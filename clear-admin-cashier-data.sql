-- =====================================================
-- Clear All Admin and Cashier Data Script
-- =====================================================
-- WARNING: This will delete ALL admin and cashier data
-- Super Admin data will remain intact
-- =====================================================

BEGIN;

-- 1. Delete all cashier-related data
DELETE FROM sales WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM payroll WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM workers WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM customers WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM products WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM locations WHERE business_id IN (SELECT id FROM businesses);
DELETE FROM business_feature_log WHERE business_id IN (SELECT id FROM businesses);

-- 2. Delete all backup records for businesses
DELETE FROM backup_records WHERE business_id IN (SELECT id FROM businesses);

-- 3. Delete all payments for businesses
DELETE FROM payments WHERE business_id IN (SELECT id FROM businesses);

-- 4. Delete all businesses (This will cascade delete related data due to ON DELETE CASCADE)
DELETE FROM businesses WHERE id IS NOT NULL;

-- 5. Delete all auth users EXCEPT super_admin
-- Note: This requires careful handling of Supabase Auth
-- We'll delete from auth.users where the user_metadata role is 'admin' or 'cashier'
-- This part needs to be run with service_role key

COMMIT;

-- =====================================================
-- Verification Queries (Run after to confirm)
-- =====================================================
-- SELECT COUNT(*) FROM businesses; -- Should be 0
-- SELECT COUNT(*) FROM products; -- Should be 0
-- SELECT COUNT(*) FROM customers; -- Should be 0
-- SELECT COUNT(*) FROM workers; -- Should be 0
-- SELECT COUNT(*) FROM sales; -- Should be 0
-- SELECT COUNT(*) FROM payments; -- Should be 0
-- SELECT COUNT(*) FROM backup_records; -- Should be 0

