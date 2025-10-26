/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...data } = await req.json()

    switch (action) {
      case 'submit-request':
        return await handleSubmitRequest(supabaseClient, data)
      
      case 'get-requests':
        return await handleGetRequests(supabaseClient, data)
      
      case 'approve-request':
        return await handleApproveRequest(supabaseClient, data)
      
      case 'reject-request':
        return await handleRejectRequest(supabaseClient, data)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleSubmitRequest(supabaseClient: any, data: any) {
  console.log('handleSubmitRequest called with data:', data)
  const { email, password, businessConfig } = data

  if (!email || !password || !businessConfig) {
    console.log('Missing required fields:', { email: !!email, password: !!password, businessConfig: !!businessConfig })
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Store the signup request (we'll hash the password when creating the actual user)
  const { data: requestData, error: insertError } = await supabaseClient
    .from('business_signup_requests')
    .insert({
      email,
      password_hash: password, // Store plain password for now, will be hashed when approved
      business_config: businessConfig,
      status: 'pending'
    })
    .select()

  if (insertError) {
    console.error('Insert error:', insertError)
    return new Response(
      JSON.stringify({ error: 'Failed to submit request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Successfully inserted signup request:', requestData[0]?.id)
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Business signup request submitted successfully. Please wait for Super Admin approval.',
      requestId: requestData[0]?.id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetRequests(supabaseClient: any, data: any) {
  const { status = 'all' } = data

  let query = supabaseClient
    .from('business_signup_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: requests, error } = await query

  if (error) {
    console.error('Get requests error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch requests' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, requests }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleApproveRequest(supabaseClient: any, data: any) {
  const { requestId, plan = 'basic', upfrontPayment = 0, maintenanceFee = 0 } = data

  if (!requestId) {
    return new Response(
      JSON.stringify({ error: 'Request ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Approving request with plan:', { requestId, plan, upfrontPayment, maintenanceFee })

  // Call the approve function with plan and pricing
  const { data: result, error } = await supabaseClient.rpc('approve_business_signup', {
    p_request_id: requestId,
    p_plan: plan,
    p_upfront_payment: upfrontPayment,
    p_maintenance_fee: maintenanceFee
  })

  if (error) {
    console.error('Approve error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to approve request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // If business was created successfully, create the admin user
  if (result.success && result.email && result.password) {
    try {
      // Fetch the business name from the businesses table
      const { data: business } = await supabaseClient
        .from('businesses')
        .select('business_name')
        .eq('id', result.business_id)
        .single()
      
      const businessName = business?.business_name || 'Business'
      
      const { data: user, error: userError } = await supabaseClient.auth.admin.createUser({
        email: result.email,
        password: result.password,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          business_id: result.business_id,
          business_name: businessName,
          name: result.owner_name || 'Admin',
          plan: result.plan || 'basic',
          features: result.features || []
        }
      })

      if (userError) {
        console.error('User creation error:', userError)
        // Don't fail the whole request if user creation fails
        result.warning = 'Business created but user creation failed. Please create user manually.'
      } else {
        result.user_id = user?.user?.id
      }
    } catch (err) {
      console.error('Error creating user:', err)
      result.warning = 'Business created but user creation failed.'
    }
  }

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRejectRequest(supabaseClient: any, data: any) {
  const { requestId, reason } = data

  if (!requestId) {
    return new Response(
      JSON.stringify({ error: 'Request ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Call the reject function
  const { data: result, error } = await supabaseClient.rpc('reject_business_signup', {
    p_request_id: requestId,
    p_rejection_reason: reason || null
  })

  if (error) {
    console.error('Reject error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to reject request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}