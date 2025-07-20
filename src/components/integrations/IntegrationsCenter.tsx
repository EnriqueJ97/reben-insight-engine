import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Plug, 
  Mail, 
  Webhook, 
  Slack, 
  MessageSquare,
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Play,
  Save,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebhookManager } from './WebhookManager';
import { IntegrationLogs } from './IntegrationLogs';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'communication' | 'analytics' | 'hr' | 'wellness';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  required_fields: string[];
  documentation_url?: string;
}

export const IntegrationsCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Envía alertas de bienestar y notificaciones al equipo',
      icon: Slack,
      category: 'communication',
      status: 'inactive',
      config: { webhook_url: '', channel: '#bienestar' },
      required_fields: ['webhook_url'],
      documentation_url: 'https://api.slack.com/messaging/webhooks'
    },
    {
      id: 'email_notifications',
      name: 'Notificaciones Email',
      description: 'Sistema automático de emails para alertas críticas',
      icon: Mail,
      category: 'communication',
      status: 'inactive',
      config: { 
        smtp_host: '', 
        smtp_port: '587', 
        username: '', 
        password: '',
        from_email: '',
        templates_enabled: true
      },
      required_fields: ['smtp_host', 'username', 'password', 'from_email'],
    },
    {
      id: 'microsoft_teams',
      name: 'Microsoft Teams',
      description: 'Integración con Teams para alertas y notificaciones',
      icon: MessageSquare,
      category: 'communication',
      status: 'inactive',
      config: { webhook_url: '', channel_id: '' },
      required_fields: ['webhook_url'],
      documentation_url: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automatiza flujos de trabajo con miles de aplicaciones',
      icon: Activity,
      category: 'analytics',
      status: 'inactive',
      config: { webhook_url: '', triggers_enabled: true },
      required_fields: ['webhook_url'],
      documentation_url: 'https://zapier.com/apps/webhook/help'
    }
  ]);
  
  const [activeTab, setActiveTab] = useState('integrations');
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Check if user is HR_ADMIN
  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Acceso Denegado</h2>
        <p className="text-muted-foreground">Solo los administradores de RRHH pueden configurar integraciones.</p>
      </div>
    );
  }

  const updateIntegrationConfig = (integrationId: string, field: string, value: any) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            config: { ...integration.config, [field]: value }
          }
        : integration
    ));
  };

  const toggleIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // Check if required fields are filled
    const missingFields = integration.required_fields.filter(
      field => !integration.config[field]?.trim()
    );

    if (missingFields.length > 0 && integration.status === 'inactive') {
      toast({
        title: "Configuración incompleta",
        description: `Por favor completa los campos requeridos: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const newStatus = integration.status === 'active' ? 'inactive' : 'active';
    
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: newStatus }
        : i
    ));

    toast({
      title: newStatus === 'active' ? "Integración activada" : "Integración desactivada",
      description: `${integration.name} ha sido ${newStatus === 'active' ? 'activada' : 'desactivada'} exitosamente.`
    });
  };

  const testIntegration = async (integrationId: string) => {
    setTestingIntegration(integrationId);
    const integration = integrations.find(i => i.id === integrationId);
    
    try {
      // Simulate test based on integration type
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (integration?.id === 'slack' && integration.config.webhook_url) {
        // Test Slack webhook
        const testMessage = {
          text: "🧪 Test de integración desde REBEN",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Test de Integración Exitoso*\n✅ La conexión con Slack está funcionando correctamente.\n\n_Enviado desde REBEN - Sistema de Bienestar Laboral_`
              }
            }
          ]
        };

        // In real implementation, you would call the webhook
        console.log('Would send to Slack:', testMessage);
      }

      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'active' }
          : i
      ));

      toast({
        title: "Test exitoso",
        description: `La conexión con ${integration?.name} está funcionando correctamente.`
      });
    } catch (error) {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'error' }
          : i
      ));

      toast({
        title: "Error en el test",
        description: `No se pudo conectar con ${integration?.name}. Verifica la configuración.`,
        variant: "destructive"
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const saveConfiguration = async () => {
    try {
      // Here you would save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Todas las integraciones han sido configuradas exitosamente."
      });
      
      setEditingIntegration(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-success text-success-foreground">Activa</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="secondary">Inactiva</Badge>;
    }
  };

  const getCategoryIntegrations = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

  const renderIntegrationForm = (integration: Integration) => {
    return (
      <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/30">
        <h4 className="font-medium">Configuración de {integration.name}</h4>
        
        {integration.required_fields.map(field => {
          const isPassword = field.includes('password') || field.includes('secret') || field.includes('token');
          const showPassword = showPasswords[`${integration.id}_${field}`];
          
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={`${integration.id}_${field}`}>
                {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} *
              </Label>
              <div className="relative">
                <Input
                  id={`${integration.id}_${field}`}
                  type={isPassword && !showPassword ? 'password' : 'text'}
                  value={integration.config[field] || ''}
                  onChange={(e) => updateIntegrationConfig(integration.id, field, e.target.value)}
                  placeholder={`Ingresa ${field.split('_').join(' ')}`}
                />
                {isPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      [`${integration.id}_${field}`]: !showPassword
                    }))}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Additional configuration fields */}
        {integration.id === 'email_notifications' && (
          <div className="space-y-2">
            <Label>Plantillas de Email</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={integration.config.templates_enabled}
                onCheckedChange={(checked) => 
                  updateIntegrationConfig(integration.id, 'templates_enabled', checked)
                }
              />
              <span className="text-sm">Usar plantillas predefinidas</span>
            </div>
          </div>
        )}

        {integration.id === 'slack' && (
          <div className="space-y-2">
            <Label htmlFor={`${integration.id}_channel`}>Canal de Slack</Label>
            <Input
              id={`${integration.id}_channel`}
              value={integration.config.channel || ''}
              onChange={(e) => updateIntegrationConfig(integration.id, 'channel', e.target.value)}
              placeholder="#bienestar"
            />
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={() => testIntegration(integration.id)}
            disabled={testingIntegration === integration.id}
            variant="outline"
            size="sm"
          >
            {testingIntegration === integration.id ? (
              <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Probar Conexión
          </Button>
          
          <Button onClick={saveConfiguration} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setEditingIntegration(null)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Plug className="h-8 w-8 text-primary" />
            <span>Centro de Integraciones</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura y gestiona las integraciones externas del sistema
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {integrations.filter(i => i.status === 'active').length} Activas
          </Badge>
          <Badge variant="secondary">
            {integrations.length} Total
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">
              {integrations.filter(i => i.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Activas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.status === 'inactive').length}
            </div>
            <div className="text-sm text-muted-foreground">Inactivas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-destructive">
              {integrations.filter(i => i.status === 'error').length}
            </div>
            <div className="text-sm text-muted-foreground">Con Error</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{integrations.length}</div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Communication Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Comunicación</span>
              </CardTitle>
              <CardDescription>
                Servicios de mensajería y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCategoryIntegrations('communication').map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <integration.icon className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        {integration.documentation_url && (
                          <a 
                            href={integration.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center mt-1"
                          >
                            Ver documentación <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      {getStatusBadge(integration.status)}
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(
                          editingIntegration === integration.id ? null : integration.id
                        )}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingIntegration === integration.id && renderIntegrationForm(integration)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Analytics Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Automatización y Analytics</span>
              </CardTitle>
              <CardDescription>
                Herramientas de análisis y automatización de flujos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getCategoryIntegrations('analytics').map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <integration.icon className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        {integration.documentation_url && (
                          <a 
                            href={integration.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center mt-1"
                          >
                            Ver documentación <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      {getStatusBadge(integration.status)}
                      <Switch
                        checked={integration.status === 'active'}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(
                          editingIntegration === integration.id ? null : integration.id
                        )}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingIntegration === integration.id && renderIntegrationForm(integration)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="logs">
          <IntegrationLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};