// Create Super Admin Account
// This script will create a new Super Admin user using Supabase Admin API

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://cddoboboxeangripcqrn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

async function createSuperAdmin() {
  try {
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔧 Creating Super Admin account...');

    // Create the Super Admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'superadmin@rekon360.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'super_admin',
        name: 'Super Admin'
      }
    });

    if (error) {
      console.error('❌ Error creating Super Admin:', error.message);
      return;
    }

    console.log('✅ Super Admin account created successfully!');
    console.log('📧 Email: superadmin@rekon360.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 User ID:', data.user?.id);

    // Verify the account was created
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    console.log('\n📊 Current users in database:');
    users.users.forEach(user => {
      console.log(`- ${user.email} (${user.user_metadata?.role || 'no role'})`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
createSuperAdmin();