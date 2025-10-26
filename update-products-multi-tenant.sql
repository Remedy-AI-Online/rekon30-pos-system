-- Update Products Table for Multi-Tenancy and Stock Management
-- Run this in Supabase SQL Editor

-- 1. Add business_id column for multi-tenant isolation
ALTER TABLE products ADD COLUMN IF NOT EXISTS business_id TEXT;

-- 2. Add original_stock column to track initial stock for 20% threshold
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_stock INTEGER DEFAULT 0;

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);

-- 4. Update existing products to set original_stock = current stock
UPDATE products SET original_stock = stock WHERE original_stock = 0 OR original_stock IS NULL;

-- 5. Add comments
COMMENT ON COLUMN products.business_id IS 'References the business admin who owns this product';
COMMENT ON COLUMN products.original_stock IS 'Original stock quantity to calculate low stock threshold (20%)';

-- 6. Update status calculation to include low stock check
-- Products with stock <= 20% of original_stock will be marked as "Low Stock"
