-- Crear tablas para el Simulador What-If

-- Tabla para plantillas de políticas predefinidas
CREATE TABLE public.policy_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  default_delta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_recommended boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla para políticas personalizadas creadas por usuarios
CREATE TABLE public.custom_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'custom',
  delta_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla para escenarios de simulación
CREATE TABLE public.scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  baseline_period text NOT NULL, -- ISO range format
  status text NOT NULL DEFAULT 'DRAFT', -- DRAFT, RUNNING, COMPLETED, ERROR
  policy_template_id uuid,
  custom_policy_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla para parámetros de escenarios
CREATE TABLE public.scenario_params (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  scenario_id uuid NOT NULL,
  param_key text NOT NULL,
  delta_type text NOT NULL, -- 'percent', 'absolute', 'fixed'
  delta_value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabla para resultados de simulaciones
CREATE TABLE public.scenario_outputs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  scenario_id uuid NOT NULL,
  metric_key text NOT NULL,
  baseline numeric,
  projected numeric,
  delta numeric,
  ci_low numeric,
  ci_high numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_outputs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para policy_templates
CREATE POLICY "Users can view policy templates in their tenant" 
ON public.policy_templates 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "HR_ADMIN can manage policy templates" 
ON public.policy_templates 
FOR ALL 
USING ((tenant_id = get_current_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])));

-- Políticas RLS para custom_policies
CREATE POLICY "Users can view custom policies in their tenant" 
ON public.custom_policies 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create their own custom policies" 
ON public.custom_policies 
FOR INSERT 
WITH CHECK ((tenant_id = get_current_user_tenant_id()) AND (creator_id = auth.uid()));

CREATE POLICY "HR_ADMIN can manage all custom policies" 
ON public.custom_policies 
FOR ALL 
USING ((tenant_id = get_current_user_tenant_id()) AND (get_current_user_role() = ANY (ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])));

CREATE POLICY "Users can manage their own custom policies" 
ON public.custom_policies 
FOR UPDATE 
USING ((tenant_id = get_current_user_tenant_id()) AND (creator_id = auth.uid()));

-- Políticas RLS para scenarios
CREATE POLICY "Users can view scenarios in their tenant" 
ON public.scenarios 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create scenarios" 
ON public.scenarios 
FOR INSERT 
WITH CHECK ((tenant_id = get_current_user_tenant_id()) AND (creator_id = auth.uid()));

CREATE POLICY "Users can manage their own scenarios" 
ON public.scenarios 
FOR UPDATE 
USING ((tenant_id = get_current_user_tenant_id()) AND ((creator_id = auth.uid()) OR (get_current_user_role() = ANY (ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text]))));

-- Políticas RLS para scenario_params
CREATE POLICY "Users can view scenario params in their tenant" 
ON public.scenario_params 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can manage scenario params for their scenarios" 
ON public.scenario_params 
FOR ALL 
USING (tenant_id = get_current_user_tenant_id());

-- Políticas RLS para scenario_outputs
CREATE POLICY "Users can view scenario outputs in their tenant" 
ON public.scenario_outputs 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "System can insert scenario outputs" 
ON public.scenario_outputs 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

-- Triggers para updated_at
CREATE TRIGGER update_policy_templates_updated_at
BEFORE UPDATE ON public.policy_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_policies_updated_at
BEFORE UPDATE ON public.custom_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar las 20 políticas predefinidas
INSERT INTO public.policy_templates (tenant_id, name, description, category, default_delta_json, is_recommended) VALUES
-- Obtener tenant_id genérico para las plantillas por defecto
((SELECT id FROM public.tenants LIMIT 1), '+1 Día Teletrabajo', 'Agregar un día adicional de trabajo remoto por semana', 'flexibilidad', '{"remote_days": {"delta_type": "absolute", "delta_value": 1}}', true),
((SELECT id FROM public.tenants LIMIT 1), 'Teletrabajo 3/5', 'Establecer teletrabajo 3 días por semana', 'flexibilidad', '{"remote_days": {"delta_type": "fixed", "delta_value": 3}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Viernes Corto', 'Reducir 2 horas el día viernes', 'tiempo', '{"hours_friday": {"delta_type": "absolute", "delta_value": -2}}', false),
((SELECT id FROM public.tenants LIMIT 1), '-15% Horas Extra', 'Reducir horas extra en 15%', 'tiempo', '{"overtime_hours": {"delta_type": "percent", "delta_value": -15}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Miércoles Sin Reuniones', 'Eliminar reuniones los miércoles para deep work', 'productividad', '{"meeting_hours_wednesday": {"delta_type": "percent", "delta_value": -100}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Día Salud Mental/Mes', 'Un día adicional para salud mental al mes', 'bienestar', '{"mental_health_days": {"delta_type": "absolute", "delta_value": 1}}', false),
((SELECT id FROM public.tenants LIMIT 1), '+20h Capacitación/Año', 'Aumentar 20 horas de formación anual', 'desarrollo', '{"training_hours": {"delta_type": "absolute", "delta_value": 20}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Rotación Turnos 2-2-3', 'Implementar patrón de turnos más equitativo', 'turnos', '{"shift_pattern": {"delta_type": "fixed", "delta_value": "2-2-3"}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Pausas Activas 5min/hora', 'Pausas de 5 minutos cada hora', 'bienestar', '{"break_ratio": {"delta_type": "absolute", "delta_value": 5}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Semana 4 Días (32h)', 'Jornada laboral de 4 días y 32 horas', 'tiempo', '{"contract_hours": {"delta_type": "fixed", "delta_value": 32}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Horario Flexible ±2h', 'Flexibilidad de entrada/salida de 2 horas', 'flexibilidad', '{"flex_band": {"delta_type": "absolute", "delta_value": 2}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Plan Deporte €30/mes', 'Subsidio deportivo de 30€ mensuales', 'bienestar', '{"wellbeing_allowance": {"delta_type": "absolute", "delta_value": 30}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Reuniones ≤25 min', 'Limitar reuniones a máximo 25 minutos', 'productividad', '{"meeting_max_minutes": {"delta_type": "percent", "delta_value": -50}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Buddy Onboarding', 'Programa de mentores para nuevos empleados', 'desarrollo', '{"onboarding_buddy": {"delta_type": "fixed", "delta_value": true}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Reconocimiento Semanal', 'Programa de reconocimiento semanal', 'engagement', '{"recognition_events": {"delta_type": "absolute", "delta_value": 1}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Gamificación Check-ins', 'Gamificar las encuestas de bienestar', 'engagement', '{"checkin_response_rate": {"delta_type": "absolute", "delta_value": 15}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Turnos Noche ≤3 Seguidos', 'Máximo 3 turnos nocturnos consecutivos', 'turnos', '{"night_shift_cap": {"delta_type": "fixed", "delta_value": 3}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Trabajo Asíncrono 40%', 'Aumentar trabajo asíncrono al 40%', 'productividad', '{"async_work_ratio": {"delta_type": "absolute", "delta_value": 40}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Coworking €100/mes', 'Subsidio para espacios de coworking', 'flexibilidad', '{"workspace_allowance": {"delta_type": "absolute", "delta_value": 100}}', false),
((SELECT id FROM public.tenants LIMIT 1), 'Guardería In-house', 'Servicio de guardería en la empresa', 'bienestar', '{"care_support": {"delta_type": "fixed", "delta_value": true}}', false);