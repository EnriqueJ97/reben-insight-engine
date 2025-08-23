import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EnhancedTrendChart } from '@/components/ui/enhanced-trend-chart';
import { 
  BarChart3,
  Users,
  Target,
  MessageSquare,
  BookOpen,
  Award,
  TrendingUp,
  Settings,
  Zap,
  Calendar,
  AlertTriangle,
  Brain,
  RefreshCw,
  Filter,
  Download,
  Share2,
  Bell,
  Slack,
  Mail,
  Star,
  Trophy,
  Gift,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdvancedManagerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Exportando reporte",
      description: `Generando ${reportType} en formato PDF...`,
    });
  };

  const handleSendAlert = (channel: string, message: string) => {
    toast({
      title: "Alerta enviada",
      description: `Notificación enviada via ${channel}`,
    });
  };

  const handleGiveRecognition = (employeeId: string, type: string) => {
    toast({
      title: "Reconocimiento otorgado",
      description: "El empleado ha sido notificado del reconocimiento",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <span>REBEN Manager Pro</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Suite avanzada de gestión de equipos y bienestar organizacional
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold">
              ⭐ Herramienta de Referencia HR
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Miembros del Equipo</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-success">87%</div>
            <div className="text-sm text-muted-foreground">Bienestar Promedio</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-warning">3</div>
            <div className="text-sm text-muted-foreground">Alertas Activas</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-info">23%</div>
            <div className="text-sm text-muted-foreground">↓ Riesgo Rotación</div>
          </div>
        </div>
      </div>

      {/* Navegación Avanzada */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-8 h-12">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span className="hidden md:inline">360º</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="recognition" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span className="hidden md:inline">Recognition</span>
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">Prediction</span>
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Workload</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        {/* Analytics y Reporting Avanzado */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analytics & Reporting Avanzado</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('comprehensive')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dashboards Personalizables */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Dashboard Personalizable</CardTitle>
                <CardDescription>Arrastra widgets para personalizar tu vista</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 transition-colors cursor-pointer">
                    <PieChart className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold">Distribución de Bienestar</h4>
                    <p className="text-sm text-muted-foreground">Por equipos y departamentos</p>
                  </div>
                  <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 transition-colors cursor-pointer">
                    <LineChart className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold">Tendencias Temporales</h4>
                    <p className="text-sm text-muted-foreground">Evolución histórica</p>
                  </div>
                </div>
                
                <EnhancedTrendChart 
                  data={[
                    { date: '2024-01-01', wellness: 75, participation: 85, alerts: 2 },
                    { date: '2024-01-08', wellness: 78, participation: 88, alerts: 1 },
                    { date: '2024-01-15', wellness: 82, participation: 90, alerts: 1 },
                    { date: '2024-01-22', wellness: 85, participation: 92, alerts: 0 }
                  ]} 
                  height={200} 
                />
              </CardContent>
            </Card>

            {/* Reportes Automáticos */}
            <Card>
              <CardHeader>
                <CardTitle>Reportes Automáticos</CardTitle>
                <CardDescription>Configurados y programados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 1,
                    name: 'Reporte Semanal de Bienestar',
                    type: 'wellness',
                    schedule: 'weekly',
                    lastGenerated: new Date()
                  },
                  {
                    id: 2,
                    name: 'Análisis de Rotación Mensual',
                    type: 'turnover',
                    schedule: 'monthly', 
                    lastGenerated: new Date()
                  }
                ].map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{report.name}</h4>
                      <Badge>{report.schedule}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Último: {report.lastGenerated.toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Compartir
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Comparativas y Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Interno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">vs. Promedio Empresa</span>
                      <span className="text-sm font-semibold text-success">+12%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">vs. Mejor Equipo</span>
                      <span className="text-sm font-semibold text-warning">-5%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benchmark Sectorial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">vs. Industria Tech</span>
                      <span className="text-sm font-semibold text-success">+8%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">vs. Top Performers</span>
                      <span className="text-sm font-semibold text-info">-2%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia Histórica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">+15%</div>
                  <p className="text-sm text-muted-foreground">Mejora últimos 6 meses</p>
                  <Badge className="mt-2 bg-success/20 text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Tendencia positiva
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance & 360º Feedback */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gestión del Desempeño & Feedback 360º</h2>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlación Bienestar-Rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Correlación Bienestar-Rendimiento</CardTitle>
                <CardDescription>Análisis de correlaciones en tu equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Correlación Positiva Fuerte</h4>
                      <p className="text-sm text-muted-foreground">R² = 0.78</p>
                    </div>
                    <div className="text-3xl font-bold text-success">78%</div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Empleados con bienestar mayor a 80% tienen 23% más productividad</p>
                    <p>• Reducción de 45% en errores cuando bienestar mayor a 70%</p>
                    <p>• 2.3x más probabilidad de promoción interna</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback 360º */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback 360º Activos</CardTitle>
                <CardDescription>Evaluaciones en curso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Ana García',
                      feedback360: {
                        peers: 4.1,
                        subordinates: 4.3,
                        manager: 4.0
                      }
                    }
                  ].map((employee, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{employee.name}</h4>
                        <Badge className="bg-info/20 text-info">En progreso</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Pares:</span>
                          <div className="font-semibold">{employee.feedback360.peers}/5</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Equipo:</span>
                          <div className="font-semibold">{employee.feedback360.subordinates}/5</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Manager:</span>
                          <div className="font-semibold">{employee.feedback360.manager}/5</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* OKRs y Objetivos */}
          <Card>
            <CardHeader>
              <CardTitle>OKRs y Objetivos del Equipo</CardTitle>
              <CardDescription>Seguimiento de objetivos y resultados clave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { title: 'Aumentar productividad del equipo', progress: 75, target: 'Q1 2025' },
                  { title: 'Mejorar satisfacción cliente', progress: 60, target: 'Q2 2025' }
                ].map((okr, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{okr.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{okr.target}</span>
                        <Badge variant={okr.progress >= 75 ? 'default' : 'secondary'}>
                          {okr.progress}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={okr.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integraciones */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Integraciones & Comunicación</h2>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Nueva Integración
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slack Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Slack className="h-5 w-5" />
                  <span>Slack</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-success">Conectado</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• 12 alertas enviadas</p>
                    <p>• Canal: #team-wellness</p>
                    <p>• Auto-recordatorios activos</p>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleSendAlert('Slack', 'Test message')}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Enviar Alerta Test
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teams Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Microsoft Teams</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted-foreground">No conectado</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Envío de alertas automático</p>
                    <p>• Integración con calendario</p>
                    <p>• Notificaciones de equipo</p>
                  </div>
                  <Button size="sm" className="w-full">
                    Conectar Teams
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-success">Activo</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• 5 emails enviados</p>
                    <p>• Reportes semanales</p>
                    <p>• Alertas críticas</p>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSendAlert('Email', 'Weekly report')}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Enviar Reporte
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-3 w-3 mr-1" />
                      Config Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Biblioteca de Recursos */}
        <TabsContent value="resources" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Biblioteca de Recursos para Managers</h2>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Solicitar Recurso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Guías de Actuación */}
            <Card>
              <CardHeader>
                <CardTitle>Guías de Actuación</CardTitle>
                <CardDescription>Protocolos paso a paso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Empleado con Alto Riesgo', urgency: 'high', time: '5 min' },
                  { title: 'Conflicto entre Compañeros', urgency: 'medium', time: '10 min' },
                  { title: 'Baja Motivación del Equipo', urgency: 'medium', time: '8 min' },
                  { title: 'Comunicación Difícil', urgency: 'low', time: '6 min' }
                ].map((guide, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer">
                    <div>
                      <h4 className="text-sm font-medium">{guide.title}</h4>
                      <p className="text-xs text-muted-foreground">Lectura: {guide.time}</p>
                    </div>
                    <Badge variant={guide.urgency === 'high' ? 'destructive' : guide.urgency === 'medium' ? 'default' : 'secondary'}>
                      {guide.urgency === 'high' ? 'Crítico' : guide.urgency === 'medium' ? 'Importante' : 'Opcional'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Formación en Liderazgo */}
            <Card>
              <CardHeader>
                <CardTitle>Formación en Liderazgo</CardTitle>
                <CardDescription>Módulos de desarrollo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Liderazgo Empático', progress: 80, duration: '2h' },
                  { title: 'Comunicación Efectiva', progress: 60, duration: '1.5h' },
                  { title: 'Gestión del Cambio', progress: 30, duration: '3h' },
                  { title: 'Coaching de Equipos', progress: 0, duration: '2.5h' }
                ].map((course, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{course.title}</h4>
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    </div>
                    <Progress value={course.progress} className="h-1 mb-1" />
                    <div className="text-xs text-muted-foreground">{course.progress}% completado</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recursos de Salud Mental */}
            <Card>
              <CardHeader>
                <CardTitle>Salud Mental</CardTitle>
                <CardDescription>Apoyo y herramientas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Señales de Alerta Temprana', type: 'guide', access: 'free' },
                  { title: 'Conversaciones Difíciles', type: 'video', access: 'premium' },
                  { title: 'Red de Apoyo Profesional', type: 'contacts', access: 'emergency' },
                  { title: 'Técnicas de Descalada', type: 'workshop', access: 'premium' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer">
                    <div>
                      <h4 className="text-sm font-medium">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                    </div>
                    <Badge variant={resource.access === 'emergency' ? 'destructive' : resource.access === 'premium' ? 'default' : 'secondary'}>
                      {resource.access}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones Proactivas */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones Proactivas</CardTitle>
              <CardDescription>Basadas en las alertas actuales de tu equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                    <div>
                      <h4 className="font-semibold text-warning mb-2">Sobrecarga Detectada</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Carlos López muestra signos de sobrecarga laboral.
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs">📖 Guía recomendada: "Redistribución de Carga"</p>
                        <p className="text-xs">🎯 Acción: Programar 1:1 esta semana</p>
                        <p className="text-xs">📞 Contacto: Equipo de Bienestar disponible</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-info mt-1" />
                    <div>
                      <h4 className="font-semibold text-info mb-2">Oportunidad de Mejora</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        El equipo muestra alta participación. Momento ideal para nuevos desafíos.
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs">🎯 Sugerencia: Implementar OKRs trimestrales</p>
                        <p className="text-xs">📈 Recurso: "Gestión por Objetivos Avanzada"</p>
                        <p className="text-xs">🏆 Meta: Aumentar engagement 15%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema de Reconocimiento */}
        <TabsContent value="recognition" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sistema de Reconocimiento</h2>
            <Button onClick={() => handleGiveRecognition('emp-1', 'excellence')}>
              <Gift className="h-4 w-4 mr-2" />
              Dar Reconocimiento
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Herramientas de Reconocimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Herramientas de Reconocimiento</CardTitle>
                <CardDescription>Recompensas y mensajes personalizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: 'Excelencia', icon: Trophy, color: 'text-yellow-500', points: 100 },
                    { type: 'Colaboración', icon: Users, color: 'text-blue-500', points: 75 },
                    { type: 'Innovación', icon: Brain, color: 'text-purple-500', points: 90 },
                    { type: 'Liderazgo', icon: Star, color: 'text-green-500', points: 85 }
                  ].map((recognition) => (
                    <div 
                      key={recognition.type} 
                      className="p-4 border-2 border-dashed hover:border-primary/60 rounded-lg cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <recognition.icon className={`h-8 w-8 ${recognition.color} mb-2`} />
                      <h4 className="font-semibold text-sm">{recognition.type}</h4>
                      <p className="text-xs text-muted-foreground">{recognition.points} puntos</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Tip del Sistema</h4>
                  <p className="text-sm text-muted-foreground">
                    Los reconocimientos públicos aumentan el engagement del equipo en un 23%. 
                    ¿Compartir en el canal de Slack?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Historial de Reconocimientos */}
            <Card>
              <CardHeader>
                <CardTitle>Reconocimientos Recientes</CardTitle>
                <CardDescription>Historial del último mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      employeeName: 'Ana García',
                      type: 'excellence',
                      description: 'Excelente trabajo en el proyecto Q4',
                      points: 100,
                      date: new Date()
                    },
                    {
                      id: 2,
                      employeeName: 'Carlos López',
                      type: 'collaboration',
                      description: 'Gran colaboración con equipo de ventas',
                      points: 75,
                      date: new Date()
                    }
                  ].map((recognition) => (
                    <div key={recognition.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {recognition.type === 'excellence' && <Trophy className="h-5 w-5 text-yellow-500" />}
                          {recognition.type === 'collaboration' && <Users className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{recognition.employeeName}</h4>
                          <p className="text-xs text-muted-foreground">{recognition.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {recognition.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary/20 text-primary">
                        +{recognition.points}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-success text-sm">Impact Positivo</h4>
                      <p className="text-xs text-muted-foreground">
                        +34% motivación del equipo este mes
                      </p>
                    </div>
                    <div className="text-2xl">📈</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predicción de Rotación */}
        <TabsContent value="prediction" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Predicción de Rotación & Plan de Sucesión</h2>
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              Actualizar Modelo
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empleados en Riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span>Empleados en Riesgo Alto</span>
                </CardTitle>
                <CardDescription>Probabilidad de rotación mayor a 60%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Carlos López', probability: 0.78, factors: ['Baja satisfacción', 'Sobrecarga'] },
                    { name: 'María Rodríguez', probability: 0.65, factors: ['Falta de crecimiento', 'Burnout'] }
                  ].map((employee, index) => (
                    <div key={index} className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{employee.name}</h4>
                        <Badge className="bg-destructive/20 text-destructive">
                          {Math.round(employee.probability * 100)}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-semibold">Factores de riesgo:</p>
                        {employee.factors.map((factor, factorIndex) => (
                          <p key={factorIndex} className="text-xs text-muted-foreground">• {factor}</p>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          Programar 1:1
                        </Button>
                        <Button size="sm" variant="outline">
                          Plan Retención
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predicciones del Modelo */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Predictivo</CardTitle>
                <CardDescription>Modelo ML actualizado semanalmente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">23%</div>
                    <p className="text-sm text-muted-foreground">Riesgo de rotación del equipo</p>
                    <Badge className="mt-2 bg-success/20 text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Mejorando (-5% vs mes pasado)
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Precisión del Modelo</span>
                        <span>94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Confianza Predicción</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Variables clave:</strong></p>
                      <p>• Bienestar promedio (peso: 32%)</p>
                      <p>• Días sin check-in (peso: 28%)</p>
                      <p>• Carga de trabajo (peso: 25%)</p>
                      <p>• Feedback 360º (peso: 15%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestión de Cargas */}
        <TabsContent value="workload" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gestión Inteligente de Cargas de Trabajo</h2>
            <Button>
              <Activity className="h-4 w-4 mr-2" />
              Optimizar Turnos
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monitor de Carga Actual */}
            <Card>
              <CardHeader>
                <CardTitle>Monitor de Carga en Tiempo Real</CardTitle>
                <CardDescription>Distribución actual de tareas y turnos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Ana García', workload: 95, status: 'Sobrecarga', hours: 45, tasks: 12 },
                    { name: 'Pedro Sánchez', workload: 78, status: 'Óptima', hours: 40, tasks: 8 },
                    { name: 'María López', workload: 85, status: 'Alta', hours: 42, tasks: 10 },
                    { name: 'Carlos Ruiz', workload: 65, status: 'Baja', hours: 35, tasks: 6 }
                  ].map((employee, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{employee.name}</h4>
                        <Badge className={
                          employee.workload > 90 ? 'bg-destructive/20 text-destructive' :
                          employee.workload > 80 ? 'bg-warning/20 text-warning' :
                          employee.workload > 70 ? 'bg-success/20 text-success' :
                          'bg-info/20 text-info'
                        }>
                          {employee.status}
                        </Badge>
                      </div>
                      <Progress value={employee.workload} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{employee.hours}h/semana</span>
                        <span>{employee.tasks} tareas</span>
                        <span>{employee.workload}% carga</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas de Equidad */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Equidad</CardTitle>
                <CardDescription>Prevención de desequilibrios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-destructive">Sobrecarga Crítica</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Ana García supera 90% de capacidad óptima
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Redistribuir Tareas
                          </Button>
                          <Button size="sm" variant="outline">
                            Ajustar Turnos
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Overview */}
        <TabsContent value="team" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Vista del Equipo</h2>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <div className="text-center p-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vista clásica del equipo disponible próximamente</p>
            <p className="text-sm">Mientras tanto, usa las pestañas avanzadas arriba</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedManagerDashboard;