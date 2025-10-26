const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://cddoboboxeangripcqrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingTables() {
  console.log('🔧 Creating Missing Tables...');
  console.log('=============================');
  
  const missingTables = [
    {
      name: 'corrections',
      sql: `
        CREATE TABLE IF NOT EXISTS corrections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sale_id UUID REFERENCES sales(id),
          cashier_id UUID REFERENCES cashiers(id),
          shop_id TEXT NOT NULL,
          shop_name TEXT NOT NULL,
          correction_type TEXT NOT NULL CHECK (correction_type IN ('Refund', 'Void', 'Adjustment', 'Return')),
          amount DECIMAL(10, 2) NOT NULL,
          reason TEXT NOT NULL,
          status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Processed')),
          approved_by UUID,
          approved_at TIMESTAMPTZ,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'payroll',
      sql: `
        CREATE TABLE IF NOT EXISTS payroll (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          worker_id UUID REFERENCES workers(id),
          shop_id TEXT NOT NULL,
          shop_name TEXT NOT NULL,
          pay_period_start DATE NOT NULL,
          pay_period_end DATE NOT NULL,
          base_salary DECIMAL(10, 2) NOT NULL,
          overtime_hours DECIMAL(5, 2) DEFAULT 0,
          overtime_rate DECIMAL(5, 2) DEFAULT 0,
          overtime_pay DECIMAL(10, 2) DEFAULT 0,
          bonus DECIMAL(10, 2) DEFAULT 0,
          deductions DECIMAL(10, 2) DEFAULT 0,
          total_pay DECIMAL(10, 2) NOT NULL,
          status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Cancelled')),
          processed_at TIMESTAMPTZ,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'daily_reports',
      sql: `
        CREATE TABLE IF NOT EXISTS daily_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shop_id TEXT NOT NULL,
          shop_name TEXT NOT NULL,
          report_date DATE NOT NULL,
          total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
          total_transactions INTEGER NOT NULL DEFAULT 0,
          total_customers INTEGER NOT NULL DEFAULT 0,
          top_products JSONB,
          low_stock_products JSONB,
          cashier_performance JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(shop_id, report_date)
        );
      `
    },
    {
      name: 'notifications',
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          shop_id TEXT,
          type TEXT NOT NULL CHECK (type IN ('Low Stock', 'Sale Alert', 'System', 'Error', 'Info')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT false,
          priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
          data JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          read_at TIMESTAMPTZ
        );
      `
    },
    {
      name: 'shop_settings',
      sql: `
        CREATE TABLE IF NOT EXISTS shop_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          shop_id TEXT UNIQUE NOT NULL,
          shop_name TEXT NOT NULL,
          settings JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'activity_logs',
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          user_name TEXT,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id UUID,
          changes JSONB,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of missingTables) {
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

  // Verify all tables now exist
  console.log('');
  console.log('🔍 Verifying all tables...');
  
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', [
      'products', 'customers', 'workers', 'cashiers', 'sales', 'sale_items',
      'corrections', 'payroll', 'daily_reports', 'notifications', 'shop_settings', 'activity_logs'
    ]);

  if (tablesError) {
    console.log('❌ Could not verify tables:', tablesError.message);
  } else {
    const businessTables = tables?.filter(t => 
      ['products', 'customers', 'workers', 'cashiers', 'sales', 'sale_items',
       'corrections', 'payroll', 'daily_reports', 'notifications', 'shop_settings', 'activity_logs'].includes(t.table_name)
    );
    console.log(`✅ Found ${businessTables?.length || 0} business tables!`);
    
    if (businessTables && businessTables.length > 0) {
      console.log('📋 All tables:', businessTables.map(t => t.table_name).join(', '));
    }
    
    if (businessTables?.length === 12) {
      console.log('');
      console.log('🎉 SUCCESS! All 12 business tables are now created!');
      console.log('🚀 Your Rekon30 ERP system is fully functional!');
    } else {
      console.log(`⚠️  Still missing ${12 - (businessTables?.length || 0)} tables`);
    }
  }
}

createMissingTables();
