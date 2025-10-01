-- LIMPIEZA COMPLETA DE DATOS DEMO - Versión simplificada

-- 1. Actualizar referencias a usuarios demo en alerts
UPDATE alerts SET resolved_by = NULL 
WHERE resolved_by IN (
  SELECT id FROM profiles 
  WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
);

-- 2. Eliminar alert_actions de usuarios demo
DELETE FROM alert_actions 
WHERE alert_id IN (
  SELECT id FROM alerts 
  WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
  )
);

-- 3. Eliminar alerts de usuarios demo
DELETE FROM alerts 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
);

-- 4. Eliminar evaluaciones de usuarios demo
DELETE FROM evaluation_responses 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
);

DELETE FROM evaluation_campaigns 
WHERE created_by IN (
  SELECT id FROM profiles 
  WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
);

-- 5. Actualizar manager_id en teams antes de eliminar
UPDATE teams SET manager_id = NULL 
WHERE manager_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com')
);

-- 6. Actualizar team_id en profiles antes de eliminar teams
UPDATE profiles SET team_id = NULL 
WHERE team_id IN (
  SELECT id FROM teams 
  WHERE name LIKE '%Demo%' 
  OR name LIKE '%Ventas%' 
  OR name LIKE '%Desarrollo%'
  OR name = 'Vancouver Tech Solutions'
);

-- 7. Eliminar equipos demo
DELETE FROM teams 
WHERE name LIKE '%Demo%' 
OR name LIKE '%Ventas%' 
OR name LIKE '%Desarrollo%'
OR name = 'Vancouver Tech Solutions';

-- 8. Eliminar usuarios demo
DELETE FROM profiles 
WHERE email IN ('empleado@demo.com', 'manager@demo.com', 'admin@demo.com');

-- 9. Resetear el tenant del usuario para que pase por onboarding
UPDATE tenants 
SET onboarding_completed = false,
    name = 'Mi Empresa'
WHERE id = '5a271d19-01e5-45a5-93ab-e8eb83b52073';