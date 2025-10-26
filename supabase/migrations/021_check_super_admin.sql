-- Check if Super Admin account exists
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data,
  email_confirmed_at,
  phone_confirmed_at
FROM auth.users 
WHERE email = 'superadmin@rekon360.com';

-- If no results, we need to create the Super Admin account
