-- ============================================
-- MIGRATION 030: Add RLS to Missing Tables
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds RLS to: business_feature_log, custom_features, shop_settings
-- ============================================

-- Step 1: Add business_id column if it doesn't exist
ALTER TABLE IF EXISTS public.business_feature_log 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.custom_features 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.shop_settings 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_feature_log_business_id ON public.business_feature_log(business_id);
CREATE INDEX IF NOT EXISTS idx_custom_features_business_id ON public.custom_features(business_id);
CREATE INDEX IF NOT EXISTS idx_shop_settings_business_id ON public.shop_settings(business_id);

-- Step 3: Enable RLS on missing tables
ALTER TABLE IF EXISTS public.business_feature_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.custom_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for business_feature_log
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all feature logs" ON public.business_feature_log;
DROP POLICY IF EXISTS "Business admins can view their feature logs" ON public.business_feature_log;
DROP POLICY IF EXISTS "Super admins can insert feature logs" ON public.business_feature_log;

CREATE POLICY "Super admins can view all feature logs" ON public.business_feature_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their feature logs" ON public.business_feature_log
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Super admins can insert feature logs" ON public.business_feature_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

-- ============================================
-- RLS Policies for custom_features
-- ============================================

DROP POLICY IF EXISTS "Super admins can manage custom features" ON public.custom_features;
DROP POLICY IF EXISTS "Business admins can view their custom features" ON public.custom_features;
DROP POLICY IF EXISTS "Business admins can request custom features" ON public.custom_features;

CREATE POLICY "Super admins can manage custom features" ON public.custom_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their custom features" ON public.custom_features
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Business admins can request custom features" ON public.custom_features
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

-- ============================================
-- RLS Policies for shop_settings
-- ============================================

DROP POLICY IF EXISTS "Super admins can view all shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Business admins can view their shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Business admins can update their shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Cashiers can view their shop settings" ON public.shop_settings;

CREATE POLICY "Super admins can view all shop settings" ON public.shop_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

CREATE POLICY "Business admins can view their shop settings" ON public.shop_settings
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Business admins can update their shop settings" ON public.shop_settings
  FOR UPDATE USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Business admins can insert their shop settings" ON public.shop_settings
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

CREATE POLICY "Cashiers can view their shop settings" ON public.shop_settings
  FOR SELECT USING (
    business_id IN (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 030 completed successfully!';
  RAISE NOTICE '✅ RLS enabled on business_feature_log';
  RAISE NOTICE '✅ RLS enabled on custom_features';
  RAISE NOTICE '✅ RLS enabled on shop_settings';
  RAISE NOTICE '✅ RLS policies created for all three tables';
END $$;

