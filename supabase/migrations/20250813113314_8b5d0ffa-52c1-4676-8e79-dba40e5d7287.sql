-- Add policy to allow any MANAGER in the same tenant to manage rotas
CREATE POLICY "Managers can insert rotas for same tenant employees"
ON public.rotas
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM profiles 
    WHERE tenant_id = get_current_user_tenant_id()
  ) 
  AND get_current_user_role() = 'MANAGER'
);

-- Also allow UPDATE and DELETE for managers in same tenant
CREATE POLICY "Managers can update rotas for same tenant employees"
ON public.rotas
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM profiles 
    WHERE tenant_id = get_current_user_tenant_id()
  ) 
  AND get_current_user_role() = 'MANAGER'
);

CREATE POLICY "Managers can delete rotas for same tenant employees"
ON public.rotas
FOR DELETE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM profiles 
    WHERE tenant_id = get_current_user_tenant_id()
  ) 
  AND get_current_user_role() = 'MANAGER'
);