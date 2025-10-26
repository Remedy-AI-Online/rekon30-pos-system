-- Clear All Data - Fresh Start
-- This will remove all businesses, users, and related data

-- 1. Clear all auth users (except super admin)
DELETE FROM auth.users 
WHERE raw_user_meta_data->>'role' IN ('admin', 'cashier') 
   OR email != 'superadmin@rekon360.com';

-- 2. Clear all business signup requests
TRUNCATE TABLE business_signup_requests CASCADE;

-- 3. Clear all businesses
TRUNCATE TABLE businesses CASCADE;

-- 4. Clear all operational data
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE workers CASCADE;
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE cashiers CASCADE;
TRUNCATE TABLE corrections CASCADE;
TRUNCATE TABLE payroll CASCADE;

-- 5. Clear backup records
TRUNCATE TABLE backup_records CASCADE;

-- 6. Clear API keys
TRUNCATE TABLE api_keys CASCADE;

-- 7. Clear custom features
TRUNCATE TABLE custom_features CASCADE;

-- 8. Clear business feature logs
TRUNCATE TABLE business_feature_log CASCADE;

-- 9. Clear KV store
TRUNCATE TABLE kv_store_86b98184 CASCADE;

-- 10. Show counts to verify cleanup
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'business_signup_requests' as table_name, 
  COUNT(*) as count 
FROM business_signup_requests
UNION ALL
SELECT 
  'businesses' as table_name, 
  COUNT(*) as count 
FROM businesses
UNION ALL
SELECT 
  'products' as table_name, 
  COUNT(*) as count 
FROM products
UNION ALL
SELECT 
  'customers' as table_name, 
  COUNT(*) as count 
FROM customers
UNION ALL
SELECT 
  'workers' as table_name, 
  COUNT(*) as count 
FROM workers
UNION ALL
SELECT 
  'sales' as table_name, 
  COUNT(*) as count 
FROM sales
UNION ALL
SELECT 
  'kv_store_86b98184' as table_name, 
  COUNT(*) as count 
FROM kv_store_86b98184;

-- Success message
SELECT 'All data cleared successfully! Fresh start ready.' as status;
