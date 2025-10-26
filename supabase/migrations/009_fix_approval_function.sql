-- Fix the approve_business_signup function to handle NULL values properly
DROP FUNCTION IF EXISTS approve_business_signup(UUID);
CREATE OR REPLACE FUNCTION approve_business_signup(p_request_id UUID)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
  new_user_id UUID;
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
  
  -- Safely convert string values to numbers, defaulting to NULL if empty or invalid
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
  
  -- Create the business record (using only existing columns)
  INSERT INTO businesses (
    business_name,
    email,
    business_type,
    business_description,
    location_count,
    plan,
    status,
    created_at
  ) VALUES (
    COALESCE(request_record.business_config->>'businessName', 'Unnamed Business'),
    request_record.email,
    COALESCE(request_record.business_config->>'businessType', 'retail'),
    request_record.business_config->>'businessDescription',
    COALESCE(v_number_of_locations, 1),
    'basic',
    'active',
    NOW()
  ) RETURNING id INTO new_business_id;
  
  -- Create the admin user in Supabase Auth
  -- Note: This requires the password from the request
  BEGIN
    -- Create user with email and password
    SELECT id INTO new_user_id FROM auth.users WHERE email = request_record.email;
    
    IF new_user_id IS NULL THEN
      -- User doesn't exist, create one
      -- The password is stored in password_hash field (plain text, to be hashed by auth)
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        request_record.email,
        crypt(request_record.password_hash, gen_salt('bf')),
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('role', 'admin', 'business_id', new_business_id),
        NOW(),
        NOW(),
        '',
        '',
        ''
      ) RETURNING id INTO new_user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If user creation fails, log it but don't fail the whole process
    RAISE WARNING 'Failed to create user: %', SQLERRM;
  END;
  
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
    'user_id', new_user_id,
    'message', 'Business approved successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the Edge Function parameter name to match
DROP FUNCTION IF EXISTS reject_business_signup(UUID, TEXT);
CREATE OR REPLACE FUNCTION reject_business_signup(p_request_id UUID, p_rejection_reason TEXT DEFAULT NULL)
RETURNS JSON AS $$
BEGIN
  UPDATE business_signup_requests 
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Business rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
