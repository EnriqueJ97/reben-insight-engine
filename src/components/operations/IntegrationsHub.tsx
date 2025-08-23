import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Mail, 
  Slack, 
  Calendar, 
  Zap, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Send,
  Webhook,
  Bot,
  ExternalLink,
  Trash2,
  Edit3,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IntegrationsHub = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notificaciones automáticas y recordatorios de check-ins',
      icon: Slack,
      connected: true,
      status: 'active',
      config: {
        webhook: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        channel: '#hr-alerts',
        mentions: '@manager',
        frequency: 'daily'
      },
      stats: { messagesSent: 156, lastUsed: '2024-01-15T10:30:00Z' }
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integración con Teams para alertas y conversaciones',
      icon: MessageSquare,
      connected: false,
      status: 'inactive',
      config: {},
      stats: { messagesSent: 0, lastUsed: null }
    },
    {
      id: 'email',
      name: 'Email Automation',
      description: 'Campañas de email y notificaciones personalizadas',
      icon: Mail,
      connected: true,
      status: 'active',
      config: {
        smtp: 'configured',
        templates: 5,
        frequency: 'weekly'
      },
      stats: { messagesSent: 342, lastUsed: '2024-01-14T15:45:00Z' }
    },
    {
      id: 'calendar',
      name: 'Outlook Calendar',
      description: 'Sincronización de eventos y reuniones 1:1',
      icon: Calendar,
      connected: false,
      status: 'inactive',
      config: {},
      stats: { messagesSent: 0, lastUsed: null }
    }
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      name: 'Alert Webhook',
      url: 'https://api.company.com/hr/alerts',
      events: ['alert_created', 'alert_resolved'],
      status: 'active',
      lastTriggered: '2024-01-15T09:15:00Z',
      successRate: 98.5
    },
    {
      id: '2',
      name: 'Check-in Webhook',
      url: 'https://analytics.company.com/wellness',
      events: ['checkin_completed'],
      status: 'active',
      lastTriggered: '2024-01-15T08:30:00Z',
      successRate: 100
    }
  ]);

  const [automations, setAutomations] = useState([
    {
      id: '1',
      name: 'Recordatorio Check-in Diario',
      trigger: 'daily_9am',
      actions: ['slack_message', 'email_reminder'],
      status: 'active',
      lastRun: '2024-01-15T09:00:00Z',
      successCount: 28
    },
    {
      id: '2',
      name: 'Alerta de Burnout Crítico',
      trigger: 'high_severity_alert',
      actions: ['slack_urgent', 'email_manager', 'sms_hr'],
      status: 'active',
      lastRun: '2024-01-12T14:22:00Z',
      successCount: 3
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: ''
  });

  const availableEvents = [
    'alert_created',
    'alert_resolved', 
    'checkin_completed',
    'employee_risk_detected',
    'team_wellness_changed',
    'shift_assigned',
    'shift_swap_requested'
  ];

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, connected: !integration.connected, status: integration.connected ? 'inactive' : 'active' }
        : integration
    ));
    
    toast({
      title: "Integración actualizada",
      description: "Los cambios se han guardado correctamente"
    });
  };

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Error",
        description: "Nombre y URL son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const webhook = {
      id: Date.now().toString(),
      ...newWebhook,
      status: 'active' as const,
      lastTriggered: null,
      successRate: 0
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: '', url: '', events: [], secret: '' });
    
    toast({
      title: "Webhook creado",
      description: "El webhook ha sido configurado correctamente"
    });
  };

  const handleTestIntegration = async (integrationId: string) => {
    toast({
      title: "Enviando prueba...",
      description: "Verificando conectividad"
    });

    // Simular llamada de prueba
    setTimeout(() => {
      toast({
        title: "Prueba exitosa",
        description: "La integración funciona correctamente"
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'inactive': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{integrations.filter(i => i.connected).length}</p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + (i.stats?.messagesSent || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Mensajes Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Webhook className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{webhooks.length}</p>
                <p className="text-xs text-muted-foreground">Webhooks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{automations.filter(a => a.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Automatizaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="automations">Automatizaciones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Integraciones Disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Conecta REBEN con tus herramientas de comunicación favoritas
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{integration.name}</h4>
                          <Badge className={getStatusColor(integration.status)}>
                            {getStatusIcon(integration.status)}
                            <span className="ml-1 capitalize">{integration.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {integration.description}
                        </p>
                        
                        {integration.connected && integration.stats && (
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>📊 {integration.stats.messagesSent} mensajes enviados</span>
                            {integration.stats.lastUsed && (
                              <span>🕒 Último uso: {new Date(integration.stats.lastUsed).toLocaleDateString('es-ES')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integration.connected}
                        onCheckedChange={() => handleToggleIntegration(integration.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestIntegration(integration.id)}
                        disabled={!integration.connected}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Probar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </div>

                  {integration.connected && Object.keys(integration.config).length > 0 && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Configuración Actual</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(integration.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium">{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gestión de Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                Configura endpoints para recibir eventos de REBEN en tiempo real
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Webhook</DialogTitle>
                  <DialogDescription>
                    Configura un endpoint para recibir eventos automáticamente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-name">Nombre</Label>
                    <Input
                      id="webhook-name"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Sistema de Analytics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">URL del Endpoint</Label>
                    <Input
                      id="webhook-url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://api.tuempresa.com/webhooks/reben"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-secret">Secret (Opcional)</Label>
                    <Input
                      id="webhook-secret"
                      type="password"
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Para verificar origen de las llamadas"
                    />
                  </div>
                  <div>
                    <Label>Eventos a Escuchar</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook(prev => ({ ...prev, events: [...prev.events, event] }));
                              } else {
                                setNewWebhook(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                              }
                            }}
                          />
                          <span className="text-sm">{event.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateWebhook}>Crear Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{webhook.name}</h4>
                      <Badge className={getStatusColor(webhook.status)}>
                        {getStatusIcon(webhook.status)}
                        <span className="ml-1 capitalize">{webhook.status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 font-mono">{webhook.url}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>📈 {webhook.successRate}% éxito</span>
                      {webhook.lastTriggered && (
                        <span>🕒 Último: {new Date(webhook.lastTriggered).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Flujos de Automatización</h3>
              <p className="text-sm text-muted-foreground">
                Configura acciones automáticas basadas en eventos del sistema
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Automatización
            </Button>
          </div>

          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{automation.name}</h4>
                      <Badge className={getStatusColor(automation.status)}>
                        {getStatusIcon(automation.status)}
                        <span className="ml-1 capitalize">{automation.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span>🎯 Trigger: {automation.trigger.replace(/_/g, ' ')}</span>
                      <span>✅ {automation.successCount} ejecuciones</span>
                      {automation.lastRun && (
                        <span>🕒 Último: {new Date(automation.lastRun).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {automation.actions.map((action) => (
                        <Badge key={action} variant="outline" className="text-xs">
                          {action.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      {automation.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Analytics de Integraciones</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Métricas de rendimiento y uso de las integraciones
            </p>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximamente:</strong> Dashboard completo de analytics con métricas de entrega, 
              tasas de respuesta y análisis de efectividad de comunicaciones.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Rendimiento por Canal</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Slack className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Slack</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">98.5%</div>
                      <div className="text-xs text-muted-foreground">Entrega</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">94.2%</div>
                      <div className="text-xs text-muted-foreground">Entrega</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Webhooks Status</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">{webhook.name}</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{webhook.successRate}%</div>
                        <div className="text-xs text-muted-foreground">Éxito</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsHub;