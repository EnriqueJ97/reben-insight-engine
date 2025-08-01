-- Add new columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
ADD COLUMN subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
ADD COLUMN subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
ADD COLUMN max_users integer DEFAULT 50;

-- Update existing tenants to have default values
UPDATE public.tenants SET 
  status = 'active',
  subscription_plan = 'basic',
  subscription_status = 'active',
  max_users = 50
WHERE status IS NULL;