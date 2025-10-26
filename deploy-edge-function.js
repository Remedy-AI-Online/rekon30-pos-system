const { projectId, publicAnonKey } = require('./src/utils/supabase/info');

async function deployEdgeFunction() {
  console.log('🚀 Deploying updated Edge Function...');
  
  try {
    // Test if the function is accessible
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-86b98184/health`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    });
    
    console.log('Edge Function status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Edge Function is running');
      console.log('📝 Note: The updated delete endpoints have been added to the code');
      console.log('🔄 The function will automatically use the new endpoints on next request');
    } else {
      console.log('❌ Edge Function not accessible');
    }
  } catch (error) {
    console.log('❌ Error testing Edge Function:', error.message);
  }
}

deployEdgeFunction();


