import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Users, TrendingUp, Shield, Settings, AlertTriangle, FileText, Download, Calendar, Clock, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const HROperationsHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('complete');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const reportTypes = [
    { value: 'complete', label: 'Reporte Completo', description: 'Análisis completo organizacional' },
    { value: 'teams', label: 'Comparativa de Equipos', description: 'Rendimiento por equipos' },
    { value: 'patterns', label: 'Patrones y Tendencias', description: 'Insights organizacionales' },
    { value: 'risks', label: 'Análisis de Riesgos', description: 'Identificación de riesgos' }
  ];

  const reportHistory = [
    { id: '1', type: 'Reporte Completo', date: '2024-01-15', status: 'completed', format: 'PDF' },
    { id: '2', type: 'Comparativa de Equipos', date: '2024-01-10', status: 'completed', format: 'Excel' },
    { id: '3', type: 'Análisis de Riesgos', date: '2024-01-08', status: 'completed', format: 'PDF' },
    { id: '4', type: 'Patrones y Tendencias', date: '2024-01-05', status: 'scheduled', format: 'PDF' }
  ];

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setGeneratingReport(true);
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Reporte generado exitosamente",
        description: `Reporte ${selectedReportType} en formato ${format.toUpperCase()} está listo para descargar`
      });
      
      // Aquí se implementaría la descarga real del archivo
      console.log(`Generating ${selectedReportType} report in ${format} format`);
      
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "Inténtalo de nuevo más tarde",
        variant: "destructive"
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleScheduleReport = () => {
    toast({
      title: "Reporte programado",
      description: `Reporte ${selectedReportType} programado para generarse ${selectedPeriod}`
    });
  };

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores HR pueden acceder a esta funcionalidad.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Análisis Organizacional Básico</h1>
        <Badge variant="outline">HR Admin</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="teams">Comparativa Equipos</TabsTrigger>
          <TabsTrigger value="patterns">Patrones Globales</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="privacy">Control de Privacidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  Distribuidos en 8 áreas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgo Global</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Personas en riesgo de rotación
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa entre Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Ventas</h4>
                    <p className="text-sm text-muted-foreground">15 personas • Manager: Ana García</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 85%</Badge>
                    <Badge variant="outline">Productividad: 92%</Badge>
                    <Badge className="bg-green-100 text-green-800">Bajo Riesgo</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Desarrollo</h4>
                    <p className="text-sm text-muted-foreground">22 personas • Manager: Carlos López</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 72%</Badge>
                    <Badge variant="outline">Productividad: 88%</Badge>
                    <Badge className="bg-amber-100 text-amber-800">Riesgo Medio</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Soporte</h4>
                    <p className="text-sm text-muted-foreground">8 personas • Manager: María Rodríguez</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 91%</Badge>
                    <Badge variant="outline">Productividad: 87%</Badge>
                    <Badge className="bg-green-100 text-green-800">Bajo Riesgo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrones Organizacionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700">Tendencia Positiva</h4>
                <p className="text-sm">Los equipos con trabajo flexible muestran 15% mayor retención</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-amber-700">Área de Atención</h4>
                <p className="text-sm">El área de IT tiene 23% mayor rotación que el promedio organizacional</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700">Oportunidad</h4>
                <p className="text-sm">Managers con feedback 360° regular tienen equipos 18% más productivos</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-700">Riesgo Identificado</h4>
                <p className="text-sm">5 equipos muestran signos tempranos de burnout colectivo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generador de Reportes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generar Nuevo Reporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Reporte</label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleGenerateReport('pdf')}
                    disabled={generatingReport}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generatingReport ? 'Generando...' : 'Generar PDF'}
                  </Button>
                  <Button 
                    onClick={() => handleGenerateReport('excel')}
                    disabled={generatingReport}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Programar Reporte Automático</label>
                    <div className="flex gap-2">
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleScheduleReport} variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Programar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial de Reportes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de Reportes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportHistory.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.type}</p>
                        <p className="text-sm text-muted-foreground">{report.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={report.status === 'completed' ? 'default' : 'outline'}
                          className={report.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {report.status === 'completed' ? 'Completado' : 'Programado'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.format}
                        </Badge>
                        {report.status === 'completed' && (
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuración Avanzada de Reportes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración Avanzada de Reportes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Distribución Automática</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Envío por email a directivos</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notificaciones Slack</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dashboard ejecutivo automático</span>
                      <Badge variant="outline">Inactivo</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Métricas Incluidas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Análisis de bienestar</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Incluido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Métricas de productividad</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Incluido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Predicciones de rotación</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">Beta</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Los reportes se envían automáticamente cada {selectedPeriod === 'weekly' ? 'lunes' : selectedPeriod === 'monthly' ? '1er día del mes' : 'inicio de trimestre'} a las 8:00 AM a los destinatarios configurados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Los datos personales y sensibles están agregados para proteger la privacidad individual.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Mostrar nombres en análisis de riesgo</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">Deshabilitado</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Acceso a datos de salarios por managers</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">Restringido</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Comparativas cross-equipo anónimas</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Habilitado</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Exportación de datos agregados</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Solo HR Admin</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HROperationsHub;