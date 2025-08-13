-- Crear plantillas de turnos para el tenant actual (Vancouver Tech Solutions)
INSERT INTO shift_templates (tenant_id, name, start_time, end_time, min_staff, skill_tags, is_active) 
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Mañana', '08:00:00', '16:00:00', 1, '{}', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Tarde', '16:00:00', '00:00:00', 1, '{}', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Noche', '00:00:00', '08:00:00', 1, '{}', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Medio Día', '12:00:00', '20:00:00', 1, '{}', true),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Flexible', '09:00:00', '17:00:00', 1, '{}', true);