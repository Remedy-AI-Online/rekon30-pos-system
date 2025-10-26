-- Verification Script: Check if all data has been cleaned
-- Run this to verify the cleanup was successful

-- Check PostgreSQL tables
DO $$
DECLARE
  product_count INTEGER;
  customer_count INTEGER;
  worker_count INTEGER;
  sale_count INTEGER;
  cashier_count INTEGER;
  kv_count INTEGER;
  auth_super_admin INTEGER;
  auth_admin INTEGER;
  auth_cashier_worker INTEGER;
  business_count INTEGER;
BEGIN
  -- Count records in operational tables
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO worker_count FROM workers;
  SELECT COUNT(*) INTO sale_count FROM sales;
  SELECT COUNT(*) INTO cashier_count FROM cashiers;
  
  -- Count KV store entries
  SELECT COUNT(*) INTO kv_count FROM kv_store_86b98184;
  
  -- Count auth users by role
  SELECT COUNT(*) INTO auth_super_admin FROM auth.users WHERE raw_user_meta_data->>'role' = 'super_admin';
  SELECT COUNT(*) INTO auth_admin FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin';
  SELECT COUNT(*) INTO auth_cashier_worker FROM auth.users WHERE raw_user_meta_data->>'role' IN ('cashier', 'worker');
  
  -- Count businesses
  SELECT COUNT(*) INTO business_count FROM businesses;

  RAISE NOTICE '==========================================';
  RAISE NOTICE '🔍 CLEANUP VERIFICATION REPORT';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 OPERATIONAL DATA (Should be 0):';
  RAISE NOTICE '  Products:        %', product_count;
  RAISE NOTICE '  Customers:       %', customer_count;
  RAISE NOTICE '  Workers:         %', worker_count;
  RAISE NOTICE '  Sales:           %', sale_count;
  RAISE NOTICE '  Cashiers:        %', cashier_count;
  RAISE NOTICE '  KV Store:        %', kv_count;
  RAISE NOTICE '';
  RAISE NOTICE '👥 AUTH USERS:';
  RAISE NOTICE '  Super Admins:    %', auth_super_admin;
  RAISE NOTICE '  Admins:          %', auth_admin;
  RAISE NOTICE '  Cashier/Workers: % (Should be 0)', auth_cashier_worker;
  RAISE NOTICE '';
  RAISE NOTICE '🏢 SYSTEM DATA:';
  RAISE NOTICE '  Businesses:      %', business_count;
  RAISE NOTICE '';
  
  -- Overall status
  IF product_count = 0 AND customer_count = 0 AND worker_count = 0 AND 
     sale_count = 0 AND cashier_count = 0 AND kv_count = 0 AND 
     auth_cashier_worker = 0 THEN
    RAISE NOTICE '✅ STATUS: CLEANUP SUCCESSFUL!';
    RAISE NOTICE '   All operational data has been removed.';
    RAISE NOTICE '   System data preserved: % Super Admin(s), % Admin(s), % Business(es)', 
                 auth_super_admin, auth_admin, business_count;
  ELSE
    RAISE NOTICE '⚠️  STATUS: CLEANUP INCOMPLETE';
    RAISE NOTICE '   Some data still exists. Review the counts above.';
  END IF;
  
  RAISE NOTICE '==========================================';
END $$;

