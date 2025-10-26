-- COMPLETE FIX FOR CREDIT SALES FUNCTIONALITY
-- This script adds all missing columns and tables for credit sales (book sales)

-- ============================================
-- STEP 1: Add missing columns to customers table
-- ============================================

-- Add credit-related columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN customers.credit_limit IS 'Maximum credit limit allowed for this customer';
COMMENT ON COLUMN customers.current_balance IS 'Current outstanding balance (used by backend)';
COMMENT ON COLUMN customers.notes IS 'Additional notes about the customer';

-- Create indexes for better performance on credit-related queries
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);
CREATE INDEX IF NOT EXISTS idx_customers_current_balance ON customers(current_balance);

-- Update existing customers to have default values
UPDATE customers SET 
  credit_limit = 0.00,
  current_balance = 0.00,
  notes = ''
WHERE credit_limit IS NULL;

-- ============================================
-- STEP 2: Create credit_sales table
-- ============================================

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

-- ============================================
-- STEP 3: Create credit_payments table
-- ============================================

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

-- ============================================
-- STEP 4: Create indexes for performance
-- ============================================

-- Credit sales indexes
CREATE INDEX IF NOT EXISTS idx_credit_sales_business_id ON credit_sales(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_customer_id ON credit_sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_payment_status ON credit_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_sales_due_date ON credit_sales(due_date);
CREATE INDEX IF NOT EXISTS idx_credit_sales_created_at ON credit_sales(created_at);

-- Credit payments indexes
CREATE INDEX IF NOT EXISTS idx_credit_payments_business_id ON credit_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_customer_id ON credit_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_sale_id ON credit_payments(credit_sale_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_created_at ON credit_payments(created_at);

-- ============================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================

-- Enable RLS on credit tables
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS policies for credit_sales
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their business credit sales" ON credit_sales;
DROP POLICY IF EXISTS "Users can only insert credit sales for their business" ON credit_sales;
DROP POLICY IF EXISTS "Users can only update their business credit sales" ON credit_sales;
DROP POLICY IF EXISTS "Super admins can see all credit sales" ON credit_sales;

-- Create new policies for credit_sales
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

CREATE POLICY "Super admins can see all credit sales" ON credit_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- ============================================
-- STEP 7: Create RLS policies for credit_payments
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their business credit payments" ON credit_payments;
DROP POLICY IF EXISTS "Users can only insert credit payments for their business" ON credit_payments;
DROP POLICY IF EXISTS "Super admins can see all credit payments" ON credit_payments;

-- Create new policies for credit_payments
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

CREATE POLICY "Super admins can see all credit payments" ON credit_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- ============================================
-- STEP 8: Add documentation comments
-- ============================================

COMMENT ON TABLE credit_sales IS 'Credit sales (book sales) where customers buy on credit';
COMMENT ON TABLE credit_payments IS 'Payments made against credit sales';
COMMENT ON COLUMN credit_sales.business_id IS 'Links credit sales to specific business for multi-tenancy';
COMMENT ON COLUMN credit_sales.customer_id IS 'Customer who made the credit purchase';
COMMENT ON COLUMN credit_sales.items IS 'JSON array of items purchased on credit';
COMMENT ON COLUMN credit_sales.payment_status IS 'Status: Paid, Partial, or Unpaid';
COMMENT ON COLUMN credit_payments.business_id IS 'Links credit payments to specific business for multi-tenancy';
COMMENT ON COLUMN credit_payments.credit_sale_id IS 'Optional link to specific credit sale';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- This script should fix the "credit_limit column not found" error
-- Run this in your Supabase SQL Editor to enable credit sales functionality
