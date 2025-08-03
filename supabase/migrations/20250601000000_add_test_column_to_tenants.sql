-- Migración de prueba: agregar columna test_column a tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS test_column TEXT;