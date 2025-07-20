import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit, 
  Play,
  Copy,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  description: string;
  active: boolean;
  secret: string;
  created_at: string;
  last_triggered?: string;
  success_count: number;
  error_count: number;
}

export const WebhookManager = () => {
  const { toast } = useToast();
  
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Sistema RRHH Principal',
      url: 'https://api.empresa.com/webhooks/bienestar',
      events: ['alert_created', 'employee_status_changed'],
      description: 'Sincronización con sistema principal de RRHH',
      active: true,
      secret: 'whsec_abc123...',
      created_at: '2024-01-15',
      last_triggered: '2024-01-20T10:30:00Z',
      success_count: 45,
      error_count: 2
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
    description: '',
    active: true
  });

  const availableEvents = [
    { id: 'alert_created', name: 'Alerta Creada', description: 'Se dispara cuando se crea una nueva alerta' },
    { id: 'alert_resolved', name: 'Alerta Resuelta', description: 'Se dispara cuando una alerta es resuelta' },
    { id: 'employee_status_changed', name: 'Estado Empleado Cambiado', description: 'Cambios en el estado de bienestar del empleado' },
    { id: 'checkin_completed', name: 'Check-in Completado', description: 'Empleado completa su check-in diario' },
    { id: 'burnout_risk_detected', name: 'Riesgo Burnout Detectado', description: 'Sistema detecta riesgo de burnout' },
    { id: 'team_report_generated', name: 'Reporte Equipo Generado', description: 'Se genera un nuevo reporte de equipo' }
  ];

  const toggleEvent = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const webhook: WebhookEndpoint = {
        id: Date.now().toString(),
        ...newWebhook,
        secret: `whsec_${Math.random().toString(36).substring(2)}`,
        created_at: new Date().toISOString().split('T')[0],
        success_count: 0,
        error_count: 0
      };

      setWebhooks(prev => [...prev, webhook]);
      setNewWebhook({ name: '', url: '', events: [], description: '', active: true });
      setIsCreating(false);

      toast({
        title: "Webhook creado",
        description: "El webhook ha sido configurado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    toast({
      title: "Webhook eliminado",
      description: "El webhook ha sido eliminado exitosamente"
    });
  };

  const toggleWebhook = async (webhookId: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === webhookId 
        ? { ...w, active: !w.active }
        : w
    ));

    const webhook = webhooks.find(w => w.id === webhookId);
    toast({
      title: webhook?.active ? "Webhook desactivado" : "Webhook activado",
      description: `El webhook "${webhook?.name}" ha sido ${webhook?.active ? 'desactivado' : 'activado'}`
    });
  };

  const testWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const webhook = webhooks.find(w => w.id === webhookId);
      
      // Simulate sending test payload
      const testPayload = {
        event: 'test_webhook',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from REBEN',
          webhook_id: webhookId,
          webhook_name: webhook?.name
        }
      };

      console.log('Test payload sent:', testPayload);

      // Update success count
      setWebhooks(prev => prev.map(w => 
        w.id === webhookId 
          ? { 
              ...w, 
              success_count: w.success_count + 1,
              last_triggered: new Date().toISOString()
            }
          : w
      ));

      toast({
        title: "Test exitoso",
        description: `El webhook "${webhook?.name}" respondió correctamente`
      });
    } catch (error) {
      // Update error count
      setWebhooks(prev => prev.map(w => 
        w.id === webhookId 
          ? { ...w, error_count: w.error_count + 1 }
          : w
      ));

      toast({
        title: "Error en el test",
        description: "El webhook no pudo ser contactado",
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    });
  };

  const getEventName = (eventId: string) => {
    return availableEvents.find(e => e.id === eventId)?.name || eventId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Webhook className="h-6 w-6" />
            <span>Gestión de Webhooks</span>
          </h2>
          <p className="text-muted-foreground">
            Configura endpoints para recibir eventos del sistema en tiempo real
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">
              {webhooks.filter(w => w.active).length}
            </div>
            <div className="text-sm text-muted-foreground">Activos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {webhooks.reduce((sum, w) => sum + w.success_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Eventos Enviados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-destructive">
              {webhooks.reduce((sum, w) => sum + w.error_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Errores</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Webhook Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Webhook</CardTitle>
            <CardDescription>
              Configura un endpoint para recibir eventos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Nombre *</Label>
                <Input
                  id="webhook-name"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Sistema RRHH"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL del Endpoint *</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.empresa.com/webhooks/bienestar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={newWebhook.description}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el propósito de este webhook..."
              />
            </div>

            <div className="space-y-2">
              <Label>Eventos a Escuchar *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableEvents.map(event => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`event-${event.id}`}
                      checked={newWebhook.events.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`event-${event.id}`} className="text-sm">
                      {event.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={createWebhook}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Webhook
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map(webhook => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-medium">{webhook.name}</h3>
                    <Badge variant={webhook.active ? "default" : "secondary"}>
                      {webhook.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">URL:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">{webhook.url}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(webhook.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Secret:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">{webhook.secret}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(webhook.secret)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div>
                      <span className="font-medium">Eventos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.map(eventId => (
                          <Badge key={eventId} variant="outline" className="text-xs">
                            {getEventName(eventId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {webhook.description && (
                      <div>
                        <span className="font-medium">Descripción:</span> {webhook.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>{webhook.success_count} éxitos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      <span>{webhook.error_count} errores</span>
                    </div>
                    {webhook.last_triggered && (
                      <div>
                        Último: {new Date(webhook.last_triggered).toLocaleString('es-ES')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Switch
                    checked={webhook.active}
                    onCheckedChange={() => toggleWebhook(webhook.id)}
                  />
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testingWebhook === webhook.id}
                    >
                      {testingWebhook === webhook.id ? (
                        <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWebhook(webhook.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {webhooks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Webhook className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin webhooks configurados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer webhook para recibir eventos del sistema
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Webhook
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};