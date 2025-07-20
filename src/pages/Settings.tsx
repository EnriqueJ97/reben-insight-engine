
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Slack, Mail, Clock, Shield, Download, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const [slackEnabled, setSlackEnabled] = useState(tenant?.settings?.slack_enabled || false);
  const [emailEnabled, setEmailEnabled] = useState(tenant?.settings?.email_enabled || true);
  const [dailyTime, setDailyTime] = useState(tenant?.settings?.daily_checkin_time || '09:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveIntegrations = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración guardada",
        description: "Las integraciones se han actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Informe generado",
        description: "El informe PDF se ha generado y enviado por email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el informe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadEmployees = () => {
    // Simulate CSV upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Archivo cargado",
          description: `Se procesará el archivo: ${file.name}`,
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <span>Configuración</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las integraciones y configuraciones de tu organización
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Slack Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Slack className="h-5 w-5" />
                  <span>Integración Slack</span>
                  <Badge variant={slackEnabled ? "default" : "secondary"}>
                    {slackEnabled ? "Activa" : "Inactiva"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Envía preguntas diarias y recibe alertas directamente en Slack
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slack-toggle">Habilitar Slack</Label>
                  <Switch
                    id="slack-toggle"
                    checked={slackEnabled}
                    onCheckedChange={setSlackEnabled}
                  />
                </div>
                
                {slackEnabled && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bot-token">Bot Token</Label>
                      <Input
                        id="bot-token"
                        placeholder="xoxb-your-token-here"
                        type="password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signing-secret">Signing Secret</Label>
                      <Input
                        id="signing-secret"
                        placeholder="your-signing-secret"
                        type="password"
                      />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Slack className="h-4 w-4 mr-2" />
                      Conectar con Slack
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Integración Email</span>
                  <Badge variant={emailEnabled ? "default" : "secondary"}>
                    {emailEnabled ? "Activa" : "Inactiva"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Envía preguntas y alertas por correo electrónico corporativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-toggle">Habilitar Email</Label>
                  <Switch
                    id="email-toggle"
                    checked={emailEnabled}
                    onCheckedChange={setEmailEnabled}
                  />
                </div>
                
                {emailEnabled && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.empresa.com"
                        defaultValue="smtp.empresa.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="smtp-user">Usuario</Label>
                        <Input
                          id="smtp-user"
                          placeholder="noreply@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">Puerto</Label>
                        <Input
                          id="smtp-port"
                          placeholder="587"
                          defaultValue="587"
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Probar Conexión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Programación</span>
                </CardTitle>
                <CardDescription>
                  Configura cuándo y cómo se envían las preguntas diarias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="daily-time">Hora del Check-in Diario</Label>
                    <Input
                      id="daily-time"
                      type="time"
                      value={dailyTime}
                      onChange={(e) => setDailyTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Input
                      id="timezone"
                      value="Europe/Madrid"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <Input
                      id="frequency"
                      value="Diaria (Lun-Vie)"
                      disabled
                    />
                  </div>
                </div>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Las preguntas se enviarán automáticamente a las {dailyTime} de lunes a viernes.
                    Los empleados tendrán hasta las 18:00 para responder.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gestión de Empleados</span>
                </CardTitle>
                <CardDescription>
                  Carga y administra la información de los empleados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={uploadEmployees} variant="outline" className="h-32">
                    <div className="text-center">
                      <Download className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Cargar CSV</div>
                      <div className="text-sm text-muted-foreground">
                        Formato: id, nombre, email, rol, team
                      </div>
                    </div>
                  </Button>
                  
                  <div className="p-4 rounded-lg border-2 border-dashed border-border">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-primary">150</div>
                      <div className="text-sm font-medium">Empleados Registrados</div>
                      <div className="text-xs text-muted-foreground">
                        12 equipos • 8 managers • 1 HR admin
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Formato CSV requerido:</strong> El archivo debe contener las columnas: 
                    id, nombre, email, rol (EMPLOYEE/MANAGER/HR_ADMIN), team_id.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generación de Informes</CardTitle>
                <CardDescription>
                  Genera informes PDF automáticos con métricas de bienestar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Informe Mensual</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Resumen completo con gráficos y análisis de tendencias
                    </p>
                    <Button onClick={generateReport} disabled={isLoading} className="w-full">
                      {isLoading ? "Generando..." : "Generar PDF"}
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Informe Semanal</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Resumen rápido de alertas y métricas clave
                    </p>
                    <Button variant="outline" className="w-full">
                      Configurar Auto-envío
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-medium mb-2">Análisis Personalizado</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Crea informes específicos por equipo o departamento
                    </p>
                    <Button variant="outline" className="w-full">
                      Crear Análisis
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📊 Contenido del Informe Mensual:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Resumen ejecutivo con KPIs principales</li>
                    <li>• Gráfico de tendencias de bienestar (30 días)</li>
                    <li>• Lista de empleados con alertas activas</li>
                    <li>• Estimación de costes por burnout y rotación</li>
                    <li>• 3 acciones recomendadas basadas en datos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Seguridad y Privacidad</span>
                </CardTitle>
                <CardDescription>
                  Configuraciones de cumplimiento RGPD y seguridad de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Retención de Datos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm">Respuestas de check-in</span>
                        <Badge variant="outline">12 meses</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm">Alertas y reportes</span>
                        <Badge variant="outline">24 meses</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm">Datos de empleados</span>
                        <Badge variant="outline">Indefinido</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Privacidad</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="anonymous-reports">Reportes Anónimos</Label>
                        <Switch id="anonymous-reports" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="data-encryption">Cifrado de Datos</Label>
                        <Switch id="data-encryption" defaultChecked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="aggregate-only">Solo Datos Agregados</Label>
                        <Switch id="aggregate-only" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cumplimiento RGPD:</strong> Todos los datos personales se procesan bajo 
                    consentimiento explícito. Los empleados pueden solicitar la eliminación de sus 
                    datos en cualquier momento usando el endpoint DELETE /user/{id}/data.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button variant="outline">
                    Descargar Política de Privacidad
                  </Button>
                  <Button variant="outline">
                    Configurar Eliminación Automática
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
