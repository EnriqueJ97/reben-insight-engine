import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { useProfiles } from '@/hooks/useProfiles';
import { WellnessMetrics } from '@/components/ui/wellness-metrics';
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
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [teamDetails, setTeamDetails] = useState<TeamMemberDetail[]>([]);
  const [teamOverview, setTeamOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    loadManagerData();
  }, [user, profiles]);

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
        const wellnessScore = memberCheckinStats?.average_mood ? 
          Math.round((memberCheckinStats.average_mood / 5) * 100) : 0;
        
        const daysSinceLastCheckin = member.stats?.lastCheckin ? 
          Math.floor((Date.now() - new Date(member.stats.lastCheckin).getTime()) / (1000 * 60 * 60 * 24)) : 
          null;

        const riskLevel = wellnessScore < 40 ? 'high' : 
                         wellnessScore < 70 ? 'medium' : 'low';

        const participationRate = memberCheckinStats?.total > 0 ? 
          Math.min(100, (memberCheckinStats.total / 30) * 100) : 0;

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

    setMetrics([
      { 
        title: 'Bienestar del Equipo', 
        value: teamWellness, 
        trend: 'stable',
        status: teamWellness >= 70 ? 'good' : teamWellness >= 50 ? 'warning' : 'critical',
        description: `${teamData?.totalMembers || 0} miembros`,
        icon: Heart
      },
      { 
        title: 'Miembros en Riesgo Alto', 
        value: highRiskMembers, 
        trend: 'stable',
        status: highRiskMembers === 0 ? 'good' : highRiskMembers <= 1 ? 'warning' : 'critical',
        description: `${mediumRiskMembers} en riesgo medio`,
        icon: AlertTriangle
      },
      { 
        title: 'Alertas Activas', 
        value: alertStats.unresolved, 
        trend: 'stable',
        status: alertStats.unresolved === 0 ? 'good' : alertStats.unresolved <= 3 ? 'warning' : 'critical',
        description: alertStats.unresolved > 0 ? `Tiempo resp: ${Math.round(responseTime)}h` : 'Todo bajo control',
        icon: Shield
      },
      { 
        title: 'Participación', 
        value: avgParticipation, 
        trend: avgParticipation >= 80 ? 'up' : avgParticipation >= 60 ? 'stable' : 'down',
        status: avgParticipation >= 80 ? 'good' : avgParticipation >= 60 ? 'warning' : 'critical',
        description: 'Check-ins completados (30d)',
        icon: Activity
      }
    ]);
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
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard del equipo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-0">
        {/* Header */}
        <div className="bg-background">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard del Manager 👥
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo avanzado del bienestar de tu equipo
          </p>
        </div>

        {/* Enhanced Metrics */}
        <WellnessMetrics metrics={metrics} />

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
                  Vista detallada de cada miembro del equipo
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
                            member.wellnessScore >= 70 ? 'text-green-600' : 
                            member.wellnessScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {member.wellnessScore}%
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
                          <div className="text-sm font-medium">{member.participationRate}%</div>
                          <Progress value={member.participationRate} className="w-16 h-2 mt-1" />
                        </div>
                        
                        {member.alertCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {member.alertCount} alertas
                          </Badge>
                        )}
                        
                        <Link to={`/dashboard/team/${member.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
                  Evolución del bienestar y participación del equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Bienestar Promedio del Equipo</h4>
                    <div className="flex items-end space-x-2 h-20">
                      {trendData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-primary/20 rounded-t"
                            style={{ height: `${(day.wellness / 100) * 60}px` }}
                          />
                          <div className="text-xs mt-1">{day.date}</div>
                          <div className="text-xs text-muted-foreground">{day.wellness}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Participación en Check-ins</h4>
                    <div className="flex items-end space-x-2 h-20">
                      {trendData.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-secondary/60 rounded-t"
                            style={{ height: `${(day.participation / 100) * 60}px` }}
                          />
                          <div className="text-xs mt-1">{day.date}</div>
                          <div className="text-xs text-muted-foreground">{day.participation}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                        <Link to="/dashboard/alerts">
                          <Button variant="outline" size="sm">
                            Revisar <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Recomendadas</CardTitle>
                  <CardDescription>
                    Basadas en el estado actual de tu equipo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamDetails.filter(m => m.riskLevel === 'high').length > 0 && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-destructive mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Acción Urgente</span>
                        </div>
                        <p className="text-sm">
                          {teamDetails.filter(m => m.riskLevel === 'high').length} miembro(s) en riesgo alto. 
                          Programa reuniones 1:1 inmediatamente.
                        </p>
                      </div>
                    )}
                    
                    {teamDetails.filter(m => m.participationRate < 60).length > 0 && (
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-warning mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Mejorar Participación</span>
                        </div>
                        <p className="text-sm">
                          Algunos miembros no están completando check-ins regularmente. 
                          Considera enviar recordatorios amigables.
                        </p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-primary mb-2">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Oportunidad de Mejora</span>
                      </div>
                      <p className="text-sm">
                        Programa una sesión de team building para fortalecer la cohesión del equipo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Herramientas de gestión del equipo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/dashboard/team">
                      <Button className="w-full justify-between">
                        Ver Equipo Completo
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link to="/dashboard/alerts">
                      <Button variant="outline" className="w-full justify-between">
                        Centro de Alertas
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link to="/dashboard/reports">
                      <Button variant="outline" className="w-full justify-between">
                        Generar Reporte
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <Link to="/dashboard/settings">
                      <Button variant="outline" className="w-full justify-between">
                        Configurar Alertas
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
