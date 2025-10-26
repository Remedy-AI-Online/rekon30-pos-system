const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const supabaseUrl = 'https://cddoboboxeangripcqrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTablesDirectly() {
  console.log('🚀 Creating tables directly using Supabase client...');
  
  try {
    // Test basic connection
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful!');

    // Create tables one by one using direct SQL execution
    const tables = [
      {
        name: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            supplier TEXT,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            cost DECIMAL(10, 2),
            stock INTEGER NOT NULL DEFAULT 0,
            low_stock_threshold INTEGER DEFAULT 10,
            status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Low Stock', 'Out of Stock')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'customers',
        sql: `
          CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            total_purchases DECIMAL(10, 2) DEFAULT 0,
            loyalty_points INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'workers',
        sql: `
          CREATE TABLE IF NOT EXISTS workers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT NOT NULL,
            position TEXT NOT NULL,
            department TEXT,
            shop_id TEXT NOT NULL,
            shop_name TEXT NOT NULL,
            salary DECIMAL(10, 2) NOT NULL,
            hire_date DATE NOT NULL,
            status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
            address TEXT,
            emergency_contact TEXT,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'cashiers',
        sql: `
          CREATE TABLE IF NOT EXISTS cashiers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            worker_id UUID REFERENCES workers(id),
            shop_id TEXT NOT NULL,
            shop_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            active BOOLEAN DEFAULT true,
            last_login TIMESTAMPTZ,
            login_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'sales',
        sql: `
          CREATE TABLE IF NOT EXISTS sales (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID REFERENCES customers(id),
            cashier_id UUID REFERENCES cashiers(id),
            shop_id TEXT NOT NULL,
            shop_name TEXT NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            payment_method TEXT NOT NULL,
            status TEXT DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Cancelled', 'Refunded')),
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'sale_items',
        sql: `
          CREATE TABLE IF NOT EXISTS sale_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id),
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      }
    ];

    // Create each table
    for (const table of tables) {
      console.log(`📄 Creating ${table.name}...`);
      
      try {
        // Try using the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({ sql: table.sql })
        });

        if (response.ok) {
          console.log(`✅ ${table.name} created successfully!`);
        } else {
          const errorText = await response.text();
          console.log(`❌ ${table.name} failed:`, errorText);
        }
      } catch (error) {
        console.log(`❌ ${table.name} failed:`, error.message);
      }
    }

    // Verify tables were created
    console.log('🔍 Checking if tables exist...');
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Could not verify tables:', tablesError.message);
    } else {
      const businessTables = existingTables?.filter(t => 
        ['products', 'customers', 'workers', 'cashiers', 'sales', 'sale_items'].includes(t.table_name)
      );
      console.log(`✅ Found ${businessTables?.length || 0} business tables!`);
      if (businessTables && businessTables.length > 0) {
        console.log('📋 Created tables:', businessTables.map(t => t.table_name).join(', '));
      }
    }

  } catch (error) {
    console.log('💥 Setup failed:', error.message);
  }
}

createTablesDirectly();
