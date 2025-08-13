-- Add SELECT policy to allow MANAGERs to view rotas for employees in their tenant
CREATE POLICY "Managers can view rotas for same tenant employees"
ON public.rotas
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM profiles 
    WHERE tenant_id = get_current_user_tenant_id()
  ) 
  AND get_current_user_role() = 'MANAGER'
);