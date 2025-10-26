-- Automatically fix all admin users by matching email to business email
-- This will link each admin user to their business

-- Update Fan milk admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'business_id', '6448248f-7fd9-4da9-8811-890d274cdb04'::text,
    'business_name', 'Fan milk'
)
WHERE email = 'presnelonline@gmail.com';

-- Update Profit Lane admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'business_id', '62b5c58d-c48e-4263-a780-348eb9395d89'::text,
    'business_name', 'Profit Lane'
)
WHERE email = 'dapaahsylvester5@gmail.com';

-- Update LatexFoam admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'business_id', 'ebb5b40a-7e12-4b5f-b85d-4624a8d3e77b'::text,
    'business_name', 'LatexFoam'
)
WHERE email = 'alexkoke46@gmail.com';

-- Verify all admin users now have business_id
SELECT
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'business_id' as business_id,
    u.raw_user_meta_data->>'business_name' as business_name
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin'
ORDER BY u.email;
