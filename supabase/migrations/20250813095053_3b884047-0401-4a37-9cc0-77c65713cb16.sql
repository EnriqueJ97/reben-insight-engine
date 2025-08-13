-- Adaptive survey settings for personalized cadence and content

-- 1) Table
CREATE TABLE IF NOT EXISTS public.adaptive_survey_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  -- Frequency candidates: daily, 2_per_week, weekly, biweekly, monthly
  frequency TEXT NOT NULL DEFAULT 'weekly',
  -- Category weighting, e.g. {"burnout": 0.6, "satisfaction": 0.3, "turnover": 0.1}
  categories_priority JSONB NOT NULL DEFAULT '{}'::jsonb,
  cooldown_days INT NOT NULL DEFAULT 0,
  next_due_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_adaptive_survey_settings_tenant ON public.adaptive_survey_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_survey_settings_user ON public.adaptive_survey_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_survey_settings_next_due ON public.adaptive_survey_settings(next_due_at);

-- 3) RLS
ALTER TABLE public.adaptive_survey_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own settings
CREATE POLICY IF NOT EXISTS "Users can manage their own adaptive settings"
ON public.adaptive_survey_settings
FOR ALL
USING (user_id = auth.uid() AND tenant_id = public.get_current_user_tenant_id())
WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_current_user_tenant_id());

-- HR and Compliance can manage tenant settings
CREATE POLICY IF NOT EXISTS "HR and Compliance can manage adaptive settings in tenant"
ON public.adaptive_survey_settings
FOR ALL
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN', 'COMPLIANCE_OFFICER')
)
WITH CHECK (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN', 'COMPLIANCE_OFFICER')
);

-- Managers can view team members' settings
CREATE POLICY IF NOT EXISTS "Managers can view team adaptive settings"
ON public.adaptive_survey_settings
FOR SELECT
USING (
  user_id IN (
    SELECT p.id
    FROM public.profiles p
    JOIN public.teams t ON p.team_id = t.id
    WHERE t.manager_id = auth.uid()
  )
);

-- 4) updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_adaptive_survey_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_adaptive_survey_settings_updated_at
    BEFORE UPDATE ON public.adaptive_survey_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;