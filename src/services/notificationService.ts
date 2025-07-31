import { supabase } from '@/integrations/supabase/client';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly';
export type NotificationType = 'burnout_alert' | 'turnover_risk' | 'low_satisfaction' | 'team_summary' | 'system_alert';

class NotificationService {
  // Envío inmediato de notificaciones
  async sendImmediateNotification(
    email: string,
    type: NotificationType,
    data: Record<string, any>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    try {
      // Obtener plantilla
      const template = await this.getEmailTemplate(type);
      if (!template) throw new Error(`Template not found for type: ${type}`);

      // Generar contenido con variables
      const htmlContent = this.interpolateTemplate(template.html_content, data);
      const subject = this.interpolateTemplate(template.subject, data);

      // Agregar a cola de envío
      const { data: queueItem, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: email,
          subject,
          html_content: htmlContent,
          template_type: type,
          priority,
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
          scheduled_at: new Date().toISOString(),
          metadata: data
        })
        .select()
        .single();

      if (error) throw error;

      // Procesar inmediatamente
      await this.processEmailQueue([queueItem.id]);
      
      return queueItem.id;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  // Envío de lotes de notificaciones
  async sendBatchNotifications(
    notifications: Array<{
      email: string;
      type: NotificationType;
      data: Record<string, any>;
    }>
  ): Promise<string[]> {
    const queueItems = [];

    for (const notification of notifications) {
      try {
        const template = await this.getEmailTemplate(notification.type);
        if (!template) continue;

        const htmlContent = this.interpolateTemplate(template.html_content, notification.data);
        const subject = this.interpolateTemplate(template.subject, notification.data);

        const { data: queueItem, error } = await supabase
          .from('email_queue')
          .insert({
            to_email: notification.email,
            subject,
            html_content: htmlContent,
            template_type: notification.type,
            priority: 'medium',
            status: 'pending',
            retry_count: 0,
            max_retries: 3,
            scheduled_at: new Date().toISOString(),
            metadata: notification.data
          })
          .select()
          .single();

        if (error) throw error;
        queueItems.push(queueItem.id);
      } catch (error) {
        console.error('Error adding notification to queue:', error);
      }
    }

    // Procesar cola en lotes
    if (queueItems.length > 0) {
      await this.processEmailQueue(queueItems);
    }
    
    return queueItems;
  }

  // Obtener plantillas de email
  async getEmailTemplate(type: NotificationType) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .single();

    if (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
    return data;
  }

  // Procesar cola de emails mediante Edge Function
  async processEmailQueue(queueIds?: string[]): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { queue_ids: queueIds }
      });

      if (error) throw error;
      console.log('Email queue processed:', data);
    } catch (error) {
      console.error('Error processing email queue:', error);
      throw error;
    }
  }

  // Obtener estadísticas de emails
  async getEmailStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('email_queue')
      .select('status, template_type, sent_at, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const stats = {
      total_sent: 0,
      total_failed: 0,
      success_rate: 0,
      by_type: {} as Record<string, number>,
      by_day: [] as Array<{ date: string; sent: number; failed: number }>
    };

    if (!data) return stats;

    // Calcular estadísticas
    data.forEach(item => {
      if (item.status === 'sent') stats.total_sent++;
      if (item.status === 'failed') stats.total_failed++;
      
      stats.by_type[item.template_type] = (stats.by_type[item.template_type] || 0) + 1;
    });

    stats.success_rate = stats.total_sent + stats.total_failed > 0 
      ? (stats.total_sent / (stats.total_sent + stats.total_failed)) * 100 
      : 0;

    return stats;
  }

  // Configuración de notificaciones por usuario
  async getNotificationConfig(userId: string) {
    const { data, error } = await supabase
      .from('notification_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateNotificationConfig(
    userId: string, 
    type: NotificationType, 
    config: {
      frequency?: NotificationFrequency;
      enabled?: boolean;
      email?: string;
    }
  ) {
    // Obtener el tenant_id del usuario actual
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('tenant_id, email')
      .eq('id', userId)
      .single();

    const { data, error } = await supabase
      .from('notification_configs')
      .upsert({
        user_id: userId,
        type,
        tenant_id: userProfile?.tenant_id,
        email: config.email || userProfile?.email,
        frequency: config.frequency || 'immediate',
        enabled: config.enabled !== undefined ? config.enabled : true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Programar notificación para más tarde
  async scheduleNotification(
    email: string,
    type: NotificationType,
    data: Record<string, any>,
    scheduledAt: Date
  ): Promise<string> {
    const template = await this.getEmailTemplate(type);
    if (!template) throw new Error(`Template not found for type: ${type}`);

    const htmlContent = this.interpolateTemplate(template.html_content, data);
    const subject = this.interpolateTemplate(template.subject, data);

    const { data: queueItem, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: email,
        subject,
        html_content: htmlContent,
        template_type: type,
        priority: 'medium',
        status: 'pending',
        retry_count: 0,
        max_retries: 3,
        scheduled_at: scheduledAt.toISOString(),
        metadata: data
      })
      .select()
      .single();

    if (error) throw error;
    return queueItem.id;
  }

  // Envío específico de alertas del sistema
  async sendAlertNotification(alertData: {
    user_email: string;
    user_name: string;
    alert_type: string;
    severity: string;
    message: string;
    manager_email?: string;
    manager_name?: string;
  }): Promise<void> {
    try {
      // Notificar al empleado para alertas no críticas
      if (alertData.severity !== 'high') {
        await this.sendImmediateNotification(
          alertData.user_email,
          'burnout_alert',
          {
            user_name: alertData.user_name,
            alert_type: alertData.alert_type,
            message: alertData.message,
            severity: alertData.severity
          },
          'medium'
        );
      }

      // Notificar al manager para alertas importantes
      if (alertData.manager_email && (alertData.severity === 'high' || alertData.severity === 'medium')) {
        await this.sendImmediateNotification(
          alertData.manager_email,
          'system_alert',
          {
            manager_name: alertData.manager_name,
            user_name: alertData.user_name,
            alert_type: alertData.alert_type,
            message: alertData.message,
            severity: alertData.severity,
            action_required: alertData.severity === 'high'
          },
          alertData.severity === 'high' ? 'high' : 'medium'
        );
      }
    } catch (error) {
      console.error('Error sending alert notification:', error);
      throw error;
    }
  }

  // Reenviar emails fallidos
  async retryFailedEmails(maxRetries = 3): Promise<void> {
    const { data: failedEmails } = await supabase
      .from('email_queue')
      .select('id')
      .eq('status', 'failed')
      .lt('retry_count', maxRetries);

    if (failedEmails && failedEmails.length > 0) {
      const queueIds = failedEmails.map(email => email.id);
      await this.processEmailQueue(queueIds);
    }
  }

  // Obtener cola de emails
  async getEmailQueue(status?: string, limit = 50) {
    let query = supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Helper para interpolar plantillas
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
  }

  // Crear nueva plantilla de email
  async createEmailTemplate(template: {
    type: NotificationType;
    subject: string;
    html_content: string;
    variables: string[];
    tenant_id?: string;
  }) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...template,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Enviar email de prueba
  async sendTestEmail(email: string, templateType: NotificationType): Promise<string> {
    const testData = {
      user_name: 'Usuario de Prueba',
      manager_name: 'Manager de Prueba',
      alert_type: 'Prueba del Sistema',
      message: 'Este es un email de prueba del sistema REBEN',
      severity: 'medium',
      week_start: new Date().toLocaleDateString('es-ES'),
      week_end: new Date().toLocaleDateString('es-ES'),
      avg_wellness: '85',
      participation_rate: '92',
      active_alerts: '3'
    };

    return this.sendImmediateNotification(email, templateType, testData, 'low');
  }
}

export const notificationService = new NotificationService();