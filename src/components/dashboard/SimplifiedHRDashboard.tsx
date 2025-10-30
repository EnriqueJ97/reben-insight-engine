import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Heart,
  Activity,
  Brain,
  ArrowRight,
  Clock,
  Target,
  BarChart3,
  Zap,
  TrendingDown,
  DollarSign,
  Calendar,
  Award,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BurnoutPredictionPanel } from '@/components/analytics/BurnoutPredictionPanel';
import AttritionPredictionPanel from '@/components/analytics/AttritionPredictionPanel';
import { REBENScoresDashboard } from '@/components/analytics/REBENScoresDashboard';
import { PlaybookRecommendations } from '@/components/analytics/PlaybookRecommendations';
import { useAlerts } from '@/hooks/useAlerts';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * Dashboard HR simplificado con enfoque en lo esencial
 * 3 pestañas: Urgente, Resumen, Análisis
 */
export const SimplifiedHRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const { alerts, loading: alertsLoading } = useAlerts();
  
  // Filtrar alertas críticas (no resueltas y severity 'high')
  const criticalAlerts = alerts?.filter(a => 
    !a.resolved && a.severity === 'high'
  ) || [];
  
  const urgentCount = criticalAlerts.length;

  // Data para gráficos
  const trendData = [
    { mes: 'Ene', bienestar: 3.5, participacion: 72, riesgo: 18 },
    { mes: 'Feb', bienestar: 3.6, participacion: 75, riesgo: 16 },
    { mes: 'Mar', bienestar: 3.7, participacion: 81, riesgo: 15 },
    { mes: 'Abr', bienestar: 3.8, participacion: 87, riesgo: 12 },
  ];

  const departmentData = [
    { name: 'Ingeniería', empleados: 45, enRiesgo: 5, bienestar: 3.9 },
    { name: 'Producto', empleados: 28, enRiesgo: 3, bienestar: 4.1 },
    { name: 'Ventas', empleados: 32, enRiesgo: 2, bienestar: 4.0 },
    { name: 'Marketing', empleados: 18, enRiesgo: 1, bienestar: 3.8 },
    { name: 'Operaciones', empleados: 27, enRiesgo: 1, bienestar: 3.7 },
  ];

  const riskDistribution = [
    { name: 'Muy Bajo', value: 102, color: 'hsl(var(--success))' },
    { name: 'Bajo', value: 36, color: 'hsl(var(--info))' },
    { name: 'Moderado', value: 9, color: 'hsl(var(--warning))' },
    { name: 'Alto', value: 3, color: 'hsl(var(--destructive))' },
  ];

  const COLORS = ['hsl(var(--success))', 'hsl(var(--info))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard HR</h1>
          <p className="text-muted-foreground">Panel de control simplificado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard/alerts')}>
            <AlertTriangle className="h-4 w-4" />
            Ver Alertas
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/dashboard/hr-chat')}>
            <Brain className="h-4 w-4" />
            Asistente IA
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="urgente" className="flex flex-col items-center gap-1 py-3">
            <AlertTriangle className="h-5 w-5" />
            <span>🚨 Urgente</span>
            {urgentCount > 0 && (
              <Badge variant="destructive" className="mt-1">{urgentCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resumen" className="flex flex-col items-center gap-1 py-3">
            <Activity className="h-5 w-5" />
            <span>📊 Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="analisis" className="flex flex-col items-center gap-1 py-3">
            <TrendingUp className="h-5 w-5" />
            <span>🔍 Análisis</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña URGENTE */}
        <TabsContent value="urgente" className="space-y-6">
          {alertsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : urgentCount > 0 ? (
            <>
              <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  Tienes <strong>{urgentCount} alertas críticas</strong> que requieren atención inmediata
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {criticalAlerts.slice(0, 5).map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-destructive">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{alert.type}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {new Date(alert.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive">Alta</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{alert.message}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => navigate('/dashboard/alerts')}>
                          Ver detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full" variant="outline" onClick={() => navigate('/dashboard/alerts')}>
                Ver todas las alertas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-green-500/10 rounded-full">
                    <Zap className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">¡Todo bajo control!</h3>
                    <p className="text-muted-foreground">No hay alertas críticas en este momento</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/dashboard/alerts')}>
                    Ver historial de alertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña RESUMEN */}
        <TabsContent value="resumen" className="space-y-6">
          {/* Métricas principales - Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-l-4 border-l-primary">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bienestar Promedio
                  </CardTitle>
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold">3.8</div>
                    <div className="text-sm text-muted-foreground">/ 5.0</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'hsl(var(--success))' }}>
                    <TrendingUp className="h-4 w-4" />
                    <span>+8% vs mes anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-destructive">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Empleados en Riesgo
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold">12</div>
                    <div className="text-sm text-muted-foreground">/ 150 (8%)</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'hsl(var(--success))' }}>
                    <TrendingDown className="h-4 w-4" />
                    <span>-3 vs semana anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-accent">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Participación Check-ins
                  </CardTitle>
                  <UserCheck className="h-5 w-5 text-accent" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold">87%</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'hsl(var(--success))' }}>
                    <TrendingUp className="h-4 w-4" />
                    <span>+5% última semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-l-4 border-l-warning">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full -mr-16 -mt-16" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ahorro Estimado
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold">€42K</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    en costes de rotación evitados
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tendencia temporal */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Evolución Últimos 4 Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorBienestar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="bienestar" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorBienestar)"
                      name="Bienestar"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="participacion" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="Participación %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución de riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Distribución de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Análisis por departamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Vista por Departamento
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/teams')}>
                  Ver detalles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="empleados" fill="hsl(var(--accent))" name="Total Empleados" />
                  <Bar dataKey="enRiesgo" fill="hsl(var(--destructive))" name="En Riesgo" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights y acciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-warning">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Top 5 Factores de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Sobrecarga de reuniones', value: 32, trend: '+5%' },
                  { label: 'Trabajo fuera de horario', value: 28, trend: '+3%' },
                  { label: 'Falta de reconocimiento', value: 18, trend: '→' },
                  { label: 'Dispersión de tareas', value: 15, trend: '-2%' },
                  { label: 'Tensión con deadline', value: 12, trend: '+8%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${item.value}%`,
                            backgroundColor: item.value > 25 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <Badge variant={item.value > 25 ? "destructive" : "secondary"}>
                        {item.value}%
                      </Badge>
                      <span className="text-xs text-muted-foreground w-10">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Recomendaciones Prioritarias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    title: 'No-Meeting Fridays',
                    desc: 'Reducirá sobrecarga en 12 personas',
                    impact: 'Alto',
                    icon: Calendar
                  },
                  {
                    title: 'Programa de reconocimiento',
                    desc: 'Impacta a 8 personas en riesgo',
                    impact: 'Medio',
                    icon: Award
                  },
                  {
                    title: 'Límites after-hours',
                    desc: 'Aplicar política para 15 empleados',
                    impact: 'Alto',
                    icon: Clock
                  },
                ].map((reco, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <reco.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{reco.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{reco.desc}</div>
                    </div>
                    <Badge variant={reco.impact === 'Alto' ? 'default' : 'secondary'}>
                      {reco.impact}
                    </Badge>
                  </div>
                ))}
                <Button className="w-full mt-2" onClick={() => setActiveTab('analisis')}>
                  Ver Todos los Playbooks
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña ANÁLISIS */}
        <TabsContent value="analisis" className="space-y-6">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Sistema REBEN Impact Engine: análisis combinado (activo + pasivo) con scoring transparente y recomendaciones accionables
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* REBEN Scores Dashboard */}
            <REBENScoresDashboard />

            {/* Playbook Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recomendaciones Accionables</CardTitle>
                  <Button variant="outline" size="sm">
                    Ver Todos los Playbooks
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PlaybookRecommendations />
              </CardContent>
            </Card>

            {/* Predicción de Burnout */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle>Predicción de Burnout</CardTitle>
                      <p className="text-sm text-muted-foreground">Análisis predictivo 30-60 días anticipados</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Detalles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <BurnoutPredictionPanel />
              </CardContent>
            </Card>

            {/* Predicción de Rotación */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle>Riesgo de Rotación</CardTitle>
                      <p className="text-sm text-muted-foreground">Identificación temprana con impacto económico</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver análisis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AttritionPredictionPanel />
              </CardContent>
            </Card>

            {/* Acceso rápido a reportes completos */}
            <Card className="bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">¿Necesitas análisis CSRD/ESRS?</h3>
                    <p className="text-sm text-muted-foreground">Exporta KPIs sociales y genera reportes de cumplimiento</p>
                  </div>
                  <Button onClick={() => navigate('/dashboard/reports')}>
                    Ver Reportes Completos
                    <ArrowRight className="h-4 w-4 ml-2" />
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
