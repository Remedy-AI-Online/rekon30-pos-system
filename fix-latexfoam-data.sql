-- Fix LatexFoam data in Supabase
-- Run these commands in Supabase Dashboard → SQL Editor

-- 1. Add missing columns
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS monthly_revenue DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false;

-- 2. Update LatexFoam data
UPDATE public.businesses 
SET 
  monthly_revenue = 3400,
  setup_complete = true,
  payment_status = 'paid',
  upfront_fee_paid = true,
  maintenance_fee_paid = true,
  last_payment_date = NOW()
WHERE business_name = 'LatexFoam';

-- 3. Verify the update
SELECT business_name, monthly_revenue, setup_complete, payment_status, upfront_fee_paid, maintenance_fee_paid 
FROM public.businesses 
WHERE business_name = 'LatexFoam';
