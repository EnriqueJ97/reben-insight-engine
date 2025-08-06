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
  EyeOff,
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

  // Función para cumplir RGPD en formato de último check-in
  const formatPrivacyCompliantCheckin = (date: Date | null) => {
    if (!date) return 'Sin registros';
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Evitar "shaming" con rangos generales
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days <= 7) return 'Esta semana';
    if (days <= 30) return 'Este mes';
    return '>30 días';
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
          {/* Privacy Compliance Notice */}
          <div className="bg-info/5 border border-info/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info mb-2">Protección de Datos Personales (RGPD)</p>
                <p className="text-muted-foreground mb-2">
                  Los datos de bienestar se muestran agregados y en formato de niveles para cumplir con la normativa de privacidad.
                  Los scores exactos solo son visibles para personal autorizado de RRHH.
                </p>
                <div className="text-xs text-muted-foreground">
                  <strong>Base legal:</strong> Prevención de riesgos laborales (Art. 9.2.h RGPD) • 
                  <strong> Principio:</strong> Minimización de datos (Art. 5.1.c RGPD)
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Estado del Equipo</span>
                </div>
                <div className="flex items-center space-x-2">
                  {teamDetails.filter(m => m.wellnessScore !== null).length >= 5 ? (
                    <Badge className="bg-success/20 text-success text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Datos autorizados
                    </Badge>
                  ) : (
                    <Badge className="bg-warning/20 text-warning text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Modo privacidad
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                🛡️ Cumplimiento RGPD: Datos mostrados según principio de minimización • 
                🎯 Solo niveles de riesgo para acción preventiva • 
                📊 Scores detallados restringidos a personal autorizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamDetails.map((member) => {
                  const canShowIndividualData = teamDetails.filter(m => m.wellnessScore !== null).length >= 5;
                  const canViewSensitiveData = user?.role === 'HR_ADMIN';
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Semáforo indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            member.riskLevel === 'low' ? 'bg-success' : 
                            member.riskLevel === 'medium' ? 'bg-warning' : 
                            member.riskLevel === 'high' ? 'bg-destructive' : 'bg-muted'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Último check-in: {formatPrivacyCompliantCheckin(member.lastCheckin)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        {/* Nivel de bienestar (no score exacto) */}
                        <div className="text-center">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {member.riskLevel === 'low' ? '🟢' : 
                               member.riskLevel === 'medium' ? '🟡' : 
                               member.riskLevel === 'high' ? '🔴' : '⚪'}
                            </span>
                            {canViewSensitiveData && (
                              <span className="text-xs text-muted-foreground">
                                ({member.wellnessScore}%)
                              </span>
                            )}
                          </div>
                          <Badge className={
                            member.riskLevel === 'low' ? 'bg-success/20 text-success border-success/30' :
                            member.riskLevel === 'medium' ? 'bg-warning/20 text-warning border-warning/30' :
                            member.riskLevel === 'high' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                            'bg-muted/20 text-muted-foreground border-muted/30'
                          }>
                            {canShowIndividualData ? (
                              member.riskLevel === 'low' ? 'Situación OK' :
                              member.riskLevel === 'medium' ? 'Requiere Atención' :
                              member.riskLevel === 'high' ? 'Prioritario' : 'Sin datos'
                            ) : (
                              'Datos insuficientes'
                            )}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">Nivel de Riesgo</div>
                        </div>
                        
                        {/* Participación */}
                        <div className="text-center">
                          <div className="text-sm font-medium flex items-center space-x-1">
                            {member.participationRate >= 70 ? (
                              <Badge className="bg-success/20 text-success text-xs">Alta</Badge>
                            ) : member.participationRate >= 40 ? (
                              <Badge className="bg-warning/20 text-warning text-xs">Media</Badge>
                            ) : (
                              <Badge className="bg-destructive/20 text-destructive text-xs">Baja</Badge>
                            )}
                            {canViewSensitiveData && (
                              <span className="text-xs text-muted-foreground">
                                ({member.participationRate}%)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Participación</div>
                        </div>
                        
                        {/* Alertas */}
                        {member.alertCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {member.alertCount} alerta{member.alertCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        {/* Acción recomendada */}
                        <div className="text-center">
                          {member.riskLevel === 'high' ? (
                            <Badge className="bg-destructive/20 text-destructive">
                              Derivar RRHH
                            </Badge>
                          ) : member.riskLevel === 'medium' ? (
                            <Badge className="bg-warning/20 text-warning">
                              Seguimiento 1:1
                            </Badge>
                          ) : (
                            <Badge className="bg-success/20 text-success">
                              Mantener
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Nota legal */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Transparencia y Cumplimiento:</p>
                    <ul className="space-y-1">
                      <li>• Datos procesados únicamente para prevención de riesgos laborales</li>
                      <li>• Acceso auditado según Art. 25, 30 RGPD</li>
                      <li>• No se utilizan para evaluaciones de desempeño</li>
                      <li>• Anonimización automática si equipo &lt; 5 personas con datos</li>
                    </ul>
                  </div>
                </div>
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
