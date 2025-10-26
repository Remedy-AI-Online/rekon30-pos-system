-- Fix business_signup_requests table if it doesn't have the correct columns
-- First, check if the table exists and has the right structure

-- Drop and recreate the table to ensure correct structure
DROP TABLE IF EXISTS business_signup_requests CASCADE;

-- Create business_signup_requests table with correct structure
CREATE TABLE business_signup_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  business_config JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_by TEXT DEFAULT 'business_signup'
);

-- Create indexes for better performance
CREATE INDEX idx_business_signup_requests_status ON business_signup_requests(status);
CREATE INDEX idx_business_signup_requests_email ON business_signup_requests(email);
CREATE INDEX idx_business_signup_requests_created_at ON business_signup_requests(created_at);

-- Enable RLS
ALTER TABLE business_signup_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can view all requests
CREATE POLICY "Super admins can view all signup requests" ON business_signup_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Super admins can update requests (approve/reject)
CREATE POLICY "Super admins can update signup requests" ON business_signup_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Allow service role to insert new requests
CREATE POLICY "Service role can insert signup requests" ON business_signup_requests
  FOR INSERT WITH CHECK (true);

-- Function to approve a business signup request
CREATE OR REPLACE FUNCTION approve_business_signup(request_id UUID)
RETURNS JSON AS $$
DECLARE
  request_record business_signup_requests%ROWTYPE;
  new_business_id UUID;
  new_user_id UUID;
BEGIN
  -- Get the request
  SELECT * INTO request_record 
  FROM business_signup_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Create the business record
  INSERT INTO businesses (
    business_name,
    email,
    business_type,
    business_size,
    owner_name,
    owner_phone,
    business_phone,
    business_address,
    city,
    region,
    registration_number,
    tin_number,
    year_established,
    number_of_employees,
    number_of_locations,
    products_count,
    average_monthly_sales,
    plan,
    status,
    created_at
  ) VALUES (
    request_record.business_config->>'businessName',
    request_record.email,
    request_record.business_config->>'businessType',
    request_record.business_config->>'businessSize',
    request_record.business_config->>'ownerName',
    request_record.business_config->>'ownerPhone',
    request_record.business_config->>'businessPhone',
    request_record.business_config->>'businessAddress',
    request_record.business_config->>'city',
    request_record.business_config->>'region',
    request_record.business_config->>'registrationNumber',
    request_record.business_config->>'tinNumber',
    (request_record.business_config->>'yearEstablished')::INTEGER,
    (request_record.business_config->>'numberOfEmployees')::INTEGER,
    (request_record.business_config->>'numberOfLocations')::INTEGER,
    (request_record.business_config->>'productsCount')::INTEGER,
    (request_record.business_config->>'averageMonthlySales')::NUMERIC,
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
  WHERE id = request_id;
  
  RETURN json_build_object(
    'success', true, 
    'business_id', new_business_id,
    'message', 'Business approved successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a business signup request
CREATE OR REPLACE FUNCTION reject_business_signup(request_id UUID, reason TEXT DEFAULT NULL)
RETURNS JSON AS $$
BEGIN
  UPDATE business_signup_requests 
  SET 
    status = 'rejected',
    rejection_reason = reason,
    approved_at = NOW(),
    approved_by = auth.uid()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Business rejected successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

