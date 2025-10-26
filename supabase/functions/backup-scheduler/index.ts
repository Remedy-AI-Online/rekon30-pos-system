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

    // Get all active businesses
    const { data: businesses, error: businessesError } = await supabaseClient
      .from('businesses')
      .select('id, business_name, status')
      .eq('status', 'active')

    if (businessesError) throw businessesError

    const backupPromises = businesses.map(async (business) => {
      try {
        // Call backup system for each business
        const backupResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/backup-system`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            business_id: business.id,
            backup_type: 'full'
          })
        })

        const result = await backupResponse.json()
        
        if (!result.success) {
          console.error(`Backup failed for business ${business.business_name}:`, result.error)
        }

        return {
          business_id: business.id,
          business_name: business.business_name,
          success: result.success,
          error: result.error
        }
      } catch (error) {
        console.error(`Backup error for business ${business.business_name}:`, error instanceof Error ? error.message : 'Unknown error')
        return {
          business_id: business.id,
          business_name: business.business_name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const results = await Promise.all(backupPromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    // Log backup summary
    console.log(`Backup completed: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        success: true,
        summary: {
          total_businesses: businesses.length,
          successful_backups: successful,
          failed_backups: failed,
          results
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Backup scheduler error:', error)
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
