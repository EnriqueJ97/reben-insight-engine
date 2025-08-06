-- Insertar plantillas de turnos de ejemplo
INSERT INTO public.shift_templates (
  id, tenant_id, name, start_time, end_time, is_active
) VALUES 
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Turno Mañana', '08:00:00', '16:00:00', true),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Turno Tarde', '14:00:00', '22:00:00', true),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Turno Noche', '22:00:00', '06:00:00', true),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Horario Flexible', '09:00:00', '17:00:00', true);

-- Insertar algunos turnos asignados de ejemplo para el empleado
WITH shift_templates_data AS (
  SELECT id, name FROM public.shift_templates WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479' LIMIT 2
)
INSERT INTO public.rotas (
  id, day, employee_id, shift_template_id, status
)
SELECT 
  gen_random_uuid(),
  (CURRENT_DATE + INTERVAL '1 day' * generate_series(0, 6))::date,
  '077afb5f-5517-49ab-a5a2-5b78461b9e27',
  (SELECT id FROM shift_templates_data ORDER BY random() LIMIT 1),
  CASE 
    WHEN random() < 0.7 THEN 'AUTO'
    WHEN random() < 0.9 THEN 'MANUAL'
    ELSE 'SWAP_REQ'
  END
FROM generate_series(0, 6);

-- Insertar políticas de flexibilidad
INSERT INTO public.flex_policies (
  id, name, tenant_id, allowed_modes, min_on_site_days, core_hours, is_active
) VALUES 
  (gen_random_uuid(), 'Política Estándar de Flexibilidad', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
   '["REMOTE", "OFFICE", "HYBRID"]', 2, 
   '{"start": "10:00", "end": "15:00"}', true);

-- Insertar algunas solicitudes de flexibilidad de ejemplo
INSERT INTO public.flex_requests (
  id, employee_id, date, requested_mode, requested_hours, reason, status
) VALUES 
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE + INTERVAL '1 day', 'REMOTE', 
   '{"start": "09:00", "end": "17:00"}', 'Cita médica familiar', 'PENDING'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE + INTERVAL '3 days', 'HYBRID', 
   '{"start": "10:00", "end": "18:00"}', 'Mejor concentración en casa por la mañana', 'APPROVED'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '2 days', 'REMOTE', 
   '{"start": "08:30", "end": "16:30"}', 'Trabajo desde casa por proyecto especial', 'REJECTED');

-- Insertar algunas preferencias de turnos
WITH shift_templates_data AS (
  SELECT id FROM public.shift_templates WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
)
INSERT INTO public.employee_shift_prefs (
  id, employee_id, weekday, shift_template_id, weight
)
SELECT 
  gen_random_uuid(),
  '077afb5f-5517-49ab-a5a2-5b78461b9e27',
  weekday,
  shift_id,
  CASE 
    WHEN weekday IN (0, 1, 2, 3, 4) THEN floor(random() * 4) + 2  -- Lunes a viernes: preferencia 2-5
    ELSE floor(random() * 3)  -- Fin de semana: preferencia 0-2
  END
FROM 
  generate_series(0, 6) AS weekday,
  (SELECT id AS shift_id FROM shift_templates_data) AS shifts;

-- Insertar historial de trabajo flexible
INSERT INTO public.work_mode_logs (
  id, employee_id, date, actual_mode, check_in_time, check_out_time, location
) VALUES 
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '1 day', 'OFFICE', 
   (CURRENT_DATE - INTERVAL '1 day' + TIME '09:15:00')::timestamp, 
   (CURRENT_DATE - INTERVAL '1 day' + TIME '17:30:00')::timestamp, 
   'Oficina Central - Vancouver'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '2 days', 'REMOTE', 
   (CURRENT_DATE - INTERVAL '2 days' + TIME '08:45:00')::timestamp, 
   (CURRENT_DATE - INTERVAL '2 days' + TIME '16:45:00')::timestamp, 
   'Casa - Vancouver'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '3 days', 'HYBRID', 
   (CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00')::timestamp, 
   (CURRENT_DATE - INTERVAL '3 days' + TIME '18:00:00')::timestamp, 
   'Oficina Central - Vancouver'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '4 days', 'OFFICE', 
   (CURRENT_DATE - INTERVAL '4 days' + TIME '09:00:00')::timestamp, 
   (CURRENT_DATE - INTERVAL '4 days' + TIME '17:15:00')::timestamp, 
   'Oficina Central - Vancouver'),
  (gen_random_uuid(), '077afb5f-5517-49ab-a5a2-5b78461b9e27', 
   CURRENT_DATE - INTERVAL '5 days', 'REMOTE', 
   (CURRENT_DATE - INTERVAL '5 days' + TIME '08:30:00')::timestamp, 
   (CURRENT_DATE - INTERVAL '5 days' + TIME '16:30:00')::timestamp, 
   'Casa - Vancouver');