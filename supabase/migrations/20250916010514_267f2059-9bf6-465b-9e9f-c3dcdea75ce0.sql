-- Crear tablas para el nuevo sistema REBEN Score de Riesgo Central

-- Tabla para almacenar scores de riesgo
CREATE TABLE public.risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  level TEXT NOT NULL CHECK (level IN ('VERDE', 'AMARILLO', 'ROJO')),
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para intervenciones automáticas
CREATE TABLE public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('FOCO_BLOQUEO', 'DESCONEXION_MODO', 'REDISTRIBUCION_CARGA')),
  risk_score_id UUID REFERENCES public.risk_scores(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'FAILED')),
  result TEXT,
  estimated_savings INTEGER DEFAULT 0,
  actual_savings INTEGER,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para eventos ROI
CREATE TABLE public.roi_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('ROTACION_EVITADA', 'ABSENTISMO_EVITADO', 'PRODUCTIVIDAD_MEJORADA')),
  employee_id UUID NOT NULL,
  intervention_id UUID REFERENCES public.interventions(id),
  tenant_id UUID NOT NULL,
  estimated_savings INTEGER NOT NULL DEFAULT 0,
  actual_savings INTEGER,
  description TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para logs de integraciones
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_type TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  tenant_id UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_scores
CREATE POLICY "Users can view their own risk scores" 
ON public.risk_scores 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own risk scores" 
ON public.risk_scores 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "HR_ADMIN can view all risk scores in tenant" 
ON public.risk_scores 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Managers can view team risk scores" 
ON public.risk_scores 
FOR SELECT 
USING (user_id IN (
  SELECT p.id FROM profiles p 
  JOIN teams t ON p.team_id = t.id 
  WHERE t.manager_id = auth.uid()
));

-- RLS Policies for interventions
CREATE POLICY "Users can view their own interventions" 
ON public.interventions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "HR_ADMIN can view all interventions in tenant" 
ON public.interventions 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "System can insert interventions" 
ON public.interventions 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

-- RLS Policies for roi_events
CREATE POLICY "HR_ADMIN can view all ROI events in tenant" 
ON public.roi_events 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "System can insert ROI events" 
ON public.roi_events 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

-- RLS Policies for integration_logs
CREATE POLICY "HR_ADMIN can view integration logs" 
ON public.integration_logs 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "System can insert integration logs" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_risk_scores_updated_at
BEFORE UPDATE ON public.risk_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_risk_scores_user_calculated ON public.risk_scores(user_id, calculated_at DESC);
CREATE INDEX idx_risk_scores_tenant_level ON public.risk_scores(tenant_id, level);
CREATE INDEX idx_interventions_user_triggered ON public.interventions(user_id, triggered_at DESC);
CREATE INDEX idx_roi_events_tenant_calculated ON public.roi_events(tenant_id, calculated_at DESC);
CREATE INDEX idx_integration_logs_executed ON public.integration_logs(executed_at DESC);