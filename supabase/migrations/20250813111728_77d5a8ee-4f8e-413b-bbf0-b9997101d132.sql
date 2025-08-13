-- Insertar plantillas de turnos por defecto
INSERT INTO shift_templates (name, start_time, end_time, description, is_active) VALUES
('Mañana', '08:00:00', '16:00:00', 'Turno de mañana estándar', true),
('Tarde', '16:00:00', '00:00:00', 'Turno de tarde estándar', true),
('Noche', '00:00:00', '08:00:00', 'Turno de noche estándar', true),
('Medio Día', '12:00:00', '20:00:00', 'Turno de medio día', true),
('Flexible', '09:00:00', '17:00:00', 'Turno flexible oficina', true);