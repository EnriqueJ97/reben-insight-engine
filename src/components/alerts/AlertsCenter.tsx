import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Filter,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Eye,
  Shield
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertRuleManager } from './AlertRuleManager';
import { CreateAlertDialog } from './CreateAlertDialog';
import { AlertMetrics } from './AlertMetrics';

export const AlertsCenter = () => {
  const { user } = useAuth();
  const { alerts, loading, resolveAlert, fetchAlerts } = useAlerts();
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const typeMatch = selectedType === 'all' || alert.type === selectedType;
      return severityMatch && typeMatch;
    });
  }, [alerts, selectedSeverity, selectedType]);

  const unresolvedAlerts = filteredAlerts.filter(alert => !alert.resolved);
  const resolvedAlerts = filteredAlerts.filter(alert => alert.resolved);

  const alertTypes = useMemo(() => {
    const types = [...new Set(alerts.map(alert => alert.type))];
    return types;
  }, [alerts]);

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

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-muted';
      default: return 'border-l-muted';
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

  const handleResolveAlert = async (alertId: string) => {
    setIsResolving(alertId);
    try {
      await resolveAlert(alertId);
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta exitosamente."
      });
      fetchAlerts(); // Refresh alerts
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

  const renderAlert = (alert: any) => {
    const timeAgo = new Date(alert.created_at).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Card key={alert.id} className={`border-l-4 ${getSeverityBorder(alert.severity)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getAlertIcon(alert.type)}
              <h4 className="font-medium">{getAlertTypeLabel(alert.type)}</h4>
              <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                {alert.severity === 'high' ? 'Alto' : 
                 alert.severity === 'medium' ? 'Medio' : 'Bajo'}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {user?.role !== 'EMPLOYEE' && alert.profiles && (
            <div className="mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Empleado: {alert.profiles.full_name || alert.profiles.email}
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {alert.resolved ? (
                <div className="flex items-center space-x-1 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Resuelta</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-warning">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Pendiente</span>
                </div>
              )}
            </div>

            {!alert.resolved && (user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolveAlert(alert.id)}
                disabled={isResolving === alert.id}
              >
                {isResolving === alert.id ? (
                  <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent" />
                ) : (
                  'Resolver'
                )}
              </Button>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Bell className="h-8 w-8 text-primary" />
            <span>Centro de Alertas</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'EMPLOYEE' 
              ? 'Gestiona tus notificaciones y alertas personales'
              : user?.role === 'MANAGER'
              ? 'Monitorea y gestiona las alertas de tu equipo'
              : 'Control total de alertas y configuración de políticas'
            }
          </p>
        </div>

        <div className="flex space-x-2">
          {(user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
            <CreateAlertDialog />
          )}
          {user?.role === 'HR_ADMIN' && (
            <AlertRuleManager />
          )}
        </div>
      </div>

      {/* Alert Overview */}
      <AlertMetrics alerts={alerts} />

      {/* Quick Stats */}
      {unresolvedAlerts.length > 0 && (
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atención:</strong> Tienes {unresolvedAlerts.length} alertas activas que requieren tu atención.
            {unresolvedAlerts.filter(a => a.severity === 'high').length > 0 && (
              <span className="text-destructive font-medium">
                {` ${unresolvedAlerts.filter(a => a.severity === 'high').length} de ellas son de alta prioridad.`}
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
                <Shield className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">¡Todo bajo control!</h3>
                <p className="text-muted-foreground">
                  No hay alertas activas en este momento.
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
                <h3 className="text-lg font-medium mb-2">Sin historial</h3>
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
    </div>
  );
};