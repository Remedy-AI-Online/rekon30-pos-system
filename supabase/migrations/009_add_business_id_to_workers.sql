-- Add business_id column to workers table for multi-tenancy
-- This ensures each worker is tied to a specific business/admin

ALTER TABLE workers ADD COLUMN IF NOT EXISTS business_id TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workers_business_id ON workers(business_id);

-- Update existing workers to have a business_id (set to shop_id for now)
-- In production, you'd map this properly
UPDATE workers SET business_id = shop_id WHERE business_id IS NULL;

-- Make business_id NOT NULL after backfilling
-- ALTER TABLE workers ALTER COLUMN business_id SET NOT NULL;

-- Add comment
COMMENT ON COLUMN workers.business_id IS 'References the business admin who owns this worker';
