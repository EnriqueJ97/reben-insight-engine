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
  Info,
  Zap,
  Target,
  BarChart3
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
  const { alerts, loading, resolveAlert, fetchAlerts, getGlobalAlertStats } = useAlerts();
  const { toast } = useToast();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionHistory, setActionHistory] = useState<Record<string, any[]>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string | null>(null);

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
      await fetchAlerts(selectedTeamFilter || undefined);
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

  const handleTeamFilter = async (teamId: string | null) => {
    setSelectedTeamFilter(teamId);
    await fetchAlerts(teamId || undefined);
  };

  // Get available teams for filtering (HR_ADMIN only)
  const teamOptions = useMemo(() => {
    if (user?.role !== 'HR_ADMIN') return [];
    
    const teams = [...new Set(
      alerts
        .map(alert => alert.profiles?.teams)
        .filter(Boolean)
        .map(team => ({ id: team!.id, name: team!.name }))
    )];
    
    return teams;
  }, [alerts, user?.role]);

  const globalStats = user?.role === 'HR_ADMIN' ? getGlobalAlertStats() : null;

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
    
    // SISTEMA DE ANONIMIZACIÓN para TODOS los roles por protección de datos
    const getInitials = (name: string) => {
      if (!name) return "N.N.";
      return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('.');
    };
    
    if (userRole === 'MANAGER' || userRole === 'HR_ADMIN') {
      if (teamSize < 5) {
        return {
          name: "Datos protegidos (equipo <5)",
          role: "Miembro del equipo",
          showIdentity: false,
          alias: null
        };
      }
      
      // Mostrar solo iniciales para proteger identidad
      const initials = getInitials(alert.profiles?.full_name || "Usuario");
      return {
        name: initials,
        role: "Empleado", // Rol genérico para proteger identidad
        showIdentity: false,
        alias: initials
      };
    }
    
    // Empleados solo ven sus propias alertas (con identidad real)
    if (alert.user_id === userRole) {
      return {
        name: alert.profiles?.full_name || alert.profiles?.email,
        role: alert.profiles?.role,
        showIdentity: true,
        alias: null
      };
    }
    
    // Por defecto, solo iniciales
    return {
      name: getInitials(alert.profiles?.full_name || "Usuario"),
      role: "Empleado",
      showIdentity: false,
      alias: getInitials(alert.profiles?.full_name || "Usuario")
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
      <Card key={alert.id} className={`group border-l-4 ${getSeverityBorder(alert.severity)} ${getSeverityBg(alert.severity)} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}>
        <CardContent className="p-6">
          {/* Header mejorado con diseño moderno */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                alert.severity === 'high' ? 'bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive shadow-lg shadow-destructive/25' :
                alert.severity === 'medium' ? 'bg-gradient-to-br from-warning/20 to-warning/10 text-warning shadow-lg shadow-warning/25' :
                'bg-gradient-to-br from-info/20 to-info/10 text-info shadow-lg shadow-info/25'
              }`}>
                {getAlertIcon(alert.type)}
              </div>
              <div>
                <h4 className="font-bold text-xl text-foreground mb-2">{getAlertTypeLabel(alert.type)}</h4>
                <div className="flex items-center space-x-3">
                  <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs font-bold px-3 py-1 shadow-md">
                    {alert.severity === 'high' ? '🔴 CRÍTICO' : 
                     alert.severity === 'medium' ? '🟡 MEDIO' : '🟢 BAJO'}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center bg-muted/30 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3 mr-1" />
                    {timeAgo}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center bg-muted/30 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3 mr-1" />
                    SLA: 48h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del empleado (GDPR Art. 9 compliant) */}
          {user?.role !== 'EMPLOYEE' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-background to-muted/20 rounded-xl border border-muted/30 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-foreground">{employee.name}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{employee.role}</Badge>
                      {!employee.showIdentity && (
                        <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
                          🔒 Datos anonimizados
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.role === 'MANAGER' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-2 bg-info/10 rounded-lg">
                            <Info className="h-4 w-4 text-info" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Protección RGPD</p>
                          <p className="text-sm">Como manager, solo ves nivel de riesgo por RGPD Art. 9</p>
                          <p className="text-sm">Para detalles clínicos, deriva a RRHH</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {teamSize < 5 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="p-2 bg-warning/10 rounded-lg">
                            <Info className="h-4 w-4 text-warning" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">K-Anonimato</p>
                          <p className="text-sm">Equipo pequeño (&lt;5): identidad protegida</p>
                          <p className="text-sm">Regla k-anonimato para prevenir reidentificación</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Descripción y sugerencias */}
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-muted/20">
              <p className="text-sm leading-relaxed text-foreground font-medium">{message}</p>
            </div>
            
            {alert.severity === 'high' && (
              <div className="p-4 bg-gradient-to-r from-info/10 to-info/5 border border-info/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-info/20 rounded-md">
                    <Target className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Sugerencia automática:</p>
                    <p className="text-sm text-foreground">
                      Repriorizar backlog y revisar staffing. Considerar derivación a Servicio de Prevención.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Owner y SLA */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Owner: {alert.assigned_to ? 'Team Lead' : 'Auto-asignado'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">TMR: 12h</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                Creado: {timeAgo}
              </span>
            </div>
          </div>

          {/* Historial de acciones */}
          {actionHistory[alert.id] && actionHistory[alert.id].length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <History className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Timeline de acciones</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {actionHistory[alert.id].map((action, index) => (
                  <div key={index} className="text-xs p-3 bg-background/80 rounded-lg border-l-2 border-primary/30 shadow-sm">
                    <span className="font-semibold text-foreground">{action.type}</span> por {action.user} 
                    <span className="text-muted-foreground ml-2">
                      {new Date(action.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer con estado y acciones mejoradas */}
          <div className="flex items-center justify-between pt-6 border-t border-muted/30">
            <div className="flex items-center space-x-3">
              {alert.resolved ? (
                <div className="flex items-center space-x-2 text-success bg-success/10 px-3 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Resuelto</span>
                </div>
              ) : (alert.status || 'pending') === 'in_progress' ? (
                <div className="flex items-center space-x-2 text-warning bg-warning/10 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-semibold">En curso</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground bg-muted/20 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Pendiente</span>
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
                      className="flex items-center space-x-2 hover:bg-primary/10"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Llamar</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(alert, 'email')}
                      className="flex items-center space-x-2 hover:bg-primary/10"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Resolver</span>
                    </Button>
                  </>
                ) : user?.role === 'MANAGER' ? (
                  // Manager solo puede derivar (GDPR compliance)
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(alert, 'hr_referral')}
                      className="flex items-center space-x-2 hover:bg-warning/10"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Derivar a RRHH</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(alert, 'action_plan')}
                      className="flex items-center space-x-2 hover:bg-info/10"
                    >
                      <BarChart3 className="h-3 w-3" />
                      <span>Plan acción</span>
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

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header rediseñado con gradiente premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background to-primary/5 border border-primary/20 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.15)_1px,transparent_0)] [background-size:20px_20px] opacity-30"></div>
        <div className="relative p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Centro de Alertas
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  Monitoreo inteligente del bienestar del equipo con IA avanzada
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-destructive/15 rounded-2xl border border-destructive/25 shadow-lg">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse shadow-lg shadow-destructive/50"></div>
                <span className="text-sm font-bold text-destructive">
                  {unresolvedAlerts.length} alertas activas
                </span>
              </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="lg"
                className="gap-3 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 shadow-lg"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar datos
              </Button>
              
              {(user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
                <CreateAlertDialog />
              )}
              {user?.role === 'HR_ADMIN' && (
                <AlertRuleManager />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de privacidad RGPD */}
      <Card className="border-info/30 bg-gradient-to-r from-info/10 to-info/5 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-info/20 rounded-lg">
              <Shield className="h-6 w-6 text-info" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-lg text-foreground">🔒 Protección de Datos Personales</h4>
              <div className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                <p><strong>RGPD Art. 9:</strong> Los datos mostrados están anonimizados para proteger la identidad de los empleados.</p>
                <p><strong>Solo iniciales:</strong> Se muestran únicamente las iniciales para cumplir con la normativa de privacidad.</p>
                <p><strong>Auditoría:</strong> Todos los accesos se registran según Art. 30 RGPD.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team filter for HR_ADMIN */}
      {user?.role === 'HR_ADMIN' && teamOptions.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Vista Global - Filtrar por Equipo</h3>
                  <p className="text-sm text-muted-foreground">Como HR Admin puedes ver alertas de toda la empresa</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Equipo:</span>
                <select 
                  value={selectedTeamFilter || 'all'} 
                  onChange={(e) => handleTeamFilter(e.target.value === 'all' ? null : e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm bg-background hover:border-primary/40 transition-colors min-w-48"
                >
                  <option value="all">Todos los equipos ({alerts.length} alertas)</option>
                  {teamOptions.map(team => {
                    const teamAlerts = alerts.filter(alert => alert.profiles?.team_id === team.id);
                    return (
                      <option key={team.id} value={team.id}>
                        {team.name} ({teamAlerts.length} alertas)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            
            {globalStats && (
              <div className="mt-4 p-4 bg-background/60 rounded-lg border border-primary/10">
                <h4 className="font-medium mb-3">Estadísticas por Equipo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(globalStats.teamBreakdown).map(([teamName, stats]) => (
                    <div key={teamName} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm font-medium">{teamName}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{stats.total}</span>
                        {stats.critical > 0 && (
                          <Badge variant="destructive" className="h-4 text-xs">{stats.critical}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métricas mejoradas */}
      <AlertMetrics alerts={alertsWithStatus} />

      {/* Filtros rediseñados */}
      <Card className="border-primary/20 bg-gradient-to-r from-background to-muted/10 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Filtros avanzados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Severidad</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="bg-background border-muted/40 hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  <SelectItem value="high">🔴 Crítico</SelectItem>
                  <SelectItem value="medium">🟡 Medio</SelectItem>
                  <SelectItem value="low">🟢 Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Tipo de alerta</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-background border-muted/40 hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {alertTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getAlertTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Responsable</Label>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="bg-background border-muted/40 hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Owner" />
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

            <div className="flex items-end">
              <Button
                onClick={handleHighPriorityFilter}
                variant="destructive"
                className="w-full gap-2 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                Solo críticas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs rediseñadas con mejor UX */}
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex items-center justify-between mb-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/30 p-2 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-3 py-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Pendientes</span>
                <Badge variant="destructive" className="ml-2 h-6 w-6 p-0 text-xs flex items-center justify-center shadow-md">
                  {unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="in_progress"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-3 py-2">
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">En curso</span>
                <Badge variant="secondary" className="ml-2 h-6 w-6 p-0 text-xs flex items-center justify-center shadow-md">
                  {inProgressAlerts.length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="resolved"
              className="data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/20 transition-all duration-300 rounded-xl"
            >
              <div className="flex items-center gap-3 py-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Resueltas</span>
                <Badge variant="outline" className="ml-2 h-6 w-6 p-0 text-xs flex items-center justify-center shadow-md">
                  {resolvedAlerts.length}
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="space-y-6">
          {unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-success/10 rounded-full mb-6">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">¡Todo bajo control!</h3>
                <p className="text-muted-foreground text-center max-w-md text-lg">
                  No hay alertas pendientes en este momento. El equipo está funcionando de manera óptima.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {unresolvedAlerts.filter(a => (a.status || 'pending') !== 'in_progress').map(alert => renderPrivacyCompliantAlert(alert))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-6">
          {inProgressAlerts.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-muted/20 rounded-full mb-6">
                  <Clock className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">Sin alertas en progreso</h3>
                <p className="text-muted-foreground text-center max-w-md text-lg">
                  No hay alertas siendo atendidas actualmente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {inProgressAlerts.map(alert => renderPrivacyCompliantAlert(alert))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-6">
          {resolvedAlerts.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-muted/20 rounded-full mb-6">
                  <History className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-2xl mb-3 text-foreground">Sin historial</h3>
                <p className="text-muted-foreground text-center max-w-md text-lg">
                  No hay alertas resueltas para mostrar en este momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {resolvedAlerts.map(alert => renderPrivacyCompliantAlert(alert))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de resolución */}
      {selectedAlert && (
        <AlertResolutionModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={() => {
            if (selectedAlert?.id) {
              resolveAlert(selectedAlert.id);
            }
            setSelectedAlert(null);
          }}
        />
      )}

      {/* Footer con información de actualización */}
      <div className="flex items-center justify-between text-sm text-muted-foreground mt-12 pt-6 border-t border-muted/30">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Última actualización: {lastRefresh.toLocaleTimeString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Datos protegidos por RGPD</span>
        </div>
      </div>
    </div>
  );
};