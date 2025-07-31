-- Crear tablas para el sistema de notificaciones

-- Tabla de configuración de notificaciones por usuario
CREATE TABLE public.notification_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  email TEXT NOT NULL,
  last_sent TIMESTAMP WITH TIME ZONE,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, type)
);

-- Tabla de plantillas de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  tenant_id UUID,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(type, tenant_id)
);

-- Tabla de cola de emails
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'retrying')) DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  tenant_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notification_configs
CREATE POLICY "Users can manage their own notification configs" 
ON public.notification_configs FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "HR_ADMIN can manage all notification configs in their tenant" 
ON public.notification_configs FOR ALL 
USING (
  tenant_id IN (
    SELECT profiles.tenant_id FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'HR_ADMIN'
  )
);

-- Políticas RLS para email_templates
CREATE POLICY "HR_ADMIN can manage email templates in their tenant" 
ON public.email_templates FOR ALL 
USING (
  tenant_id IN (
    SELECT profiles.tenant_id FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'HR_ADMIN'
  ) OR tenant_id IS NULL -- plantillas por defecto
);

CREATE POLICY "Users can view email templates in their tenant" 
ON public.email_templates FOR SELECT 
USING (
  tenant_id IN (
    SELECT profiles.tenant_id FROM profiles 
    WHERE profiles.id = auth.uid()
  ) OR tenant_id IS NULL
);

-- Políticas RLS para email_queue
CREATE POLICY "HR_ADMIN can view email queue in their tenant" 
ON public.email_queue FOR SELECT 
USING (
  tenant_id IN (
    SELECT profiles.tenant_id FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'HR_ADMIN'
  )
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_notification_configs_user_id ON public.notification_configs(user_id);
CREATE INDEX idx_notification_configs_type ON public.notification_configs(type);
CREATE INDEX idx_email_templates_type ON public.email_templates(type);
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled_at ON public.email_queue(scheduled_at);
CREATE INDEX idx_email_queue_priority ON public.email_queue(priority);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_notification_configs_updated_at
BEFORE UPDATE ON public.notification_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar plantillas por defecto
INSERT INTO public.email_templates (type, subject, html_content, variables, is_default) VALUES
('burnout_alert', 'Alerta de Bienestar - {{user_name}}', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alerta de Bienestar</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d97706;">⚠️ Alerta de Bienestar</h2>
        <p>Hola <strong>{{user_name}}</strong>,</p>
        <p>Hemos detectado algunos indicadores que sugieren que podrías estar experimentando estrés o fatiga.</p>
        <div style="background: #fef3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Tipo de alerta:</strong> {{alert_type}}<br>
            <strong>Mensaje:</strong> {{message}}
        </div>
        <p>Tu bienestar es importante para nosotros. Te recomendamos:</p>
        <ul>
            <li>Hablar con tu manager sobre tu carga de trabajo</li>
            <li>Tomar descansos regulares durante el día</li>
            <li>Contactar a Recursos Humanos si necesitas apoyo adicional</li>
        </ul>
        <p>Saludos,<br>Equipo de Bienestar</p>
    </div>
</body>
</html>
', ARRAY['user_name', 'alert_type', 'message'], true),

('system_alert', 'Acción Requerida - Alerta de Empleado {{user_name}}', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alerta del Sistema</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">🚨 Alerta del Sistema</h2>
        <p>Hola <strong>{{manager_name}}</strong>,</p>
        <p>Se ha generado una alerta para uno de los miembros de tu equipo que requiere tu atención.</p>
        <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <strong>Empleado:</strong> {{user_name}}<br>
            <strong>Tipo de alerta:</strong> {{alert_type}}<br>
            <strong>Severidad:</strong> {{severity}}<br>
            <strong>Mensaje:</strong> {{message}}
        </div>
        {{#if action_required}}
        <div style="background: #fbbf24; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong>⚡ ACCIÓN INMEDIATA REQUERIDA</strong>
        </div>
        {{/if}}
        <p><strong>Acciones recomendadas:</strong></p>
        <ul>
            <li>Programar una reunión 1:1 con {{user_name}}</li>
            <li>Revisar la carga de trabajo actual</li>
            <li>Evaluar factores de estrés en el equipo</li>
            <li>Considerar ajustes en responsabilidades si es necesario</li>
        </ul>
        <p>Accede al <a href="#" style="color: #3b82f6;">Dashboard de Alertas</a> para más detalles.</p>
        <p>Saludos,<br>Sistema REBEN</p>
    </div>
</body>
</html>
', ARRAY['manager_name', 'user_name', 'alert_type', 'severity', 'message', 'action_required'], true),

('team_summary', 'Resumen Semanal del Equipo', '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resumen Semanal</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">📊 Resumen Semanal del Equipo</h2>
        <p>Hola <strong>{{manager_name}}</strong>,</p>
        <p>Aquí tienes el resumen de bienestar de tu equipo para la semana del {{week_start}} al {{week_end}}:</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Métricas Generales</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 5px 0;"><strong>Bienestar Promedio:</strong></td>
                    <td style="text-align: right;">{{avg_wellness}}%</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;"><strong>Participación:</strong></td>
                    <td style="text-align: right;">{{participation_rate}}%</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0;"><strong>Alertas Activas:</strong></td>
                    <td style="text-align: right;">{{active_alerts}}</td>
                </tr>
            </table>
        </div>
        
        <p>Revisa el <a href="#" style="color: #3b82f6;">Dashboard de Manager</a> para más detalles y acciones recomendadas.</p>
        <p>Saludos,<br>Sistema REBEN</p>
    </div>
</body>
</html>
', ARRAY['manager_name', 'week_start', 'week_end', 'avg_wellness', 'participation_rate', 'active_alerts'], true);