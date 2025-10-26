-- Add features array to each admin user based on their business plan
-- This will make all the menu items appear in the sidebar

-- Fan milk (Enterprise plan) - Add all enterprise features
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'features', '["inventory", "sales", "workers", "reports", "customers", "multi-location", "analytics", "api", "white-label", "priority-support", "custom-features"]'::jsonb
)
WHERE email = 'presnelonline@gmail.com';

-- Profit Lane (Basic plan but has all features in business table)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'features', '["inventory", "sales", "workers", "reports", "customers", "multi-location", "analytics", "api", "white-label", "priority-support", "custom-features"]'::jsonb
)
WHERE email = 'dapaahsylvester5@gmail.com';

-- LatexFoam (Pro plan) - Basic features
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
    'features', '["inventory", "sales", "workers", "reports"]'::jsonb
)
WHERE email = 'alexkoke46@gmail.com';

-- Verify all users now have features
SELECT
    u.email,
    u.raw_user_meta_data->>'role' as role,
    u.raw_user_meta_data->>'business_name' as business_name,
    u.raw_user_meta_data->'features' as features
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin'
ORDER BY u.email;
