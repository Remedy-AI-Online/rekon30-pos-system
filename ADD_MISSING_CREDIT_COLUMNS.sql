-- Add missing credit columns to customers table
-- This fixes the "total_purchased of relation customers does not exist" error

-- Add the columns that the backend actually needs
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN customers.credit_limit IS 'Maximum credit limit allowed for this customer';
COMMENT ON COLUMN customers.current_balance IS 'Current outstanding balance (used by backend)';
COMMENT ON COLUMN customers.notes IS 'Additional notes about the customer';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);
CREATE INDEX IF NOT EXISTS idx_customers_current_balance ON customers(current_balance);

-- Update existing customers to have default values
UPDATE customers SET 
  credit_limit = 0.00,
  current_balance = 0.00,
  notes = ''
WHERE credit_limit IS NULL;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('credit_limit', 'current_balance', 'notes')
ORDER BY column_name;
