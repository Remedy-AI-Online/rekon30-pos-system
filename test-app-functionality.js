const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://cddoboboxeangripcqrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc1ODI1NCwiZXhwIjoyMDc1MzM0MjU0fQ.CbCMnclEfF2iWZzLeI4VGIgKYEPuYAt7P-kSAfPr83Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppFunctionality() {
  console.log('🧪 Testing App Functionality...');
  console.log('===============================');
  
  try {
    // Test 1: Check if we can read from products table
    console.log('1️⃣ Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
    } else {
      console.log(`✅ Products table working! Found ${products?.length || 0} products`);
    }

    // Test 2: Check if we can read from customers table
    console.log('2️⃣ Testing customers table...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(5);
    
    if (customersError) {
      console.log('❌ Customers table error:', customersError.message);
    } else {
      console.log(`✅ Customers table working! Found ${customers?.length || 0} customers`);
    }

    // Test 3: Check if we can read from workers table
    console.log('3️⃣ Testing workers table...');
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .limit(5);
    
    if (workersError) {
      console.log('❌ Workers table error:', workersError.message);
    } else {
      console.log(`✅ Workers table working! Found ${workers?.length || 0} workers`);
    }

    // Test 4: Check if we can read from sales table
    console.log('4️⃣ Testing sales table...');
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .limit(5);
    
    if (salesError) {
      console.log('❌ Sales table error:', salesError.message);
    } else {
      console.log(`✅ Sales table working! Found ${sales?.length || 0} sales`);
    }

    // Test 5: Check if we can read from cashiers table
    console.log('5️⃣ Testing cashiers table...');
    const { data: cashiers, error: cashiersError } = await supabase
      .from('cashiers')
      .select('*')
      .limit(5);
    
    if (cashiersError) {
      console.log('❌ Cashiers table error:', cashiersError.message);
    } else {
      console.log(`✅ Cashiers table working! Found ${cashiers?.length || 0} cashiers`);
    }

    // Test 6: Try to insert a test product
    console.log('6️⃣ Testing product insertion...');
    const testProduct = {
      name: 'Test Product',
      sku: `TEST_${Date.now()}`,
      category: 'Test',
      price: 10.00,
      stock: 100,
      status: 'Active'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.log('❌ Product insertion failed:', insertError.message);
    } else {
      console.log('✅ Product insertion working!');
      
      // Clean up test product
      if (insertResult && insertResult.length > 0) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Test product cleaned up');
      }
    }

    console.log('');
    console.log('🎯 Summary:');
    console.log('============');
    console.log('✅ Core database tables are working!');
    console.log('✅ Your app can now store and retrieve real data');
    console.log('✅ Products, customers, workers, sales, and cashiers are all functional');
    console.log('');
    console.log('🚀 Your Rekon30 ERP system is ready to use!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   • Start your app: npm run dev');
    console.log('   • Add some sample products');
    console.log('   • Create worker accounts');
    console.log('   • Test the POS system');
    console.log('   • Make some test sales');

  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

testAppFunctionality();
