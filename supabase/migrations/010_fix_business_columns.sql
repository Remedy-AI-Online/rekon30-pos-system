-- Update the approve function to use only existing business table columns
DROP FUNCTION IF EXISTS approve_business_signup(UUID);
CREATE OR REPLACE FUNCTION approve_business_signup(p_request_id UUID)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
  new_user_id UUID;
  v_number_of_locations INTEGER;
BEGIN
  -- Get the request
  SELECT * INTO request_record 
  FROM business_signup_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Safely convert number of locations
  BEGIN
    v_number_of_locations := NULLIF(request_record.business_config->>'numberOfLocations', '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    v_number_of_locations := 1;
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
  BEGIN
    -- Check if user already exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = request_record.email;
    
    IF new_user_id IS NULL THEN
      -- Create new user
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
        is_super_admin,
        confirmed_at,
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
        jsonb_build_object('role', 'admin', 'business_id', new_business_id, 'name', COALESCE(request_record.business_config->>'ownerName', 'Admin')),
        false,
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        ''
      ) RETURNING id INTO new_user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
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
