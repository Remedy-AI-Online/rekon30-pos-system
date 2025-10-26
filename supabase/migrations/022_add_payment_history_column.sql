-- Add payment_history column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS payment_history JSONB DEFAULT '[]'::jsonb;

-- Add index for payment_history queries
CREATE INDEX IF NOT EXISTS idx_businesses_payment_history ON public.businesses USING GIN (payment_history);
