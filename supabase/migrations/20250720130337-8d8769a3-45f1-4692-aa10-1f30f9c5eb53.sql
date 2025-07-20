-- Primero, eliminar las políticas problemáticas
DROP POLICY IF EXISTS "HR_ADMIN can manage profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;

-- Crear función SECURITY DEFINER para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Crear función SECURITY DEFINER para obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recrear políticas usando las funciones SECURITY DEFINER
CREATE POLICY "HR_ADMIN can manage profiles in their tenant" 
ON public.profiles 
FOR ALL
TO public
USING (
  public.get_current_user_role() = 'HR_ADMIN' 
  AND tenant_id = public.get_current_user_tenant_id()
);

CREATE POLICY "Users can view profiles in their tenant" 
ON public.profiles 
FOR SELECT
TO public
USING (tenant_id = public.get_current_user_tenant_id());