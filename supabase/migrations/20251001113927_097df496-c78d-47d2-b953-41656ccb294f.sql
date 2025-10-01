-- Crear función para verificar si un email es founder
CREATE OR REPLACE FUNCTION public.is_founder_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email = 'info.emotiontrack@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar trigger para manejar SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  default_tenant_id UUID;
  is_founder BOOLEAN;
BEGIN
  -- Verificar si es email de founder
  is_founder := is_founder_email(NEW.email);
  
  IF is_founder THEN
    -- Crear perfil de SUPER_ADMIN sin tenant
    INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
    VALUES (
      NEW.id,
      '00000000-0000-0000-0000-000000000000'::uuid, -- Tenant especial para super admins
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Super Admin'),
      'SUPER_ADMIN'
    );
  ELSE
    -- Obtener o crear tenant por defecto
    SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
      -- Crear tenant demo si no existe ninguno
      INSERT INTO public.tenants (name, status, subscription_plan)
      VALUES ('Empresa Demo', 'active', 'basic')
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
END;
$function$;

-- Crear tenant especial para super admins si no existe
INSERT INTO public.tenants (id, name, status, subscription_plan, description)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'REBEN Platform',
  'active',
  'enterprise',
  'Tenant especial para Super Administradores'
)
ON CONFLICT (id) DO NOTHING;

-- Si info.emotiontrack@gmail.com ya existe, actualizarlo a SUPER_ADMIN
UPDATE public.profiles
SET 
  role = 'SUPER_ADMIN',
  tenant_id = '00000000-0000-0000-0000-000000000000'::uuid,
  full_name = 'Super Admin'
WHERE email = 'info.emotiontrack@gmail.com';