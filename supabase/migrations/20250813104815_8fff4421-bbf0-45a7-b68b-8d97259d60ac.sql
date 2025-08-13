-- H1 Migration: People Data Ingestion & KPI Tables
-- 1) Types (optional enums kept as text with CHECKs for flexibility)

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.hr_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('hire','termination','leave','transfer')),
  event_date date NOT NULL,
  reason text,
  fte numeric,
  source text,
  row_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hr_events_tenant_date ON public.hr_events(tenant_id, event_date);
CREATE INDEX IF NOT EXISTS idx_hr_events_team_date ON public.hr_events(tenant_id, team_id, event_date);

-- Natural idempotency guard (in addition to row_hash)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='hr_events' AND indexname='ui_hr_events_natural'
  ) THEN
    CREATE UNIQUE INDEX ui_hr_events_natural ON public.hr_events(tenant_id, user_id, event_type, event_date);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present','absent','sick','vacation','remote')),
  hours_worked numeric,
  overtime_hours numeric,
  justification text,
  source text,
  row_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON public.attendance(tenant_id, date);
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='attendance' AND indexname='ui_attendance_natural'
  ) THEN
    CREATE UNIQUE INDEX ui_attendance_natural ON public.attendance(tenant_id, user_id, date);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.productivity_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date date NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('tasks_done','story_points','hours_billable','revenue','tickets_closed','calls','units')),
  value numeric NOT NULL,
  unit text,
  source text,
  row_hash text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prod_metrics_tenant_date ON public.productivity_metrics(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_prod_metrics_metric ON public.productivity_metrics(tenant_id, metric_type, date);
-- Unique constraints for user-level and team-level rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='productivity_metrics' AND indexname='ui_prod_user_natural'
  ) THEN
    CREATE UNIQUE INDEX ui_prod_user_natural ON public.productivity_metrics(tenant_id, date, metric_type, user_id) WHERE user_id IS NOT NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='productivity_metrics' AND indexname='ui_prod_team_natural'
  ) THEN
    CREATE UNIQUE INDEX ui_prod_team_natural ON public.productivity_metrics(tenant_id, date, metric_type, team_id) WHERE user_id IS NULL AND team_id IS NOT NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.headcount_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date_month date NOT NULL,
  headcount integer NOT NULL,
  voluntary_terminations integer NOT NULL DEFAULT 0,
  involuntary_terminations integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, date_month)
);

CREATE INDEX IF NOT EXISTS idx_headcount_tenant_month ON public.headcount_snapshots(tenant_id, date_month);

CREATE TABLE IF NOT EXISTS public.cost_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  role_level text,
  avg_salary_month numeric,
  replacement_cost_factor numeric DEFAULT 1.0,
  absenteeism_cost_per_hour numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_baselines_tenant ON public.cost_baselines(tenant_id);

-- Tokens table for webhook ingestion
CREATE TABLE IF NOT EXISTS public.tenant_api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text,
  token_hash text NOT NULL UNIQUE,
  last4 text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tokens_tenant ON public.tenant_api_tokens(tenant_id);

-- 3) RLS
ALTER TABLE public.hr_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headcount_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_api_tokens ENABLE ROW LEVEL SECURITY;

-- Policies: tenant visibility + roles
DO $$
BEGIN
  -- hr_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hr_events' AND policyname='Users view own hr events') THEN
    CREATE POLICY "Users view own hr events" ON public.hr_events FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hr_events' AND policyname='Managers view team hr events') THEN
    CREATE POLICY "Managers view team hr events" ON public.hr_events FOR SELECT USING (
      user_id IN (
        SELECT p.id FROM public.profiles p
        JOIN public.teams t ON p.team_id = t.id
        WHERE t.manager_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hr_events' AND policyname='HR view tenant hr events') THEN
    CREATE POLICY "HR view tenant hr events" ON public.hr_events FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;

  -- attendance
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendance' AND policyname='Users view own attendance') THEN
    CREATE POLICY "Users view own attendance" ON public.attendance FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendance' AND policyname='Managers view team attendance') THEN
    CREATE POLICY "Managers view team attendance" ON public.attendance FOR SELECT USING (
      user_id IN (
        SELECT p.id FROM public.profiles p
        JOIN public.teams t ON p.team_id = t.id
        WHERE t.manager_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='attendance' AND policyname='HR view tenant attendance') THEN
    CREATE POLICY "HR view tenant attendance" ON public.attendance FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;

  -- productivity_metrics
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='productivity_metrics' AND policyname='Users view own productivity metrics') THEN
    CREATE POLICY "Users view own productivity metrics" ON public.productivity_metrics FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='productivity_metrics' AND policyname='Managers view team productivity metrics') THEN
    CREATE POLICY "Managers view team productivity metrics" ON public.productivity_metrics FOR SELECT USING (
      (user_id IN (
        SELECT p.id FROM public.profiles p
        JOIN public.teams t ON p.team_id = t.id
        WHERE t.manager_id = auth.uid()
      ))
      OR
      (user_id IS NULL AND team_id IN (
        SELECT t.id FROM public.teams t WHERE t.manager_id = auth.uid()
      ))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='productivity_metrics' AND policyname='HR view tenant productivity metrics') THEN
    CREATE POLICY "HR view tenant productivity metrics" ON public.productivity_metrics FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;

  -- headcount_snapshots
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='headcount_snapshots' AND policyname='Users view tenant headcount snapshots') THEN
    CREATE POLICY "Users view tenant headcount snapshots" ON public.headcount_snapshots FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id()
    );
  END IF;

  -- cost_baselines
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cost_baselines' AND policyname='Users view tenant cost baselines') THEN
    CREATE POLICY "Users view tenant cost baselines" ON public.cost_baselines FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id()
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cost_baselines' AND policyname='HR manage cost baselines') THEN
    CREATE POLICY "HR manage cost baselines" ON public.cost_baselines FOR ALL USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    ) WITH CHECK (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;

  -- tenant_api_tokens (do not expose token_hash content to regular users)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenant_api_tokens' AND policyname='HR manage tokens') THEN
    CREATE POLICY "HR manage tokens" ON public.tenant_api_tokens FOR ALL USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    ) WITH CHECK (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenant_api_tokens' AND policyname='Hide token hash on select for non-admins') THEN
    -- Restrict SELECT to admins only (non-admins shouldn't see tokens at all)
    CREATE POLICY "Hide token hash on select for non-admins" ON public.tenant_api_tokens FOR SELECT USING (
      tenant_id = public.get_current_user_tenant_id() AND public.get_current_user_role() IN ('HR_ADMIN','COMPLIANCE_OFFICER')
    );
  END IF;
END $$;

-- 4) updated_at triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_hr_events_updated_at') THEN
    CREATE TRIGGER trg_hr_events_updated_at BEFORE UPDATE ON public.hr_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_attendance_updated_at') THEN
    CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_prod_metrics_updated_at') THEN
    CREATE TRIGGER trg_prod_metrics_updated_at BEFORE UPDATE ON public.productivity_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_headcount_snapshots_updated_at') THEN
    CREATE TRIGGER trg_headcount_snapshots_updated_at BEFORE UPDATE ON public.headcount_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_cost_baselines_updated_at') THEN
    CREATE TRIGGER trg_cost_baselines_updated_at BEFORE UPDATE ON public.cost_baselines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Done