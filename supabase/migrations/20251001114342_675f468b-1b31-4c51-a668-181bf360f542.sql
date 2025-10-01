-- Eliminar función anterior
DROP FUNCTION IF EXISTS public.is_founder_email(TEXT);

-- Recrear con el tipo correcto que usa auth.users
CREATE OR REPLACE FUNCTION public.is_founder_email(user_email TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN user_email = 'info.emotiontrack@gmail.com';
END;
$$;

-- Recrear trigger con manejo de errores mejorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  default_tenant_id UUID;
  is_founder BOOLEAN;
BEGIN
  -- Verificar si es email de founder
  is_founder := is_founder_email(NEW.email::TEXT);
  
  IF is_founder THEN
    -- Crear perfil de SUPER_ADMIN sin tenant
    INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
    VALUES (
      NEW.id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
      'SUPER_ADMIN'
    );
  ELSE
    -- Obtener o crear tenant por defecto
    SELECT id INTO default_tenant_id 
    FROM public.tenants 
    WHERE id != '00000000-0000-0000-0000-000000000000'::uuid
    LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
      -- Crear tenant demo si no existe ninguno
      INSERT INTO public.tenants (name, status, subscription_plan, description)
      VALUES ('Empresa Demo', 'active', 'basic', 'Tenant creado automáticamente')
      RETURNING id INTO default_tenant_id;
    END IF;
    
    -- Crear perfil normal
    INSERT INTO public.profiles (id, tenant_id, email, full_name, role, team_id)
    VALUES (
      NEW.id,
      default_tenant_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'EMPLOYEE'),
      CASE 
        WHEN NEW.raw_user_meta_data->>'team_id' IS NOT NULL 
        THEN (NEW.raw_user_meta_data->>'team_id')::uuid 
        ELSE NULL 
      END
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RAISE;
END;
$function$;