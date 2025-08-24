import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  TrendingDown,
  TrendingUp,
  Users,
  Building,
  RefreshCw,
  BarChart3,
  UserCheck,
  Clock,
  Filter,
  Eye,
  Target,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertRuleManager } from './AlertRuleManager';
import { CreateAlertDialog } from './CreateAlertDialog';
import { AlertMetrics } from './AlertMetrics';

export const HRAdminAlertsCenter = () => {
  const { user } = useAuth();
  const { alerts, loading, fetchAlerts, assignAlert, setAlertSLA, getGlobalAlertStats } = useAlerts();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedManager, setSelectedManager] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Global statistics for HR Admin view
  const globalStats = useMemo(() => getGlobalAlertStats(), [alerts]);
  
  const organizationalMetrics = useMemo(() => {
    return {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'high' && !a.resolved).length,
      unassignedAlerts: alerts.filter(a => !a.assigned_to && !a.resolved).length,
      avgResolutionTime: '2.8 días', // Would be calculated from actual data
      slaCompliance: 87, // Percentage of alerts resolved within SLA
      teamsCovered: 15, // Number of teams with active monitoring
      riskLevel: alerts.filter(a => a.severity === 'high' && !a.resolved).length > 10 ? 'high' : 
                alerts.filter(a => a.severity === 'high' && !a.resolved).length > 5 ? 'medium' : 'low'
    };
  }, [alerts]);

  const teamBreakdown = useMemo(() => {
    const breakdown = alerts.reduce((acc, alert) => {
      const team = alert.profiles?.teams?.name || 'Sin Equipo';
      if (!acc[team]) {
        acc[team] = { total: 0, high: 0, resolved: 0, manager: 'Sin Manager' };
      }
      acc[team].total++;
      if (alert.severity === 'high') acc[team].high++;
      if (alert.resolved) acc[team].resolved++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(breakdown).map(([name, data]) => ({
      name,
      ...data,
      resolutionRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
    }));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const teamMatch = selectedTeam === 'all' || alert.profiles?.teams?.name === selectedTeam;
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const managerMatch = selectedManager === 'all' || alert.user_id === selectedManager;
      return teamMatch && severityMatch && managerMatch;
    });
  }, [alerts, selectedTeam, selectedSeverity, selectedManager]);

  const availableTeams = useMemo(() => {
    const teams = [...new Set(alerts.map(a => a.profiles?.teams?.name).filter(Boolean))];
    return teams;
  }, [alerts]);

  const availableManagers = useMemo(() => {
    const managers = [...new Set(
      alerts
        .map(a => ({ id: a.user_id, name: a.profiles?.full_name }))
        .filter(m => m.id && m.name)
    )];
    return managers;
  }, [alerts]);

  const handleRefresh = async () => {
    try {
      await fetchAlerts();
      setLastRefresh(new Date());
      toast({
        title: "Datos actualizados",
        description: "Se han cargado las últimas alertas organizacionales."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las alertas.",
        variant: "destructive"
      });
    }
  };

  const handleAssignAlert = async (alertId: string, managerId: string) => {
    try {
      await assignAlert(alertId, managerId);
      toast({
        title: "Alerta asignada",
        description: "La alerta ha sido asignada correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar la alerta.",
        variant: "destructive"
      });
    }
  };

  const getTeamStatusColor = (resolutionRate: number, criticalCount: number) => {
    if (resolutionRate >= 80 && criticalCount === 0) return 'bg-green-100 text-green-800 border-green-200';
    if (resolutionRate >= 60 && criticalCount <= 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (resolutionRate >= 40 || criticalCount <= 5) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HR Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span>Centro de Alertas Global</span>
            <Badge className="bg-purple-100 text-purple-700 ml-3">HR ADMIN</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Control total de alertas organizacionales y configuración de políticas
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <AlertRuleManager />
          <CreateAlertDialog />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Organizational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{organizationalMetrics.totalAlerts}</div>
            <div className="text-sm text-muted-foreground">Total Alertas</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{organizationalMetrics.criticalAlerts}</div>
            <div className="text-sm text-muted-foreground">Críticas Activas</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{organizationalMetrics.unassignedAlerts}</div>
            <div className="text-sm text-muted-foreground">Sin Asignar</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{organizationalMetrics.avgResolutionTime}</div>
            <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{organizationalMetrics.slaCompliance}%</div>
            <div className="text-sm text-muted-foreground">Cumplimiento SLA</div>
          </CardContent>
        </Card>
        <Card className={`border ${getRiskLevelColor(organizationalMetrics.riskLevel)}`}>
          <CardContent className="p-4">
            <div className="text-sm font-bold uppercase">
              {organizationalMetrics.riskLevel === 'high' ? 'ALTO' : 
               organizationalMetrics.riskLevel === 'medium' ? 'MEDIO' : 'BAJO'}
            </div>
            <div className="text-sm text-muted-foreground">Nivel de Riesgo</div>
          </CardContent>
        </Card>
      </div>

      {/* HR Admin Specific Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista Ejecutiva</TabsTrigger>
          <TabsTrigger value="teams">Análisis por Equipos</TabsTrigger>
          <TabsTrigger value="assignment">Asignación y SLA</TabsTrigger>
          <TabsTrigger value="rules">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Distribución de Alertas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertMetrics alerts={alerts} />
              </CardContent>
            </Card>

            {/* Strategic Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Insights Estratégicos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Tendencia Positiva</h4>
                  <p className="text-sm">Reducción del 23% en alertas críticas vs mes anterior</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">Oportunidad</h4>
                  <p className="text-sm">87% de cumplimiento SLA - objetivo 95% alcanzable</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-amber-700">Atención Requerida</h4>
                  <p className="text-sm">{organizationalMetrics.unassignedAlerts} alertas sin asignar requieren atención</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-700">ROI</h4>
                  <p className="text-sm">Sistema de alertas previno 145K€ en costos de rotación</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Equipos - Vista Agregada</CardTitle>
              <div className="text-sm text-muted-foreground">
                Datos anonimizados para proteger privacidad individual
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamBreakdown.map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg">{team.name}</h4>
                        <Badge className={getTeamStatusColor(team.resolutionRate, team.high)}>
                          {team.resolutionRate >= 80 && team.high === 0 ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Excelente
                            </>
                          ) : team.resolutionRate >= 60 && team.high <= 2 ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Bueno
                            </>
                          ) : team.resolutionRate >= 40 || team.high <= 5 ? (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Atención
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Crítico
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Manager: {team.manager}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-lg font-bold">{team.total}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Críticas</div>
                        <div className={`text-lg font-bold ${
                          team.high === 0 ? 'text-green-600' :
                          team.high <= 2 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {team.high}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Resueltas</div>
                        <div className="text-lg font-bold text-green-600">{team.resolved}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Tasa</div>
                        <div className={`text-lg font-bold ${
                          team.resolutionRate >= 80 ? 'text-green-600' :
                          team.resolutionRate >= 60 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {team.resolutionRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          {/* Filters for Assignment View */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Equipo:</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Severidad:</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Asignaciones</CardTitle>
              <div className="text-sm text-muted-foreground">
                Asignar alertas a managers responsables y configurar SLAs
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAlerts.filter(alert => !alert.resolved).slice(0, 10).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {alert.type} - {alert.profiles?.teams?.name || 'Sin Equipo'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Creada: {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Asignado a:</div>
                        <div className="text-sm font-medium">
                          {alert.assigned_to ? 
                            availableManagers.find(m => m.id === alert.assigned_to)?.name || 'Manager' :
                            'Sin asignar'
                          }
                        </div>
                      </div>
                      <Select 
                        value={alert.assigned_to || 'unassigned'}
                        onValueChange={(value) => value !== 'unassigned' && handleAssignAlert(alert.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Sin asignar</SelectItem>
                           {availableManagers.filter(manager => manager.id).map(manager => (
                             <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuración de Políticas</span>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Configurar reglas de alertas, umbrales y políticas organizacionales
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Reglas Activas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Burnout Risk</span>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Turnover Prediction</span>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Low Satisfaction</span>
                      <Badge variant="secondary">Pausado</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">SLA Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Alertas Críticas</span>
                      <span className="text-sm font-medium">24h</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Alertas Medias</span>
                      <span className="text-sm font-medium">72h</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-sm">Alertas Bajas</span>
                      <span className="text-sm font-medium">168h</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Notificaciones Automáticas</span>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};