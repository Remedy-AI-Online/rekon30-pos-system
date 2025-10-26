-- Migration: Add Business Details and Fix RLS
-- This migration:
-- 1. Adds business detail columns to businesses table
-- 2. Enables RLS on all public tables that are missing it
-- 3. Creates appropriate RLS policies

-- ============================================
-- PART 1: Add Business Details Columns
-- ============================================

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_phone TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS tin_number TEXT,
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS number_of_employees INTEGER,
ADD COLUMN IF NOT EXISTS products_count INTEGER,
ADD COLUMN IF NOT EXISTS average_monthly_sales DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS business_size TEXT CHECK (business_size IN ('startup', 'small', 'medium', 'enterprise')),
ADD COLUMN IF NOT EXISTS business_config JSONB;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_businesses_business_size ON public.businesses(business_size);
CREATE INDEX IF NOT EXISTS idx_businesses_year_established ON public.businesses(year_established);
CREATE INDEX IF NOT EXISTS idx_businesses_region ON public.businesses(region);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses(city);

-- Add comments for documentation
COMMENT ON COLUMN businesses.business_config IS 'Full business configuration as submitted during signup';
COMMENT ON COLUMN businesses.owner_name IS 'Business owner full name';
COMMENT ON COLUMN businesses.owner_phone IS 'Owner contact phone number';
COMMENT ON COLUMN businesses.business_phone IS 'Business contact phone number';
COMMENT ON COLUMN businesses.business_address IS 'Physical business address';
COMMENT ON COLUMN businesses.registration_number IS 'Business registration/license number';
COMMENT ON COLUMN businesses.tin_number IS 'Tax Identification Number';
COMMENT ON COLUMN businesses.business_size IS 'Business size category (startup, small, medium, enterprise)';
COMMENT ON COLUMN businesses.year_established IS 'Year the business was established';
COMMENT ON COLUMN businesses.number_of_employees IS 'Current number of employees';
COMMENT ON COLUMN businesses.products_count IS 'Estimated number of products/SKUs';
COMMENT ON COLUMN businesses.average_monthly_sales IS 'Estimated average monthly sales in cedis';

-- ============================================
-- PART 2: Enable RLS on All Public Tables
-- ============================================

-- Enable RLS on activity_logs
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on backups table if exists
ALTER TABLE IF EXISTS public.backups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on backup_logs if exists
ALTER TABLE IF EXISTS public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on businesses table (should already be enabled, but ensure it)
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on business_signup_requests (should already be enabled)
ALTER TABLE IF EXISTS public.business_signup_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on business_features table
ALTER TABLE IF EXISTS public.business_features ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payments table
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on super_admins table
ALTER TABLE IF EXISTS public.super_admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: Create RLS Policies for New Tables
-- ============================================

-- Activity Logs Policies
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_logs;

CREATE POLICY "Super admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own activity" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Backups Policies
DROP POLICY IF EXISTS "Super admins can manage backups" ON public.backups;
DROP POLICY IF EXISTS "Business admins can view their backups" ON public.backups;

CREATE POLICY "Super admins can manage backups" ON public.backups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their backups" ON public.backups
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

-- Business Features Policies
DROP POLICY IF EXISTS "Super admins can manage business features" ON public.business_features;

CREATE POLICY "Super admins can manage business features" ON public.business_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

-- Payments Policies
DROP POLICY IF EXISTS "Super admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Business admins can view their payments" ON public.payments;

CREATE POLICY "Super admins can manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their payments" ON public.payments
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

-- Businesses Policies (ensure they exist)
DROP POLICY IF EXISTS "Super admins can manage all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business admins can view their business" ON public.businesses;

CREATE POLICY "Super admins can manage all businesses" ON public.businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their business" ON public.businesses
  FOR SELECT USING (
    id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Business admins can update their business" ON public.businesses
  FOR UPDATE USING (
    id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

-- Super Admins Policies
DROP POLICY IF EXISTS "Super admins can view super admins" ON public.super_admins;

CREATE POLICY "Super admins can view super admins" ON public.super_admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

-- ============================================
-- PART 4: Add Comments to Tables
-- ============================================

COMMENT ON TABLE public.activity_logs IS 'Audit log of user actions across the system';
COMMENT ON TABLE public.businesses IS 'Business accounts registered in the system';
COMMENT ON TABLE public.business_features IS 'Features enabled for each business';
COMMENT ON TABLE public.payments IS 'Payment records for business subscriptions';
COMMENT ON TABLE public.super_admins IS 'Super administrator accounts';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '✅ Business details columns added';
  RAISE NOTICE '✅ RLS enabled on all public tables';
  RAISE NOTICE '✅ RLS policies created';
END $$;

