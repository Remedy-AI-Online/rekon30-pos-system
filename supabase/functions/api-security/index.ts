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

    const apiKey = req.headers.get('x-api-key')
    const endpoint = new URL(req.url).pathname
    const method = req.method
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Validate API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Check API key validity
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('*')
      .eq('key_value', apiKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Check if key is expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Check permissions
    const permissions = keyData.permissions || []
    const hasPermission = permissions.includes(endpoint) || permissions.includes('*')
    
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      )
    }

    // Rate limiting check
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const { data: usageData, error: usageError } = await supabaseClient
      .from('api_usage_logs')
      .select('id')
      .eq('api_key_id', keyData.id)
      .gte('created_at', oneHourAgo.toISOString())

    if (usageError) throw usageError

    const currentUsage = usageData?.length || 0
    if (currentUsage >= keyData.rate_limit) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        }
      )
    }

    // Log API usage
    const startTime = Date.now()
    
    // Process the request (this would be your actual API logic)
    const response = await processApiRequest(req, keyData)
    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Log the API call
    await supabaseClient
      .from('api_usage_logs')
      .insert({
        api_key_id: keyData.id,
        endpoint,
        method,
        status_code: response.status,
        response_time_ms: responseTime,
        ip_address: ipAddress,
        user_agent: req.headers.get('user-agent')
      })

    // Update last used timestamp
    await supabaseClient
      .from('api_keys')
      .update({ last_used: now.toISOString() })
      .eq('id', keyData.id)

    return response

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

function processApiRequest(_req: Request, keyData: Record<string, unknown>) {
  // This is where you'd implement your actual API logic
  // For now, return a simple response
  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'API request processed',
      business_id: keyData.business_id,
      permissions: keyData.permissions
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    }
  )
}
