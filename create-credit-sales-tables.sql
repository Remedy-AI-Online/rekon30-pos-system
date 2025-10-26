-- Credit Sales System for Rekon360
-- Allows shops to track "book" sales (credit) - critical for Ghana market

-- 1. Customers table - Track customers who buy on credit
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  credit_limit DECIMAL(10, 2) DEFAULT 0,  -- Maximum credit allowed
  current_balance DECIMAL(10, 2) DEFAULT 0,  -- Current amount owed
  total_purchased DECIMAL(10, 2) DEFAULT 0,  -- Lifetime purchases
  total_paid DECIMAL(10, 2) DEFAULT 0,  -- Lifetime payments
  status TEXT DEFAULT 'Active',  -- Active, Suspended, Blocked
  notes TEXT,  -- Admin notes about customer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Credit Sales table - Track individual credit transactions
CREATE TABLE IF NOT EXISTS credit_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id TEXT,  -- Link to regular sales table if needed
  receipt_id TEXT NOT NULL,
  cashier_id TEXT,
  cashier_name TEXT,
  items JSONB NOT NULL,  -- Array of {id, name, size, price, quantity}
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,  -- Partial payment
  amount_owed DECIMAL(10, 2) NOT NULL,  -- Remaining balance
  payment_status TEXT DEFAULT 'Unpaid',  -- Unpaid, Partial, Paid
  due_date DATE,  -- When payment is expected
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Credit Payments table - Track payments made on credit
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  credit_sale_id UUID REFERENCES credit_sales(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,  -- cash, mtn-momo, vodafone-cash, etc.
  reference_number TEXT,  -- For mobile money transactions
  received_by TEXT,  -- Cashier/admin who received payment
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_credit_sales_business_id ON credit_sales(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_customer_id ON credit_sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_payment_status ON credit_sales(business_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_credit_payments_business_id ON credit_payments(business_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_customer_id ON credit_payments(customer_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own business customers"
  ON customers FOR SELECT
  USING (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can insert their own business customers"
  ON customers FOR INSERT
  WITH CHECK (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can update their own business customers"
  ON customers FOR UPDATE
  USING (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can delete their own business customers"
  ON customers FOR DELETE
  USING (business_id = current_setting('app.current_business_id', true));

-- RLS Policies for credit_sales
CREATE POLICY "Users can view their own business credit sales"
  ON credit_sales FOR SELECT
  USING (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can insert their own business credit sales"
  ON credit_sales FOR INSERT
  WITH CHECK (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can update their own business credit sales"
  ON credit_sales FOR UPDATE
  USING (business_id = current_setting('app.current_business_id', true));

-- RLS Policies for credit_payments
CREATE POLICY "Users can view their own business credit payments"
  ON credit_payments FOR SELECT
  USING (business_id = current_setting('app.current_business_id', true));

CREATE POLICY "Users can insert their own business credit payments"
  ON credit_payments FOR INSERT
  WITH CHECK (business_id = current_setting('app.current_business_id', true));

-- Function to automatically update customer balance
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate customer's current balance
  UPDATE customers
  SET
    current_balance = (
      SELECT COALESCE(SUM(amount_owed), 0)
      FROM credit_sales
      WHERE customer_id = NEW.customer_id
      AND payment_status != 'Paid'
    ),
    total_purchased = (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM credit_sales
      WHERE customer_id = NEW.customer_id
    ),
    total_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM credit_payments
      WHERE customer_id = NEW.customer_id
    ),
    updated_at = NOW()
  WHERE id = NEW.customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update customer balance automatically
CREATE TRIGGER update_balance_after_credit_sale
  AFTER INSERT OR UPDATE ON credit_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_balance();

CREATE TRIGGER update_balance_after_payment
  AFTER INSERT ON credit_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_balance();

-- Function to update credit sale payment status
CREATE OR REPLACE FUNCTION update_credit_sale_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate amount paid and owed for the credit sale
  UPDATE credit_sales
  SET
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM credit_payments
      WHERE credit_sale_id = NEW.credit_sale_id
    ),
    payment_status = CASE
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_payments
        WHERE credit_sale_id = NEW.credit_sale_id
      ) >= total_amount THEN 'Paid'
      WHEN (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_payments
        WHERE credit_sale_id = NEW.credit_sale_id
      ) > 0 THEN 'Partial'
      ELSE 'Unpaid'
    END,
    amount_owed = total_amount - (
      SELECT COALESCE(SUM(amount), 0)
      FROM credit_payments
      WHERE credit_sale_id = NEW.credit_sale_id
    ),
    updated_at = NOW()
  WHERE id = NEW.credit_sale_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update credit sale status after payment
CREATE TRIGGER update_sale_status_after_payment
  AFTER INSERT ON credit_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_sale_status();

-- Sample data for testing (optional - remove in production)
-- This will help you test the feature
/*
INSERT INTO customers (business_id, name, phone, credit_limit) VALUES
  ('test-business-id', 'Auntie Ama', '0241234567', 500.00),
  ('test-business-id', 'Kwame Mensah', '0501234567', 300.00),
  ('test-business-id', 'Sister Abena', '0261234567', 1000.00);
*/

-- Verify tables created
SELECT
  'customers' as table_name,
  COUNT(*) as row_count
FROM customers
UNION ALL
SELECT
  'credit_sales' as table_name,
  COUNT(*) as row_count
FROM credit_sales
UNION ALL
SELECT
  'credit_payments' as table_name,
  COUNT(*) as row_count
FROM credit_payments;
