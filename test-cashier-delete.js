// Test cashier delete endpoint
const projectId = 'cddoboboxeangripcqrn';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo';

async function testCashierDelete() {
  console.log('🧪 Testing cashier delete endpoint...');
  
  try {
    console.log('\nTesting cashier delete endpoint...');
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/cashiers/test-id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Cashier DELETE status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.log('Cashier DELETE error:', error.message);
  }
}

testCashierDelete();


