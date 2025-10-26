#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Backend Functions for Rekon30...\n');

// Function names and their descriptions
const functions = [
  { name: 'backup-system', description: 'Automated backup system for businesses' },
  { name: 'backup-scheduler', description: 'Backup scheduler for all businesses' },
  { name: 'data-restore', description: 'Data restore system for lost data recovery' },
  { name: 'api-security', description: 'API security with rate limiting and key management' },
  { name: 'realtime-events', description: 'Real-time events system for dashboard updates' },
  { name: 'payment-verification', description: 'Manual payment verification system' },
  { name: 'analytics', description: 'Comprehensive analytics system' },
  { name: 'cron-backup', description: 'Cron job for automated backups every 5 minutes' }
];

async function deployFunction(functionName, description) {
  try {
    console.log(`📦 Deploying ${functionName}...`);
    
    // Check if function directory exists
    const functionPath = path.join('supabase', 'functions', functionName);
    if (!fs.existsSync(functionPath)) {
      console.log(`❌ Function directory not found: ${functionPath}`);
      return false;
    }

    // Deploy the function
    execSync(`supabase functions deploy ${functionName}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(`✅ ${functionName} deployed successfully - ${description}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to deploy ${functionName}: ${error.message}`);
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('\n📊 Running database migrations...');
    execSync('supabase db push', { stdio: 'inherit' });
    console.log('✅ Database migrations completed');
    return true;
  } catch (error) {
    console.log(`❌ Migration failed: ${error.message}`);
    return false;
  }
}

async function setupCronJobs() {
  try {
    console.log('\n⏰ Setting up cron jobs...');
    
    // Create a simple cron setup script
    const cronScript = `
# Rekon30 Backup Cron Job
# Runs every 5 minutes
*/5 * * * * curl -X POST "https://your-project.supabase.co/functions/v1/cron-backup" \\
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \\
  -H "Content-Type: application/json"
    `;
    
    fs.writeFileSync('cron-backup-setup.txt', cronScript);
    console.log('✅ Cron job setup instructions saved to cron-backup-setup.txt');
    console.log('📝 Add the cron job to your server or use a service like GitHub Actions');
    return true;
  } catch (error) {
    console.log(`❌ Cron setup failed: ${error.message}`);
    return false;
  }
}

async function createAPIKeyManagement() {
  try {
    console.log('\n🔑 Creating API key management system...');
    
    const apiKeyScript = `
-- Create API key for third-party integrations
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit, created_by)
VALUES (
  'Third Party Integration',
  'sk_' || substr(md5(random()::text), 1, 32),
  NULL, -- System-wide key
  '["analytics", "backup_status"]'::jsonb,
  1000,
  (SELECT id FROM super_admins LIMIT 1)
);
    `;
    
    fs.writeFileSync('api-key-setup.sql', apiKeyScript);
    console.log('✅ API key management script created');
    return true;
  } catch (error) {
    console.log(`❌ API key setup failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🎯 Rekon30 Backend Deployment Started\n');
  
  let successCount = 0;
  let totalFunctions = functions.length;
  
  // Deploy all functions
  for (const func of functions) {
    const success = await deployFunction(func.name, func.description);
    if (success) successCount++;
  }
  
  // Run migrations
  const migrationSuccess = await runMigrations();
  
  // Setup cron jobs
  const cronSuccess = await setupCronJobs();
  
  // Create API key management
  const apiKeySuccess = await createAPIKeyManagement();
  
  // Summary
  console.log('\n📋 Deployment Summary:');
  console.log(`✅ Functions deployed: ${successCount}/${totalFunctions}`);
  console.log(`✅ Database migrations: ${migrationSuccess ? 'Success' : 'Failed'}`);
  console.log(`✅ Cron job setup: ${cronSuccess ? 'Success' : 'Failed'}`);
  console.log(`✅ API key management: ${apiKeySuccess ? 'Success' : 'Failed'}`);
  
  if (successCount === totalFunctions && migrationSuccess) {
    console.log('\n🎉 All backend functions deployed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Set up cron job for automated backups (see cron-backup-setup.txt)');
    console.log('2. Create API keys for integrations (see api-key-setup.sql)');
    console.log('3. Test the functions using the Supabase dashboard');
    console.log('4. Configure real-time subscriptions in your frontend');
  } else {
    console.log('\n⚠️  Some functions failed to deploy. Check the errors above.');
  }
}

main().catch(console.error);
