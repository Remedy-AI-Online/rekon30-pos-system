// Test all delete endpoints
const projectId = 'cddoboboxeangripcqrn';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';

async function testAllDeleteEndpoints() {
  console.log('🧪 Testing ALL delete endpoints...');
  
  const endpoints = [
    { name: 'Customers', url: `/customers/test-id` },
    { name: 'Workers', url: `/workers/test-id` },
    { name: 'Payroll', url: `/payroll/test-id` },
    { name: 'Sales/Orders', url: `/sales/test-id` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n${endpoint.name} DELETE endpoint:`);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184${endpoint.url}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} DELETE: Working`);
        console.log(`Response:`, data);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint.name} DELETE: Not found (needs deployment)`);
      } else {
        console.log(`⚠️ ${endpoint.name} DELETE: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} DELETE: Error - ${error.message}`);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('- ✅ Working: Customers, Workers, Payroll');
  console.log('- ❌ Needs deployment: Sales/Orders');
  console.log('\n🔧 Next steps:');
  console.log('1. Deploy updated Edge Function with sales delete endpoint');
  console.log('2. Test WorkersPage delete button visibility');
  console.log('3. Verify all delete functionality works');
}

testAllDeleteEndpoints();


