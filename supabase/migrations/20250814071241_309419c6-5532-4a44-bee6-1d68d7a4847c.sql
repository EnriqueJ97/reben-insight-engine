-- Insert 5 pre-loaded flex policy templates
INSERT INTO public.flex_policies (id, tenant_id, name, min_on_site_days, core_hours, allowed_modes, is_active) VALUES
(gen_random_uuid(), (SELECT id FROM public.tenants LIMIT 1), 'Política Estándar', 3, '{"start": "09:00", "end": "17:00"}', ARRAY['OFFICE', 'REMOTE', 'HYBRID'], true),
(gen_random_uuid(), (SELECT id FROM public.tenants LIMIT 1), 'Flexibilidad Total', 0, '{"start": "10:00", "end": "15:00"}', ARRAY['OFFICE', 'REMOTE', 'HYBRID'], false),
(gen_random_uuid(), (SELECT id FROM public.tenants LIMIT 1), 'Presencial Preferente', 4, '{"start": "08:30", "end": "17:30"}', ARRAY['OFFICE', 'HYBRID'], false),
(gen_random_uuid(), (SELECT id FROM public.tenants LIMIT 1), 'Remoto Primero', 1, '{"start": "10:00", "end": "14:00"}', ARRAY['REMOTE', 'HYBRID'], false),
(gen_random_uuid(), (SELECT id FROM public.tenants LIMIT 1), 'Horario Reducido', 2, '{"start": "11:00", "end": "15:00"}', ARRAY['OFFICE', 'REMOTE', 'HYBRID'], false);