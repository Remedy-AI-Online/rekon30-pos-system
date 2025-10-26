-- Clear all data from the KV store
-- This is where the actual products, customers, workers, and sales data is stored

-- Check what's in the KV store before deletion
DO $$
DECLARE
  kv_count INTEGER;
  product_keys INTEGER;
  customer_keys INTEGER;
  worker_keys INTEGER;
  sale_keys INTEGER;
BEGIN
  SELECT COUNT(*) INTO kv_count FROM kv_store_86b98184;
  SELECT COUNT(*) INTO product_keys FROM kv_store_86b98184 WHERE key LIKE 'product_%';
  SELECT COUNT(*) INTO customer_keys FROM kv_store_86b98184 WHERE key LIKE 'customer_%';
  SELECT COUNT(*) INTO worker_keys FROM kv_store_86b98184 WHERE key LIKE 'worker_%';
  SELECT COUNT(*) INTO sale_keys FROM kv_store_86b98184 WHERE key LIKE 'sale_%';

  RAISE NOTICE '==========================================';
  RAISE NOTICE 'KV STORE CLEANUP - BEFORE';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Total KV entries: %', kv_count;
  RAISE NOTICE 'Product keys: %', product_keys;
  RAISE NOTICE 'Customer keys: %', customer_keys;
  RAISE NOTICE 'Worker keys: %', worker_keys;
  RAISE NOTICE 'Sale keys: %', sale_keys;
  RAISE NOTICE '==========================================';
END $$;

-- Delete ALL data from the KV store
-- This removes products, customers, workers, sales, cashiers, corrections, payroll, etc.
TRUNCATE TABLE kv_store_86b98184;

-- Verify deletion
DO $$
DECLARE
  kv_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO kv_count FROM kv_store_86b98184;

  RAISE NOTICE '==========================================';
  RAISE NOTICE 'KV STORE CLEANUP - AFTER';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Total KV entries: %', kv_count;
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'KV STORE CLEANUP COMPLETE!';
  RAISE NOTICE 'All operational data has been removed.';
  RAISE NOTICE '==========================================';
END $$;

