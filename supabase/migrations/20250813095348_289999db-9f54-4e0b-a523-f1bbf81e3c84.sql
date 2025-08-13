-- Create adaptive survey profiles table with cadence and risk profile
-- This migration is idempotent and avoids IF NOT EXISTS on policies by checking pg_policies

-- 1) Table
CREATE TABLE IF NOT EXISTS public.adaptive_survey_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  -- Frequency options: daily, twice_week, weekly, biweekly, monthly
  frequency TEXT NOT NULL DEFAULT 'weekly',
  categories_priority JSONB NOT NULL DEFAULT '{}'::jsonb,
  cooldown_days INT NOT NULL DEFAULT 0,
  next_due_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  -- Profile features
  role_snapshot TEXT,
  tenure_months INT,
  risk_level TEXT CHECK (risk_level IN ('low','medium','high')),
  last_risk_score NUMERIC,
  last_checkin_score NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_adaptive_profiles_tenant ON public.adaptive_survey_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_profiles_user ON public.adaptive_survey_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_profiles_team ON public.adaptive_survey_profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_profiles_next_due ON public.adaptive_survey_profiles(next_due_at);
CREATE INDEX IF NOT EXISTS idx_adaptive_profiles_risk ON public.adaptive_survey_profiles(risk_level);

-- 3) RLS
ALTER TABLE public.adaptive_survey_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adaptive_survey_profiles' AND policyname = 'Users can manage their own adaptive profile'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can manage their own adaptive profile"
      ON public.adaptive_survey_profiles
      FOR ALL
      USING (user_id = auth.uid() AND tenant_id = public.get_current_user_tenant_id())
      WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_current_user_tenant_id());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adaptive_survey_profiles' AND policyname = 'HR and Compliance can manage adaptive profiles in tenant'
  ) THEN
    EXECUTE $$
      CREATE POLICY "HR and Compliance can manage adaptive profiles in tenant"
      ON public.adaptive_survey_profiles
      FOR ALL
      USING (
        tenant_id = public.get_current_user_tenant_id()
        AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
      )
      WITH CHECK (
        tenant_id = public.get_current_user_tenant_id()
        AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
      );
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'adaptive_survey_profiles' AND policyname = 'Managers can view team adaptive profiles'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Managers can view team adaptive profiles"
      ON public.adaptive_survey_profiles
      FOR SELECT
      USING (
        user_id IN (
          SELECT p.id
          FROM public.profiles p
          JOIN public.teams t ON p.team_id = t.id
          WHERE t.manager_id = auth.uid()
        )
      );
    $$;
  END IF;
END $$;

-- 4) updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_adaptive_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_adaptive_profiles_updated_at
    BEFORE UPDATE ON public.adaptive_survey_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
