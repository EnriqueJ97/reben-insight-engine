-- Fix other policies that reference profiles table directly
DROP POLICY IF EXISTS "SUPER_ADMIN can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "SUPER_ADMIN can manage all tenants" ON public.tenants;

-- Recreate with security definer function
CREATE POLICY "SUPER_ADMIN can view all tenants" 
ON public.tenants 
FOR SELECT 
USING (public.get_current_user_role() = 'SUPER_ADMIN');

CREATE POLICY "SUPER_ADMIN can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (public.get_current_user_role() = 'SUPER_ADMIN');