import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './supabase/info'

const SUPABASE_URL = `https://${projectId}.supabase.co`
const SUPABASE_ANON_KEY = publicAnonKey

let supabaseClient: any = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'cashier' | 'super_admin'
  name: string
  shopId?: string
  shopName?: string
  cashierId?: string
  active?: boolean
}

export interface CashierCredentials {
  shopId: string
  cashierId: string
  password: string
  email: string
}

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null, error: string | null, accessToken?: string }> {
    try {
      console.log('🔐 Starting sign in process for:', email)
      const supabase = getSupabaseClient()
      console.log('📡 Supabase client created, attempting sign in...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('🔑 Sign in response:', { data: !!data, error: error?.message })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'No user found' }
      }

      // Get user metadata and construct user object
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.user_metadata?.role || 'cashier',
        name: data.user.user_metadata?.name || '',
        shopId: data.user.user_metadata?.shopId,
        shopName: data.user.user_metadata?.shopName,
        cashierId: data.user.user_metadata?.cashierId,
        active: data.user.user_metadata?.active !== false
      }

      // Update last login (only for cashiers)
      if (user.role === 'cashier' && user.cashierId) {
        console.log('🔄 Updating last login for cashier...')
        try {
          await this.updateLastLogin(user.cashierId)
        } catch (error) {
          console.warn('⚠️ Failed to update last login (non-critical):', error)
          // Don't fail the login if this fails
        }
      }

      console.log('✅ Sign in successful for:', user.email)
      return { user, error: null, accessToken: data.session?.access_token }
    } catch (error: any) {
      console.error('💥 Sign in error:', error)
      console.error('💥 Error type:', typeof error)
      console.error('💥 Error message:', error.message)
      console.error('💥 Error stack:', error.stack)
      return { user: null, error: error.message || 'Sign in failed' }
    }
  },

  // Get current session
  async getSession(): Promise<{ user: AuthUser | null, error: string | null, accessToken?: string }> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        return { user: null, error: error?.message || 'No active session' }
      }

      const user: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        role: data.session.user.user_metadata?.role || 'cashier',
        name: data.session.user.user_metadata?.name || '',
        shopId: data.session.user.user_metadata?.shopId,
        shopName: data.session.user.user_metadata?.shopName,
        cashierId: data.session.user.user_metadata?.cashierId,
        active: data.session.user.user_metadata?.active !== false
      }

      return { user, error: null, accessToken: data.session.access_token }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Update last login time for cashier
  async updateLastLogin(cashierId: string): Promise<void> {
    try {
      console.log('🔄 Updating last login for cashier:', cashierId)
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers/${cashierId}/login`
      console.log('📡 Fetching URL:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })
      
      console.log('📊 Update login response:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('❌ Failed to update last login:', response.status, response.statusText)
      } else {
        console.log('✅ Last login updated successfully')
      }
    } catch (error) {
      console.error('💥 Error updating last login:', error)
    }
  },

  // Generate random password
  generatePassword(): string {
    const length = 10
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  },

  async signUp(email: string, password: string, businessConfig: any): Promise<{ user: AuthUser | null, error: string | null, accessToken?: string }> {
    try {
      const supabase = getSupabaseClient()
      
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          email_confirm: false // Skip email confirmation for now
        }
      })

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || 'Failed to create user' }
      }

      // Create admin user in our system
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/auth/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          businessConfig
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        return { user: null, error: result.error || 'Failed to create admin account' }
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          role: 'admin',
          name: businessConfig.businessName
        },
        error: null,
        accessToken: authData.session?.access_token
      }
    } catch (error: any) {
      return { user: null, error: error.message || 'Signup failed' }
    }
  }
}
