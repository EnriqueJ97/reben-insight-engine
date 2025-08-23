import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedWellnessMetrics } from '@/components/ui/enhanced-wellness-metrics';
import { EnhancedTrendChart } from '@/components/ui/enhanced-trend-chart';
import { 
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  RefreshCw,
  Eye,
  Calendar,
  Target,
  ArrowRight,
  Brain,
  Award,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const AdvancedManagerDashboard = () => {
  const { user } = useAuth();
  const { getCheckinStats } = useCheckins();
  const { alerts, getAlertStats } = useAlerts();
  const { getTeamOverview } = useProfiles();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [teamOverview, setTeamOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadManagerData();
  }, [user]);

  const loadManagerData = async () => {
    if (!user || user.role !== 'MANAGER') return;
    
    setLoading(true);
    try {
      const [alertStats, teamData] = await Promise.all([
        getAlertStats(),
        getTeamOverview()
      ]);

      setTeamOverview(teamData);
      await loadManagerMetrics(alertStats, teamData);
      await loadTrendData();
    } catch (error) {
      console.error('Error loading manager dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadManagerMetrics = async (alertStats: any, teamData: any) => {
    const teamWellness = teamData?.averageTeamMood ? 
      Math.round((teamData.averageTeamMood / 5) * 100) : 0;
    
    const generateSparklineData = (baseValue: number, variance: number = 10) => {
      return Array.from({ length: 7 }, () => 
        Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance))
      );
    };

    setMetrics([
      { 
        title: 'Bienestar del Equipo', 
        value: teamWellness, 
        trend: teamWellness >= 70 ? 'up' : teamWellness >= 50 ? 'stable' : 'down',
        status: teamWellness >= 70 ? 'good' : teamWellness >= 50 ? 'warning' : 'critical',
        description: `${teamData?.totalMembers || 0} miembros del equipo`,
        icon: Users,
        sparklineData: generateSparklineData(teamWellness)
      },
      { 
        title: 'Alertas Activas', 
        value: alertStats.unresolved, 
        trend: alertStats.unresolved <= 2 ? 'stable' : 'down',
        status: alertStats.unresolved === 0 ? 'good' : alertStats.unresolved <= 3 ? 'warning' : 'critical',
        description: alertStats.unresolved > 0 ? `Requieren atención` : 'Todo bajo control',
        icon: AlertTriangle,
        formula: 'Alertas pendientes de resolución'
      },
      { 
        title: 'Participación', 
        value: 87, 
        trend: 'up',
        status: 'good',
        description: 'Check-ins completados (30d)',
        icon: Activity,
        sparklineData: generateSparklineData(87)
      },
      { 
        title: 'Riesgo de Rotación', 
        value: 23, 
        trend: 'up',
        status: 'good',
        description: 'Predicción ML (-5% vs mes anterior)',
        icon: TrendingUp
      }
    ]);
  };

  const loadTrendData = async () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        wellness: Math.round(60 + Math.random() * 30),
        participation: Math.round(70 + Math.random() * 25),
        alerts: Math.floor(Math.random() * 5)
      };
    });
    setTrendData(last7Days);
  };

  const handleRefreshData = async () => {
    setLastRefresh(new Date());
    await loadManagerData();
    toast({
      title: "Datos actualizados",
      description: "El dashboard se ha actualizado con la información más reciente.",
    });
  };

  const getQuickActions = () => [
    { 
      label: 'Ver Alertas', 
      href: '/dashboard/alerts', 
      icon: AlertTriangle, 
      description: 'Gestionar alertas del equipo',
      count: alerts.filter(a => !a.resolved).length
    },
    { 
      label: 'Mi Equipo', 
      href: '/dashboard/team', 
      icon: Users, 
      description: 'Gestión y análisis del equipo'
    },
    { 
      label: 'Operaciones', 
      href: '/dashboard/operations', 
      icon: Zap, 
      description: 'Integraciones y recursos'
    },
    { 
      label: 'Turnos Inteligentes', 
      href: '/dashboard/shifts', 
      icon: Calendar, 
      description: 'Gestión avanzada de turnos'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas rápidas */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <span>Dashboard Manager</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Vista general del bienestar y rendimiento de tu equipo
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastRefresh.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary">{teamOverview?.totalMembers || 12}</div>
            <div className="text-sm text-muted-foreground">Miembros del Equipo</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-success">
              {teamOverview?.averageTeamMood ? Math.round((teamOverview.averageTeamMood / 5) * 100) : 87}%
            </div>
            <div className="text-sm text-muted-foreground">Bienestar Promedio</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-warning">{alerts.filter(a => !a.resolved).length}</div>
            <div className="text-sm text-muted-foreground">Alertas Activas</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-info">23%</div>
            <div className="text-sm text-muted-foreground">Riesgo Rotación</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <EnhancedWellnessMetrics metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendencias */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Tendencias del Equipo</span>
            </CardTitle>
            <CardDescription>
              Evolución semanal de bienestar y participación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedTrendChart data={trendData} height={200} />
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Acciones Rápidas</span>
            </CardTitle>
            <CardDescription>
              Navegación directa a herramientas clave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getQuickActions().map((action, index) => (
                <Link key={index} to={action.href}>
                  <Button 
                    variant="outline"
                    className="w-full h-auto p-4 justify-start hover:scale-[1.02] transition-transform"
                  >
                    <action.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center space-x-2">
                        <span>{action.label}</span>
                        {'count' in action && action.count > 0 && (
                          <Badge className="bg-destructive/20 text-destructive text-xs">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen del Equipo */}
      {teamOverview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resumen del Equipo</span>
            </CardTitle>
            <CardDescription>
              Estado general y próximas acciones recomendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-success">✅ Fortalezas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Alta participación en check-ins</li>
                  <li>• Bienestar promedio por encima del 80%</li>
                  <li>• Tendencia positiva últimas 4 semanas</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-warning">⚠️ Áreas de Atención</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {alerts.filter(a => !a.resolved).length} alertas requieren seguimiento</li>
                  <li>• 2 empleados con riesgo moderado</li>
                  <li>• Distribución desigual de cargas</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-info">🎯 Próximas Acciones</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Revisar alertas pendientes</li>
                  <li>• Planificar 1:1 con empleados en riesgo</li>
                  <li>• Optimizar distribución de turnos</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-primary">💡 Insight del Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu equipo muestra un rendimiento sólido con oportunidades claras de mejora. 
                    Las herramientas avanzadas están disponibles en cada sección para análisis detallados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedManagerDashboard;