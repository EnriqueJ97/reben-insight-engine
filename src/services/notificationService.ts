import { supabase } from '@/integrations/supabase/client';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly';
export type NotificationType = 'burnout_alert' | 'turnover_risk' | 'low_satisfaction' | 'team_summary' | 'system_alert';

export interface NotificationConfig {
  id: string;
  user_id: string;
  type: NotificationType;
  frequency: NotificationFrequency;
  enabled: boolean;
  email: string;
  last_sent?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  html_content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailQueue {
  id: string;
  to_email: string;
  subject: string;
  html_content: string;
  template_type: NotificationType;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  sent_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class NotificationService {
  // Configuración de notificaciones
  async getNotificationConfig(userId: string): Promise<NotificationConfig[]> {
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
    config: Partial<NotificationConfig>
  ): Promise<NotificationConfig> {
    const { data, error } = await supabase
      .from('notification_configs')
      .upsert({
        user_id: userId,
        type,
        ...config,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Envío de notificaciones
  async sendImmediateNotification(
    email: string,
    type: NotificationType,
    data: Record<string, any>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<string> {
    // Obtener plantilla
    const template = await this.getEmailTemplate(type);
    if (!template) throw new Error(`Template not found for type: ${type}`);

    // Generar contenido con variables
    const htmlContent = this.interpolateTemplate(template.html_content, data);
    const subject = this.interpolateTemplate(template.subject, data);

    // Agregar a cola de envío
    const queueItem = await this.addToEmailQueue({
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
    });

    // Enviar inmediatamente
    await this.processEmailQueue([queueItem.id]);
    
    return queueItem.id;
  }

  async sendBatchNotifications(
    notifications: Array<{
      email: string;
      type: NotificationType;
      data: Record<string, any>;
    }>
  ): Promise<string[]> {
    const queueItems = [];

    for (const notification of notifications) {
      const template = await this.getEmailTemplate(notification.type);
      if (!template) continue;

      const htmlContent = this.interpolateTemplate(template.html_content, notification.data);
      const subject = this.interpolateTemplate(template.subject, notification.data);

      const queueItem = await this.addToEmailQueue({
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
      });

      queueItems.push(queueItem.id);
    }

    // Procesar cola en lotes
    await this.processEmailQueue(queueItems);
    return queueItems;
  }

  // Gestión de plantillas
  async getEmailTemplate(type: NotificationType): Promise<EmailTemplate | null> {
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

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Gestión de cola de emails
  async addToEmailQueue(item: Omit<EmailQueue, 'id' | 'created_at' | 'updated_at'>): Promise<EmailQueue> {
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async processEmailQueue(queueIds?: string[]): Promise<void> {
    try {
      // Llamar a la Edge Function para procesar la cola
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

  async getEmailQueue(status?: string, limit = 50): Promise<EmailQueue[]> {
    let query = supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = query;
    if (error) throw error;
    return data || [];
  }

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

  // Reportes y análisis
  async getEmailStats(days = 30): Promise<{
    total_sent: number;
    total_failed: number;
    success_rate: number;
    by_type: Record<string, number>;
    by_day: Array<{ date: string; sent: number; failed: number }>;
  }> {
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

  // Helpers privados
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
  }

  // Notificaciones programadas
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

    const queueItem = await this.addToEmailQueue({
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
    });

    return queueItem.id;
  }

  // Envío de alertas específicas del sistema
  async sendAlertNotification(
    alertData: {
      user_email: string;
      user_name: string;
      alert_type: string;
      severity: string;
      message: string;
      manager_email?: string;
      manager_name?: string;
    }
  ): Promise<void> {
    // Notificar al empleado si es apropiado
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

    // Notificar al manager/HR para alertas importantes
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
  }
}

export const notificationService = new NotificationService();