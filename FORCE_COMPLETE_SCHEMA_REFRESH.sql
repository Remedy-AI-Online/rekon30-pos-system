-- Force complete schema refresh to fix the total_purchased error
-- This should completely resolve the schema cache issue

-- 1. Drop all problematic columns
ALTER TABLE customers DROP COLUMN IF EXISTS total_purchased;
ALTER TABLE customers DROP COLUMN IF EXISTS total_paid;
ALTER TABLE customers DROP COLUMN IF EXISTS credit_balance;
ALTER TABLE customers DROP COLUMN IF EXISTS credit_used;

-- 2. Ensure only the columns we actually need exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Update existing customers to have default values
UPDATE customers SET 
  credit_limit = 0.00,
  current_balance = 0.00,
  notes = ''
WHERE credit_limit IS NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);
CREATE INDEX IF NOT EXISTS idx_customers_current_balance ON customers(current_balance);

-- 5. Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- 6. Wait a moment for schema refresh
SELECT pg_sleep(2);

-- 7. Verify the columns exist and show what we have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('credit_limit', 'current_balance', 'notes')
ORDER BY column_name;

-- 8. Show all columns in customers table to verify
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY column_name;

