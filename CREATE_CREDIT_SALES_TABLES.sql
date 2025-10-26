-- Create credit sales tables for book sales functionality
-- This enables customers to buy on credit and pay later

-- Create credit_sales table
CREATE TABLE IF NOT EXISTS credit_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  receipt_id TEXT NOT NULL,
  cashier_id TEXT,
  cashier_name TEXT,
  items JSONB NOT NULL, -- Array of items with details
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0.00,
  amount_owed DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Partial', 'Unpaid')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create credit_payments table
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  credit_sale_id UUID REFERENCES credit_sales(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  received_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add business_id to existing tables if not exists
ALTER TABLE credit_sales ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE credit_payments ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_sales_business_id ON credit_sales(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_customer_id ON credit_sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_payment_status ON credit_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_sales_due_date ON credit_sales(due_date);
CREATE INDEX IF NOT EXISTS idx_credit_sales_created_at ON credit_sales(created_at);

CREATE INDEX IF NOT EXISTS idx_credit_payments_business_id ON credit_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_customer_id ON credit_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_sale_id ON credit_payments(credit_sale_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_created_at ON credit_payments(created_at);

-- Enable RLS on credit tables
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_sales
CREATE POLICY "Users can only see their business credit sales" ON credit_sales
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
    )
  );

CREATE POLICY "Users can only insert credit sales for their business" ON credit_sales
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT business_id FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
    )
  );

CREATE POLICY "Users can only update their business credit sales" ON credit_sales
  FOR UPDATE USING (
    business_id IN (
      SELECT business_id FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
    )
  );

-- Create RLS policies for credit_payments
CREATE POLICY "Users can only see their business credit payments" ON credit_payments
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
    )
  );

CREATE POLICY "Users can only insert credit payments for their business" ON credit_payments
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT business_id FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
    )
  );

-- Super admin policies (can see all data)
CREATE POLICY "Super admins can see all credit sales" ON credit_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Super admins can see all credit payments" ON credit_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE credit_sales IS 'Credit sales (book sales) where customers buy on credit';
COMMENT ON TABLE credit_payments IS 'Payments made against credit sales';
COMMENT ON COLUMN credit_sales.business_id IS 'Links credit sales to specific business for multi-tenancy';
COMMENT ON COLUMN credit_sales.customer_id IS 'Customer who made the credit purchase';
COMMENT ON COLUMN credit_sales.items IS 'JSON array of items purchased on credit';
COMMENT ON COLUMN credit_sales.payment_status IS 'Status: Paid, Partial, or Unpaid';
COMMENT ON COLUMN credit_payments.business_id IS 'Links credit payments to specific business for multi-tenancy';
COMMENT ON COLUMN credit_payments.credit_sale_id IS 'Optional link to specific credit sale';
