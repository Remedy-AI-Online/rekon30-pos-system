-- Create RLS policies for complete multi-tenancy
-- This ensures each business can only access their own data

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their business products" ON public.products;
DROP POLICY IF EXISTS "Users can only insert products for their business" ON public.products;
DROP POLICY IF EXISTS "Users can only update their business products" ON public.products;
DROP POLICY IF EXISTS "Users can only delete their business products" ON public.products;
DROP POLICY IF EXISTS "Super admins can see all products" ON public.products;

-- Drop workers policies
DROP POLICY IF EXISTS "Users can only see their business workers" ON public.workers;
DROP POLICY IF EXISTS "Users can only insert workers for their business" ON public.workers;
DROP POLICY IF EXISTS "Users can only update their business workers" ON public.workers;
DROP POLICY IF EXISTS "Users can only delete their business workers" ON public.workers;
DROP POLICY IF EXISTS "Super admins can see all workers" ON public.workers;

-- Drop customers policies
DROP POLICY IF EXISTS "Users can only see their business customers" ON public.customers;
DROP POLICY IF EXISTS "Users can only insert customers for their business" ON public.customers;
DROP POLICY IF EXISTS "Users can only update their business customers" ON public.customers;
DROP POLICY IF EXISTS "Users can only delete their business customers" ON public.customers;
DROP POLICY IF EXISTS "Super admins can see all customers" ON public.customers;

-- Drop sales policies
DROP POLICY IF EXISTS "Users can only see their business sales" ON public.sales;
DROP POLICY IF EXISTS "Users can only insert sales for their business" ON public.sales;
DROP POLICY IF EXISTS "Users can only update their business sales" ON public.sales;
DROP POLICY IF EXISTS "Users can only delete their business sales" ON public.sales;
DROP POLICY IF EXISTS "Super admins can see all sales" ON public.sales;

-- Drop sale_items policies
DROP POLICY IF EXISTS "Users can only see their business sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can only insert sale items for their business" ON public.sale_items;
DROP POLICY IF EXISTS "Users can only update their business sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Users can only delete their business sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Super admins can see all sale items" ON public.sale_items;

-- Drop corrections policies
DROP POLICY IF EXISTS "Users can only see their business corrections" ON public.corrections;
DROP POLICY IF EXISTS "Users can only insert corrections for their business" ON public.corrections;
DROP POLICY IF EXISTS "Users can only update their business corrections" ON public.corrections;
DROP POLICY IF EXISTS "Users can only delete their business corrections" ON public.corrections;
DROP POLICY IF EXISTS "Super admins can see all corrections" ON public.corrections;

-- Drop payroll policies
DROP POLICY IF EXISTS "Users can only see their business payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can only insert payroll for their business" ON public.payroll;
DROP POLICY IF EXISTS "Users can only update their business payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can only delete their business payroll" ON public.payroll;
DROP POLICY IF EXISTS "Super admins can see all payroll" ON public.payroll;

-- Drop cashiers policies
DROP POLICY IF EXISTS "Users can only see their business cashiers" ON public.cashiers;
DROP POLICY IF EXISTS "Users can only insert cashiers for their business" ON public.cashiers;
DROP POLICY IF EXISTS "Users can only update their business cashiers" ON public.cashiers;
DROP POLICY IF EXISTS "Users can only delete their business cashiers" ON public.cashiers;
DROP POLICY IF EXISTS "Super admins can see all cashiers" ON public.cashiers;

-- Drop daily_reports policies
DROP POLICY IF EXISTS "Users can only see their business daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can only insert daily reports for their business" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can only update their business daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Users can only delete their business daily reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Super admins can see all daily reports" ON public.daily_reports;

-- Drop notifications policies
DROP POLICY IF EXISTS "Users can only see their business notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can only insert notifications for their business" ON public.notifications;
DROP POLICY IF EXISTS "Users can only update their business notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can only delete their business notifications" ON public.notifications;
DROP POLICY IF EXISTS "Super admins can see all notifications" ON public.notifications;

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
CREATE POLICY "Super admins can see all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Workers policies
CREATE POLICY "Users can only see their business workers" ON public.workers
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert workers for their business" ON public.workers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business workers" ON public.workers
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business workers" ON public.workers
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all workers" ON public.workers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Customers policies
CREATE POLICY "Users can only see their business customers" ON public.customers
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert customers for their business" ON public.customers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business customers" ON public.customers
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business customers" ON public.customers
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all customers" ON public.customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Sales policies
CREATE POLICY "Users can only see their business sales" ON public.sales
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert sales for their business" ON public.sales
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business sales" ON public.sales
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business sales" ON public.sales
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all sales" ON public.sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Sale items policies
CREATE POLICY "Users can only see their business sale items" ON public.sale_items
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert sale items for their business" ON public.sale_items
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business sale items" ON public.sale_items
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business sale items" ON public.sale_items
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all sale items" ON public.sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Corrections policies
CREATE POLICY "Users can only see their business corrections" ON public.corrections
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert corrections for their business" ON public.corrections
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business corrections" ON public.corrections
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business corrections" ON public.corrections
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all corrections" ON public.corrections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Payroll policies
CREATE POLICY "Users can only see their business payroll" ON public.payroll
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert payroll for their business" ON public.payroll
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business payroll" ON public.payroll
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business payroll" ON public.payroll
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all payroll" ON public.payroll
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Cashiers policies
CREATE POLICY "Users can only see their business cashiers" ON public.cashiers
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert cashiers for their business" ON public.cashiers
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business cashiers" ON public.cashiers
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business cashiers" ON public.cashiers
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all cashiers" ON public.cashiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Daily reports policies
CREATE POLICY "Users can only see their business daily reports" ON public.daily_reports
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert daily reports for their business" ON public.daily_reports
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business daily reports" ON public.daily_reports
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business daily reports" ON public.daily_reports
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all daily reports" ON public.daily_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can only see their business notifications" ON public.notifications
    FOR SELECT USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only insert notifications for their business" ON public.notifications
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only update their business notifications" ON public.notifications
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Users can only delete their business notifications" ON public.notifications
    FOR DELETE USING (
        business_id IN (
            SELECT business_id FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'business_id' = business_id::text
        )
    );

CREATE POLICY "Super admins can see all notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );
