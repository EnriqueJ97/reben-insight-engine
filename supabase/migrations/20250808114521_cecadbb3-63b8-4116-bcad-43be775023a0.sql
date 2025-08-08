-- Re-run creation of alert_actions table, RLS policies, and trigger safely

-- 1) Ensure alert_actions table exists
CREATE TABLE IF NOT EXISTS public.alert_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  note text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_actions ENABLE ROW LEVEL SECURITY;

-- 2) Policies (create if missing)
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

-- 3) Trigger function and trigger
CREATE OR REPLACE FUNCTION public.update_alert_last_action()
RETURNS trigger AS $$
BEGIN
  UPDATE public.alerts SET last_action_at = now() WHERE id = NEW.alert_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_alert_actions_last_action ON public.alert_actions;
CREATE TRIGGER trg_alert_actions_last_action
AFTER INSERT ON public.alert_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_alert_last_action();