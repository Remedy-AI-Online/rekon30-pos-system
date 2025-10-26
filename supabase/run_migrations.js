/**
 * Run Supabase Migrations Script
 * This script will execute all SQL migrations against your Supabase database
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase credentials
const PROJECT_ID = 'cddoboboxeangripcqrn';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';
const DATABASE_PASSWORD = 'Sylvester1_Dapaah';

// PostgreSQL connection using Supabase REST API
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

async function executeSQLFile(filename) {
  const sqlPath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  console.log(`\n📄 Executing ${filename}...`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ ${filename} executed successfully`);
          resolve(responseData);
        } else {
          console.error(`❌ Error executing ${filename}:`, res.statusCode, responseData);
          // Don't reject - continue with other migrations
          resolve(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Network error for ${filename}:`, error);
      resolve(); // Continue with other migrations
    });
    
    req.write(data);
    req.end();
  });
}

async function runMigrations() {
  console.log('🚀 Starting Supabase migrations...\n');
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log(`🌐 URL: ${SUPABASE_URL}\n`);
  
  const migrationFiles = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_functions_triggers.sql'
  ];
  
  for (const file of migrationFiles) {
    await executeSQLFile(file);
    // Wait a bit between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ All migrations completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify tables in Supabase Dashboard → Table Editor');
  console.log('   2. Check RLS policies in → Authentication → Policies');
  console.log('   3. Test the application');
}

// Alternative: Direct PostgreSQL execution
async function runMigrationsDirectSQL() {
  const { Client } = require('pg');
  
  const client = new Client({
    host: `db.${PROJECT_ID}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DATABASE_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_rls_policies.sql',
      '003_functions_triggers.sql'
    ];
    
    for (const file of migrationFiles) {
      const sqlPath = path.join(__dirname, 'migrations', file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log(`📄 Executing ${file}...`);
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error.message);
        // Continue with other migrations
      }
      
      // Wait a bit between migrations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✨ All migrations completed!');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    await client.end();
  }
}

// Check if pg module is available
try {
  require.resolve('pg');
  console.log('Using PostgreSQL direct connection...\n');
  runMigrationsDirectSQL();
} catch (e) {
  console.log('PostgreSQL module not found. Please install it with:');
  console.log('  npm install pg');
  console.log('\nOr run migrations manually through Supabase SQL Editor.');
  console.log('Copy the SQL files from supabase/migrations/ and paste them in:');
  console.log('  Supabase Dashboard → SQL Editor → New Query\n');
}

module.exports = { runMigrations, runMigrationsDirectSQL };

