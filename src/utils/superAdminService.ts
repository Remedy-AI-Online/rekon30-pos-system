import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './supabase/info'
import { getSupabaseClient } from './authService'

const SUPABASE_URL = `https://${projectId}.supabase.co`
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q'

// Use shared client for regular operations
const supabase = getSupabaseClient()

// Singleton admin client to prevent multiple instances
let supabaseAdmin: any = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  }
  return supabaseAdmin
}

export interface Business {
  id: string
  business_name: string
  owner_email: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'pending'
  payment_status: 'paid' | 'pending' | 'overdue'
  last_payment_date: string | null
  renewal_date: string
  monthly_revenue: number
  created_at: string
  setup_complete: boolean
  business_phone?: string
  business_address?: string
}

export interface Payment {
  id: string
  business_id: string
  amount: number
  payment_type: 'upfront' | 'maintenance'
  payment_method: string
  payment_date: string
  verified_by?: string
  notes?: string
}

export interface BackupRecord {
  id: string
  business_id: string
  backup_type: 'full' | 'selective'
  storage_path: string
  data_size: number
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
}

export interface ApiKey {
  id: string
  key_name: string
  key_value: string
  business_id?: string
  permissions: string[]
  rate_limit: number
  last_used?: string
  created_at: string
  is_active: boolean
}

