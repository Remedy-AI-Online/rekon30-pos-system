import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Add Custom Feature
    if (action === 'add-custom-feature') {
      const { feature_id, feature_name, feature_icon, category, description, created_by } = await req.json()

      const { data, error } = await supabaseClient
        .from('custom_features')
        .insert({
          feature_id,
          feature_name,
          feature_icon: feature_icon || 'Package',
          category: category || 'custom',
          description,
          created_by
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, feature: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enable Feature
    if (action === 'enable-feature') {
      const { business_id, feature_id, reason, changed_by } = await req.json()

      // Get current features
      const { data: business, error: fetchError } = await supabaseClient
        .from('businesses')
        .select('features')
        .eq('id', business_id)
        .single()

      if (fetchError) {
        return new Response(
          JSON.stringify({ success: false, error: fetchError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const currentFeatures = business.features || []
      if (currentFeatures.includes(feature_id)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Feature already enabled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const newFeatures = [...currentFeatures, feature_id]

      // Update features
      const { error: updateError } = await supabaseClient
        .from('businesses')
        .update({
          features: newFeatures,
          features_updated_at: new Date().toISOString()
        })
        .eq('id', business_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Log the change
      await supabaseClient
        .from('business_feature_log')
        .insert({
          business_id,
          feature_id,
          action: 'enabled',
          reason,
          changed_by
        })

      return new Response(
        JSON.stringify({ success: true, features: newFeatures }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Disable Feature
    if (action === 'disable-feature') {
      const { business_id, feature_id, reason, changed_by } = await req.json()

      // Core features that cannot be disabled
      const CORE_FEATURES = ['inventory', 'sales', 'customers', 'reports']
      
      if (CORE_FEATURES.includes(feature_id)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cannot disable core features' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Get current features
      const { data: business, error: fetchError } = await supabaseClient
        .from('businesses')
        .select('features')
        .eq('id', business_id)
        .single()

      if (fetchError) {
        return new Response(
          JSON.stringify({ success: false, error: fetchError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const currentFeatures = business.features || []
      const newFeatures = currentFeatures.filter((f: string) => f !== feature_id)

      // Update features
      const { error: updateError } = await supabaseClient
        .from('businesses')
        .update({
          features: newFeatures,
          features_updated_at: new Date().toISOString()
        })
        .eq('id', business_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Log the change
      await supabaseClient
        .from('business_feature_log')
        .insert({
          business_id,
          feature_id,
          action: 'disabled',
          reason,
          changed_by
        })

      return new Response(
        JSON.stringify({ success: true, features: newFeatures }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Business Features
    if (action === 'get-business-features') {
      const business_id = url.searchParams.get('business_id')

      const { data, error } = await supabaseClient
        .from('businesses')
        .select('features, features_updated_at, api_key')
        .eq('id', business_id)
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Feature Statistics
    if (action === 'get-feature-stats') {
      const { data: businesses, error } = await supabaseClient
        .from('businesses')
        .select('features')

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Count feature usage
      const featureStats: Record<string, number> = {}
      businesses.forEach((business: { features: string[] }) => {
        const features = business.features || []
        features.forEach((feature: string) => {
          featureStats[feature] = (featureStats[feature] || 0) + 1
        })
      })

      return new Response(
        JSON.stringify({ success: true, stats: featureStats, total_businesses: businesses.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get All Custom Features
    if (action === 'get-custom-features') {
      const { data, error } = await supabaseClient
        .from('custom_features')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, features: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Bulk Update Features
    if (action === 'bulk-update') {
      const { business_ids, features_to_add, features_to_remove, reason, changed_by } = await req.json()

      const results = []

      for (const business_id of business_ids) {
        // Get current features
        const { data: business } = await supabaseClient
          .from('businesses')
          .select('features')
          .eq('id', business_id)
          .single()

        let currentFeatures = business?.features || []

        // Add features
        if (features_to_add && features_to_add.length > 0) {
          features_to_add.forEach((feature: string) => {
            if (!currentFeatures.includes(feature)) {
              currentFeatures.push(feature)
            }
          })
        }

        // Remove features (except core)
        if (features_to_remove && features_to_remove.length > 0) {
          const CORE_FEATURES = ['inventory', 'sales', 'customers', 'reports']
          features_to_remove.forEach((feature: string) => {
            if (!CORE_FEATURES.includes(feature)) {
              currentFeatures = currentFeatures.filter((f: string) => f !== feature)
            }
          })
        }

        // Update
        const { error } = await supabaseClient
          .from('businesses')
          .update({
            features: currentFeatures,
            features_updated_at: new Date().toISOString()
          })
          .eq('id', business_id)

        if (!error) {
          // Log changes
          if (features_to_add) {
            for (const feature of features_to_add) {
              await supabaseClient
                .from('business_feature_log')
                .insert({
                  business_id,
                  feature_id: feature,
                  action: 'enabled',
                  reason,
                  changed_by
                })
            }
          }
          if (features_to_remove) {
            for (const feature of features_to_remove) {
              await supabaseClient
                .from('business_feature_log')
                .insert({
                  business_id,
                  feature_id: feature,
                  action: 'disabled',
                  reason,
                  changed_by
                })
            }
          }
        }

        results.push({ business_id, success: !error, error: error?.message })
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

