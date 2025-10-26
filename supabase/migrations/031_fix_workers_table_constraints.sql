-- Fix workers table to use business_id instead of shop_id/shop_name
-- Make shop_id and shop_name nullable for backward compatibility

ALTER TABLE public.workers
ALTER COLUMN shop_id DROP NOT NULL,
ALTER COLUMN shop_name DROP NOT NULL;

-- Ensure hire_date exists and is required
ALTER TABLE public.workers
ALTER COLUMN hire_date SET NOT NULL;

-- Add comment
COMMENT ON COLUMN public.workers.hire_date IS 'Date when the worker was hired (required)';
COMMENT ON COLUMN public.workers.shop_id IS 'Legacy shop identifier (optional, use business_id instead)';
COMMENT ON COLUMN public.workers.shop_name IS 'Legacy shop name (optional, use business via business_id instead)';
