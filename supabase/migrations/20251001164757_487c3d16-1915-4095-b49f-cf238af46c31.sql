-- Insertar perfiles para las cuentas demo
-- Verificar si ya existen antes de insertar
INSERT INTO profiles (id, email, full_name, role, tenant_id, created_at, updated_at)
VALUES 
  (
    '077afb5f-5517-49ab-a5a2-5b78461b9e27',
    'empleado@demo.com',
    'Ana Empleado',
    'EMPLOYEE',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
  ),
  (
    '21492075-9c79-4bfd-9665-11612a41dbe2',
    'manager@demo.com',
    'Carlos Manager',
    'MANAGER',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
  ),
  (
    'bd558bd9-c936-4787-bd66-1fa1dd3328bf',
    'admin@demo.com',
    'María HR Admin',
    'HR_ADMIN',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;