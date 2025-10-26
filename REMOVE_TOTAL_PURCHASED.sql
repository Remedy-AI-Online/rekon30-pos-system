-- Remove the problematic total_purchased column that's causing the error
-- This should fix the "total_purchased of relation customers does not exist" error

-- Drop the column if it exists
ALTER TABLE customers DROP COLUMN IF EXISTS total_purchased;
ALTER TABLE customers DROP COLUMN IF EXISTS total_paid;

-- Verify the column is gone
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('total_purchased', 'total_paid')
ORDER BY column_name;

-- Show what columns we actually have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('credit_limit', 'current_balance', 'notes')
ORDER BY column_name;

