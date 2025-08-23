-- Tabla para configuraciones de políticas HR personalizables
CREATE TABLE public.hr_policy_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  policy_type TEXT NOT NULL, -- 'check_ins', 'shift_rules', 'auto_approval', etc.
  config_name TEXT NOT NULL,
  config_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, policy_type, config_name)
);

-- Enable RLS
ALTER TABLE public.hr_policy_configs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "HR_ADMIN can manage policy configs in their tenant"
ON public.hr_policy_configs
FOR ALL
USING (
  tenant_id = get_current_user_tenant_id() AND 
  get_current_user_role() = 'HR_ADMIN'
);

CREATE POLICY "Users can view policy configs in their tenant"
ON public.hr_policy_configs
FOR SELECT
USING (tenant_id = get_current_user_tenant_id());

-- Tabla para recomendaciones del asistente AI
CREATE TABLE public.ai_policy_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'turnover_reduction', 'satisfaction_improvement', etc.
  current_metrics JSONB NOT NULL DEFAULT '{}',
  recommended_changes JSONB NOT NULL DEFAULT '{}',
  expected_impact JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'dismissed'
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by UUID
);

-- Enable RLS
ALTER TABLE public.ai_policy_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "HR_ADMIN can manage AI recommendations in their tenant"
ON public.ai_policy_recommendations
FOR ALL
USING (
  tenant_id = get_current_user_tenant_id() AND 
  get_current_user_role() = 'HR_ADMIN'
);

-- Tabla para análisis comparativo de políticas
CREATE TABLE public.policy_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  policy_config_id UUID REFERENCES public.hr_policy_configs(id),
  metric_type TEXT NOT NULL, -- 'turnover_rate', 'satisfaction_score', 'productivity_index', etc.
  metric_value NUMERIC NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type TEXT NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "HR_ADMIN can manage policy metrics in their tenant"
ON public.policy_performance_metrics
FOR ALL
USING (
  tenant_id = get_current_user_tenant_id() AND 
  get_current_user_role() = 'HR_ADMIN'
);

CREATE POLICY "Users can view policy metrics in their tenant"
ON public.policy_performance_metrics
FOR SELECT
USING (tenant_id = get_current_user_tenant_id());

-- Índices para mejorar performance
CREATE INDEX idx_hr_policy_configs_tenant_type ON public.hr_policy_configs(tenant_id, policy_type);
CREATE INDEX idx_ai_policy_recommendations_tenant_status ON public.ai_policy_recommendations(tenant_id, status);
CREATE INDEX idx_policy_performance_metrics_tenant_date ON public.policy_performance_metrics(tenant_id, measurement_date);

-- Trigger para updated_at
CREATE TRIGGER update_hr_policy_configs_updated_at
BEFORE UPDATE ON public.hr_policy_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();