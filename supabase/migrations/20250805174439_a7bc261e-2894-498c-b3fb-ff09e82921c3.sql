-- Create Vancouver organization with complete demo data

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

-- 3. Update existing manager to be part of Vancouver organization
UPDATE public.profiles 
SET 
  tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  team_id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  role = 'MANAGER'
WHERE email = 'javiergarciatort@gmail.com';

-- 4. Update the team to have this manager
UPDATE public.teams 
SET manager_id = (SELECT id FROM public.profiles WHERE email = 'javiergarciatort@gmail.com')
WHERE id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

-- 5. Create 50 employees for Vancouver
INSERT INTO public.profiles (id, tenant_id, team_id, email, full_name, role, created_at, updated_at)
VALUES 
  -- Senior Developers
  ('11111111-1111-1111-1111-111111111111', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'ana.rodriguez@vancouver.tech', 'Ana Rodríguez', 'EMPLOYEE', now() - interval '6 months', now()),
  ('11111111-1111-1111-1111-111111111112', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'carlos.martinez@vancouver.tech', 'Carlos Martínez', 'EMPLOYEE', now() - interval '5 months', now()),
  ('11111111-1111-1111-1111-111111111113', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'sofia.lopez@vancouver.tech', 'Sofía López', 'EMPLOYEE', now() - interval '4 months', now()),
  ('11111111-1111-1111-1111-111111111114', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'diego.hernandez@vancouver.tech', 'Diego Hernández', 'EMPLOYEE', now() - interval '7 months', now()),
  ('11111111-1111-1111-1111-111111111115', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'lucia.garcia@vancouver.tech', 'Lucía García', 'EMPLOYEE', now() - interval '3 months', now()),
  
  -- Mid-level Developers
  ('11111111-1111-1111-1111-111111111116', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'miguel.torres@vancouver.tech', 'Miguel Torres', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111117', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'elena.vargas@vancouver.tech', 'Elena Vargas', 'EMPLOYEE', now() - interval '8 months', now()),
  ('11111111-1111-1111-1111-111111111118', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'fernando.ruiz@vancouver.tech', 'Fernando Ruiz', 'EMPLOYEE', now() - interval '1 month', now()),
  ('11111111-1111-1111-1111-111111111119', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'patricia.morales@vancouver.tech', 'Patricia Morales', 'EMPLOYEE', now() - interval '9 months', now()),
  ('11111111-1111-1111-1111-111111111120', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'ricardo.jimenez@vancouver.tech', 'Ricardo Jiménez', 'EMPLOYEE', now() - interval '4 months', now()),
  
  -- Junior Developers
  ('11111111-1111-1111-1111-111111111121', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'claudia.castro@vancouver.tech', 'Claudia Castro', 'EMPLOYEE', now() - interval '2 weeks', now()),
  ('11111111-1111-1111-1111-111111111122', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'andres.mendoza@vancouver.tech', 'Andrés Mendoza', 'EMPLOYEE', now() - interval '3 weeks', now()),
  ('11111111-1111-1111-1111-111111111123', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'natalia.romero@vancouver.tech', 'Natalia Romero', 'EMPLOYEE', now() - interval '1 month', now()),
  ('11111111-1111-1111-1111-111111111124', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'jaime.aguilar@vancouver.tech', 'Jaime Aguilar', 'EMPLOYEE', now() - interval '5 weeks', now()),
  ('11111111-1111-1111-1111-111111111125', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'valeria.gutierrez@vancouver.tech', 'Valeria Gutiérrez', 'EMPLOYEE', now() - interval '6 weeks', now()),
  
  -- QA Team
  ('11111111-1111-1111-1111-111111111126', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'roberto.silva@vancouver.tech', 'Roberto Silva', 'EMPLOYEE', now() - interval '3 months', now()),
  ('11111111-1111-1111-1111-111111111127', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'monica.perez@vancouver.tech', 'Mónica Pérez', 'EMPLOYEE', now() - interval '4 months', now()),
  ('11111111-1111-1111-1111-111111111128', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'sebastian.vega@vancouver.tech', 'Sebastián Vega', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111129', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'alejandra.ramos@vancouver.tech', 'Alejandra Ramos', 'EMPLOYEE', now() - interval '7 months', now()),
  ('11111111-1111-1111-1111-111111111130', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'oscar.delgado@vancouver.tech', 'Óscar Delgado', 'EMPLOYEE', now() - interval '5 months', now()),
  
  -- UX/UI Team
  ('11111111-1111-1111-1111-111111111131', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'daniela.ortiz@vancouver.tech', 'Daniela Ortiz', 'EMPLOYEE', now() - interval '6 months', now()),
  ('11111111-1111-1111-1111-111111111132', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'adrian.flores@vancouver.tech', 'Adrián Flores', 'EMPLOYEE', now() - interval '3 months', now()),
  ('11111111-1111-1111-1111-111111111133', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'isabella.cruz@vancouver.tech', 'Isabella Cruz', 'EMPLOYEE', now() - interval '4 months', now()),
  ('11111111-1111-1111-1111-111111111134', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'gabriel.reyes@vancouver.tech', 'Gabriel Reyes', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111135', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'carolina.santos@vancouver.tech', 'Carolina Santos', 'EMPLOYEE', now() - interval '8 months', now()),
  
  -- DevOps Team
  ('11111111-1111-1111-1111-111111111136', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'emilio.navarro@vancouver.tech', 'Emilio Navarro', 'EMPLOYEE', now() - interval '5 months', now()),
  ('11111111-1111-1111-1111-111111111137', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'camila.herrera@vancouver.tech', 'Camila Herrera', 'EMPLOYEE', now() - interval '7 months', now()),
  ('11111111-1111-1111-1111-111111111138', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'nicolas.medina@vancouver.tech', 'Nicolás Medina', 'EMPLOYEE', now() - interval '3 months', now()),
  ('11111111-1111-1111-1111-111111111139', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'lorena.campos@vancouver.tech', 'Lorena Campos', 'EMPLOYEE', now() - interval '6 months', now()),
  ('11111111-1111-1111-1111-111111111140', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'raul.guerrero@vancouver.tech', 'Raúl Guerrero', 'EMPLOYEE', now() - interval '4 months', now()),
  
  -- More Developers
  ('11111111-1111-1111-1111-111111111141', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'paola.molina@vancouver.tech', 'Paola Molina', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111142', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'mario.valdez@vancouver.tech', 'Mario Valdez', 'EMPLOYEE', now() - interval '9 months', now()),
  ('11111111-1111-1111-1111-111111111143', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'sara.pacheco@vancouver.tech', 'Sara Pacheco', 'EMPLOYEE', now() - interval '1 month', now()),
  ('11111111-1111-1111-1111-111111111144', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'hugo.contreras@vancouver.tech', 'Hugo Contreras', 'EMPLOYEE', now() - interval '8 months', now()),
  ('11111111-1111-1111-1111-111111111145', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'viviana.leon@vancouver.tech', 'Viviana León', 'EMPLOYEE', now() - interval '3 months', now()),
  ('11111111-1111-1111-1111-111111111146', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'rodrigo.pena@vancouver.tech', 'Rodrigo Peña', 'EMPLOYEE', now() - interval '6 months', now()),
  ('11111111-1111-1111-1111-111111111147', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'beatriz.rojas@vancouver.tech', 'Beatriz Rojas', 'EMPLOYEE', now() - interval '4 months', now()),
  ('11111111-1111-1111-1111-111111111148', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'marcos.ibarra@vancouver.tech', 'Marcos Ibarra', 'EMPLOYEE', now() - interval '7 months', now()),
  ('11111111-1111-1111-1111-111111111149', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'alicia.cabrera@vancouver.tech', 'Alicia Cabrera', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111150', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'leonardo.cordova@vancouver.tech', 'Leonardo Córdova', 'EMPLOYEE', now() - interval '5 months', now()),
  ('11111111-1111-1111-1111-111111111151', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'veronica.escobar@vancouver.tech', 'Verónica Escobar', 'EMPLOYEE', now() - interval '3 months', now()),
  ('11111111-1111-1111-1111-111111111152', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'esteban.lara@vancouver.tech', 'Esteban Lara', 'EMPLOYEE', now() - interval '6 months', now()),
  ('11111111-1111-1111-1111-111111111153', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'gloria.montoya@vancouver.tech', 'Gloria Montoya', 'EMPLOYEE', now() - interval '8 months', now()),
  ('11111111-1111-1111-1111-111111111154', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'joaquin.cervantes@vancouver.tech', 'Joaquín Cervantes', 'EMPLOYEE', now() - interval '1 month', now()),
  ('11111111-1111-1111-1111-111111111155', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'renata.villanueva@vancouver.tech', 'Renata Villanueva', 'EMPLOYEE', now() - interval '4 months', now()),
  ('11111111-1111-1111-1111-111111111156', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'cesar.espinoza@vancouver.tech', 'César Espinoza', 'EMPLOYEE', now() - interval '7 months', now()),
  ('11111111-1111-1111-1111-111111111157', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'diana.nunez@vancouver.tech', 'Diana Núñez', 'EMPLOYEE', now() - interval '2 months', now()),
  ('11111111-1111-1111-1111-111111111158', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'gustavo.sandoval@vancouver.tech', 'Gustavo Sandoval', 'EMPLOYEE', now() - interval '9 months', now()),
  ('11111111-1111-1111-1111-111111111159', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'mariana.acosta@vancouver.tech', 'Mariana Acosta', 'EMPLOYEE', now() - interval '5 months', now()),
  ('11111111-1111-1111-1111-111111111160', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'alberto.fuentes@vancouver.tech', 'Alberto Fuentes', 'EMPLOYEE', now() - interval '3 months', now());