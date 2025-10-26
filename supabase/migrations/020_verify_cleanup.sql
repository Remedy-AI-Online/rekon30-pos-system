-- Verify All Data Has Been Cleared
-- This will show counts for all tables to confirm cleanup

SELECT '=== CLEANUP VERIFICATION REPORT ===' as status;

-- Check auth users
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEARED'
    WHEN COUNT(*) = 1 THEN '✅ ONLY SUPER ADMIN REMAINS'
    ELSE '❌ STILL HAS DATA'
  END as status
FROM auth.users;

-- Check business tables
SELECT 'business_signup_requests' as table_name, COUNT(*) as count, 
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM business_signup_requests
UNION ALL
SELECT 'businesses' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM businesses;

-- Check operational data
SELECT 'products' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM products
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM customers
UNION ALL
SELECT 'workers' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM workers
UNION ALL
SELECT 'sales' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM sales;

-- Check KV store
SELECT 'kv_store_86b98184' as table_name, COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ CLEARED' ELSE '❌ STILL HAS DATA' END as status
FROM kv_store_86b98184;

-- Final status
SELECT '=== FRESH START READY ===' as status;
