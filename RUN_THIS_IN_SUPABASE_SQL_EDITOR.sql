-- ============================================
-- MIGRATION 028: Add Business Details & Fix RLS
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================

-- Step 1: Add business details columns
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

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_business_size ON public.businesses(business_size);
CREATE INDEX IF NOT EXISTS idx_businesses_year_established ON public.businesses(year_established);
CREATE INDEX IF NOT EXISTS idx_businesses_region ON public.businesses(region);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON public.businesses(city);

-- Step 3: Enable RLS on all tables
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_signup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.super_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies for activity_logs
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

-- Step 5: Create RLS Policies for businesses
DROP POLICY IF EXISTS "Super admins can manage all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business admins can view their business" ON public.businesses;
DROP POLICY IF EXISTS "Business admins can update their business" ON public.businesses;

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

-- Step 6: Create RLS Policies for payments
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 028 completed successfully!';
  RAISE NOTICE '✅ Business details columns added';
  RAISE NOTICE '✅ RLS enabled on all public tables';
  RAISE NOTICE '✅ RLS policies created';
END $$;

