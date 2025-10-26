// Test specific delete functionality
const projectId = 'cddoboboxeangripcqrn';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';

async function testSpecificDeletes() {
  console.log('🧪 Testing specific delete scenarios...');
  
  // Test with actual IDs that might exist
  const testIds = [
    { type: 'customers', id: 'test-customer-123' },
    { type: 'workers', id: 'test-worker-123' },
    { type: 'payroll', id: 'test-payroll-123' },
    { type: 'sales', id: 'test-sale-123' },
    { type: 'cashiers', id: 'test-cashier-123' }
  ];
  
  for (const test of testIds) {
    try {
      console.log(`\nTesting ${test.type} delete with ID: ${test.id}`);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/${test.type}/${test.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`✅ ${test.type} DELETE: Working - ${JSON.stringify(data)}`);
      } else if (response.status === 404) {
        console.log(`⚠️ ${test.type} DELETE: Not found (expected for test ID)`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${test.type} DELETE: Error ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${test.type} DELETE: Network error - ${error.message}`);
    }
  }
}

testSpecificDeletes();


