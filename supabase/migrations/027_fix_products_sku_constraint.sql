-- Fix products SKU constraint for multi-tenancy
-- Remove the global unique constraint on SKU and add a composite unique constraint
-- that allows the same SKU across different businesses

-- Drop the existing unique constraint on SKU
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Create a composite unique constraint on (business_id, sku)
-- This allows the same SKU to exist across different businesses
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_business_sku 
ON public.products(business_id, sku) 
WHERE sku IS NOT NULL;

-- Add a comment explaining the multi-tenant SKU constraint
COMMENT ON INDEX idx_products_business_sku IS 'Ensures SKU is unique within each business, but allows same SKU across different businesses';
