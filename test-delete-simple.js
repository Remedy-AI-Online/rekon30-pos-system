// Test delete endpoints
const projectId = 'cddoboboxeangripcqrn';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';

async function testDeleteEndpoints() {
  console.log('🧪 Testing delete endpoints...');
  
  // Test customers delete endpoint
  try {
    console.log('\n1. Testing customers delete endpoint...');
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/customers/test-id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Customers DELETE status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Customers DELETE error:', error.message);
  }
  
  // Test workers delete endpoint
  try {
    console.log('\n2. Testing workers delete endpoint...');
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/workers/test-id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Workers DELETE status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Workers DELETE error:', error.message);
  }
  
  // Test payroll delete endpoint
  try {
    console.log('\n3. Testing payroll delete endpoint...');
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll/test-id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Payroll DELETE status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Payroll DELETE error:', error.message);
  }
}

testDeleteEndpoints();


