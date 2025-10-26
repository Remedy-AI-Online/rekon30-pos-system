// Script to setup Super Admin account
// Run this with: node setup-super-admin.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Your Supabase credentials
const supabaseUrl = 'https://cddoboboxeangripcqrn.supabase.co'
const supabaseServiceKey = 'your-service-role-key' // You need the service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSuperAdmin() {
  try {
    console.log('🚀 Setting up Super Admin account...')

    // 1. Create Super Admin record
    const { data: adminData, error: adminError } = await supabase
      .from('super_admins')
      .upsert({
        email: 'admin@rekon360.com',
        name: 'Rekon360 Owner',
        role: 'super_admin'
      })
      .select()

    if (adminError) {
      console.error('❌ Error creating super admin:', adminError)
      return
    }

    console.log('✅ Super Admin record created:', adminData)

    // 2. Create sample businesses
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .upsert([
        {
          business_name: 'Kofi Electronics',
          business_type: 'retail',
          business_description: 'Electronics and gadgets store',
          email: 'kofi@electronics.com',
          plan: 'basic',
          status: 'active',
          payment_status: 'paid',
          upfront_fee_paid: true,
          maintenance_fee_paid: true
        },
        {
          business_name: 'Ama Wholesale',
          business_type: 'wholesale',
          business_description: 'Bulk goods distribution',
          email: 'ama@wholesale.com',
          plan: 'pro',
          status: 'active',
          payment_status: 'paid',
          upfront_fee_paid: true,
          maintenance_fee_paid: true
        },
        {
          business_name: 'Uncle 19 Shops',
          business_type: 'enterprise',
          business_description: 'Multi-location retail chain',
          email: 'uncle@business.com',
          plan: 'enterprise',
          status: 'pending',
          payment_status: 'pending',
          upfront_fee_paid: false,
          maintenance_fee_paid: false
        }
      ])
      .select()

    if (businessError) {
      console.error('❌ Error creating businesses:', businessError)
    } else {
      console.log('✅ Sample businesses created:', businessData)
    }

    // 3. Setup system settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('system_settings')
      .upsert([
        { setting_key: 'basic_upfront_fee', setting_value: '1500', description: 'Basic plan upfront fee in Ghana Cedis' },
        { setting_key: 'basic_maintenance_fee', setting_value: '200', description: 'Basic plan 6-month maintenance fee in Ghana Cedis' },
        { setting_key: 'pro_upfront_fee', setting_value: '3000', description: 'Pro plan upfront fee in Ghana Cedis' },
        { setting_key: 'pro_maintenance_fee', setting_value: '400', description: 'Pro plan 6-month maintenance fee in Ghana Cedis' },
        { setting_key: 'enterprise_upfront_fee', setting_value: '5000', description: 'Enterprise plan upfront fee in Ghana Cedis' },
        { setting_key: 'enterprise_maintenance_fee', setting_value: '800', description: 'Enterprise plan 6-month maintenance fee in Ghana Cedis' },
        { setting_key: 'sync_interval_minutes', setting_value: '5', description: 'Offline sync interval in minutes' },
        { setting_key: 'maintenance_reminder_days', setting_value: '30', description: 'Days before maintenance due to send reminder' }
      ])
      .select()

    if (settingsError) {
      console.error('❌ Error creating settings:', settingsError)
    } else {
      console.log('✅ System settings created:', settingsData)
    }

    console.log('🎉 Super Admin setup complete!')
    console.log('📧 Login with: admin@rekon360.com')
    console.log('🔑 You need to create the auth user in Supabase Dashboard > Authentication > Users')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupSuperAdmin()
