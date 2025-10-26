-- Run this in Supabase SQL Editor to fix workers table
-- This allows workers to be created with business_id instead of shop_id/shop_name

ALTER TABLE public.workers
ALTER COLUMN shop_id DROP NOT NULL,
ALTER COLUMN shop_name DROP NOT NULL;

-- Ensure hire_date is required
ALTER TABLE public.workers
ALTER COLUMN hire_date SET NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN public.workers.hire_date IS 'Date when the worker was hired (required)';
COMMENT ON COLUMN public.workers.shop_id IS 'Legacy shop identifier (optional, use business_id instead)';
COMMENT ON COLUMN public.workers.shop_name IS 'Legacy shop name (optional, use business via business_id instead)';

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'workers'
  AND table_schema = 'public'
  AND column_name IN ('business_id', 'shop_id', 'shop_name', 'hire_date')
ORDER BY ordinal_position;