export const superAdminService = {
  // ==================== BUSINESSES ====================
  
  async getAllBusinesses(): Promise<{ data: Business[] | null; error: string | null }> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async getBusinessById(id: string): Promise<{ data: Business | null; error: string | null }> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async updateBusiness(id: string, updates: Partial<Business>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('businesses')
        .update(updates)
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async deleteBusiness(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('businesses')
        .delete()
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ==================== PAYMENTS ====================

  async recordPayment(paymentData: {
    business_id: string
    amount: number
    payment_type: 'upfront' | 'maintenance'
    payment_method: string
    reference?: string
    notes?: string
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('💳 Recording payment in Supabase...', paymentData)
      
      // Insert payment record into payments table (using only available columns)
      const { error: paymentError } = await getSupabaseAdmin()
        .from('payments')
        .insert({
          business_id: paymentData.business_id,
          amount: paymentData.amount
        })

      if (paymentError) {
        console.error('❌ Payment insert error:', paymentError)
        return { success: false, error: paymentError.message }
      }

      console.log('✅ Payment recorded in Supabase payments table')

      // Update business payment status
      const updateData: any = {
        payment_status: 'paid',
        last_payment_date: new Date().toISOString()
      }

      if (paymentData.payment_type === 'upfront') {
        updateData.upfront_fee_paid = true
      } else if (paymentData.payment_type === 'maintenance') {
        updateData.maintenance_fee_paid = true
        // Set next payment date (6 months from now)
        const nextDate = new Date()
        nextDate.setMonth(nextDate.getMonth() + 6)
        updateData.next_payment_date = nextDate.toISOString()
        updateData.next_maintenance_due = nextDate.toISOString()
      }

      const { error: updateError } = await getSupabaseAdmin()
        .from('businesses')
        .update(updateData)
        .eq('id', paymentData.business_id)

      if (updateError) {
        console.error('❌ Business update error:', updateError)
        return { success: false, error: updateError.message }
      }

      console.log('✅ Business payment status updated in Supabase')
      return { success: true, error: null }
    } catch (error: any) {
      console.error('💥 Payment recording error:', error)
      return { success: false, error: error.message }
    }
  },

  async getAllPayments(): Promise<{ data: Payment[] | null; error: string | null }> {
    try {
      console.log('📊 Fetching payments from Supabase payments table...')
      
      // Get payments from dedicated payments table
      const { data: payments, error } = await getSupabaseAdmin()
        .from('payments')
        .select(`
          *,
          businesses!inner(business_name)
        `)
        .order('payment_date', { ascending: false })

      if (error) {
        console.error('❌ Error fetching payments:', error)
        return { data: null, error: error.message }
      }

      console.log('✅ Payments fetched from Supabase:', payments?.length || 0)
      
      // Transform to include business name
      const transformedPayments = payments?.map((payment: any) => ({
        ...payment,
        business_name: payment.businesses?.business_name || 'Unknown Business'
      })) || []

      return { data: transformedPayments, error: null }
    } catch (error: any) {
      console.error('💥 Error fetching payments:', error)
      return { data: null, error: error.message }
    }
  },

  async verifyPayment(paymentData: {
    business_id: string
    amount: number
    payment_type: 'upfront' | 'maintenance'
    payment_method: string
    notes?: string
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()
      
      if (!result.success) {
        return { success: false, error: result.error || 'Payment verification failed' }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getPaymentHistory(businessId?: string): Promise<{ data: Payment[] | null; error: string | null }> {
    try {
      let query = getSupabaseAdmin().from('payments').select('*').order('payment_date', { ascending: false })
      
      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // ==================== BACKUPS ====================

  async triggerBackup(businessId?: string, backupType: 'full' | 'selective' = 'full'): Promise<{ success: boolean; error: string | null }> {
    try {
      const endpoint = businessId ? 'backup-system' : 'cron-backup'
      const body = businessId ? { business_id: businessId, backup_type: backupType } : {}

      const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (!result.success) {
        return { success: false, error: result.error || 'Backup failed' }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async getBackupHistory(businessId?: string): Promise<{ data: BackupRecord[] | null; error: string | null }> {
    try {
      let query = getSupabaseAdmin().from('backup_records').select('*').order('created_at', { ascending: false })
      
      if (businessId) {
        query = query.eq('business_id', businessId)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async restoreBackup(businessId: string, backupId: string, dataTypes?: string[]): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/data-restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_id: businessId,
          backup_id: backupId,
          restore_type: dataTypes ? 'selective' : 'full',
          data_types: dataTypes
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        return { success: false, error: result.error || 'Restore failed' }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ==================== API KEYS ====================

  async getAllApiKeys(): Promise<{ data: ApiKey[] | null; error: string | null }> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async createApiKey(keyData: {
    key_name: string
    business_id?: string
    permissions: string[]
    rate_limit: number
  }): Promise<{ data: ApiKey | null; error: string | null }> {
    try {
      // Generate a random API key
      const keyValue = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

      const { data, error } = await getSupabaseAdmin()
        .from('api_keys')
        .insert({
          key_name: keyData.key_name,
          key_value: keyValue,
          business_id: keyData.business_id || null,
          permissions: keyData.permissions,
          rate_limit: keyData.rate_limit,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('api_keys')
        .update(updates)
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async deleteApiKey(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await getSupabaseAdmin()
        .from('api_keys')
        .delete()
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ==================== ANALYTICS ====================

  async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{ data: any | null; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analytics?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.success) {
        return { data: null, error: result.error || 'Failed to fetch analytics' }
      }

      return { data: result.data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // ==================== FEATURES ====================

  async addCustomFeature(featureData: {
    feature_id: string
    feature_name: string
    feature_icon?: string
    category?: string
    description?: string
    created_by?: string
  }): Promise<{ success: boolean; feature?: any; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/feature-management?action=add-custom-feature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(featureData)
      })

      const result = await response.json()
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to add custom feature' }
      }

      return { success: true, feature: result.feature, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async enableFeature(businessId: string, featureId: string, reason?: string): Promise<{ success: boolean; features?: string[]; error: string | null }> {
    try {
      console.log('➕ Enabling feature:', { businessId, featureId, reason })
      
      // 1. Get current features from businesses table
      const { data: business, error: fetchError } = await getSupabaseAdmin()
        .from('businesses')
        .select('features, email')
        .eq('id', businessId)
        .single()

      if (fetchError || !business) {
        console.error('❌ Failed to fetch business:', fetchError)
        return { success: false, error: 'Business not found' }
      }

      const currentFeatures = business.features || []
      
      // Add feature if not already present
      if (!currentFeatures.includes(featureId)) {
        const updatedFeatures = [...currentFeatures, featureId]
        
        // 2. Update features in businesses table
        const { error: updateError } = await getSupabaseAdmin()
          .from('businesses')
          .update({ features: updatedFeatures })
          .eq('id', businessId)

        if (updateError) {
          console.error('❌ Failed to update business features:', updateError)
          return { success: false, error: updateError.message }
        }

        // 3. Update user metadata in Supabase Auth
        const { data: { users }, error: userError } = await getSupabaseAdmin().auth.admin.listUsers()
        
        if (userError) {
          console.error('❌ Failed to list users:', userError)
        } else {
          const businessUser = users.find((u: any) => u.user_metadata?.business_id === businessId)
          
          if (businessUser) {
            const { error: metadataError } = await getSupabaseAdmin().auth.admin.updateUserById(
              businessUser.id,
              {
                user_metadata: {
                  ...businessUser.user_metadata,
                  features: updatedFeatures
                }
              }
            )

            if (metadataError) {
              console.error('⚠️ Failed to update user metadata:', metadataError)
            } else {
              console.log('✅ User metadata updated with new features')
            }
          }
        }

        console.log('✅ Feature enabled successfully:', updatedFeatures)
        return { success: true, features: updatedFeatures, error: null }
      }

      return { success: true, features: currentFeatures, error: null }
    } catch (error: any) {
      console.error('❌ Error enabling feature:', error)
      return { success: false, error: error.message }
    }
  },

  async disableFeature(businessId: string, featureId: string, reason?: string): Promise<{ success: boolean; features?: string[]; error: string | null }> {
    try {
      console.log('➖ Disabling feature:', { businessId, featureId, reason })
      
      // 1. Get current features from businesses table
      const { data: business, error: fetchError } = await getSupabaseAdmin()
        .from('businesses')
        .select('features, email')
        .eq('id', businessId)
        .single()

      if (fetchError || !business) {
        console.error('❌ Failed to fetch business:', fetchError)
        return { success: false, error: 'Business not found' }
      }

      const currentFeatures = business.features || []
      
      // Remove feature if present
      if (currentFeatures.includes(featureId)) {
        const updatedFeatures = currentFeatures.filter((f: string) => f !== featureId)
        
        // 2. Update features in businesses table
        const { error: updateError } = await getSupabaseAdmin()
          .from('businesses')
          .update({ features: updatedFeatures })
          .eq('id', businessId)

        if (updateError) {
          console.error('❌ Failed to update business features:', updateError)
          return { success: false, error: updateError.message }
        }

        // 3. Update user metadata in Supabase Auth
        const { data: { users }, error: userError } = await getSupabaseAdmin().auth.admin.listUsers()
        
        if (userError) {
          console.error('❌ Failed to list users:', userError)
        } else {
          const businessUser = users.find((u: any) => u.user_metadata?.business_id === businessId)
          
          if (businessUser) {
            const { error: metadataError } = await getSupabaseAdmin().auth.admin.updateUserById(
              businessUser.id,
              {
                user_metadata: {
                  ...businessUser.user_metadata,
                  features: updatedFeatures
                }
              }
            )

            if (metadataError) {
              console.error('⚠️ Failed to update user metadata:', metadataError)
            } else {
              console.log('✅ User metadata updated with removed feature')
            }
          }
        }

        console.log('✅ Feature disabled successfully:', updatedFeatures)
        return { success: true, features: updatedFeatures, error: null }
      }

      return { success: true, features: currentFeatures, error: null }
    } catch (error: any) {
      console.error('❌ Error disabling feature:', error)
      return { success: false, error: error.message }
    }
  },

  async getBusinessFeatures(businessId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/feature-management?action=get-business-features&business_id=${businessId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.success) {
        return { data: null, error: result.error || 'Failed to get business features' }
      }

      return { data: result.data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async getFeatureStats(): Promise<{ data: any | null; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/feature-management?action=get-feature-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.success) {
        return { data: null, error: result.error || 'Failed to get feature stats' }
      }

      return { data: result, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async getCustomFeatures(): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/feature-management?action=get-custom-features`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.success) {
        return { data: null, error: result.error || 'Failed to get custom features' }
      }

      return { data: result.features, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async bulkUpdateFeatures(businessIds: string[], featuresToAdd?: string[], featuresToRemove?: string[], reason?: string): Promise<{ success: boolean; results?: any[]; error: string | null }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/feature-management?action=bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_ids: businessIds,
          features_to_add: featuresToAdd,
          features_to_remove: featuresToRemove,
          reason,
          changed_by: 'super_admin'
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to bulk update features' }
      }

      return { success: true, results: result.results, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  // ==================== REALTIME ====================

  subscribeToBusinessUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('businesses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, callback)
      .subscribe()
  },

  subscribeToPaymentUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, callback)
      .subscribe()
  },

  subscribeToBackupUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('backups-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'backup_records' }, callback)
      .subscribe()
  },

  subscribeToFeatureUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('features-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, callback)
      .subscribe()
  },

  // Business Signup Requests
  async getSignupRequests(status: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
    try {
      console.log('Fetching signup requests with status:', status)
      const response = await fetch(`${SUPABASE_URL}/functions/v1/business-signup-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: 'get-requests', status })
      })
      
      const result = await response.json()
      console.log('Signup requests response:', result)
      return result.success ? result.requests : []
    } catch (error) {
      console.error('Error fetching signup requests:', error)
      return []
    }
  },

  async approveSignupRequest(
    requestId: string,
    plan: 'basic' | 'pro' | 'enterprise' = 'basic',
    upfrontPayment: number = 0,
    maintenanceFee: number = 0
  ) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/business-signup-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ 
          action: 'approve-request', 
          requestId,
          plan,
          upfrontPayment,
          maintenanceFee
        })
      })
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error approving signup request:', error)
      return { success: false, error: 'Network error' }
    }
  },

  async rejectSignupRequest(requestId: string, reason?: string) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/business-signup-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: 'reject-request', requestId, reason })
      })
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error rejecting signup request:', error)
      return { success: false, error: 'Network error' }
    }
  }
}

