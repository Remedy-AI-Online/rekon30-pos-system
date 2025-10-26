-- Setup Super Admin Account
-- Run this in your Supabase SQL Editor

-- 1. Create Super Admin record
INSERT INTO super_admins (email, name, role) 
VALUES ('admin@rekon360.com', 'Rekon360 Owner', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Update auth user metadata to set role as super_admin
-- First, let's check if the user exists
DO $$
BEGIN
    -- Check if user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@rekon360.com') THEN
        -- Update existing user metadata
        UPDATE auth.users 
        SET user_metadata = jsonb_set(
            COALESCE(user_metadata, '{}'), 
            '{role}', 
            '"super_admin"'
        )
        WHERE email = 'admin@rekon360.com';
        
        RAISE NOTICE 'Updated existing user metadata';
    ELSE
        RAISE NOTICE 'User does not exist in auth.users. Please create the user first in Supabase Dashboard > Authentication > Users';
    END IF;
END $$;

-- 3. Create some sample businesses for testing
INSERT INTO businesses (business_name, business_type, business_description, email, plan, status, payment_status, upfront_fee_paid, maintenance_fee_paid) VALUES
('Kofi Electronics', 'retail', 'Electronics and gadgets store', 'kofi@electronics.com', 'basic', 'active', 'paid', true, true),
('Ama Wholesale', 'wholesale', 'Bulk goods distribution', 'ama@wholesale.com', 'pro', 'active', 'paid', true, true),
('Uncle 19 Shops', 'enterprise', 'Multi-location retail chain', 'uncle@business.com', 'enterprise', 'pending', 'pending', false, false)
ON CONFLICT (email) DO NOTHING;

-- 4. Add features for the sample businesses
INSERT INTO business_features (business_id, feature_name, enabled) 
SELECT 
    b.id,
    f.feature_name,
    CASE 
        WHEN b.plan = 'basic' AND f.feature_name IN ('dashboard', 'products', 'orders', 'reports', 'settings') THEN true
        WHEN b.plan = 'pro' AND f.feature_name IN ('dashboard', 'products', 'orders', 'reports', 'settings', 'workers', 'customers') THEN true
        WHEN b.plan = 'enterprise' THEN true
        ELSE false
    END
FROM businesses b
CROSS JOIN (
    SELECT unnest(ARRAY['dashboard', 'products', 'orders', 'reports', 'settings', 'workers', 'customers', 'multi-location', 'warehouse', 'analytics']) as feature_name
) f
ON CONFLICT (business_id, feature_name) DO NOTHING;

-- 5. Create sample payment records
INSERT INTO payment_records (business_id, payment_type, amount, payment_method, payment_reference, status, confirmed_at) 
SELECT 
    b.id,
    'upfront',
    CASE 
        WHEN b.plan = 'basic' THEN 1500
        WHEN b.plan = 'pro' THEN 3000
        WHEN b.plan = 'enterprise' THEN 5000
    END,
    'MoMo',
    'MOMO' || EXTRACT(EPOCH FROM NOW())::text,
    'confirmed',
    NOW() - INTERVAL '30 days'
FROM businesses b
WHERE b.upfront_fee_paid = true
ON CONFLICT DO NOTHING;

-- 6. Set up system settings if not exists
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('basic_upfront_fee', '1500', 'Basic plan upfront fee in Ghana Cedis'),
('basic_maintenance_fee', '200', 'Basic plan 6-month maintenance fee in Ghana Cedis'),
('pro_upfront_fee', '3000', 'Pro plan upfront fee in Ghana Cedis'),
('pro_maintenance_fee', '400', 'Pro plan 6-month maintenance fee in Ghana Cedis'),
('enterprise_upfront_fee', '5000', 'Enterprise plan upfront fee in Ghana Cedis'),
('enterprise_maintenance_fee', '800', 'Enterprise plan 6-month maintenance fee in Ghana Cedis'),
('sync_interval_minutes', '5', 'Offline sync interval in minutes'),
('maintenance_reminder_days', '30', 'Days before maintenance due to send reminder')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Create RLS policies for super admin access
-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Super admins can access all businesses" ON businesses;
DROP POLICY IF EXISTS "Super admins can access all business features" ON business_features;
DROP POLICY IF EXISTS "Super admins can access all payment records" ON payment_records;
DROP POLICY IF EXISTS "Super admins can access system settings" ON system_settings;

-- Create new policies
CREATE POLICY "Super admins can access all businesses" ON businesses
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all business features" ON business_features
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all payment records" ON payment_records
    FOR ALL USING (true);

CREATE POLICY "Super admins can access system settings" ON system_settings
    FOR ALL USING (true);

-- 8. Grant necessary permissions
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON business_features TO authenticated;
GRANT ALL ON payment_records TO authenticated;
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON super_admins TO authenticated;

-- Success message
SELECT 'Super Admin setup complete! You can now login with admin@rekon360.com' as message;
