-- Obtener el tenant_id del primer tenant para las plantillas por defecto
WITH default_tenant AS (
  SELECT id FROM tenants LIMIT 1
)
INSERT INTO shift_templates (tenant_id, name, start_time, end_time, min_staff, skill_tags, is_active) 
SELECT 
  dt.id,
  template_name,
  start_time::time,
  end_time::time,
  1 as min_staff,
  '{}' as skill_tags,
  true as is_active
FROM default_tenant dt,
(VALUES 
  ('Mañana', '08:00:00', '16:00:00'),
  ('Tarde', '16:00:00', '00:00:00'),
  ('Noche', '00:00:00', '08:00:00'),
  ('Medio Día', '12:00:00', '20:00:00'),
  ('Flexible', '09:00:00', '17:00:00')
) AS templates(template_name, start_time, end_time);