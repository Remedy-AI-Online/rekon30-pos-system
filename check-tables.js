/**
 * Check if tables exist in Supabase using REST API
 */

const https = require('https');

const PROJECT_ID = 'cddoboboxeangripcqrn';
const PUBLIC_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';

const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1`;

async function checkTables() {
  console.log('🔍 Checking if tables exist in Supabase...\n');

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
    try {
      const response = await makeRequest(`${BASE_URL}/${table}?select=*&limit=1`);
      results[table] = '✅ EXISTS';
      console.log(`✅ ${table} - Table exists`);
    } catch (error) {
      if (error.status === 404) {
        results[table] = '❌ NOT FOUND';
        console.log(`❌ ${table} - Table not found`);
      } else {
        results[table] = `⚠️ ERROR: ${error.message}`;
        console.log(`⚠️ ${table} - Error: ${error.message}`);
      }
    }
  }

  console.log('\n📊 Summary:');
  const existing = Object.values(results).filter(r => r.includes('✅')).length;
  const missing = Object.values(results).filter(r => r.includes('❌')).length;
  const errors = Object.values(results).filter(r => r.includes('⚠️')).length;

  console.log(`✅ Existing tables: ${existing}`);
  console.log(`❌ Missing tables: ${missing}`);
  console.log(`⚠️ Errors: ${errors}`);

  if (missing > 0) {
    console.log('\n💡 The migrations may not have run properly.');
    console.log('   Let me try to run them manually...');
  } else {
    console.log('\n🎉 All tables exist! Database is ready.');
  }

  return results;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'apikey': PUBLIC_ANON_KEY,
        'Authorization': `Bearer ${PUBLIC_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          const error = new Error(`HTTP ${res.statusCode}: ${data}`);
          error.status = res.statusCode;
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

checkTables().catch(console.error);
