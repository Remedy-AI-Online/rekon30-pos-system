const { projectId, publicAnonKey } = require('./src/utils/supabase/info');

async function testEndpoints() {
  console.log('Testing delete endpoints...');
  
  // Test customers endpoint
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/customers`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Customers endpoint status:', response.status);
    const data = await response.json();
    console.log('Customers response:', data);
  } catch (error) {
    console.log('Customers endpoint error:', error.message);
  }
  
  // Test workers endpoint  
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/workers`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Workers endpoint status:', response.status);
    const data = await response.json();
    console.log('Workers response:', data);
  } catch (error) {
    console.log('Workers endpoint error:', error.message);
  }
  
  // Test payroll endpoint
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/payroll`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    console.log('Payroll endpoint status:', response.status);
    const data = await response.json();
    console.log('Payroll response:', data);
  } catch (error) {
    console.log('Payroll endpoint error:', error.message);
  }
}

testEndpoints();


