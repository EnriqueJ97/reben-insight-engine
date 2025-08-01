-- Add SUPER_ADMIN role to user_role enum
ALTER TYPE user_role ADD VALUE 'SUPER_ADMIN';

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

-- Set enriquejimenezcruz@gmail.com as SUPER_ADMIN
UPDATE public.profiles 
SET role = 'SUPER_ADMIN' 
WHERE email = 'enriquejimenezcruz@gmail.com';

-- Create RLS policies for SUPER_ADMIN access
CREATE POLICY "SUPER_ADMIN can view all tenants" 
ON public.tenants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all checkins" 
ON public.checkins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all alerts" 
ON public.alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all teams" 
ON public.teams 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all email campaigns" 
ON public.email_campaigns 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "SUPER_ADMIN can view all custom questions" 
ON public.custom_questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  )
);