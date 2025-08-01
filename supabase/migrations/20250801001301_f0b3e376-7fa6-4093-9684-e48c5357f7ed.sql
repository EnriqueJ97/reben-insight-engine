-- Remove problematic policies first
DROP POLICY IF EXISTS "SUPER_ADMIN can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "SUPER_ADMIN can manage all profiles" ON public.profiles;

-- Create security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Recreate policies using the security definer function
CREATE POLICY "SUPER_ADMIN can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'SUPER_ADMIN');

CREATE POLICY "SUPER_ADMIN can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() = 'SUPER_ADMIN');