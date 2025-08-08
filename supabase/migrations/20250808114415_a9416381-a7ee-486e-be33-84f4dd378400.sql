-- Sprint 1: Alert tickets with assignment, SLA and action log
-- 1) Extend alerts table
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS last_action_at timestamptz NOT NULL DEFAULT now();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON public.alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_sla_due_at ON public.alerts(sla_due_at);

-- 2) Create alert_actions table for notes and audit trail
CREATE TABLE IF NOT EXISTS public.alert_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type text NOT NULL, -- note | status_change | assign | sla_update | resolve
  note text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_actions ENABLE ROW LEVEL SECURITY;

-- RLS: Employees can view actions for their own alerts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_actions' AND policyname = 'Users can view actions for their own alerts'
  ) THEN
    CREATE POLICY "Users can view actions for their own alerts"
    ON public.alert_actions
    FOR SELECT
    USING (
      alert_id IN (
        SELECT a.id FROM public.alerts a
        WHERE a.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- RLS: Managers can view actions for their team alerts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_actions' AND policyname = 'Managers can view actions for their team'
  ) THEN
    CREATE POLICY "Managers can view actions for their team"
    ON public.alert_actions
    FOR SELECT
    USING (
      alert_id IN (
        SELECT a.id
        FROM public.alerts a
        JOIN profiles p ON a.user_id = p.id
        JOIN teams t ON p.team_id = t.id
        WHERE t.manager_id = auth.uid()
      )
    );
  END IF;
END $$;

-- RLS: HR Admin can view all actions in their tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_actions' AND policyname = 'HR_ADMIN can view actions in their tenant'
  ) THEN
    CREATE POLICY "HR_ADMIN can view actions in their tenant"
    ON public.alert_actions
    FOR SELECT
    USING (
      alert_id IN (
        SELECT a.id
        FROM public.alerts a
        JOIN profiles p ON a.user_id = p.id
        WHERE p.tenant_id IN (
          SELECT profiles.tenant_id FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'HR_ADMIN'
        )
      )
    );
  END IF;
END $$;

-- RLS: Managers and HR Admin can insert actions for alerts in their tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_actions' AND policyname = 'Managers and HR_ADMIN can insert actions'
  ) THEN
    CREATE POLICY "Managers and HR_ADMIN can insert actions"
    ON public.alert_actions
    FOR INSERT
    WITH CHECK (
      alert_id IN (
        SELECT a.id
        FROM public.alerts a
        JOIN profiles p ON a.user_id = p.id
        WHERE p.tenant_id IN (
          SELECT pr.tenant_id FROM profiles pr
          WHERE pr.id = auth.uid() AND pr.role IN ('MANAGER', 'HR_ADMIN')
        )
      )
    );
  END IF;
END $$;

-- Trigger to keep alerts.last_action_at fresh when an action is added
CREATE OR REPLACE FUNCTION public.update_alert_last_action()
RETURNS trigger AS $$
BEGIN
  UPDATE public.alerts SET last_action_at = now() WHERE id = NEW.alert_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_triggers WHERE tgname = 'trg_alert_actions_last_action'
  ) THEN
    CREATE TRIGGER trg_alert_actions_last_action
    AFTER INSERT ON public.alert_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_alert_last_action();
  END IF;
END $$;