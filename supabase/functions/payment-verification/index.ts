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

    const { business_id, payment_amount, payment_method, payment_reference, verified_by } = await req.json()

    // Get business details
    const { data: business, error: businessError } = await supabaseClient
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError) throw businessError

    // Calculate expected payment amount based on plan
    const { data: settings, error: settingsError } = await supabaseClient
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        `${business.plan}_upfront_fee`,
        `${business.plan}_maintenance_fee`
      ])

    if (settingsError) throw settingsError

    const upfrontFee = settings.find(s => s.setting_key === `${business.plan}_upfront_fee`)?.setting_value
    const maintenanceFee = settings.find(s => s.setting_key === `${business.plan}_maintenance_fee`)?.setting_value

    // Determine payment type
    let paymentType = 'maintenance'
    let expectedAmount = parseFloat(maintenanceFee || '0')
    
    if (!business.upfront_fee_paid) {
      paymentType = 'upfront'
      expectedAmount = parseFloat(upfrontFee || '0')
    }

    // Verify payment amount
    const isAmountCorrect = Math.abs(payment_amount - expectedAmount) < 0.01 // Allow small rounding differences

    if (!isAmountCorrect) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment amount does not match expected amount',
          expected_amount: expectedAmount,
          received_amount: payment_amount,
          payment_type: paymentType
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('payment_records')
      .insert({
        business_id,
        payment_type: paymentType,
        amount: payment_amount,
        payment_method,
        payment_reference,
        status: 'confirmed',
        confirmed_by: verified_by,
        confirmed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Update business payment status
    const updateData: Record<string, unknown> = {
      last_payment_date: new Date().toISOString(),
      payment_status: 'paid'
    }

    if (paymentType === 'upfront') {
      updateData.upfront_fee_paid = true
    } else {
      updateData.maintenance_fee_paid = true
      // Set next payment date (6 months from now)
      const nextPaymentDate = new Date()
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 6)
      updateData.next_payment_date = nextPaymentDate.toISOString()
    }

    const { error: updateError } = await supabaseClient
      .from('businesses')
      .update(updateData)
      .eq('id', business_id)

    if (updateError) throw updateError

    // Create realtime event for dashboard update
    await supabaseClient
      .from('realtime_events')
      .insert({
        event_type: 'payment_verified',
        business_id,
        data: {
          payment_record_id: paymentRecord.id,
          payment_type: paymentType,
          amount: payment_amount,
          business_name: business.business_name
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_record_id: paymentRecord.id,
        payment_type: paymentType,
        amount: payment_amount,
        business_name: business.business_name,
        message: 'Payment verified and recorded successfully'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
