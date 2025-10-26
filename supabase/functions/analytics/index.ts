/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const analyticsType = url.searchParams.get('type') || 'overview'
    const businessId = url.searchParams.get('business_id')

    let analyticsData: any = {}

    switch (analyticsType) {
      case 'overview':
        analyticsData = await getOverviewAnalytics(supabaseClient)
        break
      case 'business':
        if (!businessId) throw new Error('Business ID required for business analytics')
        analyticsData = await getBusinessAnalytics(supabaseClient, businessId)
        break
      case 'revenue':
        analyticsData = await getRevenueAnalytics(supabaseClient)
        break
      case 'growth':
        analyticsData = await getGrowthAnalytics(supabaseClient)
        break
      default:
        throw new Error('Invalid analytics type')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analytics_type: analyticsType,
        data: analyticsData,
        generated_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function getOverviewAnalytics(supabaseClient: any) {
  // Get total businesses
  const { data: totalBusinesses, error: totalError } = await supabaseClient
    .from('businesses')
    .select('id', { count: 'exact' })

  if (totalError) throw totalError

  // Get active businesses
  const { data: activeBusinesses, error: activeError } = await supabaseClient
    .from('businesses')
    .select('id', { count: 'exact' })
    .eq('status', 'active')

  if (activeError) throw activeError

  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabaseClient
    .from('payment_records')
    .select('amount')
    .eq('status', 'confirmed')

  if (revenueError) throw revenueError

  const totalRevenue = revenueData?.reduce((sum: number, record: any) => sum + parseFloat(record.amount), 0) || 0

  // Get overdue payments
  const { data: overdueData, error: overdueError } = await supabaseClient
    .from('businesses')
    .select('id', { count: 'exact' })
    .eq('payment_status', 'overdue')

  if (overdueError) throw overdueError

  // Get new businesses this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: newBusinesses, error: newError } = await supabaseClient
    .from('businesses')
    .select('id', { count: 'exact' })
    .gte('created_at', startOfMonth.toISOString())

  if (newError) throw newError

  return {
    total_businesses: totalBusinesses?.length || 0,
    active_businesses: activeBusinesses?.length || 0,
    total_revenue: totalRevenue,
    overdue_payments: overdueData?.length || 0,
    new_this_month: newBusinesses?.length || 0,
    active_rate: totalBusinesses?.length > 0 ? 
      ((activeBusinesses?.length || 0) / totalBusinesses.length * 100).toFixed(1) : 0
  }
}

async function getBusinessAnalytics(supabaseClient: any, businessId: string) {
  // Get business details
  const { data: business, error: businessError } = await supabaseClient
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (businessError) throw businessError

  // Get payment history
  const { data: payments, error: paymentsError } = await supabaseClient
    .from('payment_records')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  if (paymentsError) throw paymentsError

  // Get backup history
  const { data: backups, error: backupsError } = await supabaseClient
    .from('backup_records')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (backupsError) throw backupsError

  const totalPaid = payments?.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0) || 0
  const lastBackup = backups?.[0]

  return {
    business,
    total_paid: totalPaid,
    payment_count: payments?.length || 0,
    last_payment: payments?.[0],
    backup_count: backups?.length || 0,
    last_backup: lastBackup,
    days_since_last_backup: lastBackup ? 
      Math.floor((Date.now() - new Date(lastBackup.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null
  }
}

async function getRevenueAnalytics(supabaseClient: any) {
  // Get revenue by plan
  const { data: planRevenue, error: planError } = await supabaseClient
    .from('businesses')
    .select('plan, payment_records(amount)')
    .eq('status', 'active')

  if (planError) throw planError

  const revenueByPlan = planRevenue?.reduce((acc: Record<string, number>, business: any) => {
    const plan = business.plan
    const totalAmount = business.payment_records?.reduce((sum: number, payment: any) => 
      sum + parseFloat(payment.amount), 0) || 0
    
    acc[plan] = (acc[plan] || 0) + totalAmount
    return acc
  }, {} as Record<string, number>)

  // Get monthly revenue trend (last 12 months)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { data: monthlyRevenue, error: monthlyError } = await supabaseClient
    .from('payment_records')
    .select('amount, created_at')
    .eq('status', 'confirmed')
    .gte('created_at', twelveMonthsAgo.toISOString())

  if (monthlyError) throw monthlyError

  const monthlyTrend = monthlyRevenue?.reduce((acc: Record<string, number>, payment: any) => {
    const month = new Date(payment.created_at).toISOString().slice(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + parseFloat(payment.amount)
    return acc
  }, {} as Record<string, number>)

  return {
    revenue_by_plan: revenueByPlan,
    monthly_trend: monthlyTrend,
    total_revenue: Object.values(revenueByPlan || {}).reduce((sum: number, amount: unknown) => sum + (amount as number), 0)
  }
}

async function getGrowthAnalytics(supabaseClient: any) {
  // Get business growth over time
  const { data: businesses, error: businessesError } = await supabaseClient
    .from('businesses')
    .select('created_at, plan, status')
    .order('created_at', { ascending: true })

  if (businessesError) throw businessesError

  // Calculate growth metrics
  const now = new Date()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const newThisMonth = businesses?.filter((b: any) => new Date(b.created_at) >= oneMonthAgo).length || 0
  const newLastThreeMonths = businesses?.filter((b: any) => new Date(b.created_at) >= threeMonthsAgo).length || 0

  // Calculate retention rate
  const activeBusinesses = businesses?.filter((b: any) => b.status === 'active').length || 0
  const totalBusinesses = businesses?.length || 0
  const retentionRate = totalBusinesses > 0 ? (activeBusinesses / totalBusinesses * 100).toFixed(1) : 0

  return {
    total_businesses: totalBusinesses,
    active_businesses: activeBusinesses,
    new_this_month: newThisMonth,
    new_last_three_months: newLastThreeMonths,
    retention_rate: parseFloat(String(retentionRate)),
    growth_rate: newLastThreeMonths > 0 ? 
      ((newThisMonth - (newLastThreeMonths - newThisMonth) / 2) / newLastThreeMonths * 100).toFixed(1) : 0
  }
}
