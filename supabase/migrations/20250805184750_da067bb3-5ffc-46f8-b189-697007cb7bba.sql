-- Permitir NULL en tenant_id para plantillas globales
ALTER TABLE public.policy_templates ALTER COLUMN tenant_id DROP NOT NULL;

-- Actualizar las políticas predefinidas para que sean globales
UPDATE public.policy_templates 
SET tenant_id = NULL 
WHERE category IN ('flexibilidad', 'tiempo', 'bienestar', 'productividad', 'desarrollo', 'engagement', 'turnos');

-- Actualizar las políticas RLS para permitir ver plantillas globales
DROP POLICY "Users can view policy templates in their tenant" ON public.policy_templates;

CREATE POLICY "Users can view policy templates" 
ON public.policy_templates 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() OR tenant_id IS NULL);