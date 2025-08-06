import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { useProfiles } from '@/hooks/useProfiles';
import { EnhancedWellnessMetrics } from '@/components/ui/enhanced-wellness-metrics';
import { EnhancedTrendChart } from '@/components/ui/enhanced-trend-chart';
import { AlertResolutionModal } from '@/components/alerts/AlertResolutionModal';
import { QuickActionsPanel } from '@/components/actions/QuickActionsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  Target, 
  ArrowRight,
  Clock,
  Heart,
  Activity,
  Shield,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberDetail {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  wellnessScore: number;
  lastCheckin: Date | null;
  riskLevel: 'low' | 'medium' | 'high';
  alertCount: number;
  trend: 'up' | 'down' | 'stable';
  participationRate: number;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { getCheckinStats } = useCheckins();
  const { alerts, getAlertStats } = useAlerts();
  const { profiles, getTeamOverview } = useProfiles();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [teamDetails, setTeamDetails] = useState<TeamMemberDetail[]>([]);
  const [teamOverview, setTeamOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
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
      await loadTeamDetails(teamData);
      await loadManagerMetrics(alertStats, teamData);
      await loadTrendData();
    } catch (error) {
      console.error('Error loading manager dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (teamData: any) => {
    if (!teamData?.memberStats) return;

    const details: TeamMemberDetail[] = await Promise.all(
      teamData.memberStats.map(async (member: any) => {
        const memberAlerts = alerts.filter(alert => 
          alert.user_id === member.id && !alert.resolved
        );
        
        const memberCheckinStats = await getCheckinStats(member.id);
        // Convert mood scale (1-5) to percentage (20%-100%)
        const wellnessScore = member.stats?.averageMood && member.stats.totalCheckins > 0 ? 
          Math.round((member.stats.averageMood / 5) * 100) : 0;
        
        const daysSinceLastCheckin = member.stats?.lastCheckin ? 
          Math.floor((Date.now() - new Date(member.stats.lastCheckin).getTime()) / (1000 * 60 * 60 * 24)) : 
          null;

        const riskLevel = wellnessScore < 40 ? 'high' : 
                         wellnessScore < 70 ? 'medium' : 'low';

        // Participation rate based on last 30 days, rounded to integer
        const participationRate = memberCheckinStats?.total > 0 ? 
          Math.round(Math.min(100, (memberCheckinStats.total / 30) * 100)) : 0;

        return {
          id: member.id,
          name: member.full_name || member.email,
          email: member.email,
          wellnessScore,
          lastCheckin: member.stats?.lastCheckin ? new Date(member.stats.lastCheckin) : null,
          riskLevel,
          alertCount: memberAlerts.length,
          trend: memberCheckinStats?.trend || 'stable',
          participationRate
        };
      })
    );

    setTeamDetails(details.sort((a, b) => {
      // Sort by risk level first, then by wellness score
      const riskOrder = { high: 3, medium: 2, low: 1 };
      const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (riskDiff !== 0) return riskDiff;
      return a.wellnessScore - b.wellnessScore;
    }));
  };

  const loadManagerMetrics = async (alertStats: any, teamData: any) => {
    // Convert team mood scale (1-5) to percentage (20%-100%)
    const teamWellness = teamData?.averageTeamMood ? 
      Math.round((teamData.averageTeamMood / 5) * 100) : 0;
    
    const highRiskMembers = teamDetails.filter(m => m.riskLevel === 'high').length;
    const mediumRiskMembers = teamDetails.filter(m => m.riskLevel === 'medium').length;
    
    const avgParticipation = teamDetails.length > 0 ? 
      Math.round(teamDetails.reduce((sum, m) => sum + m.participationRate, 0) / teamDetails.length) : 0;

    const responseTime = alerts
      .filter(alert => alert.resolved && alert.resolved_at)
      .reduce((sum, alert) => {
        const created = new Date(alert.created_at).getTime();
        const resolved = new Date(alert.resolved_at!).getTime();
        return sum + (resolved - created);
      }, 0) / (1000 * 60 * 60); // Convert to hours

    // Simular datos históricos para sparklines (últimos 7 días)
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
        description: `${teamData?.totalMembers || 0} miembros`,
        icon: Heart,
        delta: Math.random() * 6 - 3, // Simulado: entre -3% y +3%
        formula: `Promedio estado de ánimo (${(teamData?.averageTeamMood || 0).toFixed(1)}/5) → ${teamWellness}%`,
        sparklineData: generateSparklineData(teamWellness)
      },
      { 
        title: 'Miembros en Riesgo Alto', 
        value: highRiskMembers, 
        trend: highRiskMembers <= 1 ? 'stable' : 'down',
        status: highRiskMembers === 0 ? 'good' : highRiskMembers <= 1 ? 'warning' : 'critical',
        description: `${mediumRiskMembers} en riesgo medio`,
        icon: AlertTriangle,
        formula: `Empleados con bienestar < 40%`
      },
      { 
        title: 'Alertas Activas', 
        value: alertStats.unresolved, 
        trend: alertStats.unresolved <= 2 ? 'stable' : 'down',
        status: alertStats.unresolved === 0 ? 'good' : alertStats.unresolved <= 3 ? 'warning' : 'critical',
        description: alertStats.unresolved > 0 ? `Tiempo resp: ${Math.round(responseTime)}h` : 'Todo bajo control',
        icon: Shield,
        formula: 'Alertas pendientes de resolución'
      },
      { 
        title: 'Participación', 
        value: avgParticipation, 
        trend: avgParticipation >= 80 ? 'up' : avgParticipation >= 60 ? 'stable' : 'down',
        status: avgParticipation >= 80 ? 'good' : avgParticipation >= 60 ? 'warning' : 'critical',
        description: 'Check-ins completados (30d)',
        icon: Activity,
        delta: Math.random() * 8 - 4, // Simulado: entre -4% y +4%
        formula: `Check-ins completados / días esperados × 100`,
        sparklineData: generateSparklineData(avgParticipation)
      }
    ]);
  };

  const handleRefreshData = async () => {
    setLastRefresh(new Date());
    await loadManagerData();
    toast({
      title: "Datos actualizados",
      description: "El dashboard se ha actualizado con la información más reciente.",
    });
  };

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setIsAlertModalOpen(true);
  };

  const handleAlertResolved = () => {
    loadManagerData(); // Recargar datos después de resolver alerta
  };

  const getWellnessLevel = (score: number) => {
    if (score >= 70) return 'Alto';
    if (score >= 50) return 'Medio';
    return 'Bajo';
  };

  const loadTrendData = async () => {
    // Simulated trend data - in real app, this would come from API
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

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const formatLastCheckin = (date: Date | null) => {
    if (!date) return 'Nunca';
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard del equipo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard del Manager 👥
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo avanzado del bienestar de tu equipo
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

      {/* Enhanced Metrics */}
      <EnhancedWellnessMetrics metrics={metrics} />

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team">Mi Equipo</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          {/* Team Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Estado del Equipo</span>
              </CardTitle>
              <CardDescription>
                📊 Bienestar: Promedio de estado de ánimo (1-5) • 🎯 Participación: % de check-ins completados (últimos 30 días)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamDetails.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          member.wellnessScore >= 70 ? 'text-success' : 
                          member.wellnessScore >= 50 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {getWellnessLevel(member.wellnessScore)}
                        </div>
                        <div className="text-xs text-muted-foreground">Bienestar</div>
                      </div>
                      
                      <div className="text-center">
                        <Badge className={getRiskColor(member.riskLevel)}>
                          {member.riskLevel === 'high' ? 'Alto' : 
                           member.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">Riesgo</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{formatLastCheckin(member.lastCheckin)}</span>
                          {getTrendIcon(member.trend)}
                        </div>
                        <div className="text-xs text-muted-foreground">Último check-in</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium flex items-center space-x-1">
                          <span>{member.participationRate}%</span>
                          {member.participationRate >= 70 ? (
                            <Badge className="bg-success/20 text-success text-xs">Alta</Badge>
                          ) : member.participationRate >= 40 ? (
                            <Badge className="bg-warning/20 text-warning text-xs">Media</Badge>
                          ) : (
                            <Badge className="bg-destructive/20 text-destructive text-xs">Baja</Badge>
                          )}
                        </div>
                        <Progress value={member.participationRate} className="w-16 h-2 mt-1" />
                        <div className="text-xs text-muted-foreground">Participación</div>
                      </div>
                      
                      {member.alertCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {member.alertCount} alertas
                        </Badge>
                      )}
                      
                      <Button variant="ghost" size="sm" disabled title="Vista detallada del empleado (próximamente)">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Semanales</CardTitle>
              <CardDescription>
                Evolución del bienestar y participación del equipo con datos interactivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedTrendChart data={trendData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Alertas</CardTitle>
              <CardDescription>
                Alertas activas que requieren tu atención
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.filter(alert => !alert.resolved).length > 0 ? (
                  alerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Badge 
                          variant={alert.severity === 'high' ? 'destructive' : 
                                  alert.severity === 'medium' ? 'secondary' : 'outline'}
                        >
                          {alert.severity}
                        </Badge>
                        <div>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(alert.created_at).toLocaleDateString()} - {alert.profiles?.full_name || 'Usuario'}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAlertClick(alert)}
                      >
                        Resolver <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">¡Excelente trabajo!</h3>
                    <p className="text-muted-foreground">No hay alertas pendientes en tu equipo.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <QuickActionsPanel 
            teamMembers={teamDetails}
            highRiskCount={teamDetails.filter(m => m.riskLevel === 'high').length}
            lowParticipationCount={teamDetails.filter(m => m.participationRate < 60).length}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de resolución de alertas */}
      <AlertResolutionModal
        alert={selectedAlert}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onResolve={handleAlertResolved}
      />
    </div>
  );
};

export default ManagerDashboard;
