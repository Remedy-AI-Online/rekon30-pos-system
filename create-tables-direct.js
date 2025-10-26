/**
 * Create tables directly using Supabase REST API
 */

const https = require('https');

const PROJECT_ID = 'cddoboboxeangripcqrn';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1`;

async function createTables() {
  console.log('🚀 Creating tables directly via Supabase REST API...\n');

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
          worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
          worker_name TEXT NOT NULL,
          shop_id TEXT NOT NULL,
          shop_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          auth_user_id UUID,
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
          receipt_id TEXT UNIQUE NOT NULL,
          date DATE NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          cashier_id UUID REFERENCES cashiers(id),
          cashier_name TEXT,
          shop_id TEXT NOT NULL,
          shop_name TEXT,
          customer_id UUID REFERENCES customers(id),
          customer_name TEXT,
          customer_phone TEXT,
          customer_email TEXT,
          payment_method TEXT NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          tax DECIMAL(10, 2) DEFAULT 0,
          discount DECIMAL(10, 2) DEFAULT 0,
          total DECIMAL(10, 2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
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
          product_name TEXT NOT NULL,
          product_sku TEXT,
          size TEXT,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          unit_cost DECIMAL(10, 2),
          total_price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📄 Creating ${table.name}...`);
      
      const response = await makeRequest(`${BASE_URL}/rpc/exec_sql`, {
        method: 'POST',
        body: JSON.stringify({ sql: table.sql })
      });
      
      console.log(`✅ ${table.name} created successfully`);
    } catch (error) {
      console.log(`❌ ${table.name} failed: ${error.message}`);
    }
  }

  console.log('\n🎯 Table creation complete!');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (options.body) {
      requestOptions.body = options.body;
    }

    const req = https.request(url, requestOptions, (res) => {
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
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

createTables().catch(console.error);
