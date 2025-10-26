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

    const { business_id, backup_id, restore_type = 'full' } = await req.json()

    // Get backup record
    const { data: backup, error: backupError } = await supabaseClient
      .from('backup_records')
      .select('*')
      .eq('id', backup_id)
      .eq('business_id', business_id)
      .single()

    if (backupError) throw backupError

    // Download backup file
    const { data: backupFile, error: fileError } = await supabaseClient.storage
      .from('business-backups')
      .download(backup.file_path)

    if (fileError) throw fileError

    const backupData = JSON.parse(await backupFile.text())

    // Create restore request
    const { data: restoreRequest, error: requestError } = await supabaseClient
      .from('restore_requests')
      .insert({
        business_id,
        backup_id,
        status: 'processing',
        restore_data: backupData
      })
      .select()
      .single()

    if (requestError) throw requestError

    // Restore data based on type
    if (restore_type === 'full') {
      // Restore all business data
      await restoreBusinessData(supabaseClient, business_id, backupData)
    } else if (restore_type === 'selective') {
      // Restore only specific data types
      const { data_types } = await req.json()
      await restoreSelectiveData(supabaseClient, business_id, backupData, data_types)
    }

    // Update restore request status
    await supabaseClient
      .from('restore_requests')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', restoreRequest.id)

    // Create realtime event
    await supabaseClient
      .from('realtime_events')
      .insert({
        event_type: 'data_restored',
        business_id,
        data: {
          restore_request_id: restoreRequest.id,
          backup_id,
          restore_type
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        restore_request_id: restoreRequest.id,
        message: 'Data restore completed successfully'
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

async function restoreBusinessData(supabaseClient: any, businessId: string, backupData: any) {
  const { business, products, customers, workers, sales, payments } = backupData

  // Update business data
  if (business) {
    await supabaseClient
      .from('businesses')
      .update(business)
      .eq('id', businessId)
  }

  // Restore products
  if (products && products.length > 0) {
    for (const product of products) {
      await supabaseClient
        .from('products')
        .upsert(product, { onConflict: 'id' })
    }
  }

  // Restore customers
  if (customers && customers.length > 0) {
    for (const customer of customers) {
      await supabaseClient
        .from('customers')
        .upsert(customer, { onConflict: 'id' })
    }
  }

  // Restore workers
  if (workers && workers.length > 0) {
    for (const worker of workers) {
      await supabaseClient
        .from('workers')
        .upsert(worker, { onConflict: 'id' })
    }
  }

  // Restore sales
  if (sales && sales.length > 0) {
    for (const sale of sales) {
      await supabaseClient
        .from('sales')
        .upsert(sale, { onConflict: 'id' })
    }
  }

  // Restore payments
  if (payments && payments.length > 0) {
    for (const payment of payments) {
      await supabaseClient
        .from('payment_records')
        .upsert(payment, { onConflict: 'id' })
    }
  }
}

async function restoreSelectiveData(supabaseClient: any, _businessId: string, backupData: any, dataTypes: string[]) {
  for (const dataType of dataTypes) {
    switch (dataType) {
      case 'products':
        if (backupData.products) {
          for (const product of backupData.products) {
            await supabaseClient
              .from('products')
              .upsert(product, { onConflict: 'id' })
          }
        }
        break
      case 'customers':
        if (backupData.customers) {
          for (const customer of backupData.customers) {
            await supabaseClient
              .from('customers')
              .upsert(customer, { onConflict: 'id' })
          }
        }
        break
      case 'workers':
        if (backupData.workers) {
          for (const worker of backupData.workers) {
            await supabaseClient
              .from('workers')
              .upsert(worker, { onConflict: 'id' })
          }
        }
        break
      case 'sales':
        if (backupData.sales) {
          for (const sale of backupData.sales) {
            await supabaseClient
              .from('sales')
              .upsert(sale, { onConflict: 'id' })
          }
        }
        break
    }
  }
}
