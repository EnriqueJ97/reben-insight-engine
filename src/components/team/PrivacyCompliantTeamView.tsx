import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WellnessMetrics } from '@/components/ui/wellness-metrics';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, AlertTriangle, MessageSquare, Shield, Activity, Info, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfiles } from '@/hooks/useProfiles';
import { useAlerts } from '@/hooks/useAlerts';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const PrivacyCompliantTeamView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profiles: teamMembers, loading: profilesLoading, fetchTeamMembers, getTeamOverview } = useProfiles();
  const { alerts, loading: alertsLoading, resolveAlert, fetchAlerts } = useAlerts();
  
  const [teamStats, setTeamStats] = useState<any>(null);
  const [teamMetrics, setTeamMetrics] = useState<any[]>([]);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  // Load team data
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'HR_ADMIN')) {
      fetchTeamMembers();
      fetchAlerts();
      loadTeamStats();
    }
  }, [user]);

  const loadTeamStats = async () => {
    try {
      const overview = await getTeamOverview();
      if (overview) {
        setTeamStats(overview);
        
        // Calculate team metrics ONLY from real data
        const memberStats = overview.memberStats || [];
        const membersWithData = memberStats.filter((m: any) => m.stats?.totalCheckins > 0);
        
        // Solo calcular métricas si hay datos reales
        const avgWellness = membersWithData.length > 0 
          ? Math.round(membersWithData.reduce((sum: number, m: any) => sum + m.stats.averageMood, 0) / membersWithData.length * 10)
          : null;
        
        const highRiskCount = membersWithData.filter((m: any) => m.stats.averageMood < 6).length;
        const highRiskPercentage = membersWithData.length > 0 
          ? Math.round((highRiskCount / membersWithData.length) * 100)
          : null;
        
        const participationRate = memberStats.length > 0
          ? Math.round((membersWithData.length / memberStats.length) * 100)
          : 0;

        setTeamMetrics([
          { 
            title: 'Bienestar Promedio', 
            value: avgWellness ?? 0, 
            trend: avgWellness ? (avgWellness >= 70 ? 'up' as const : avgWellness >= 50 ? 'stable' as const : 'down' as const) : 'stable' as const, 
            status: avgWellness ? (avgWellness >= 70 ? 'good' as const : avgWellness >= 50 ? 'warning' as const : 'critical' as const) : 'warning' as const, 
            description: avgWellness ? `${membersWithData.length} con datos` : 'Sin datos disponibles'
          },
          { 
            title: 'Riesgo Alto', 
            value: highRiskPercentage ?? 0, 
            trend: highRiskPercentage ? (highRiskPercentage <= 20 ? 'down' as const : 'up' as const) : 'stable' as const, 
            status: highRiskPercentage ? (highRiskPercentage <= 20 ? 'good' as const : highRiskPercentage <= 40 ? 'warning' as const : 'critical' as const) : 'warning' as const, 
            description: highRiskPercentage ? `${highRiskCount} persona${highRiskCount !== 1 ? 's' : ''}` : 'Sin datos disponibles'
          },
          { 
            title: 'Participación', 
            value: participationRate, 
            trend: participationRate >= 80 ? 'up' as const : 'stable' as const, 
            status: participationRate >= 80 ? 'good' as const : participationRate >= 60 ? 'warning' as const : 'critical' as const, 
            description: `${membersWithData.length}/${memberStats.length} participando`
          },
          { 
            title: 'Alertas Activas', 
            value: alerts.filter(a => !a.resolved).length, 
            trend: 'stable' as const, 
            status: alerts.filter(a => !a.resolved).length === 0 ? 'good' as const : alerts.filter(a => !a.resolved).length <= 3 ? 'warning' as const : 'critical' as const, 
            description: 'Requieren atención' 
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading team stats:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setIsResolving(alertId);
    try {
      await resolveAlert(alertId);
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta exitosamente."
      });
      loadTeamStats(); // Refresh metrics
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsResolving(null);
    }
  };

  const getWellnessScore = (member: any) => {
    // Solo calcular si hay check-ins reales
    if (!member.stats || member.stats.totalCheckins === 0) return null;
    return Math.round(member.stats.averageMood * 10);
  };

  const getRiskLevel = (score: number | null) => {
    if (score === null) return 'unknown';
    if (score >= 70) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  };

  const getMemberAlerts = (memberId: string) => {
    return alerts.filter(alert => alert.user_id === memberId && !alert.resolved).length;
  };

  const getLastCheckinText = (member: any) => {
    if (!member.stats || member.stats.totalCheckins === 0 || !member.stats.lastCheckin) return 'Sin check-ins';
    const lastCheckin = new Date(member.stats.lastCheckin);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60));
    
    // Formato compatible con RGPD - evitar exactitud excesiva
    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return 'Hoy';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays <= 7) return 'Esta semana';
    if (diffDays <= 30) return 'Este mes';
    return '>30 días';
  };

  // Verificar si se pueden mostrar datos individuales (regla 5-k)
  const canShowIndividualData = () => {
    const membersWithData = teamStats?.memberStats?.filter((m: any) => m.stats?.totalCheckins > 0) || [];
    return membersWithData.length >= 5;
  };

  // Formatear nivel de riesgo según RGPD
  const getPrivacyCompliantRiskLevel = (riskLevel: string, hasData: boolean) => {
    if (!canShowIndividualData() && user?.role !== 'HR_ADMIN') {
      return 'Datos insuficientes';
    }
    
    if (!hasData) return 'Sin datos';
    
    switch (riskLevel) {
      case 'low': return 'Situación OK';
      case 'medium': return 'Requiere Atención';
      case 'high': return 'Prioritario';
      default: return 'No evaluado';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'unknown': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10';
      case 'medium': return 'bg-warning/10';
      case 'high': return 'bg-destructive/10';
      case 'unknown': return 'bg-muted/10';
      default: return 'bg-muted';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);

  if (profilesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Alert className="border-info/30 bg-info/5">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Protección de Datos (RGPD):</strong> Los datos de bienestar se muestran según el principio de minimización.
          Los indicadores no se usan para evaluación de desempeño.
          {!canShowIndividualData() && user?.role !== 'HR_ADMIN' && (
            <span className="ml-2 font-medium text-warning">
              Datos individuales ocultos por tamaño de muestra insuficiente (&lt;5 personas con datos).
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Team Metrics */}
      <WellnessMetrics metrics={teamMetrics} />

      {/* Active Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alertas Activas:</strong> Tienes {unresolvedAlerts.length} alertas que requieren tu atención inmediata.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Miembros del Equipo</span>
                <Badge variant="secondary">{teamMembers.length} personas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamStats?.memberStats?.map((member) => {
                  const wellnessScore = getWellnessScore(member);
                  const riskLevel = getRiskLevel(wellnessScore);
                  const memberAlerts = getMemberAlerts(member.id);
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">
                              {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {/* Semáforo indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            riskLevel === 'low' ? 'bg-success' : 
                            riskLevel === 'medium' ? 'bg-warning' : 
                            riskLevel === 'high' ? 'bg-destructive' : 'bg-muted'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.full_name || 'Usuario'}</h3>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>Último check-in: {getLastCheckinText(member)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {riskLevel === 'low' ? '🟢' : 
                               riskLevel === 'medium' ? '🟡' : 
                               riskLevel === 'high' ? '🔴' : '⚪'}
                            </span>
                            {user?.role === 'HR_ADMIN' && wellnessScore && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-xs text-muted-foreground cursor-help">
                                    ({wellnessScore}%)
                                  </span>
                                </TooltipTrigger>
                                <Tooltip>
                                  <p className="text-xs">Score detallado (solo RRHH)</p>
                                </Tooltip>
                              </Tooltip>
                            )}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${getRiskBg(riskLevel)} ${getRiskColor(riskLevel)} text-xs`}
                          >
                            {getPrivacyCompliantRiskLevel(riskLevel, wellnessScore !== null)}
                          </Badge>
                        </div>
                        
                        {memberAlerts > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {memberAlerts} alerta{memberAlerts > 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Hablar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Alertas Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unresolvedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      ¡Excelente! No hay alertas activas
                    </p>
                  </div>
                ) : (
                  unresolvedAlerts.slice(0, 5).map((alert) => {
                    const member = teamMembers.find(m => m.id === alert.user_id);
                    const timeAgo = alert.created_at ? 
                      new Date(alert.created_at).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Fecha desconocida';
                    
                    return (
                      <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'border-l-destructive bg-destructive/5' :
                        alert.severity === 'medium' ? 'border-l-warning bg-warning/5' :
                        'border-l-muted bg-muted/5'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{member?.full_name || 'Usuario'}</p>
                          <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                            {alert.severity === 'high' ? 'Alto' : 
                             alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{timeAgo}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={isResolving === alert.id}
                          >
                            {isResolving === alert.id ? 'Resolviendo...' : 'Resolver'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCompliantTeamView;