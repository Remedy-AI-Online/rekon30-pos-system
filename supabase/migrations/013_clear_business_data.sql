-- Clear all test data (these tables don't have business_id, so clear everything)
-- This is a one-time cleanup for testing

-- Delete all sales records
TRUNCATE TABLE sales CASCADE;

-- Delete all payroll records
TRUNCATE TABLE payroll CASCADE;

-- Delete all workers
TRUNCATE TABLE workers CASCADE;

-- Delete all customers
TRUNCATE TABLE customers CASCADE;

-- Delete all products
TRUNCATE TABLE products CASCADE;

-- Delete all cashier/worker users (keep only super_admin and admin)
DELETE FROM auth.users 
WHERE raw_user_meta_data->>'role' IN ('cashier', 'worker');

-- Note: Since tables don't have business_id column, this clears ALL data
-- In production, you would need to add business_id columns for proper multi-tenancy
