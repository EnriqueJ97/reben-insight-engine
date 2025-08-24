import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Filter,
  TrendingDown,
  TrendingUp,
  Users,
  Phone,
  Mail,
  MessageSquare,
  History,
  Calendar,
  User,
  RefreshCw,
  Target,
  Activity,
  UserCheck,
  Eye
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ManagerAlertsCenter = () => {
  const { user } = useAuth();
  const { alerts, loading, resolveAlert, fetchAlerts } = useAlerts();
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const [actionHistory, setActionHistory] = useState<Record<string, any[]>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Filter alerts to only show team alerts for managers
  const teamAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // For managers, only show alerts from their team members
      // This would be enhanced with actual team membership data
      return true; // Placeholder - would filter by team_id in real implementation
    });
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return teamAlerts.filter(alert => {
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const typeMatch = selectedType === 'all' || alert.type === selectedType;
      return severityMatch && typeMatch;
    });
  }, [teamAlerts, selectedSeverity, selectedType]);

  const unresolvedAlerts = filteredAlerts.filter(alert => !alert.resolved);
  const resolvedAlerts = filteredAlerts.filter(alert => alert.resolved);

  const alertTypes = useMemo(() => {
    const types = [...new Set(teamAlerts.map(alert => alert.type))];
    return types;
  }, [teamAlerts]);

  const teamMetrics = useMemo(() => {
    const total = unresolvedAlerts.length;
    const high = unresolvedAlerts.filter(a => a.severity === 'high').length;
    const avgResolutionTime = '2.3 días'; // Would be calculated from actual data
    
    return {
      totalActive: total,
      highPriority: high,
      avgResolutionTime,
      teamSize: 12, // Would come from actual team data
      coverageRate: total > 0 ? Math.round(((total - high) / total) * 100) : 100
    };
  }, [unresolvedAlerts]);

  const handleRefresh = async () => {
    try {
      await fetchAlerts();
      setLastRefresh(new Date());
      toast({
        title: "Alertas actualizadas",
        description: "Se han cargado las últimas alertas de tu equipo."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las alertas.",
        variant: "destructive"
      });
    }
  };

  const handleQuickAction = async (alert: any, actionType: 'call' | 'email' | 'one_on_one' | 'follow_up') => {
    const newAction = {
      type: actionType,
      timestamp: new Date().toISOString(),
      user: user?.full_name || user?.email,
      alert_id: alert.id
    };

    setActionHistory(prev => ({
      ...prev,
      [alert.id]: [...(prev[alert.id] || []), newAction]
    }));

    let actionText = '';
    switch (actionType) {
      case 'call': actionText = 'Llamada programada'; break;
      case 'email': actionText = 'Email de seguimiento enviado'; break;
      case 'one_on_one': actionText = '1:1 programado'; break;
      case 'follow_up': actionText = 'Seguimiento registrado'; break;
    }

    toast({
      title: "Acción registrada",
      description: `${actionText} para ${alert.profiles?.full_name || 'el empleado'}`
    });
  };

  const openResolveDialog = (alert: any) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
    setResolveNotes('');
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    
    setIsResolving(selectedAlert.id);
    try {
      await resolveAlert(selectedAlert.id);
      
      const newAction = {
        type: 'resolved',
        timestamp: new Date().toISOString(),
        notes: resolveNotes,
        user: user?.full_name || user?.email
      };
      
      setActionHistory(prev => ({
        ...prev,
        [selectedAlert.id]: [...(prev[selectedAlert.id] || []), newAction]
      }));

      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta exitosamente."
      });
      
      setResolveDialogOpen(false);
      setSelectedAlert(null);
      fetchAlerts();
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'burnout_risk': return <TrendingDown className="h-4 w-4" />;
      case 'turnover_risk': return <Users className="h-4 w-4" />;
      case 'low_satisfaction': return <TrendingDown className="h-4 w-4" />;
      case 'high_stress': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'burnout_risk': 'Riesgo de Burnout',
      'turnover_risk': 'Riesgo de Fuga',
      'low_satisfaction': 'Baja Satisfacción',
      'high_stress': 'Alto Estrés',
      'attendance_issue': 'Problema de Asistencia',
      'performance_decline': 'Declive de Rendimiento'
    };
    return labels[type] || type;
  };

  const renderAlert = (alert: any) => {
    const timeAgo = new Date(alert.created_at).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Card key={alert.id} className={`border-l-4 ${
        alert.severity === 'high' ? 'border-l-destructive bg-destructive/5' :
        alert.severity === 'medium' ? 'border-l-warning bg-warning/5' :
        'border-l-info bg-info/5'
      } transition-all hover:shadow-md`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                alert.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                alert.severity === 'medium' ? 'bg-warning/20 text-warning' :
                'bg-info/20 text-info'
              }`}>
                {getAlertIcon(alert.type)}
              </div>
              <div>
                <h4 className="font-semibold text-lg">{getAlertTypeLabel(alert.type)}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs font-medium">
                    {alert.severity === 'high' ? 'CRÍTICO' : 
                     alert.severity === 'medium' ? 'MEDIO' : 'BAJO'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {timeAgo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Info */}
          {alert.profiles && (
            <div className="mb-4 p-3 bg-background/50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {alert.profiles.full_name || alert.profiles.email}
                </span>
                <Badge variant="outline" className="text-xs">
                  Tu equipo
                </Badge>
              </div>
            </div>
          )}

          {/* Alert Message */}
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm leading-relaxed">{alert.message}</p>
          </div>

          {/* Suggested Actions for Managers */}
          {alert.severity === 'high' && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">Acción recomendada:</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Programa un 1:1 urgente y considera redistribuir la carga de trabajo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action History */}
          {actionHistory[alert.id] && actionHistory[alert.id].length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Acciones realizadas</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {actionHistory[alert.id].map((action, index) => (
                  <div key={index} className="text-xs p-2 bg-background/50 rounded border-l-2 border-primary/20">
                    <span className="font-medium">{action.type}</span> - {action.user} 
                    <span className="text-muted-foreground ml-2">
                      {new Date(action.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer with actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {alert.resolved ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Resuelta</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Pendiente</span>
                </div>
              )}
            </div>

            {!alert.resolved && (
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(alert, 'call')}
                        className="flex items-center space-x-1"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Programar llamada</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(alert, 'one_on_one')}
                        className="flex items-center space-x-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Programar 1:1</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openResolveDialog(alert)}
                  disabled={isResolving === alert.id}
                  className="flex items-center space-x-1"
                >
                  {isResolving === alert.id ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  <span>Resolver</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
      {/* Manager-specific Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Bell className="h-8 w-8 text-blue-600" />
            <span>Centro de Alertas</span>
            <Badge className="bg-blue-100 text-blue-700 ml-3">MANAGER</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitorea y gestiona las alertas de tu equipo - Enfoque operativo
          </p>
        </div>

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

      {/* Team Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{teamMetrics.teamSize}</div>
            <div className="text-sm text-muted-foreground">Miembros del Equipo</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{teamMetrics.totalActive}</div>
            <div className="text-sm text-muted-foreground">Alertas Activas</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{teamMetrics.highPriority}</div>
            <div className="text-sm text-muted-foreground">Alta Prioridad</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{teamMetrics.avgResolutionTime}</div>
            <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{teamMetrics.coverageRate}%</div>
            <div className="text-sm text-muted-foreground">Cobertura</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Alert */}
      {unresolvedAlerts.length > 0 && (
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atención:</strong> Tienes {unresolvedAlerts.length} alertas activas de tu equipo.
            {teamMetrics.highPriority > 0 && (
              <span className="text-destructive font-medium">
                {` ${teamMetrics.highPriority} de ellas son de alta prioridad.`}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Severidad:</label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1 rounded border border-input bg-background"
          >
            <option value="all">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Tipo:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 rounded border border-input bg-background"
          >
            <option value="all">Todos</option>
            {alertTypes.map(type => (
              <option key={type} value={type}>{getAlertTypeLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Activas ({unresolvedAlerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Resueltas ({resolvedAlerts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {unresolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">¡Equipo sin alertas!</h3>
                <p className="text-muted-foreground">
                  Tu equipo está funcionando perfectamente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unresolvedAlerts.map(renderAlert)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin historial reciente</h3>
                <p className="text-muted-foreground">
                  No hay alertas resueltas para mostrar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resolvedAlerts.map(renderAlert)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>
              Marca esta alerta como resuelta y añade notas sobre la resolución.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="notes">Notas de resolución (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe las acciones tomadas para resolver esta alerta..."
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleResolveAlert}
              disabled={isResolving === selectedAlert?.id}
            >
              {isResolving === selectedAlert?.id ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent mr-2" />
                  Resolviendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolver Alerta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};