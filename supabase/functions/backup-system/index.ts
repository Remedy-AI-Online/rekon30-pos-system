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

    const { business_id, backup_type = 'full' } = await req.json()

    // Get business data
    const { data: business, error: businessError } = await supabaseClient
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError) throw businessError

    // Get related data based on backup type
    let backupData: Record<string, unknown> = { business }

    if (backup_type === 'full') {
      // Get all business-related data
      const [products, customers, workers, sales, payments] = await Promise.all([
        supabaseClient.from('products').select('*').eq('shop_id', business.business_name),
        supabaseClient.from('customers').select('*').eq('shop_id', business.business_name),
        supabaseClient.from('workers').select('*').eq('shop_id', business.business_name),
        supabaseClient.from('sales').select('*').eq('shop_id', business.business_name),
        supabaseClient.from('payment_records').select('*').eq('business_id', business_id)
      ])

      backupData = {
        business,
        products: products.data,
        customers: customers.data,
        workers: workers.data,
        sales: sales.data,
        payments: payments.data,
        backup_metadata: {
          created_at: new Date().toISOString(),
          business_id,
          backup_type,
          data_size: JSON.stringify(backupData).length
        }
      }
    }

    // Create backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${business_id}-${timestamp}.json`

    // Store backup in Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('business-backups')
      .upload(filename, JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Record backup in database
    const { error: recordError } = await supabaseClient
      .from('backup_records')
      .insert({
        business_id,
        backup_type,
        filename,
        file_path: uploadData.path,
        data_size: (backupData.backup_metadata as any).data_size,
        status: 'completed'
      })

    if (recordError) throw recordError

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup_id: uploadData.path,
        filename,
        data_size: (backupData.backup_metadata as any).data_size
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
