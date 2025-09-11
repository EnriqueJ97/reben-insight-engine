-- EIE v2 Database Schema Migration (Fixed)
-- Add feature flag and analytics infrastructure

-- Add EIE v2 feature flag to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS eie_v2_enabled boolean DEFAULT false;

-- Analytics cache for computed metrics with confidence intervals
CREATE TABLE IF NOT EXISTS public.analytics_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  entity_id uuid NOT NULL, -- user_id or team_id
  entity_type text NOT NULL, -- 'user' or 'team'
  metric_key text NOT NULL,
  value numeric NOT NULL,
  ci_low numeric,
  ci_high numeric,
  n_effective integer,
  drivers jsonb DEFAULT '[]'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, entity_id, entity_type, metric_key)
);

-- Benchmarks reference data for percentile calculations
CREATE TABLE IF NOT EXISTS public.benchmarks_ref (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid, -- NULL for global benchmarks
  industry text NOT NULL,
  size_bucket text NOT NULL,
  region text NOT NULL DEFAULT 'global',
  metric_key text NOT NULL,
  ecdf_data jsonb NOT NULL, -- ECDF percentiles and values
  sample_n integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(industry, size_bucket, region, metric_key)
);

-- Analytics quality of service metrics
CREATE TABLE IF NOT EXISTS public.analytics_qos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  date_collected date NOT NULL DEFAULT CURRENT_DATE,
  precision_c_index numeric,
  ece_score numeric, -- Expected Calibration Error
  days_advance_median numeric,
  recommendations_applied_pct numeric,
  kpis_csrd_covered_pct numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, date_collected)
);

-- Enable RLS on new tables
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks_ref ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_qos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_cache
DROP POLICY IF EXISTS "Users can view analytics in their tenant" ON public.analytics_cache;
CREATE POLICY "Users can view analytics in their tenant" 
ON public.analytics_cache 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

DROP POLICY IF EXISTS "System can insert analytics cache" ON public.analytics_cache;
CREATE POLICY "System can insert analytics cache" 
ON public.analytics_cache 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

DROP POLICY IF EXISTS "System can update analytics cache" ON public.analytics_cache;
CREATE POLICY "System can update analytics cache" 
ON public.analytics_cache 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id());

-- RLS Policies for benchmarks_ref
DROP POLICY IF EXISTS "Users can view benchmarks" ON public.benchmarks_ref;
CREATE POLICY "Users can view benchmarks" 
ON public.benchmarks_ref 
FOR SELECT 
USING (tenant_id IS NULL OR tenant_id = get_current_user_tenant_id());

DROP POLICY IF EXISTS "HR can manage tenant benchmarks" ON public.benchmarks_ref;
CREATE POLICY "HR can manage tenant benchmarks" 
ON public.benchmarks_ref 
FOR ALL 
USING (
  tenant_id = get_current_user_tenant_id() 
  AND get_current_user_role() = ANY(ARRAY['HR_ADMIN', 'COMPLIANCE_OFFICER'])
);

-- RLS Policies for analytics_qos
DROP POLICY IF EXISTS "Users can view QoS in their tenant" ON public.analytics_qos;
CREATE POLICY "Users can view QoS in their tenant" 
ON public.analytics_qos 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

DROP POLICY IF EXISTS "System can manage QoS metrics" ON public.analytics_qos;
CREATE POLICY "System can manage QoS metrics" 
ON public.analytics_qos 
FOR ALL 
USING (tenant_id = get_current_user_tenant_id());

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_analytics_cache_updated_at ON public.analytics_cache;
CREATE TRIGGER update_analytics_cache_updated_at
BEFORE UPDATE ON public.analytics_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_benchmarks_ref_updated_at ON public.benchmarks_ref;
CREATE TRIGGER update_benchmarks_ref_updated_at
BEFORE UPDATE ON public.benchmarks_ref
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();