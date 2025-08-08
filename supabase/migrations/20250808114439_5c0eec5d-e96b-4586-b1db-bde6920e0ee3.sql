-- Fix trigger creation without querying pg_triggers
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