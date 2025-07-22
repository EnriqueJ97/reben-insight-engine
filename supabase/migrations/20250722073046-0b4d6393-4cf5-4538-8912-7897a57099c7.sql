-- Update the handle_new_user function to support team assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- For now, we'll create a default tenant if none exists
  -- In production, this would be handled differently during company signup
  INSERT INTO public.profiles (id, tenant_id, email, full_name, role, team_id)
  VALUES (
    NEW.id,
    (SELECT id FROM public.tenants LIMIT 1), -- Temporary: use first tenant
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'EMPLOYEE'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'team_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'team_id')::uuid 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$function$;