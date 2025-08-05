-- Actualizar las políticas predefinidas para que sean globales (tenant_id = NULL)
-- y permitir que todos los tenants las vean

UPDATE public.policy_templates 
SET tenant_id = NULL 
WHERE category IN ('flexibilidad', 'tiempo', 'bienestar', 'productividad', 'desarrollo', 'engagement', 'turnos');

-- Actualizar las políticas RLS para permitir ver plantillas globales
DROP POLICY "Users can view policy templates in their tenant" ON public.policy_templates;

CREATE POLICY "Users can view policy templates" 
ON public.policy_templates 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() OR tenant_id IS NULL);