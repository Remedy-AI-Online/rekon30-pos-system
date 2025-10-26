const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://cddoboboxeangripcqrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up database with service role...');
  
  try {
    // Test connection
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error) {
      console.log('⚠️  Connection test failed:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }

    // Read and execute the initial schema migration
    console.log('📄 Reading initial schema...');
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'supabase', 'migrations', '20251011145258_initial_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔧 Executing schema migration...');
    const { data: schemaResult, error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (schemaError) {
      console.log('❌ Schema migration failed:', schemaError.message);
      console.log('💡 Trying alternative approach...');
      
      // Try using the REST API with raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: schemaSQL })
      });
      
      if (response.ok) {
        console.log('✅ Schema migration successful via REST API!');
      } else {
        const errorText = await response.text();
        console.log('❌ REST API also failed:', errorText);
      }
    } else {
      console.log('✅ Schema migration successful!');
    }

    // Read and execute RLS policies
    console.log('🔒 Setting up RLS policies...');
    const rlsPath = path.join(__dirname, 'supabase', 'migrations', '20251011145309_rls_policies.sql');
    const rlsSQL = fs.readFileSync(rlsPath, 'utf8');
    
    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.log('❌ RLS policies failed:', rlsError.message);
    } else {
      console.log('✅ RLS policies set up successfully!');
    }

    // Read and execute functions and triggers
    console.log('⚙️  Setting up functions and triggers...');
    const functionsPath = path.join(__dirname, 'supabase', 'migrations', '20251011145325_functions_triggers.sql');
    const functionsSQL = fs.readFileSync(functionsPath, 'utf8');
    
    const { data: functionsResult, error: functionsError } = await supabase.rpc('exec_sql', { sql: functionsSQL });
    
    if (functionsError) {
      console.log('❌ Functions and triggers failed:', functionsError.message);
    } else {
      console.log('✅ Functions and triggers set up successfully!');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'products', 'customers', 'workers', 'cashiers', 'sales', 
        'sale_items', 'corrections', 'payroll', 'daily_reports', 
        'notifications', 'shop_settings', 'activity_logs'
      ]);

    if (tablesError) {
      console.log('❌ Could not verify tables:', tablesError.message);
    } else {
      console.log(`✅ Found ${tables?.length || 0} business tables created!`);
      if (tables && tables.length > 0) {
        console.log('📋 Created tables:', tables.map(t => t.table_name).join(', '));
      }
    }

  } catch (error) {
    console.log('💥 Setup failed:', error.message);
  }
}

setupDatabase();
