-- ============================================
-- MIGRATION 029: Update Approval Function
-- RUN THIS AFTER THE FIRST SQL FILE
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================

-- Drop and recreate the approval function
DROP FUNCTION IF EXISTS approve_business_signup(UUID, TEXT, DECIMAL, DECIMAL);

CREATE OR REPLACE FUNCTION approve_business_signup(
  p_request_id UUID,
  p_plan TEXT DEFAULT 'basic',
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
    v_number_of_locations := NULLIF(request_record.business_config->>'locationCount', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_number_of_locations := 1;
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

  -- Create the business record with ALL details
  INSERT INTO businesses (
    business_name,
    email,
    business_type,
    business_description,
    location_count,
    
    -- Owner information
    owner_name,
    owner_phone,
    
    -- Business contact information
    business_phone,
    business_address,
    city,
    region,
    
    -- Business registration
    registration_number,
    tin_number,
    
    -- Business metrics
    year_established,
    number_of_employees,
    products_count,
    average_monthly_sales,
    business_size,
    
    -- Store full config for reference
    business_config,
    
    -- Plan and features
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
    request_record.business_config->>'description',
    COALESCE(v_number_of_locations, 1),
    
    -- Owner information
    request_record.business_config->>'ownerName',
    request_record.business_config->>'ownerPhone',
    
    -- Business contact information
    request_record.business_config->>'businessPhone',
    request_record.business_config->>'businessAddress',
    request_record.business_config->>'city',
    request_record.business_config->>'region',
    
    -- Business registration
    request_record.business_config->>'registrationNumber',
    request_record.business_config->>'tinNumber',
    
    -- Business metrics
    v_year_established,
    v_number_of_employees,
    v_products_count,
    v_average_monthly_sales,
    request_record.business_config->>'businessSize',
    
    -- Store full config
    request_record.business_config,
    
    -- Plan and features
    p_plan,
    default_features,
    p_upfront_payment,
    p_maintenance_fee,
    'half-yearly',
    CURRENT_DATE + INTERVAL '6 months',
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
    'business_name', request_record.business_config->>'businessName',
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 029 completed successfully!';
  RAISE NOTICE '✅ Approval function updated to extract all business details';
END $$;

