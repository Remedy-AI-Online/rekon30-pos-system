// @ts-ignore - Deno imports for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno imports for Supabase Edge Functions  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      // @ts-ignore - Deno environment variables
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore - Deno environment variables
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, requestId, plan, upfrontPayment, maintenanceFee, reason } = await req.json()

    if (action === 'approve-request') {
      return await handleApproveRequest(supabase, requestId, plan, upfrontPayment, maintenanceFee)
    } else if (action === 'reject-request') {
      return await handleRejectRequest(supabase, requestId, reason)
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error in business-signup-requests:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleApproveRequest(supabase: any, requestId: string, plan: string, upfrontPayment: number, maintenanceFee: number) {
  try {
    // Get the signup request
    const { data: request, error: requestError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ success: false, error: 'Signup request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Define features based on plan
    let features: string[] = []
    
    if (plan === 'basic') {
      features = ['dashboard', 'products', 'orders', 'workers', 'reports', 'settings']
    } else if (plan === 'pro') {
      features = [
        'dashboard', 'products', 'orders', 'workers', 'reports', 'settings',
        'customers', 'workers-management', 'payroll', 'suppliers', 'location-management', 'credit-management'
      ]
    } else if (plan === 'enterprise') {
      features = [
        'dashboard', 'products', 'orders', 'workers', 'reports', 'settings',
        'customers', 'workers-management', 'payroll', 'suppliers', 'location-management', 'credit-management',
        'api-access', 'white-label', 'priority-support', 'custom-features', 'enterprise-analytics'
      ]
    }

    // Create business record
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        id: businessId,
        business_name: request.business_config?.businessName || 'Unknown Business',
        owner_email: request.email,
        business_type: request.business_config?.businessType || 'retail',
        business_phone: request.business_config?.businessPhone || '',
        business_address: request.business_config?.businessAddress || '',
        city: request.business_config?.city || '',
        region: request.business_config?.region || '',
        plan: plan,
        features: features,
        status: 'active',
        payment_status: 'pending',
        monthly_revenue: 0,
        setup_complete: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (businessError) {
      console.error('Error creating business:', businessError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create business record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin user
    const adminEmail = request.email
    const adminPassword = generatePassword()
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        business_id: businessId,
        name: request.business_config?.ownerName || 'Admin',
        plan: plan,
        features: features
      }
    })

    if (adminError) {
      console.error('Error creating admin user:', adminError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create admin user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        business_id: businessId,
        amount: upfrontPayment,
        payment_type: 'upfront',
        payment_method: 'manual',
        payment_date: new Date().toISOString(),
        verified_by: 'super_admin',
        notes: `Initial payment for ${plan} plan`
      })

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
    }

    // Update signup request status
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        business_id: businessId
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating signup request:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        businessId: businessId,
        adminEmail: adminEmail,
        adminPassword: adminPassword,
        features: features
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handleApproveRequest:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleRejectRequest(supabase: any, requestId: string, reason?: string) {
  try {
    const { error } = await supabase
      .from('signup_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided'
      })
      .eq('id', requestId)

    if (error) {
      console.error('Error rejecting request:', error)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to reject request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in handleRejectRequest:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}