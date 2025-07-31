import { useAuth } from '@/contexts/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  Shield,
  Phone,
  Mail,
  MessageSquare,
  History,
  ExternalLink,
  Calendar,
  User
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
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [actionHistory, setActionHistory] = useState<Record<string, any[]>>({});

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
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-muted';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'bg-blue-50 dark:bg-blue-950/20';
      default: return 'bg-muted/20';
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
      
      // Agregar acción al historial
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

  const handleQuickAction = async (alert: any, actionType: 'call' | 'email' | 'note') => {
    const newAction = {
      type: actionType,
      timestamp: new Date().toISOString(),
      user: user?.full_name || user?.email
    };

    setActionHistory(prev => ({
      ...prev,
      [alert.id]: [...(prev[alert.id] || []), newAction]
    }));

    let actionText = '';
    switch (actionType) {
      case 'call': actionText = 'Llamada iniciada'; break;
      case 'email': actionText = 'Email enviado'; break;
      case 'note': actionText = 'Nota agregada'; break;
    }

    toast({
      title: "Acción registrada",
      description: `${actionText} para ${alert.profiles?.full_name || alert.profiles?.email}`
    });
  };

  const renderAlert = (alert: any) => {
    const timeAgo = new Date(alert.created_at).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Card key={alert.id} className={`border-l-4 ${getSeverityBorder(alert.severity)} ${getSeverityBg(alert.severity)} transition-all hover:shadow-md`}>
        <CardContent className="p-6">
          {/* Header con información principal */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                alert.severity === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
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

          {/* Información del empleado */}
          {user?.role !== 'EMPLOYEE' && alert.profiles && (
            <div className="mb-4 p-3 bg-background/50 rounded-lg border">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {alert.profiles.full_name || alert.profiles.email}
                </span>
                <Badge variant="outline" className="text-xs">
                  {alert.profiles.role}
                </Badge>
              </div>
            </div>
          )}

          {/* Mensaje de la alerta */}
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm leading-relaxed">{alert.message}</p>
          </div>

          {/* Historial de acciones */}
          {actionHistory[alert.id] && actionHistory[alert.id].length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Historial de acciones</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {actionHistory[alert.id].map((action, index) => (
                  <div key={index} className="text-xs p-2 bg-background/50 rounded border-l-2 border-primary/20">
                    <span className="font-medium">{action.type}</span> por {action.user} 
                    <span className="text-muted-foreground ml-2">
                      {new Date(action.timestamp).toLocaleString('es-ES')}
                    </span>
                    {action.notes && (
                      <div className="mt-1 text-muted-foreground italic">"{action.notes}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer con estado y acciones */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {alert.resolved ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Resuelta</span>
                  {alert.resolved_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.resolved_at).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Pendiente</span>
                </div>
              )}
            </div>

            {!alert.resolved && (user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
              <div className="flex items-center space-x-2">
                {/* Acciones rápidas */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(alert, 'call')}
                  className="flex items-center space-x-1"
                >
                  <Phone className="h-3 w-3" />
                  <span>Llamar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(alert, 'email')}
                  className="flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </Button>

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

      {/* Modal de resolución de alertas */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Resolver Alerta</span>
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres marcar esta alerta como resuelta?
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* Información de la alerta */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {getAlertIcon(selectedAlert.type)}
                  <span className="font-medium">{getAlertTypeLabel(selectedAlert.type)}</span>
                  <Badge variant={getSeverityColor(selectedAlert.severity) as any}>
                    {selectedAlert.severity === 'high' ? 'CRÍTICO' : 
                     selectedAlert.severity === 'medium' ? 'MEDIO' : 'BAJO'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
                {selectedAlert.profiles && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Empleado: </span>
                    {selectedAlert.profiles.full_name || selectedAlert.profiles.email}
                  </p>
                )}
              </div>

              {/* Campo de notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas de resolución (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe las acciones tomadas para resolver esta alerta..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Estas notas se guardarán en el historial de la alerta.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
              disabled={!!isResolving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolveAlert}
              disabled={!!isResolving || !selectedAlert}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isResolving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 animate-spin rounded-full border border-current border-t-transparent" />
                  <span>Resolviendo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirmar Resolución</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};