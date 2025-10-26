-- Complete Multi-Tenancy Setup
-- This migration adds business_id to all operational tables and sets up proper RLS

-- Add business_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to customers table  
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to workers table
ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to sale_items table
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to corrections table
ALTER TABLE public.corrections 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to payroll table
ALTER TABLE public.payroll 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to cashiers table
ALTER TABLE public.cashiers 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to daily_reports table
ALTER TABLE public.daily_reports 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id column to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_workers_business_id ON public.workers(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_business_id ON public.sale_items(business_id);
CREATE INDEX IF NOT EXISTS idx_corrections_business_id ON public.corrections(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_business_id ON public.payroll(business_id);
CREATE INDEX IF NOT EXISTS idx_cashiers_business_id ON public.cashiers(business_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_business_id ON public.daily_reports(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON public.notifications(business_id);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can only see their business products" ON public.products;
DROP POLICY IF EXISTS "Users can only insert products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can only update their business products" ON public.products;
DROP POLICY IF EXISTS "Users can only delete their business products" ON public.products;

-- Create RLS policies for business isolation
-- Products policies
CREATE POLICY "Users can only see their business products" ON public.products
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert products for their business" ON public.products
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business products" ON public.products
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business products" ON public.products
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

-- Super admin policies (can see all data)
DROP POLICY IF EXISTS "Super admins can see all products" ON public.products;
CREATE POLICY "Super admins can see all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Add a comment explaining the multi-tenancy setup
COMMENT ON COLUMN public.products.business_id IS 'Links products to specific business for multi-tenancy';
COMMENT ON COLUMN public.customers.business_id IS 'Links customers to specific business for multi-tenancy';
COMMENT ON COLUMN public.workers.business_id IS 'Links workers to specific business for multi-tenancy';
COMMENT ON COLUMN public.sales.business_id IS 'Links sales to specific business for multi-tenancy';
COMMENT ON COLUMN public.sale_items.business_id IS 'Links sale items to specific business for multi-tenancy';
COMMENT ON COLUMN public.corrections.business_id IS 'Links corrections to specific business for multi-tenancy';
COMMENT ON COLUMN public.payroll.business_id IS 'Links payroll to specific business for multi-tenancy';
COMMENT ON COLUMN public.cashiers.business_id IS 'Links cashiers to specific business for multi-tenancy';
COMMENT ON COLUMN public.daily_reports.business_id IS 'Links daily reports to specific business for multi-tenancy';
COMMENT ON COLUMN public.notifications.business_id IS 'Links notifications to specific business for multi-tenancy';
