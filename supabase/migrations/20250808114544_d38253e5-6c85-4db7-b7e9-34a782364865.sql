-- Ensure alerts columns exist (idempotent)
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS sla_due_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS last_action_at timestamptz NOT NULL DEFAULT now();

-- Replace trigger function with fixed search_path
CREATE OR REPLACE FUNCTION public.update_alert_last_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.alerts SET last_action_at = now() WHERE id = NEW.alert_id;
  RETURN NEW;
END;
$$;