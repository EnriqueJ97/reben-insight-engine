-- =====================================================
-- MIGRACIÓN COMPLETA PARA MVP EMPRESARIAL
-- =====================================================
-- Ejecutar este script en Supabase Dashboard > SQL Editor
-- =====================================================

-- Add MVP features for enterprise testing

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR_ADMIN')),
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('alert', 'reminder', 'report', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  alert_notifications BOOLEAN DEFAULT TRUE,
  report_notifications BOOLEAN DEFAULT TRUE,
  reminder_notifications BOOLEAN DEFAULT TRUE,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')),
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add onboarding_completed column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Mexico_City';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_tenant_id ON notification_settings(tenant_id);

-- Create RLS policies for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their tenant" ON invitations
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "HR admins can create invitations" ON invitations
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

CREATE POLICY "HR admins can update invitations" ON invitations
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

CREATE POLICY "HR admins can delete invitations" ON invitations
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notification settings for their tenant" ON notification_settings
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "HR admins can manage notification settings" ON notification_settings
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

-- Create function to automatically create notification settings for new tenants
CREATE OR REPLACE FUNCTION create_notification_settings_for_tenant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (tenant_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_notification_settings
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_settings_for_tenant();

-- Create function to check invitation expiration
CREATE OR REPLACE FUNCTION check_invitation_expiration()
RETURNS void AS $$
BEGIN
  UPDATE invitations 
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Add some sample data for testing
INSERT INTO notification_settings (tenant_id, email_notifications, push_notifications)
SELECT id, true, true FROM tenants WHERE onboarding_completed = false
ON CONFLICT (tenant_id) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  CASE WHEN row_security = 't' THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('invitations', 'notifications', 'notification_settings')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('invitations', 'notifications', 'notification_settings')
ORDER BY tablename, policyname;

-- Verificar funciones creadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('create_notification_settings_for_tenant', 'check_invitation_expiration')
ORDER BY routine_name;

-- =====================================================
-- MENSAJE DE ÉXITO
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente!';
  RAISE NOTICE '📊 Tablas creadas: invitations, notifications, notification_settings';
  RAISE NOTICE '🔐 RLS habilitado en todas las tablas';
  RAISE NOTICE '⚙️ Funciones automáticas configuradas';
  RAISE NOTICE '🚀 MVP listo para pruebas empresariales!';
END $$; 