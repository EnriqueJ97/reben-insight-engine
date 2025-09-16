-- Create evaluation campaigns table
CREATE TABLE public.evaluation_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  target_audience JSONB NOT NULL DEFAULT '{"allEmployees": true}',
  launch_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'weekly', 'monthly', 'quarterly')),
  total_participants INTEGER DEFAULT 0,
  completed_responses INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluation responses table
CREATE TABLE public.evaluation_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  user_id UUID, -- Nullable for anonymous responses
  user_alias TEXT, -- For anonymous responses
  responses JSONB NOT NULL DEFAULT '{}', -- Store all question responses
  completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluation analytics table for aggregated results
CREATE TABLE public.evaluation_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  instrument_id TEXT NOT NULL, -- Reference to scientific instrument
  dimension_id TEXT, -- For specific dimensions
  team_id UUID, -- For team-level analytics
  metric_key TEXT NOT NULL, -- e.g., 'burnout_score', 'engagement_vigor'
  score NUMERIC NOT NULL,
  percentile NUMERIC, -- Benchmarking
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  sample_size INTEGER NOT NULL DEFAULT 0,
  confidence_interval JSONB, -- {low: x, high: y}
  benchmark_data JSONB, -- Industry/size comparisons
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluation notifications table
CREATE TABLE public.evaluation_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('invitation', 'reminder', 'completion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_evaluation_campaigns_tenant_id ON public.evaluation_campaigns(tenant_id);
CREATE INDEX idx_evaluation_campaigns_status ON public.evaluation_campaigns(status);
CREATE INDEX idx_evaluation_responses_campaign_id ON public.evaluation_responses(campaign_id);
CREATE INDEX idx_evaluation_responses_user_id ON public.evaluation_responses(user_id);
CREATE INDEX idx_evaluation_analytics_campaign_id ON public.evaluation_analytics(campaign_id);
CREATE INDEX idx_evaluation_analytics_tenant_team ON public.evaluation_analytics(tenant_id, team_id);
CREATE INDEX idx_evaluation_notifications_campaign_user ON public.evaluation_notifications(campaign_id, user_id);

-- Enable RLS
ALTER TABLE public.evaluation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluation_campaigns
CREATE POLICY "HR_ADMIN can manage evaluation campaigns in their tenant"
ON public.evaluation_campaigns
FOR ALL
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Users can view active campaigns in their tenant"
ON public.evaluation_campaigns
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND status = 'active');

-- RLS Policies for evaluation_responses
CREATE POLICY "Users can manage their own evaluation responses"
ON public.evaluation_responses
FOR ALL
USING (tenant_id = get_current_user_tenant_id() AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "HR_ADMIN can view all responses in their tenant"
ON public.evaluation_responses
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Managers can view team responses"
ON public.evaluation_responses
FOR SELECT
USING (
  tenant_id = get_current_user_tenant_id() AND 
  get_current_user_role() = 'MANAGER' AND
  user_id IN (
    SELECT p.id FROM profiles p
    JOIN teams t ON p.team_id = t.id
    WHERE t.manager_id = auth.uid()
  )
);

-- RLS Policies for evaluation_analytics
CREATE POLICY "HR_ADMIN can manage analytics in their tenant"
ON public.evaluation_analytics
FOR ALL
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Managers can view team analytics"
ON public.evaluation_analytics
FOR SELECT
USING (
  tenant_id = get_current_user_tenant_id() AND 
  get_current_user_role() = 'MANAGER' AND
  (team_id IN (
    SELECT t.id FROM teams t WHERE t.manager_id = auth.uid()
  ) OR team_id IS NULL)
);

CREATE POLICY "Users can view aggregate analytics"
ON public.evaluation_analytics
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND team_id IS NULL);

-- RLS Policies for evaluation_notifications
CREATE POLICY "Users can view their own notifications"
ON public.evaluation_notifications
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND user_id = auth.uid());

CREATE POLICY "HR_ADMIN can manage notifications in their tenant"
ON public.evaluation_notifications
FOR ALL
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

-- Create function to generate anonymous alias for responses
CREATE OR REPLACE FUNCTION public.generate_evaluation_alias(campaign_uuid UUID, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alias_code TEXT;
  tenant_uuid UUID;
BEGIN
  -- Get tenant
  SELECT tenant_id INTO tenant_uuid FROM public.profiles WHERE id = user_uuid;
  
  -- Generate unique anonymous alias
  alias_code := 'EVAL-' || UPPER(substring(md5(campaign_uuid::text || user_uuid::text || random()::text) from 1 for 6));
  
  RETURN alias_code;
END;
$$;

-- Create function to calculate evaluation scores
CREATE OR REPLACE FUNCTION public.calculate_evaluation_scores(campaign_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_record RECORD;
  instrument_record RECORD;
  tenant_uuid UUID;
BEGIN
  -- Get tenant from campaign
  SELECT tenant_id INTO tenant_uuid FROM public.evaluation_campaigns WHERE id = campaign_uuid;
  
  -- Process completed responses
  FOR response_record IN 
    SELECT * FROM public.evaluation_responses 
    WHERE campaign_id = campaign_uuid AND completion_status = 'completed'
  LOOP
    -- Process each instrument in the response
    -- This would contain the scientific scoring logic for each instrument
    -- For now, we'll insert sample analytics data
    
    INSERT INTO public.evaluation_analytics (
      tenant_id, campaign_id, instrument_id, metric_key, score, sample_size
    ) VALUES (
      tenant_uuid, campaign_uuid, 'sample_instrument', 'sample_score', 
      (random() * 100), 1
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_evaluation_campaigns_updated_at
BEFORE UPDATE ON public.evaluation_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluation_responses_updated_at
BEFORE UPDATE ON public.evaluation_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();