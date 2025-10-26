-- Check admin users
SELECT u.id as user_id, u.email, u.raw_user_meta_data->>'role' as role, u.raw_user_meta_data->>'business_id' as current_business_id, u.raw_user_meta_data->>'business_name' as current_business_name FROM auth.users u WHERE u.raw_user_meta_data->>'role' IN ('admin', 'super_admin') ORDER BY u.created_at DESC;
