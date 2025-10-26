-- NUCLEAR DATA CLEANUP - Remove ALL operational data while preserving system structure
-- This is necessary because tables lack proper business_id multi-tenancy
-- WARNING: This will delete ALL data from products, customers, workers, sales, etc.

-- First, verify what we're about to delete
DO $$
DECLARE
  product_count INTEGER;
  customer_count INTEGER;
  worker_count INTEGER;
  sale_count INTEGER;
  cashier_count INTEGER;
  correction_count INTEGER;
  payroll_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO worker_count FROM workers;
  SELECT COUNT(*) INTO sale_count FROM sales;
  SELECT COUNT(*) INTO cashier_count FROM cashiers;
  SELECT COUNT(*) INTO correction_count FROM corrections;
  SELECT COUNT(*) INTO payroll_count FROM payroll;

  RAISE NOTICE '==========================================';
  RAISE NOTICE 'DATA CLEANUP - BEFORE';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Products: %', product_count;
  RAISE NOTICE 'Customers: %', customer_count;
  RAISE NOTICE 'Workers: %', worker_count;
  RAISE NOTICE 'Sales: %', sale_count;
  RAISE NOTICE 'Cashiers: %', cashier_count;
  RAISE NOTICE 'Corrections: %', correction_count;
  RAISE NOTICE 'Payroll: %', payroll_count;
  RAISE NOTICE '==========================================';
END $$;

-- Delete all operational data (CASCADE will handle foreign keys)
TRUNCATE TABLE sale_items CASCADE;
TRUNCATE TABLE sales CASCADE;
TRUNCATE TABLE corrections CASCADE;
TRUNCATE TABLE payroll CASCADE;
TRUNCATE TABLE cashiers CASCADE;
TRUNCATE TABLE workers CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE daily_reports CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- Delete cashier/worker users from auth (keep super_admin and admin)
DELETE FROM auth.sessions 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' IN ('cashier', 'worker')
);

DELETE FROM auth.users 
WHERE raw_user_meta_data->>'role' IN ('cashier', 'worker');

-- Verify deletion
DO $$
DECLARE
  product_count INTEGER;
  customer_count INTEGER;
  worker_count INTEGER;
  sale_count INTEGER;
  cashier_count INTEGER;
  auth_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO customer_count FROM customers;
  SELECT COUNT(*) INTO worker_count FROM workers;
  SELECT COUNT(*) INTO sale_count FROM sales;
  SELECT COUNT(*) INTO cashier_count FROM cashiers;
  SELECT COUNT(*) INTO auth_user_count FROM auth.users WHERE raw_user_meta_data->>'role' IN ('super_admin', 'admin');

  RAISE NOTICE '==========================================';
  RAISE NOTICE 'DATA CLEANUP - AFTER';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Products: %', product_count;
  RAISE NOTICE 'Customers: %', customer_count;
  RAISE NOTICE 'Workers: %', worker_count;
  RAISE NOTICE 'Sales: %', sale_count;
  RAISE NOTICE 'Cashiers: %', cashier_count;
  RAISE NOTICE 'Remaining auth users (super_admin/admin): %', auth_user_count;
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'CLEANUP COMPLETE - All operational data removed!';
  RAISE NOTICE '==========================================';
END $$;

