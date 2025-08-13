-- Add missing RLS policies for rotas table to allow HR_ADMIN to insert new shifts

-- Policy to allow HR_ADMIN to insert rotas for employees in their tenant
CREATE POLICY "HR_ADMIN can insert rotas for their tenant employees"
ON public.rotas
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM profiles 
    WHERE tenant_id = get_current_user_tenant_id()
  ) 
  AND get_current_user_role() = 'HR_ADMIN'
);

-- Policy to allow Managers to insert rotas for their team members
CREATE POLICY "Managers can insert rotas for their team"
ON public.rotas
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT p.id
    FROM profiles p
    JOIN teams t ON p.team_id = t.id
    WHERE t.manager_id = auth.uid()
  )
);