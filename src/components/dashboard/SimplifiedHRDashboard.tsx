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
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BurnoutPredictionPanel } from '@/components/analytics/BurnoutPredictionPanel';
import AttritionPredictionPanel from '@/components/analytics/AttritionPredictionPanel';
import { useAlerts } from '@/hooks/useAlerts';

/**
 * Dashboard HR simplificado con enfoque en lo esencial
 * 3 pestañas: Urgente, Resumen, Análisis
 */
export const SimplifiedHRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('urgente');
  const { alerts, loading: alertsLoading } = useAlerts();
  
  // Filtrar alertas críticas (no resueltas y severity 'high')
  const criticalAlerts = alerts?.filter(a => 
    !a.resolved && a.severity === 'high'
  ) || [];
  
  const urgentCount = criticalAlerts.length;

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bienestar Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-3xl font-bold">3.8</div>
                    <div className="text-xs text-muted-foreground">de 5.0</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  ↗ +0.3 vs mes anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Empleados en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div>
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-xs text-muted-foreground">de 150</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-orange-600">
                  ⚠ 3 críticos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Participación Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-3xl font-bold">87%</div>
                    <div className="text-xs text-muted-foreground">últimos 7 días</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  ↗ +5% vs semana anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alertas Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <div>
                    <div className="text-3xl font-bold">23</div>
                    <div className="text-xs text-muted-foreground">sin resolver</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-destructive">
                  ⚠ Atención requerida
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Bienestar (Últimos 30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Gráfico de tendencias aquí</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 3 Factores de Riesgo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sobrecarga de trabajo</span>
                  <Badge variant="destructive">32%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reuniones excesivas</span>
                  <Badge variant="destructive">28%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Falta de reconocimiento</span>
                  <Badge className="bg-orange-500">18%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recomendaciones IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5" />
                  <span>Implementar "No-Meeting Fridays" para reducir sobrecarga</span>
                </div>
                <div className="text-sm flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5" />
                  <span>Programa de reconocimiento para empleados destacados</span>
                </div>
                <div className="text-sm flex items-start gap-2">
                  <Brain className="h-4 w-4 text-primary mt-0.5" />
                  <span>Capacitación en gestión de tiempo para managers</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña ANÁLISIS */}
        <TabsContent value="analisis" className="space-y-6">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Análisis predictivo con IA para anticipar riesgos y tomar decisiones basadas en datos
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
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
                      <p className="text-sm text-muted-foreground">Análisis de riesgo con machine learning</p>
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
                      <p className="text-sm text-muted-foreground">Identificación temprana de empleados en riesgo</p>
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
                    <h3 className="font-semibold mb-1">¿Necesitas más análisis?</h3>
                    <p className="text-sm text-muted-foreground">Accede a reportes completos con insights avanzados</p>
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
