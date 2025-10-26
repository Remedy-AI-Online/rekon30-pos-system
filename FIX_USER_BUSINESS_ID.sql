-- Fix admin user to have business_id in metadata
-- This allows workers and other operations to work correctly

-- First, let's see what users and businesses exist
SELECT
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'business_id' as current_business_id,
    u.raw_user_meta_data->>'business_name' as current_business_name
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
ORDER BY u.created_at DESC;

-- Show all businesses
SELECT id, business_name, owner_name, owner_email, status, plan
FROM public.businesses
ORDER BY created_at DESC;

-- Now update the admin user with their business_id
-- ⚠️ IMPORTANT: Replace the values below with actual data from the queries above

/*
-- Example: If user email is 'admin@example.com' and business_id is '123e4567-e89b-12d3-a456-426614174000'
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'business_id', '123e4567-e89b-12d3-a456-426614174000'::text,
    'business_name', 'My Business Name'
)
WHERE email = 'admin@example.com';
*/

-- After updating, verify the change:
SELECT
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'business_id' as business_id,
    u.raw_user_meta_data->>'business_name' as business_name
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin';
