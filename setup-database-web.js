const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Database Setup Guide');
console.log('=======================');
console.log('');

// Read the SQL migration files
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

console.log('📋 Migration files found:');
const migrationFiles = [
  '20251011145258_initial_schema.sql',
  '20251011145309_rls_policies.sql', 
  '20251011145325_functions_triggers.sql'
];

migrationFiles.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${index + 1}. ${file}`);
  } else {
    console.log(`❌ ${index + 1}. ${file} - NOT FOUND`);
  }
});

console.log('');
console.log('🌐 Opening web-based SQL runner...');
console.log('');

// Open the SQL runner in the browser
const sqlRunnerPath = path.join(__dirname, 'supabase', 'sql-runner.html');
const fullPath = `file://${sqlRunnerPath.replace(/\\/g, '/')}`;

console.log('📖 INSTRUCTIONS:');
console.log('================');
console.log('');
console.log('1. The SQL runner should open in your browser');
console.log('2. If it doesn\'t open automatically, navigate to:');
console.log(`   ${fullPath}`);
console.log('');
console.log('3. Follow these steps in order:');
console.log('');
console.log('   STEP 1: Run Initial Schema');
console.log('   ---------------------------');
console.log('   • Copy ALL content from: supabase/migrations/20251011145258_initial_schema.sql');
console.log('   • Paste into the SQL editor');
console.log('   • Click "Execute SQL"');
console.log('   • Wait for "Success" message');
console.log('');
console.log('   STEP 2: Run RLS Policies');
console.log('   -------------------------');
console.log('   • Clear the editor');
console.log('   • Copy ALL content from: supabase/migrations/20251011145309_rls_policies.sql');
console.log('   • Paste and execute');
console.log('   • Wait for "Success" message');
console.log('');
console.log('   STEP 3: Run Functions & Triggers');
console.log('   ---------------------------------');
console.log('   • Clear the editor');
console.log('   • Copy ALL content from: supabase/migrations/20251011145325_functions_triggers.sql');
console.log('   • Paste and execute');
console.log('   • Wait for "Success" message');
console.log('');
console.log('4. After all 3 steps are complete, run: node check-tables.js');
console.log('   This will verify that all tables were created successfully.');
console.log('');
console.log('🎯 Expected Result:');
console.log('   ✅ 12 business tables created');
console.log('   ✅ Row Level Security enabled');
console.log('   ✅ Database functions and triggers active');
console.log('   ✅ Your app will now work with real data!');
console.log('');

// Try to open the SQL runner
try {
  const { spawn } = require('child_process');
  
  // Try different commands based on OS
  const commands = [
    { cmd: 'start', args: [fullPath], os: 'win32' },
    { cmd: 'open', args: [fullPath], os: 'darwin' },
    { cmd: 'xdg-open', args: [fullPath], os: 'linux' }
  ];
  
  const platform = process.platform;
  const command = commands.find(c => c.os === platform) || commands[0];
  
  const child = spawn(command.cmd, command.args, { 
    detached: true, 
    stdio: 'ignore' 
  });
  
  child.unref();
  
  console.log('✅ SQL runner opened in browser!');
  console.log('');
  console.log('⏳ Please follow the instructions above to set up your database.');
  console.log('   This should take about 2-3 minutes.');
  
} catch (error) {
  console.log('⚠️  Could not auto-open browser. Please manually navigate to:');
  console.log(`   ${fullPath}`);
  console.log('');
  console.log('   Then follow the instructions above.');
}

console.log('');
console.log('🔄 After setup, run this command to verify:');
console.log('   node check-tables.js');
console.log('');
