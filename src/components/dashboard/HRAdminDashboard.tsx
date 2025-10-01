import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useProfiles } from '@/hooks/useProfiles';
import RiskScoreDashboard from './RiskScoreDashboard';
import { BurnoutPredictionPanel } from '@/components/analytics/BurnoutPredictionPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Settings,
  BarChart3,
  RefreshCw,
  Eye,
  Target,
  ArrowRight,
  Shield,
  Calendar,
  Award,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { WellnessMetrics } from '@/components/ui/wellness-metrics';

const HRAdminDashboard = () => {
  const { user } = useAuth();
  const { getAlertStats } = useAlerts();
  const { getTeamOverview } = useProfiles();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [organizationalData, setOrganizationalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [teamComparisons, setTeamComparisons] = useState<any[]>([]);
  const [globalTrends, setGlobalTrends] = useState<any>(null);

  useEffect(() => {
    loadHRAdminData();
  }, [user]);

  const loadHRAdminData = async () => {
    if (!user || user.role !== 'HR_ADMIN') return;
    
    setLoading(true);
    try {
      const [alertStats, orgData] = await Promise.all([
        getAlertStats(),
        getTeamOverview()
      ]);

      setOrganizationalData(orgData);
      await loadOrganizationalMetrics(alertStats, orgData);
      await loadTeamComparisons();
      await loadGlobalTrends();
    } catch (error) {
      console.error('Error loading HR Admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationalMetrics = async (alertStats: any, orgData: any) => {
    const totalEmployees = 234; // This would come from actual data
    const activeTeams = 15;
    const avgWellness = orgData?.averageTeamMood ? 
      Math.round((orgData.averageTeamMood / 5) * 100) : 78;
    const riskLevel = alertStats.bySeverity?.high || 0;

    setMetrics([
      { 
        title: 'Empleados Activos', 
        value: totalEmployees, 
        trend: 'up',
        status: 'good',
        description: `+12 vs mes anterior`,
        icon: Users,
        changePercent: '+5.4%'
      },
      { 
        title: 'Bienestar Organizacional', 
        value: avgWellness, 
        trend: avgWellness >= 75 ? 'up' : avgWellness >= 65 ? 'stable' : 'down',
        status: avgWellness >= 75 ? 'good' : avgWellness >= 65 ? 'warning' : 'critical',
        description: `Promedio global`,
        icon: Award,
        changePercent: avgWellness >= 75 ? '+2.1%' : '-1.3%'
      },
      { 
        title: 'Alertas Críticas Globales', 
        value: riskLevel, 
        trend: riskLevel <= 5 ? 'down' : 'up',
        status: riskLevel === 0 ? 'good' : riskLevel <= 10 ? 'warning' : 'critical',
        description: 'Requieren intervención',
        icon: AlertTriangle,
        changePercent: riskLevel <= 5 ? '-8.2%' : '+12.5%'
      },
      { 
        title: 'Equipos Activos', 
        value: activeTeams, 
        trend: 'up',
        status: 'good',
        description: 'Equipos colaborando',
        icon: Building,
        changePercent: '+8.1%'
      }
    ]);
  };

  const loadTeamComparisons = async () => {
    // Mock data for team comparisons
    setTeamComparisons([
      { 
        team: 'Ventas', 
        members: 18, 
        wellness: 89, 
        retention: 95, 
        productivity: 112, 
        status: 'excellent',
        manager: 'Ana García'
      },
      { 
        team: 'Desarrollo', 
        members: 24, 
        wellness: 82, 
        retention: 88, 
        productivity: 98, 
        status: 'good',
        manager: 'Carlos López'
      },
      { 
        team: 'Marketing', 
        members: 12, 
        wellness: 76, 
        retention: 85, 
        productivity: 89, 
        status: 'attention',
        manager: 'María Rodríguez'
      },
      { 
        team: 'Soporte', 
        members: 8, 
        wellness: 71, 
        retention: 79, 
        productivity: 82, 
        status: 'needs_improvement',
        manager: 'José Martín'
      }
    ]);
  };

  const loadGlobalTrends = async () => {
    setGlobalTrends({
      wellnessTrend: [78, 76, 79, 81, 78, 82, 85],
      retentionTrend: [89, 87, 91, 88, 90, 92, 89],
      engagementTrend: [82, 85, 81, 84, 87, 86, 88]
    });
  };

  const handleRefreshData = async () => {
    setLastRefresh(new Date());
    await loadHRAdminData();
    toast({
      title: "Datos actualizados",
      description: "Dashboard organizacional actualizado correctamente.",
    });
  };

  const getStrategicActions = () => [
    { 
      label: 'Configurar Políticas', 
      href: '/dashboard/settings', 
      icon: Settings, 
      description: 'Gestionar políticas globales',
      priority: 'high'
    },
    { 
      label: 'Análisis Organizacional', 
      href: '/dashboard/operations/hr-analytics', 
      icon: BarChart3, 
      description: 'Insights y comparativas avanzadas'
    },
    { 
      label: 'Gestión de Equipos', 
      href: '/dashboard/teams/manage', 
      icon: Building, 
      description: 'Vista estratégica de equipos'
    },
    { 
      label: 'Reportes Ejecutivos', 
      href: '/dashboard/reports', 
      icon: TrendingUp, 
      description: 'Informes para dirección'
    }
  ];

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attention': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted-100 text-muted-800 border-muted-200';
    }
  };

  const getTeamStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4" />;
      case 'good': return <CheckCircle2 className="h-4 w-4" />;
      case 'attention': return <AlertTriangle className="h-4 w-4" />;
      case 'needs_improvement': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
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
      {/* Strategic Header */}
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-cyan-600/10 rounded-xl p-6 border border-blue-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <span>Dashboard Ejecutivo RRHH</span>
              <Badge className="bg-blue-100 text-blue-700 ml-3">HR ADMIN</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Visión estratégica y control organizacional completo
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

        {/* Executive KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-white/20">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-muted-foreground">Equipos Activos</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-white/20">
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-muted-foreground">Retención Global</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-white/20">
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <div className="text-sm text-muted-foreground">Bienestar Global</div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-white/20">
            <div className="text-2xl font-bold text-amber-600">12</div>
            <div className="text-sm text-muted-foreground">Alertas Globales</div>
          </div>
        </div>
      </div>

      {/* Organizational Metrics */}
      <WellnessMetrics metrics={metrics} />

      <Tabs defaultValue="reben" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reben">Risk Score</TabsTrigger>
          <TabsTrigger value="prediction">🧠 Predicción IA</TabsTrigger>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="teams">Comparativa Equipos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias Globales</TabsTrigger>
        </TabsList>

        <TabsContent value="reben" className="space-y-6">
          <RiskScoreDashboard userRole="HR_ADMIN" />
        </TabsContent>

        <TabsContent value="prediction" className="space-y-6">
          <BurnoutPredictionPanel analysisType="team" />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Acciones Estratégicas</span>
                </CardTitle>
                <CardDescription>
                  Herramientas de configuración y análisis organizacional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStrategicActions().map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Button 
                        variant="outline"
                        className="w-full h-auto p-4 justify-start hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <action.icon className="h-5 w-5 mr-3 text-blue-600" />
                        <div className="text-left flex-1">
                          <div className="font-medium flex items-center space-x-2">
                            <span>{action.label}</span>
                            {action.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                Prioridad
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-2 text-blue-600" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Organizational Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Salud Organizacional</span>
                </CardTitle>
                <CardDescription>
                  Estado general y áreas de mejora identificadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bienestar Global</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-20" />
                      <span className="text-sm font-medium text-green-600">78%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Retención Proyectada</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={89} className="w-20" />
                      <span className="text-sm font-medium text-blue-600">89%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Engagement</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm font-medium text-purple-600">85%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Estado: Saludable</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    La organización muestra indicadores positivos en todas las métricas clave.
                    Oportunidades identificadas en 2 equipos para optimización.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa entre Equipos</CardTitle>
              <CardDescription>
                Análisis agregado por equipo - Datos anonimizados cuando corresponda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamComparisons.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg">{team.team}</h4>
                        <Badge className={getTeamStatusColor(team.status)}>
                          {getTeamStatusIcon(team.status)}
                          {team.status === 'excellent' ? 'Excelente' :
                           team.status === 'good' ? 'Bueno' :
                           team.status === 'attention' ? 'Atención' : 'Mejora Requerida'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {team.members} personas • Manager: {team.manager}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Bienestar</div>
                        <div className={`text-lg font-bold ${
                          team.wellness >= 85 ? 'text-green-600' :
                          team.wellness >= 75 ? 'text-blue-600' :
                          team.wellness >= 65 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {team.wellness}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Retención</div>
                        <div className={`text-lg font-bold ${
                          team.retention >= 90 ? 'text-green-600' :
                          team.retention >= 80 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {team.retention}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Productividad</div>
                        <div className={`text-lg font-bold ${
                          team.productivity >= 100 ? 'text-green-600' :
                          team.productivity >= 90 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {team.productivity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Organizacionales</CardTitle>
              <CardDescription>
                Evolución histórica de métricas clave - Últimos 7 períodos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-700">Tendencia Positiva</h3>
                  <p className="text-sm text-muted-foreground">
                    Bienestar organizacional ha mejorado 12% en los últimos 3 meses
                  </p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-700">Retención Estable</h3>
                  <p className="text-sm text-muted-foreground">
                    89% de retención global, +2% vs objetivo anual
                  </p>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-700">Engagement Alto</h3>
                  <p className="text-sm text-muted-foreground">
                    85% engagement promedio, benchmark top 10% sectorial
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Recomendaciones Estratégicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Escalar Mejores Prácticas</h4>
                  <p className="text-sm">Replicar modelo del equipo Ventas (89% bienestar) en otros departamentos</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">Inversión en Bienestar</h4>
                  <p className="text-sm">ROI actual 185K€. Proyección 240K€ con expansión programa</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-700">Certificación Bienestar</h4>
                  <p className="text-sm">Métricas califican para Great Place to Work certification</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-700">Áreas de Mejora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-amber-700">Equipo Soporte</h4>
                  <p className="text-sm">71% bienestar - Plan de mejora dirigido requerido</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-700">Distribución Carga</h4>
                  <p className="text-sm">Desbalance detectado entre equipos - Revisar asignaciones</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700">Formación Managers</h4>
                  <p className="text-sm">2 managers requieren capacitación en gestión de bienestar</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRAdminDashboard;