-- Super Admin Tables for Business Management

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  business_description TEXT,
  location_count INTEGER DEFAULT 1,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  upfront_fee_paid BOOLEAN DEFAULT FALSE,
  maintenance_fee_paid BOOLEAN DEFAULT FALSE,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business features table
CREATE TABLE IF NOT EXISTS business_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, feature_name)
);

-- Super admin users table
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Payment records table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('upfront', 'maintenance')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmed_by UUID REFERENCES super_admins(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_plan ON businesses(plan);
CREATE INDEX IF NOT EXISTS idx_businesses_payment_status ON businesses(payment_status);
CREATE INDEX IF NOT EXISTS idx_business_features_business_id ON business_features(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_business_id ON payment_records(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_features_updated_at BEFORE UPDATE ON business_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for Super Admin
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Super admin can access all data
CREATE POLICY "Super admins can access all businesses" ON businesses
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all business features" ON business_features
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all payment records" ON payment_records
    FOR ALL USING (true);

CREATE POLICY "Super admins can access system settings" ON system_settings
    FOR ALL USING (true);
