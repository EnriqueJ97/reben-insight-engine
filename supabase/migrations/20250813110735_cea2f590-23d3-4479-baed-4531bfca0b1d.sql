-- Actualizar los tipos de planes disponibles
DROP TYPE IF EXISTS subscription_plan_type CASCADE;
CREATE TYPE subscription_plan_type AS ENUM ('lite', 'esencial', 'profesional', 'enterprise');

-- Actualizar la tabla tenants para usar los nuevos planes
ALTER TABLE public.tenants 
DROP CONSTRAINT IF EXISTS tenants_subscription_plan_check;

ALTER TABLE public.tenants 
ALTER COLUMN subscription_plan TYPE TEXT;

-- Crear tabla de configuración de planes y features
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price_per_employee DECIMAL(10,2) NOT NULL,
  min_employees INTEGER DEFAULT 1,
  max_employees INTEGER,
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'annual'
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar los planes definidos
INSERT INTO public.subscription_plans (plan_name, display_name, price_per_employee, features) VALUES
('lite', 'Lite', 1.90, '{
  "checkins": {
    "manual": true,
    "automatic": false,
    "contextual": false
  },
  "dashboard": {
    "basic": true,
    "team_breakdown": false,
    "executive": false
  },
  "export": {
    "csv": true,
    "pdf": false,
    "excel": false
  },
  "ai_chat": {
    "enabled": false
  },
  "alerts": {
    "basic": false,
    "predictive": false
  },
  "integrations": {
    "slack": false,
    "teams": false,
    "hris": false
  },
  "compliance": {
    "csrd": false
  },
  "support": {
    "email_48h": true,
    "priority": false,
    "dedicated_manager": false
  }
}'),
('esencial', 'Esencial', 3.90, '{
  "checkins": {
    "manual": true,
    "automatic": true,
    "contextual": true
  },
  "dashboard": {
    "basic": true,
    "team_breakdown": true,
    "executive": false
  },
  "export": {
    "csv": true,
    "pdf": false,
    "excel": false
  },
  "ai_chat": {
    "enabled": true,
    "basic": true
  },
  "alerts": {
    "basic": true,
    "predictive": false
  },
  "time_tracking": {
    "basic": true
  },
  "integrations": {
    "slack": false,
    "teams": false,
    "hris": false
  },
  "compliance": {
    "csrd": false
  },
  "support": {
    "email_48h": true,
    "priority": false,
    "dedicated_manager": false
  }
}'),
('profesional', 'Profesional', 7.90, '{
  "checkins": {
    "manual": true,
    "automatic": true,
    "contextual": true
  },
  "dashboard": {
    "basic": true,
    "team_breakdown": true,
    "executive": true
  },
  "export": {
    "csv": true,
    "pdf": true,
    "excel": true
  },
  "ai_chat": {
    "enabled": true,
    "basic": true,
    "advanced": true
  },
  "alerts": {
    "basic": true,
    "predictive": true
  },
  "burnout_analysis": {
    "enabled": true
  },
  "wellness_score": {
    "enabled": true
  },
  "what_if_simulator": {
    "enabled": true
  },
  "time_tracking": {
    "basic": true,
    "advanced": true
  },
  "integrations": {
    "slack": true,
    "teams": true,
    "hris": true
  },
  "compliance": {
    "csrd": true
  },
  "support": {
    "email_48h": true,
    "priority": false,
    "dedicated_manager": false
  }
}'),
('enterprise', 'Enterprise', 0.00, '{
  "checkins": {
    "manual": true,
    "automatic": true,
    "contextual": true,
    "custom": true
  },
  "dashboard": {
    "basic": true,
    "team_breakdown": true,
    "executive": true,
    "custom": true
  },
  "export": {
    "csv": true,
    "pdf": true,
    "excel": true,
    "custom": true
  },
  "ai_chat": {
    "enabled": true,
    "basic": true,
    "advanced": true,
    "custom": true
  },
  "alerts": {
    "basic": true,
    "predictive": true,
    "custom": true
  },
  "burnout_analysis": {
    "enabled": true,
    "advanced": true
  },
  "wellness_score": {
    "enabled": true,
    "custom": true
  },
  "what_if_simulator": {
    "enabled": true,
    "advanced": true
  },
  "flexible_work": {
    "enabled": true,
    "shift_management": true
  },
  "time_tracking": {
    "basic": true,
    "advanced": true,
    "realtime": true
  },
  "integrations": {
    "slack": true,
    "teams": true,
    "hris": true,
    "api": true,
    "custom": true
  },
  "compliance": {
    "csrd": true,
    "custom": true
  },
  "support": {
    "email_48h": true,
    "priority": true,
    "dedicated_manager": true,
    "onboarding": true,
    "training": true
  }
}');

-- Actualizar billing para usar price_per_employee
ALTER TABLE public.tenant_billing 
ADD COLUMN IF NOT EXISTS price_per_employee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_employees INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS volume_discount DECIMAL(5,2) DEFAULT 0; -- % descuento por volumen

-- Función para calcular el precio total basado en empleados
CREATE OR REPLACE FUNCTION calculate_tenant_pricing(tenant_uuid UUID)
RETURNS TABLE(
  monthly_total DECIMAL(10,2),
  annual_total DECIMAL(10,2),
  price_per_employee DECIMAL(10,2),
  total_employees INTEGER,
  volume_discount DECIMAL(5,2)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_info RECORD;
  employee_count INTEGER;
  base_price DECIMAL(10,2);
  discount_rate DECIMAL(5,2) := 0;
BEGIN
  -- Obtener plan actual del tenant
  SELECT t.subscription_plan INTO plan_info
  FROM public.tenants t 
  WHERE t.id = tenant_uuid;
  
  -- Obtener precio base del plan
  SELECT sp.price_per_employee INTO base_price
  FROM public.subscription_plans sp
  WHERE sp.plan_name = plan_info.subscription_plan;
  
  -- Contar empleados activos
  SELECT COUNT(*) INTO employee_count
  FROM public.profiles p
  WHERE p.tenant_id = tenant_uuid;
  
  -- Calcular descuento por volumen (1000+ empleados = 15% descuento)
  IF employee_count >= 1000 THEN
    discount_rate := 15.0;
  ELSIF employee_count >= 500 THEN
    discount_rate := 10.0;
  ELSIF employee_count >= 250 THEN
    discount_rate := 5.0;
  END IF;
  
  -- Aplicar descuento
  base_price := base_price * (1 - discount_rate / 100);
  
  RETURN QUERY SELECT
    (base_price * employee_count) as monthly_total,
    (base_price * employee_count * 12 * 0.85) as annual_total, -- 15% descuento anual
    base_price as price_per_employee,
    employee_count as total_employees,
    discount_rate as volume_discount;
END;
$$;

-- RLS para subscription_plans (todos pueden leer)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage subscription plans"
ON public.subscription_plans
FOR ALL
USING (get_current_user_role() = 'SUPER_ADMIN');

-- Actualizar trigger para tenant_billing
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();