-- Migration: Plan-Based Features System
-- This migration adds plan support and pricing to the businesses table

-- Add plan and pricing columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS upfront_payment DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS maintenance_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'half-yearly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'half-yearly', 'yearly')),
ADD COLUMN IF NOT EXISTS next_maintenance_due DATE;

-- Create a function to get default features for a plan
CREATE OR REPLACE FUNCTION get_plan_features(plan_type TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE plan_type
    WHEN 'enterprise' THEN
      RETURN '["inventory", "sales", "workers", "reports", "customers", "analytics", "multi-location", "api-access"]'::jsonb;
    WHEN 'pro' THEN
      RETURN '["inventory", "sales", "workers", "reports", "customers", "analytics"]'::jsonb;
    ELSE -- basic
      RETURN '["inventory", "sales", "workers", "reports"]'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the approve_business_signup function to handle plan assignment
DROP FUNCTION IF EXISTS approve_business_signup(UUID);
CREATE OR REPLACE FUNCTION approve_business_signup(
  p_request_id UUID,
  p_plan TEXT DEFAULT 'basic', -- Super Admin assigns plan
  p_upfront_payment DECIMAL DEFAULT NULL,
  p_maintenance_fee DECIMAL DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
  default_features JSONB;
  v_year_established INTEGER;
  v_number_of_employees INTEGER;
  v_number_of_locations INTEGER;
  v_products_count INTEGER;
  v_average_monthly_sales NUMERIC;
BEGIN
  -- Get the request
  SELECT * INTO request_record
  FROM business_signup_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;

  -- Get default features for the assigned plan
  default_features := get_plan_features(p_plan);

  -- Safely convert string values to numbers
  BEGIN
    v_year_established := NULLIF(request_record.business_config->>'yearEstablished', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_year_established := NULL;
  END;

  BEGIN
    v_number_of_employees := NULLIF(request_record.business_config->>'numberOfEmployees', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_number_of_employees := NULL;
  END;

  BEGIN
    v_number_of_locations := NULLIF(request_record.business_config->>'numberOfLocations', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_number_of_locations := NULL;
  END;

  BEGIN
    v_products_count := NULLIF(request_record.business_config->>'productsCount', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_products_count := NULL;
  END;

  BEGIN
    v_average_monthly_sales := NULLIF(request_record.business_config->>'averageMonthlySales', '')::NUMERIC;
  EXCEPTION WHEN OTHERS THEN
    v_average_monthly_sales := NULL;
  END;

  -- Create the business record with plan and features
  INSERT INTO businesses (
    business_name,
    email,
    business_type,
    business_description,
    location_count,
    plan,
    features,
    upfront_payment,
    maintenance_fee,
    payment_frequency,
    next_maintenance_due,
    status,
    created_at
  ) VALUES (
    COALESCE(request_record.business_config->>'businessName', 'Unnamed Business'),
    request_record.email,
    COALESCE(request_record.business_config->>'businessType', 'retail'),
    request_record.business_config->>'businessDescription',
    COALESCE(v_number_of_locations, 1),
    p_plan, -- Assigned by Super Admin
    default_features, -- Features based on plan
    p_upfront_payment,
    p_maintenance_fee,
    'half-yearly',
    CURRENT_DATE + INTERVAL '6 months', -- Next maintenance in 6 months
    'active',
    NOW()
  ) RETURNING id INTO new_business_id;

  -- Update the request status
  UPDATE business_signup_requests
  SET
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = p_request_id;

  RETURN json_build_object(
    'success', true,
    'business_id', new_business_id,
    'email', request_record.email,
    'password', request_record.password_hash,
    'owner_name', request_record.business_config->>'ownerName',
    'plan', p_plan,
    'features', default_features,
    'message', 'Business approved successfully with ' || p_plan || ' plan'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for plan-based queries
CREATE INDEX IF NOT EXISTS idx_businesses_plan ON businesses(plan);
CREATE INDEX IF NOT EXISTS idx_businesses_next_maintenance ON businesses(next_maintenance_due);

-- Add comment
COMMENT ON COLUMN businesses.plan IS 'Business plan: basic, pro, or enterprise';
COMMENT ON COLUMN businesses.upfront_payment IS 'One-time upfront payment in cedis';
COMMENT ON COLUMN businesses.maintenance_fee IS 'Recurring maintenance fee in cedis';
COMMENT ON COLUMN businesses.next_maintenance_due IS 'Date when next maintenance payment is due';

