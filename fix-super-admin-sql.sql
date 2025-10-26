-- Fix Super Admin Role - Run this in Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query

-- Update the user metadata to set role as super_admin
UPDATE auth.users 
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'), 
    '{role}', 
    '"super_admin"'
)
WHERE email = 'admin@rekon360.com';

-- Also update the name if needed
UPDATE auth.users 
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'), 
    '{name}', 
    '"Rekon360 Owner"'
)
WHERE email = 'admin@rekon360.com';

-- Verify the update worked
SELECT 
    id,
    email,
    user_metadata->>'role' as role,
    user_metadata->>'name' as name,
    created_at
FROM auth.users 
WHERE email = 'admin@rekon360.com';

-- Success message
SELECT 'Super Admin role updated successfully! You can now login.' as message;
