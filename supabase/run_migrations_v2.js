/**
 * Supabase Migration Runner v2
 * Uses Supabase REST API to create tables directly
 */

const https = require('https');

const PROJECT_ID = 'cddoboboxeangripcqrn';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

// Migration 1: Create Products table
async function createProductsTable() {
  console.log('📦 Creating products table...');
  
  const productData = {
    name: 'Sample Product',
    sku: 'TEST-001',
    category: 'Test',
    supplier: 'Test Supplier',
    description: 'Test product for migration',
    price: 10.00,
    cost: 5.00,
    stock: 100,
    low_stock_threshold: 10,
    status: 'Active'
  };
  
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ Products table created and accessible');
          resolve(true);
        } else if (res.statusCode === 404) {
          console.log('❌ Products table does not exist - need to create via SQL');
          resolve(false);
        } else {
          console.log('⚠️  Products table status:', res.statusCode, data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Error testing products table:', error.message);
      resolve(false);
    });
    
    req.write(JSON.stringify(productData));
    req.end();
  });
}

// Test all required tables
async function testAllTables() {
  console.log('🔍 Testing all required tables...\n');
  
  const tables = [
    'products',
    'customers', 
    'workers',
    'cashiers',
    'sales',
    'sale_items',
    'corrections',
    'payroll',
    'daily_reports',
    'notifications',
    'shop_settings',
    'activity_logs'
  ];
  
  const results = {};
  
  for (const table of tables) {
    console.log(`Testing ${table}...`);
    
    const exists = await testTableExists(table);
    results[table] = exists;
    
    if (exists) {
      console.log(`✅ ${table} exists`);
    } else {
      console.log(`❌ ${table} missing`);
    }
  }
  
  return results;
}

async function testTableExists(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: `/rest/v1/${tableName}?select=*&limit=1`,
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
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Main function
async function runMigrationCheck() {
  console.log('🚀 Supabase Migration Checker v2\n');
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log(`🌐 URL: ${SUPABASE_URL}\n`);
  
  // Test all tables
  const tableResults = await testAllTables();
  
  console.log('\n📊 Summary:');
  const existingTables = Object.entries(tableResults).filter(([_, exists]) => exists);
  const missingTables = Object.entries(tableResults).filter(([_, exists]) => !exists);
  
  console.log(`✅ Existing tables: ${existingTables.length}`);
  existingTables.forEach(([table, _]) => console.log(`   - ${table}`));
  
  console.log(`\n❌ Missing tables: ${missingTables.length}`);
  missingTables.forEach(([table, _]) => console.log(`   - ${table}`));
  
  if (missingTables.length > 0) {
    console.log('\n💡 Next Steps:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and run the SQL from supabase/migrations/');
    console.log('3. Or use the manual migration guide');
    console.log('\n📁 Migration files ready:');
    console.log('   - supabase/migrations/001_initial_schema.sql');
    console.log('   - supabase/migrations/002_rls_policies.sql');
    console.log('   - supabase/migrations/003_functions_triggers.sql');
  } else {
    console.log('\n🎉 All tables exist! Your database is ready.');
  }
}

// Run the check
runMigrationCheck().catch(console.error);
