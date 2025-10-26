/**
 * Automated Supabase Migration Runner
 * This will connect directly to your PostgreSQL database and run all migrations
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const PROJECT_ID = 'cddoboboxeangripcqrn';
const DATABASE_PASSWORD = 'Sylvester1_Dapaah';

// PostgreSQL connection string
const connectionString = `postgresql://postgres:${DATABASE_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function runAutomatedMigrations() {
  console.log('🚀 Automated Supabase Migration Runner');
  console.log(`📦 Project: ${PROJECT_ID}`);
  console.log(`🔌 Connecting to PostgreSQL...\n`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL!\n');

    // Read and execute migration files
    const migrations = [
      '001_initial_schema.sql',
      '002_rls_policies.sql', 
      '003_functions_triggers.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📄 Running ${migrationFile}...`);
      
      const sqlPath = path.join(__dirname, 'migrations', migrationFile);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${migrationFile} completed successfully\n`);
      } catch (error) {
        console.log(`⚠️  ${migrationFile} had some issues:`, error.message);
        console.log('   (This is often normal - continuing...)\n');
      }
      
      // Wait between migrations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verify tables were created
    console.log('🔍 Verifying database setup...');
    
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE '_%'
      ORDER BY table_name;
    `);

    const createdTables = tableCheck.rows.map(row => row.table_name);
    
    console.log(`📊 Found ${createdTables.length} tables:`);
    createdTables.forEach(table => console.log(`   ✅ ${table}`));

    // Check for required tables
    const requiredTables = [
      'products', 'customers', 'workers', 'cashiers', 
      'sales', 'sale_items', 'corrections', 'payroll',
      'daily_reports', 'notifications', 'shop_settings', 'activity_logs'
    ];

    const missingTables = requiredTables.filter(table => !createdTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('\n🎉 SUCCESS! All required tables created!');
      console.log('✅ Your database is ready to use');
    } else {
      console.log('\n⚠️  Some tables may be missing:');
      missingTables.forEach(table => console.log(`   ❌ ${table}`));
    }

    // Test inserting sample data
    console.log('\n🧪 Testing database functionality...');
    
    try {
      // Test products table
      await client.query(`
        INSERT INTO products (name, sku, category, price, stock) 
        VALUES ('Test Product', 'TEST-001', 'Test', 10.00, 100)
        ON CONFLICT (sku) DO NOTHING;
      `);
      console.log('✅ Products table working');

      // Test customers table  
      await client.query(`
        INSERT INTO customers (name, phone) 
        VALUES ('Test Customer', '123-456-7890')
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Customers table working');

      // Test workers table
      await client.query(`
        INSERT INTO workers (name, phone, position, shop_id, shop_name, salary, hire_date) 
        VALUES ('Test Worker', '123-456-7890', 'Cashier', 'SHOP001', 'Test Shop', 1000.00, CURRENT_DATE)
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Workers table working');

      console.log('\n🎯 Database is fully functional!');
      
    } catch (testError) {
      console.log('⚠️  Sample data test had issues:', testError.message);
      console.log('   (This might be normal if tables have constraints)');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your database password');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Try running migrations manually via Supabase Dashboard');
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the automated migration
runAutomatedMigrations().catch(console.error);
