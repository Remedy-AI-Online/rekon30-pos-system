-- Add missing columns to customers table for credit sales functionality
-- This allows customers to have credit limits and balances for book sales

-- Add credit-related columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_used DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_balance DECIMAL(10, 2) DEFAULT 0.00;

-- Add comments for documentation
COMMENT ON COLUMN customers.credit_limit IS 'Maximum credit limit allowed for this customer';
COMMENT ON COLUMN customers.credit_balance IS 'Current available credit balance';
COMMENT ON COLUMN customers.credit_used IS 'Total credit amount currently used';
COMMENT ON COLUMN customers.current_balance IS 'Current outstanding balance (used by backend)';

-- Create indexes for better performance on credit-related queries
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);
CREATE INDEX IF NOT EXISTS idx_customers_credit_balance ON customers(credit_balance);
CREATE INDEX IF NOT EXISTS idx_customers_current_balance ON customers(current_balance);

-- Update existing customers to have default values
UPDATE customers SET 
  credit_limit = 0.00,
  credit_balance = 0.00,
  credit_used = 0.00,
  current_balance = 0.00
WHERE credit_limit IS NULL;
