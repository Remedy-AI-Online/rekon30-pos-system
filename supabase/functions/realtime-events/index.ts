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

    const { event_type, business_id, data } = await req.json()

    // Create realtime event
    const { data: event, error: eventError } = await supabaseClient
      .from('realtime_events')
      .insert({
        event_type,
        business_id,
        data
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Broadcast to realtime channel
    const channel = supabaseClient.channel('super-admin-dashboard')
    
    await channel.send({
      type: 'broadcast',
      event: 'business_update',
      payload: {
        event_type,
        business_id,
        data,
        timestamp: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        event_id: event.id,
        message: 'Realtime event created and broadcasted'
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
