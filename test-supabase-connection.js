/**
 * Test Supabase Connection
 * This script will verify your Supabase credentials and check existing tables
 */

const https = require('https');

// Your Supabase credentials
const PROJECT_ID = 'cddoboboxeangripcqrn';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  console.log(`📦 Project ID: ${PROJECT_ID}`);
  console.log(`🌐 URL: ${SUPABASE_URL}\n`);

  // Test 1: Check if project is accessible
  await testProjectAccess();
  
  // Test 2: Check existing tables
  await checkExistingTables();
  
  // Test 3: Test service role permissions
  await testServiceRoleAccess();
}

async function testProjectAccess() {
  console.log('1️⃣ Testing project access...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': PUBLIC_ANON_KEY,
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Project is accessible');
          console.log('📋 Available endpoints:', JSON.parse(data).paths ? Object.keys(JSON.parse(data).paths).length : 'Unknown');
        } else {
          console.log('❌ Project access failed:', res.statusCode);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Connection error:', error.message);
      resolve();
    });
    
    req.end();
  });
}

async function checkExistingTables() {
  console.log('\n2️⃣ Checking existing tables...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const tables = response.paths ? Object.keys(response.paths) : [];
          
          console.log('✅ Database accessible');
          console.log(`📊 Found ${tables.length} tables/endpoints:`);
          
          // Filter out system tables and show business tables
          const businessTables = tables.filter(table => 
            !table.includes('kv_store') && 
            !table.includes('auth') &&
            !table.includes('storage') &&
            !table.includes('realtime') &&
            !table.includes('_') &&
            table.length > 1
          );
          
          if (businessTables.length > 0) {
            console.log('📋 Business tables found:');
            businessTables.forEach(table => console.log(`   - ${table}`));
          } else {
            console.log('📋 No business tables found (only system tables)');
            console.log('   This means we need to create all tables from scratch');
          }
          
          // Check for specific tables we need
          const requiredTables = ['products', 'customers', 'sales', 'workers', 'cashiers'];
          const missingTables = requiredTables.filter(table => !tables.includes(table));
          
          if (missingTables.length > 0) {
            console.log('\n⚠️  Missing required tables:');
            missingTables.forEach(table => console.log(`   - ${table}`));
            console.log('\n💡 We need to create these tables');
          } else {
            console.log('\n✅ All required tables exist!');
          }
          
        } else {
          console.log('❌ Database access failed:', res.statusCode);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Database error:', error.message);
      resolve();
    });
    
    req.end();
  });
}

async function testServiceRoleAccess() {
  console.log('\n3️⃣ Testing service role permissions...');
  
  return new Promise((resolve) => {
    // Try to create a test table to verify service role works
    const testSQL = {
      query: `
        CREATE TABLE IF NOT EXISTS connection_test (
          id SERIAL PRIMARY KEY,
          test_field TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    };
    
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Service role has full database access');
          console.log('✅ Can create tables and run migrations');
        } else {
          console.log('❌ Service role access limited:', res.statusCode);
          console.log('Response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Service role test failed:', error.message);
      resolve();
    });
    
    req.write(JSON.stringify(testSQL));
    req.end();
  });
}

// Run the tests
testConnection().then(() => {
  console.log('\n🎯 Connection test complete!');
  console.log('\n📋 Next steps:');
  console.log('1. If all tests passed, we can proceed with migrations');
  console.log('2. If any failed, check your credentials');
  console.log('3. Run: node test-supabase-connection.js');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
