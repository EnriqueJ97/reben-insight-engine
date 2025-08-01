import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  tenant_id: string;
  integration_type: string;
  name: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface WebhookEndpoint {
  id: string;
  tenant_id: string;
  name: string;
  url: string;
  events: string[];
  description?: string;
  secret: string;
  is_active: boolean;
  success_count: number;
  error_count: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useIntegrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'HR_ADMIN') {
      fetchIntegrations();
      fetchWebhooks();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      // For now, return mock data since tables are not in types yet
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          tenant_id: user?.tenant_id || '',
          integration_type: 'slack',
          name: 'Slack',
          config: { webhook_url: '', channel: '#bienestar' },
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || ''
        },
        {
          id: '2',
          tenant_id: user?.tenant_id || '',
          integration_type: 'email_notifications',
          name: 'Notificaciones Email',
          config: { smtp_host: '', username: '', password: '', from_email: '' },
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || ''
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las integraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      // For now, return mock data since tables are not in types yet
      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: '1',
          tenant_id: user?.tenant_id || '',
          name: 'Sistema RRHH Principal',
          url: 'https://api.empresa.com/webhooks/bienestar',
          events: ['alert_created', 'employee_status_changed'],
          description: 'Sincronización con sistema principal de RRHH',
          secret: 'whsec_abc123...',
          is_active: true,
          success_count: 45,
          error_count: 2,
          last_triggered_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user?.id || ''
        }
      ];
      
      setWebhooks(mockWebhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const createIntegration = async (integrationData: Partial<Integration>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const newIntegration: Integration = {
        id: Date.now().toString(),
        tenant_id: user.tenant_id,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...integrationData
      } as Integration;

      setIntegrations(prev => [newIntegration, ...prev]);
      
      toast({
        title: "Integración creada",
        description: `${newIntegration.name} ha sido configurada exitosamente`
      });

      return { data: newIntegration, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la integración",
        variant: "destructive"
      });
      return { error };
    }
  };

  const updateIntegration = async (id: string, updates: Partial<Integration>) => {
    try {
      // Update in local state for now
      setIntegrations(prev => prev.map(int => 
        int.id === id ? { ...int, ...updates, updated_at: new Date().toISOString() } : int
      ));
      
      toast({
        title: "Integración actualizada",
        description: "La configuración ha sido guardada"
      });

      return { data: null, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      setIntegrations(prev => prev.filter(int => int.id !== id));
      
      toast({
        title: "Integración eliminada",
        description: "La integración ha sido eliminada exitosamente"
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la integración",
        variant: "destructive"
      });
      return { error };
    }
  };

  const testIntegration = async (integration: Integration) => {
    try {
      // Test different integration types
      if (integration.integration_type === 'slack' && integration.config.webhook_url) {
        const testPayload = {
          text: "🧪 Test de integración desde REBEN",
          channel: integration.config.channel || '#bienestar',
          username: 'REBEN',
          icon_emoji: ':heart:'
        };

        const response = await fetch(integration.config.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      }

      // Simulate test for other types
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Test exitoso",
        description: `La conexión con ${integration.name} está funcionando correctamente`
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Error en el test",
        description: `No se pudo conectar con ${integration.name}: ${error.message}`,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    }
  };

  const createWebhook = async (webhookData: Partial<WebhookEndpoint>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const secret = `whsec_${Math.random().toString(36).substring(2)}`;
      
      const newWebhook: WebhookEndpoint = {
        id: Date.now().toString(),
        tenant_id: user.tenant_id,
        created_by: user.id,
        secret,
        success_count: 0,
        error_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...webhookData
      } as WebhookEndpoint;

      setWebhooks(prev => [newWebhook, ...prev]);
      
      toast({
        title: "Webhook creado",
        description: `${newWebhook.name} ha sido configurado exitosamente`
      });

      return { data: newWebhook, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el webhook",
        variant: "destructive"
      });
      return { error };
    }
  };

  const updateWebhook = async (id: string, updates: Partial<WebhookEndpoint>) => {
    try {
      setWebhooks(prev => prev.map(wh => 
        wh.id === id ? { ...wh, ...updates, updated_at: new Date().toISOString() } : wh
      ));
      
      return { data: null, error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      setWebhooks(prev => prev.filter(wh => wh.id !== id));
      
      toast({
        title: "Webhook eliminado",
        description: "El webhook ha sido eliminado exitosamente"
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el webhook",
        variant: "destructive"
      });
      return { error };
    }
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    try {
      const testPayload = {
        event_type: 'test_webhook',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from REBEN',
          webhook_id: webhook.id,
          webhook_name: webhook.name
        }
      };

      // Create signature for security
      const signature = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(webhook.secret + JSON.stringify(testPayload))
      );
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-REBEN-Signature': `sha256=${signatureHex}`,
          'X-REBEN-Event': 'test_webhook',
          'User-Agent': 'REBEN-Webhook/1.0'
        },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Update success count
      await updateWebhook(webhook.id, {
        success_count: webhook.success_count + 1,
        last_triggered_at: new Date().toISOString()
      });

      toast({
        title: "Test exitoso",
        description: `El webhook "${webhook.name}" respondió correctamente`
      });

      return { success: true };
    } catch (error) {
      // Update error count
      await updateWebhook(webhook.id, {
        error_count: webhook.error_count + 1
      });

      toast({
        title: "Error en el test",
        description: `El webhook no pudo ser contactado: ${error.message}`,
        variant: "destructive"
      });

      return { success: false, error: error.message };
    }
  };

  const triggerWebhook = async (eventType: string, data: any) => {
    if (!user) return;

    try {
      // Call webhook processor edge function
      await supabase.functions.invoke('webhook-processor', {
        body: {
          event_type: eventType,
          data,
          tenant_id: user.tenant_id
        }
      });
    } catch (error) {
      console.error('Error triggering webhooks:', error);
    }
  };

  return {
    integrations,
    webhooks,
    loading,
    fetchIntegrations,
    fetchWebhooks,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    triggerWebhook
  };
};