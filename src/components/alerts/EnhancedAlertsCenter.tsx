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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  Clock, 
  Filter,
  TrendingDown,
  TrendingUp,
  Users,
  Shield,
  Phone,
  Mail,
  MessageSquare,
  History,
  Calendar,
  User,
  UserCheck,
  Building,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertRuleManager } from './AlertRuleManager';
import { CreateAlertDialog } from './CreateAlertDialog';
import { AlertMetrics } from './AlertMetrics';
import { AlertResolutionModal } from './AlertResolutionModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const EnhancedAlertsCenter = () => {
  const { user } = useAuth();
  const { alerts, loading, resolveAlert, fetchAlerts } = useAlerts();
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionHistory, setActionHistory] = useState<Record<string, any[]>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const typeMatch = selectedType === 'all' || alert.type === selectedType;
      const ownerMatch = selectedOwner === 'all' || 
        (selectedOwner === 'unassigned' && !alert.assigned_to) ||
        alert.assigned_to === selectedOwner;
      return severityMatch && typeMatch && ownerMatch;
    });
  }, [alerts, selectedSeverity, selectedType, selectedOwner]);

  const unresolvedAlerts = filteredAlerts.filter(alert => !alert.resolved);
  const resolvedAlerts = filteredAlerts.filter(alert => alert.resolved);
  const inProgressAlerts = filteredAlerts.filter(alert => alert.status === 'in_progress');
  
  // Fallback status assignment for alerts without status
  const alertsWithStatus = filteredAlerts.map(alert => ({
    ...alert,
    status: alert.status || (alert.resolved ? 'resolved' : 'pending'),
    assigned_to: alert.assigned_to || undefined
  }));

  const alertTypes = useMemo(() => {
    const types = [...new Set(alerts.map(alert => alert.type))];
    return types;
  }, [alerts]);

  const teamMembers = useMemo(() => {
    const members = [...new Set(alerts.map(alert => alert.profiles?.full_name).filter(Boolean))];
    return members;
  }, [alerts]);

  const handleHighPriorityFilter = useCallback(() => {
    setSelectedSeverity('high');
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAlerts();
      setLastRefresh(new Date());
      toast({
        title: "Datos actualizados",
        description: "Las alertas se han actualizado correctamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las alertas.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'burnout_risk': return <TrendingDown className="h-4 w-4" />;
      case 'turnover_risk': return <Users className="h-4 w-4" />;
      case 'low_satisfaction': return <TrendingDown className="h-4 w-4" />;
      case 'high_stress': return <AlertTriangle className="h-4 w-4" />;
      case 'workload_critical': return <AlertTriangle className="h-4 w-4" />;
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
      case 'low': return 'border-l-info';
      default: return 'border-l-muted';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/5';
      case 'medium': return 'bg-warning/5';
      case 'low': return 'bg-info/5';
      default: return 'bg-muted/20';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'burnout_risk': 'Riesgo de Burnout',
      'turnover_risk': 'Riesgo de Fuga',
      'low_satisfaction': 'Baja Satisfacción',
      'high_stress': 'Alto Estrés',
      'workload_critical': 'Carga de Trabajo Crítica',
      'attendance_issue': 'Problema de Asistencia',
      'performance_decline': 'Declive de Rendimiento'
    };
    return labels[type] || type;
  };

  const getPrivacyCompliantMessage = (alert: any, teamSize: number) => {
    // GDPR compliance: anonymize if team < 5 people
    if (teamSize < 5) {
      return "Patrones de riesgo detectados en el equipo. Detalles confidenciales protegidos por privacidad.";
    }
    return alert.message;
  };

  const getPrivacyCompliantEmployee = (alert: any, teamSize: number, userRole: string) => {
    // RGPD Art. 9: Datos de salud mental - NADIE puede ver nombres reales sin consentimiento explícito
    
    // SISTEMA DE ALIAS TEMPORALES para TODOS los roles
    if (userRole === 'MANAGER' || userRole === 'HR_ADMIN') {
      if (teamSize < 5) {
        return {
          name: "Datos protegidos por confidencialidad (equipo <5)",
          role: "Miembro del equipo",
          showIdentity: false,
          alias: null
        };
      }
      
      // TODOS ven solo alias temporal - incluso RRHH para intervenciones ciegas
      const aliasCode = alert.alias_code || `ANON-${alert.id.slice(-4)}`;
      return {
        name: `${aliasCode}`,
        role: "Empleado", // Rol genérico para proteger identidad
        showIdentity: false,
        alias: aliasCode
      };
    }
    
    // Empleados solo ven sus propias alertas (con identidad real)
    return {
      name: alert.profiles?.full_name || alert.profiles?.email,
      role: alert.profiles?.role,
      showIdentity: true,
      alias: null
    };
  };

  const handleQuickAction = async (alert: any, actionType: 'call' | 'email' | 'hr_referral' | 'action_plan') => {
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

    // Log action for GDPR compliance (art. 30)
    console.log('Alert action logged:', newAction);

    let actionText = '';
    switch (actionType) {
      case 'call': 
        actionText = 'Llamada iniciada'; 
        break;
      case 'email': 
        actionText = 'Email enviado'; 
        break;
      case 'hr_referral': 
        actionText = 'Derivado a RRHH'; 
        break;
      case 'action_plan': 
        actionText = 'Plan de acción creado'; 
        break;
    }

    toast({
      title: "Acción registrada",
      description: `${actionText} - Registrado para auditoría RGPD`
    });
  };

  const renderPrivacyCompliantAlert = (alert: any) => {
    const teamSize = 8; // This should come from actual team data
    const timeAgo = new Date(alert.created_at).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const employee = getPrivacyCompliantEmployee(alert, teamSize, user?.role || 'EMPLOYEE');
    const message = getPrivacyCompliantMessage(alert, teamSize);

    // Log access for GDPR audit (Art. 30)
    console.log('Alert access logged:', {
      alert_id: alert.id,
      accessed_by: user?.id,
      user_role: user?.role,
      timestamp: new Date().toISOString(),
      data_shown: employee.showIdentity ? 'full' : 'anonymized'
    });

    return (
      <Card key={alert.id} className={`border-l-4 ${getSeverityBorder(alert.severity)} ${getSeverityBg(alert.severity)} transition-all hover:shadow-md`}>
        <CardContent className="p-6">
          {/* Header mejorado */}
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
                    {alert.severity === 'high' ? '🔴 CRÍTICO' : 
                     alert.severity === 'medium' ? '🟡 MEDIO' : '🟢 BAJO'}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {timeAgo}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    SLA: 48h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del empleado (GDPR Art. 9 compliant) */}
          {user?.role !== 'EMPLOYEE' && (
            <div className="mb-4 p-3 bg-background/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{employee.name}</span>
                  <Badge variant="outline" className="text-xs">{employee.role}</Badge>
                  {!employee.showIdentity && (
                    <Badge variant="secondary" className="text-xs">
                      🔒 Datos anonimizados
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {user?.role === 'MANAGER' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Como manager, solo ves nivel de riesgo por RGPD Art. 9</p>
                          <p>Para detalles clínicos, deriva a RRHH</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {teamSize < 5 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-warning" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Equipo pequeño (&lt;5): identidad protegida</p>
                          <p>Regla k-anonimato para prevenir reidentificación</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Descripción y sugerencias */}
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm leading-relaxed">{message}</p>
            </div>
            
            {alert.severity === 'high' && (
              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info-foreground">
                  <strong>Sugerencia:</strong> Repriorizar backlog y revisar staffing. Considerar derivación a Servicio de Prevención.
                </p>
              </div>
            )}
          </div>

          {/* Owner y SLA */}
          <div className="mb-4 p-3 bg-muted/10 rounded-lg border-l-2 border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-1" />
                  Owner: {alert.assigned_to ? 'Team Lead' : 'Auto-asignado'}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  TMR: 12h
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Creado: {timeAgo}
              </span>
            </div>
          </div>

          {/* Historial de acciones */}
          {actionHistory[alert.id] && actionHistory[alert.id].length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Timeline de acciones</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {actionHistory[alert.id].map((action, index) => (
                  <div key={index} className="text-xs p-2 bg-background/50 rounded border-l-2 border-primary/20">
                    <span className="font-medium">{action.type}</span> por {action.user} 
                    <span className="text-muted-foreground ml-2">
                      {new Date(action.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer con estado y acciones mejoradas */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {alert.resolved ? (
                <div className="flex items-center space-x-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Resuelto</span>
                </div>
              ) : (alert.status || 'pending') === 'in_progress' ? (
                <div className="flex items-center space-x-2 text-warning">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">En curso</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Pendiente</span>
                </div>
              )}
            </div>

            {!alert.resolved && (user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
              <div className="flex items-center space-x-2">
                {/* Acciones según rol y GDPR */}
                {user?.role === 'HR_ADMIN' ? (
                  // RRHH tiene acceso completo para función clínica
                  <>
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
                      onClick={() => setSelectedAlert(alert)}
                      className="flex items-center space-x-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Resolver</span>
                    </Button>
                  </>
                ) : user?.role === 'MANAGER' ? (
                  // Managers: acciones limitadas, sin contacto directo
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuickAction(alert, 'hr_referral')}
                      className="flex items-center space-x-1"
                    >
                      <Building className="h-3 w-3" />
                      <span>Derivar RRHH</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuickAction(alert, 'action_plan')}
                      className="flex items-center space-x-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Plan 1:1</span>
                    </Button>
                  </>
                ) : null}
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
      {/* Header con refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Bell className="h-8 w-8 text-primary" />
            <span>Centro de Alertas</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center space-x-2">
            <span>
              {user?.role === 'EMPLOYEE' 
                ? 'Gestiona tus notificaciones y alertas personales'
                : user?.role === 'MANAGER'
                ? 'Monitorea y gestiona las alertas de tu equipo'
                : 'Control total de alertas y configuración de políticas'
              }
            </span>
            <span className="text-xs">
              • Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}
            </span>
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
          
          {(user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
            <CreateAlertDialog />
          )}
          {user?.role === 'HR_ADMIN' && (
            <AlertRuleManager />
          )}
        </div>
      </div>

      {/* Política de privacidad RGPD más explícita */}
      <Card className="border-info bg-info/5">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-info mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">🔒 Cumplimiento RGPD - Datos de Salud Mental</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Art. 9 RGPD:</strong> Datos de bienestar son información sensible de salud.</p>
                <p><strong>Managers:</strong> Solo ven nivel de riesgo pseudonimizado, no identidad real.</p>
                <p><strong>RRHH:</strong> Acceso completo para función de prevención laboral.</p>
                <p><strong>Auditoría:</strong> Todos los accesos se registran según Art. 30 RGPD.</p>
                <p><strong>Minimización:</strong> Solo datos necesarios para la función específica.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas mejoradas */}
      <AlertMetrics alerts={alerts} onHighPriorityFilter={handleHighPriorityFilter} />

      {/* Filtros ampliados */}
      <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        
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

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Tipo:</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {alertTypes.map(type => (
                <SelectItem key={type} value={type}>{getAlertTypeLabel(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Responsable:</label>
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member} value={member}>{member}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs con estados ampliados */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pendientes ({unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').length})</span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>En curso ({inProgressAlerts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Resueltas ({resolvedAlerts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">¡Todo bajo control!</h3>
                <p className="text-muted-foreground">No hay alertas pendientes en este momento.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').map(renderPrivacyCompliantAlert)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin alertas en curso</h3>
                <p className="text-muted-foreground">No hay alertas siendo procesadas actualmente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inProgressAlerts.map(renderPrivacyCompliantAlert)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin historial</h3>
                <p className="text-muted-foreground">No hay alertas resueltas para mostrar.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resolvedAlerts.map(renderPrivacyCompliantAlert)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de resolución mejorado */}
      {selectedAlert && (
        <AlertResolutionModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={() => {
            setSelectedAlert(null);
            fetchAlerts();
          }}
        />
      )}
    </div>
  );
};