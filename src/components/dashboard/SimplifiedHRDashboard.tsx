import { useState } from 'react';
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
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BurnoutPredictionPanel } from '@/components/analytics/BurnoutPredictionPanel';
import { EnhancedAlertsCenter } from '@/components/alerts/EnhancedAlertsCenter';

/**
 * Dashboard HR simplificado con enfoque en lo esencial
 * 3 pestañas: Urgente, Resumen, Análisis
 */
export const SimplifiedHRDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('urgente');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard HR</h1>
          <p className="text-muted-foreground">Panel de control simplificado</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Brain className="h-4 w-4" />
          Pregunta al Asistente IA
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="urgente" className="flex flex-col items-center gap-1 py-3">
            <AlertTriangle className="h-5 w-5" />
            <span>🚨 Urgente</span>
            <Badge variant="destructive" className="mt-1">3</Badge>
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
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              Tienes <strong>3 alertas críticas</strong> que requieren atención inmediata
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Carlos López - Riesgo de Burnout</CardTitle>
                      <p className="text-sm text-muted-foreground">Desarrollo • Hace 2 horas</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Burnout risk: <strong>87%</strong> • 5 check-ins consecutivos con estrés alto • 
                  12h promedio de trabajo diario (últimos 7 días)
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Clock className="h-3 w-3 mr-2" />
                    Programar 1-on-1
                  </Button>
                  <Button size="sm" variant="outline">Ver detalles</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Equipo Marketing - Sobrecarga</CardTitle>
                      <p className="text-sm text-muted-foreground">8 miembros • Hace 5 horas</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Alto</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Bienestar del equipo: <strong>2.8/5</strong> • 60% reporta sobrecarga de trabajo • 
                  Reuniones promedio: 6.5h/día
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Target className="h-3 w-3 mr-2" />
                    Hablar con Manager
                  </Button>
                  <Button size="sm" variant="outline">Ver equipo</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Riesgo de Turnover Aumentando</CardTitle>
                      <p className="text-sm text-muted-foreground">Toda la empresa • Hace 1 día</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Alto</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Predicción IA: <strong>23% probabilidad turnover</strong> próximos 90 días • 
                  +15% vs mes anterior • 7 empleados en riesgo
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Brain className="h-3 w-3 mr-2" />
                    Ver análisis IA
                  </Button>
                  <Button size="sm" variant="outline">Estrategias</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button className="w-full" variant="outline">
            Ver todas las alertas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
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
          <div className="grid gap-6">
            <BurnoutPredictionPanel />
            <EnhancedAlertsCenter />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
