-- Create Vancouver organization with existing users

-- 1. Create Vancouver tenant
INSERT INTO public.tenants (id, name, domain, status, settings, max_users, subscription_plan, subscription_status, onboarding_completed, industry, company_size, timezone, description)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Vancouver Tech Solutions',
  'vancouver.tech',
  'active',
  '{"email_enabled": true, "slack_enabled": false, "daily_checkin_time": "09:00", "weekly_reports": true}',
  100,
  'premium',
  'active',
  true,
  'technology',
  '51-200',
  'America/Vancouver',
  'Empresa de desarrollo de software especializada en soluciones empresariales'
);

-- 2. Create team for Vancouver
INSERT INTO public.teams (id, tenant_id, name, invite_code)
VALUES (
  'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Equipo de Desarrollo Vancouver',
  'VAN2024'
);

-- 3. Update existing users to be part of Vancouver organization
UPDATE public.profiles 
SET 
  tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  team_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
WHERE email IN ('javiergarciatort@gmail.com', 'empleado@demo.com', 'manager@demo.com', 'admin@demo.com');

-- 4. Set Javier as manager
UPDATE public.profiles 
SET role = 'MANAGER'
WHERE email = 'javiergarciatort@gmail.com';

-- 5. Update the team to have Javier as manager
UPDATE public.teams 
SET manager_id = (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com')
WHERE id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

-- 6. Create check-ins with realistic data patterns for the last 30 days
-- Employee check-ins (Ana Empleado)
INSERT INTO public.checkins (user_id, mood, response_value, question_id, created_at)
SELECT 
  (SELECT id FROM public.profiles WHERE email = 'empleado@demo.com'),
  CASE 
    WHEN random() < 0.1 THEN 1  -- 10% very low
    WHEN random() < 0.3 THEN 2  -- 20% low  
    WHEN random() < 0.6 THEN 3  -- 30% neutral
    WHEN random() < 0.85 THEN 4 -- 25% good
    ELSE 5  -- 15% excellent
  END,
  CASE 
    WHEN random() < 0.2 THEN 1  -- 20% struggling
    WHEN random() < 0.4 THEN 2  -- 20% some difficulty
    WHEN random() < 0.7 THEN 3  -- 30% neutral
    WHEN random() < 0.9 THEN 4  -- 20% good
    ELSE 5  -- 10% excellent
  END,
  'daily_wellbeing',
  current_date - INTERVAL '1 day' * generate_series(0, 29)
FROM generate_series(0, 29);

-- Manager check-ins (Carlos Manager)  
INSERT INTO public.checkins (user_id, mood, response_value, question_id, created_at)
SELECT 
  (SELECT id FROM public.profiles WHERE email = 'manager@demo.com'),
  CASE 
    WHEN random() < 0.05 THEN 1  -- 5% very low
    WHEN random() < 0.15 THEN 2  -- 10% low  
    WHEN random() < 0.4 THEN 3   -- 25% neutral
    WHEN random() < 0.75 THEN 4  -- 35% good
    ELSE 5  -- 25% excellent
  END,
  CASE 
    WHEN random() < 0.1 THEN 1   -- 10% struggling
    WHEN random() < 0.25 THEN 2  -- 15% some difficulty
    WHEN random() < 0.55 THEN 3  -- 30% neutral
    WHEN random() < 0.8 THEN 4   -- 25% good
    ELSE 5  -- 20% excellent
  END,
  'manager_stress',
  current_date - INTERVAL '1 day' * generate_series(0, 29)
FROM generate_series(0, 29);

-- Javier (new manager) check-ins - showing some stress from new role
INSERT INTO public.checkins (user_id, mood, response_value, question_id, created_at)
SELECT 
  (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com'),
  CASE 
    WHEN random() < 0.15 THEN 2  -- 15% low (adaptation stress)
    WHEN random() < 0.4 THEN 3   -- 25% neutral
    WHEN random() < 0.75 THEN 4  -- 35% good
    ELSE 5  -- 25% excellent
  END,
  CASE 
    WHEN random() < 0.2 THEN 2   -- 20% some difficulty (learning curve)
    WHEN random() < 0.45 THEN 3  -- 25% neutral
    WHEN random() < 0.75 THEN 4  -- 30% good
    ELSE 5  -- 25% excellent
  END,
  'leadership_transition',
  current_date - INTERVAL '1 day' * generate_series(0, 14)  -- 2 weeks as manager
FROM generate_series(0, 14);

-- 7. Create some alerts for the team
-- Low satisfaction alert for Ana
INSERT INTO public.alerts (user_id, type, severity, message, resolved, created_at)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'empleado@demo.com'),
  'low_satisfaction',
  'medium',
  'Empleado muestra patrones de baja satisfacción en los últimos 5 días',
  false,
  now() - interval '2 days'
);

-- High workload alert for Carlos  
INSERT INTO public.alerts (user_id, type, severity, message, resolved, created_at)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'manager@demo.com'),
  'high_workload',
  'high',
  'Manager reporta carga de trabajo muy alta consistentemente',
  false,
  now() - interval '1 day'
);

-- Adaptation stress for Javier
INSERT INTO public.alerts (user_id, type, severity, message, resolved, created_at)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com'),
  'role_transition',
  'medium',
  'Nuevo manager en período de adaptación - monitorear progreso',
  false,
  now() - interval '3 days'
);

-- Resolved alert example
INSERT INTO public.alerts (user_id, type, severity, message, resolved, resolved_by, resolved_at, created_at)
VALUES (
  (SELECT id FROM public.profiles WHERE email = 'empleado@demo.com'),
  'burnout_risk',
  'high',
  'Empleado mostraba signos de burnout - resuelto tras reunión 1:1',
  true,
  (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com'),
  now() - interval '1 day',
  now() - interval '5 days'
);

-- 8. Create some custom questions for Vancouver
INSERT INTO public.custom_questions (id, tenant_id, text, category, subcategory, scale_description, is_active, created_by)
VALUES 
  ('vancouver_remote_work', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '¿Qué tan efectivo te sientes trabajando de forma remota?', 'trabajo_remoto', 'productividad', '0=Muy inefectivo, 4=Muy efectivo', true, (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com')),
  ('vancouver_team_collab', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '¿Cómo calificarías la colaboración en tu equipo?', 'colaboracion', 'equipo', '0=Muy mala, 4=Excelente', true, (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com')),
  ('vancouver_tech_tools', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '¿Las herramientas tecnológicas facilitan tu trabajo diario?', 'herramientas', 'tecnologia', '0=Nada útiles, 4=Muy útiles', true, (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com'));