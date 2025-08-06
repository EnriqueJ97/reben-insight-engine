-- Insertar políticas de flexibilidad por defecto para cada tenant
INSERT INTO flex_policies (tenant_id, name, min_on_site_days, core_hours, allowed_modes, is_active)
SELECT 
  t.id as tenant_id,
  'Política de Trabajo Flexible Estándar' as name,
  3 as min_on_site_days,
  '{"start": "09:00", "end": "17:00"}'::jsonb as core_hours,
  ARRAY['OFFICE', 'REMOTE', 'HYBRID'] as allowed_modes,
  true as is_active
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM flex_policies fp WHERE fp.tenant_id = t.id
);