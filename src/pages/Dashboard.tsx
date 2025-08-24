import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { useProfiles } from '@/hooks/useProfiles';
import { WellnessOverview, WellnessMetrics } from '@/components/ui/wellness-metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, Users, AlertTriangle, Calendar, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AdvancedManagerDashboard from '@/components/dashboard/AdvancedManagerDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import HRAdminDashboard from '@/components/dashboard/HRAdminDashboard';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  // If user is a manager, show the advanced manager dashboard
  if (user?.role === 'MANAGER') {
    return <AdvancedManagerDashboard />;
  }

  // If user is HR_ADMIN, show the strategic HR dashboard
  if (user?.role === 'HR_ADMIN') {
    return <HRAdminDashboard />;
  }
  // If user is an employee, show the positive employee dashboard
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboard />;
  }
  const { alerts, getAlertStats } = useAlerts();
  const { getTeamOverview } = useProfiles();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamOverview, setTeamOverview] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.role === 'HR_ADMIN') {
        await loadHRMetrics();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHRMetrics = async () => {
    const [alertStats, teamData] = await Promise.all([
      getAlertStats(),
      getTeamOverview()
    ]);

    setTeamOverview(teamData);

    const overallWellness = teamData?.averageTeamMood ? Math.round((teamData.averageTeamMood / 5) * 100) : 0;
    const totalEmployees = teamData?.totalMembers || 0;

    setMetrics([
      { 
        title: 'Bienestar General', 
        value: overallWellness, 
        trend: 'stable',
        status: overallWellness >= 70 ? 'good' : overallWellness >= 50 ? 'warning' : 'critical',
        description: `${totalEmployees} empleados` 
      },
      { 
        title: 'Alertas Críticas', 
        value: alertStats.bySeverity?.high || 0, 
        trend: 'stable',
        status: (alertStats.bySeverity?.high || 0) === 0 ? 'good' : 'critical',
        description: 'Requieren acción inmediata' 
      },
      { 
        title: 'Riesgo de Rotación', 
        value: 15, 
        trend: 'down',
        status: 'good',
        description: 'Proyección 6 meses' 
      },
      { 
        title: 'Coste Estimado', 
        value: Math.round((alertStats.unresolved * 2500) / 1000), 
        trend: 'stable',
        status: 'warning',
        description: 'K€ impacto burnout' 
      }
    ]);
  };

  const getQuickActions = () => [
    { label: 'Ver Todos los Equipos', href: '/dashboard/teams', icon: Users, urgent: false },
    { label: 'Configuración', href: '/dashboard/settings', icon: Target, urgent: false },
    { label: 'Informes Ejecutivos', href: '/dashboard/reports', icon: TrendingUp, urgent: false },
  ];

  const getRecentAlerts = () => {
    return alerts
      .filter(alert => !alert.resolved)
      .slice(0, 3)
      .map(alert => ({
        id: alert.id,
        message: alert.message,
        severity: alert.severity,
        time: new Date(alert.created_at).toLocaleDateString(),
        user: alert.profiles?.full_name || alert.profiles?.email || 'Usuario'
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          ¡Hola, {user?.name || user?.full_name || user?.email}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Panel ejecutivo de bienestar organizacional
        </p>
      </div>

      {/* Metrics Overview */}
      <WellnessMetrics metrics={metrics} />

      {/* Main Dashboard with AI Insights */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>IA Insights</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Acciones Rápidas</span>
                </CardTitle>
                <CardDescription>
                  Tareas importantes para hoy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getQuickActions().map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Button 
                        variant={action.urgent ? "default" : "outline"} 
                        className="w-full h-auto p-4 justify-start"
                      >
                        <action.icon className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{action.label}</div>
                          {action.urgent && (
                            <div className="text-xs opacity-75">Recomendado hoy</div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alertas Recientes</span>
                </CardTitle>
                <CardDescription>
                  Últimas notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentAlerts().length > 0 ? (
                    getRecentAlerts().map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Badge 
                          variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}
                          className="mt-0.5"
                        >
                          {alert.severity}
                        </Badge>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{alert.user}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground">
                        No hay alertas pendientes
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ¡Todo está bajo control!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Última actualización: {new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <AIInsightsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
