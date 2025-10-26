import { projectId, publicAnonKey } from './supabase/info'

export async function setupAdminAccount(email: string, password: string, name: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-86b98184/auth/create-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      }
    )

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create admin account')
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error('Error setting up admin:', error)
    return { success: false, error: error.message }
  }
}

// Instructions for manual setup:
// Run this in browser console on first setup:
/*
const setupAdmin = async () => {
  const response = await fetch(
    'https://cddoboboxeangripcqrn.supabase.co/functions/v1/make-server-86b98184/auth/create-admin',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo'
      },
      body: JSON.stringify({
        email: 'uncle@latexfoam.com',
        password: 'YourSecurePassword123!',
        name: 'Uncle Manager'
      })
    }
  );
  const data = await response.json();
  console.log(data);
};
setupAdmin();
*/
