-- Simplified approval function that doesn't try to create auth users directly
-- The user creation will be handled differently
DROP FUNCTION IF EXISTS approve_business_signup(UUID);
CREATE OR REPLACE FUNCTION approve_business_signup(p_request_id UUID)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
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
  
  -- Update the request status
  UPDATE business_signup_requests 
  SET 
    status = 'approved',
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = p_request_id;
  
  -- Return the business_id and email/password for the Edge Function to create the user
  RETURN json_build_object(
    'success', true, 
    'business_id', new_business_id,
    'email', request_record.email,
    'password', request_record.password_hash,
    'owner_name', request_record.business_config->>'ownerName',
    'message', 'Business approved successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
