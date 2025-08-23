import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Users, 
  Settings, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  Activity,
  Target,
  BarChart3,
  Brain,
  Shield,
  Zap,
  TrendingDown,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShiftAssignmentCalendar from '@/components/shifts/ShiftAssignmentCalendar';
import EmployeePreferences from '@/components/shifts/EmployeePreferences';

const ShiftManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('workload');
  const [assigning, setAssigning] = useState(false);
  const [metrics, setMetrics] = useState<{ equityIndex: number; preferenceMatch: number; averageWorkload: number } | null>(null);
  
  // Estados para gestión inteligente de cargas
  const [workloadData, setWorkloadData] = useState([
    {
      id: '1',
      employeeName: 'María García',
      currentLoad: 85,
      weeklyHours: 42,
      consecutiveShifts: 3,
      riskLevel: 'medium',
      wellnessScore: 78,
      lastBreak: '2 días',
      shiftTypes: { morning: 60, afternoon: 30, night: 10 },
      burnoutRisk: 0.35,
      recommendedAction: 'Reducir turnos nocturnos'
    },
    {
      id: '2',
      employeeName: 'Carlos López',
      currentLoad: 95,
      weeklyHours: 48,
      consecutiveShifts: 5,
      riskLevel: 'high',
      wellnessScore: 62,
      lastBreak: '5 días',
      shiftTypes: { morning: 40, afternoon: 20, night: 40 },
      burnoutRisk: 0.75,
      recommendedAction: 'Descanso obligatorio'
    },
    {
      id: '3',
      employeeName: 'Ana Martínez',
      currentLoad: 65,
      weeklyHours: 35,
      consecutiveShifts: 2,
      riskLevel: 'low',
      wellnessScore: 88,
      lastBreak: '1 día',
      shiftTypes: { morning: 70, afternoon: 30, night: 0 },
      burnoutRisk: 0.15,
      recommendedAction: 'Puede asumir más carga'
    }
  ]);

  const [automationRules, setAutomationRules] = useState([
    {
      id: '1',
      name: 'Prevención Burnout Crítico',
      condition: 'Carga > 90% AND Bienestar < 65%',
      action: 'Redistribuir turnos automáticamente',
      status: 'active',
      triggered: 12,
      lastTriggered: '2024-01-14T10:30:00Z'
    },
    {
      id: '2',
      name: 'Equidad de Turnos Nocturnos',
      condition: 'Turnos nocturnos > 3 consecutivos',
      action: 'Rotar asignación + Alerta manager',
      status: 'active',
      triggered: 5,
      lastTriggered: '2024-01-12T22:15:00Z'
    },
    {
      id: '3',
      name: 'Optimización Fin de Semana',
      condition: 'Distribución desigual > 20%',
      action: 'Rebalancear automáticamente',
      status: 'paused',
      triggered: 8,
      lastTriggered: '2024-01-10T14:45:00Z'
    }
  ]);

  const [teamMetrics, setTeamMetrics] = useState({
    averageLoad: 78,
    totalRisk: 'medium' as const,
    activeAlerts: 6,
    efficiency: 87,
    equityIndex: 0.73,
    wellnessCorrelation: 0.82,
    automationSavings: 15.5 // horas semanales ahorradas
  });

  useEffect(() => {
    // Simular carga de datos en tiempo real
    const interval = setInterval(() => {
      // Actualizar métricas cada 30 segundos en producción
      setTeamMetrics(prev => ({
        ...prev,
        averageLoad: Math.max(70, Math.min(95, prev.averageLoad + (Math.random() - 0.5) * 2))
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  const handleAutoAssign = async () => {
    if (!user?.tenant_id) {
      toast({ title: 'Falta tenant', description: 'No se pudo detectar el tenant', variant: 'destructive' });
      return;
    }
    setAssigning(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 13); // 14 días
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const { data, error } = await supabase.functions.invoke('assign-shifts', {
        body: {
          startDate,
          endDate,
          tenantId: user.tenant_id,
        },
      });
      if (error) throw error;
      if (data?.success) {
        const m = data.metrics || null;
        setMetrics(m);
        toast({ title: 'Asignación completada', description: `${data.assignmentsCreated} turnos generados con IA` });
      } else {
        toast({ title: 'Error al asignar', description: data?.error || 'Intenta nuevamente', variant: 'destructive' });
      }
    } catch (e) {
      console.error('assign-shifts error', e);
      toast({ title: 'Error', description: 'No se pudo completar la asignación', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRebalanceWorkload = async () => {
    toast({
      title: "Rebalanceando cargas...",
      description: "Analizando distribución óptima con IA"
    });
    
    // Simular rebalanceo inteligente
    setTimeout(() => {
      setWorkloadData(prev => prev.map(emp => ({
        ...emp,
        currentLoad: Math.max(60, Math.min(80, emp.currentLoad + (Math.random() - 0.5) * 20)),
        riskLevel: emp.currentLoad > 85 ? 'high' : emp.currentLoad > 75 ? 'medium' : 'low'
      })));
      
      toast({
        title: "Rebalanceo completado",
        description: "Cargas redistribuidas para optimizar bienestar"
      });
    }, 3000);
  };

  const handleToggleAutomation = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ));
    
    toast({
      title: "Regla actualizada",
      description: "Los cambios se aplicarán en la próxima evaluación"
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';  
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10';
      case 'medium': return 'bg-warning/10';
      case 'high': return 'bg-destructive/10';
      default: return 'bg-muted/10';
    }
  };

  const getWorkloadColor = (load: number) => {
    if (load >= 90) return 'text-destructive';
    if (load >= 80) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-6">
      {/* Alert de funcionalidad inteligente */}
      <Alert className="border-primary/30 bg-primary/5">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>IA Activada:</strong> Sistema inteligente analizando cargas de trabajo en tiempo real. 
          Automatización activa para prevenir burnout y optimizar distribución.
        </AlertDescription>
      </Alert>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className={`text-2xl font-bold ${getWorkloadColor(teamMetrics.averageLoad)}`}>
                  {Math.round(teamMetrics.averageLoad)}%
                </p>
                <p className="text-xs text-muted-foreground">Carga Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{teamMetrics.activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Alertas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{teamMetrics.efficiency}%</p>
                <p className="text-xs text-muted-foreground">Eficiencia IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold text-info">{teamMetrics.automationSavings}h</p>
                <p className="text-xs text-muted-foreground">Ahorro Semanal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workload" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cargas Inteligentes
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automatización
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gestión Inteligente de Cargas de Trabajo</h3>
              <p className="text-sm text-muted-foreground">
                Análisis en tiempo real con correlación de bienestar y prevención de burnout
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRebalanceWorkload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebalancear IA
              </Button>
              <Button onClick={handleAutoAssign} disabled={assigning}>
                <Brain className="h-4 w-4 mr-2" />
                {assigning ? 'Optimizando...' : 'Optimizar Todo'}
              </Button>
            </div>
          </div>

          {/* Lista de empleados con análisis de carga */}
          <div className="space-y-4">
            {workloadData.map((employee) => (
              <Card key={employee.id} className={`p-6 border-l-4 ${
                employee.riskLevel === 'high' ? 'border-l-destructive' :
                employee.riskLevel === 'medium' ? 'border-l-warning' : 'border-l-success'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-semibold text-lg">{employee.employeeName}</h4>
                      <Badge className={`${getRiskBg(employee.riskLevel)} ${getRiskColor(employee.riskLevel)} border-0`}>
                        Riesgo {employee.riskLevel === 'high' ? 'Alto' : employee.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Carga Actual</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={employee.currentLoad} className="flex-1 h-2" />
                          <span className={`text-lg font-bold ${getWorkloadColor(employee.currentLoad)}`}>
                            {employee.currentLoad}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Bienestar</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={employee.wellnessScore} className="flex-1 h-2" />
                          <span className={`text-lg font-bold ${
                            employee.wellnessScore >= 80 ? 'text-success' : 
                            employee.wellnessScore >= 60 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {employee.wellnessScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Horas Semanales</p>
                        <p className="text-lg font-bold">{employee.weeklyHours}h</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Turnos Consecutivos</p>
                        <p className={`text-lg font-bold ${
                          employee.consecutiveShifts >= 4 ? 'text-destructive' : 
                          employee.consecutiveShifts >= 3 ? 'text-warning' : 'text-success'
                        }`}>
                          {employee.consecutiveShifts}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Distribución de Turnos</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Mañana:</span>
                            <span className="font-medium">{employee.shiftTypes.morning}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tarde:</span>
                            <span className="font-medium">{employee.shiftTypes.afternoon}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Noche:</span>
                            <span className="font-medium">{employee.shiftTypes.night}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <h5 className="font-medium mb-2">Métricas de Riesgo</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Burnout Risk:</span>
                            <span className={`font-medium ${
                              employee.burnoutRisk >= 0.7 ? 'text-destructive' : 
                              employee.burnoutRisk >= 0.4 ? 'text-warning' : 'text-success'
                            }`}>
                              {Math.round(employee.burnoutRisk * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Último descanso:</span>
                            <span className="font-medium">{employee.lastBreak}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recomendación IA */}
                    <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Brain className="h-4 w-4 text-info" />
                        <span className="text-sm font-medium text-info">Recomendación IA:</span>
                      </div>
                      <p className="text-sm">{employee.recommendedAction}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalles
                    </Button>
                    {employee.riskLevel !== 'low' && (
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Actuar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Reglas de Automatización</h3>
              <p className="text-sm text-muted-foreground">
                Configuración de acciones automáticas basadas en métricas de carga y bienestar
              </p>
            </div>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Nueva Regla
            </Button>
          </div>

          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{rule.name}</h4>
                      <Badge className={rule.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                        {rule.status === 'active' ? 'Activa' : 'Pausada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Condición:</p>
                        <p className="text-sm text-muted-foreground font-mono bg-muted/30 p-2 rounded">
                          {rule.condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Acción:</p>
                        <p className="text-sm text-muted-foreground">
                          {rule.action}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>🔥 Activada {rule.triggered} veces</span>
                      <span>🕒 Última: {new Date(rule.lastTriggered).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleAutomation(rule.id)}
                    >
                      {rule.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Métricas de automatización */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg">Rendimiento de Automatización</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-3xl font-bold text-success mb-2">{teamMetrics.automationSavings}h</div>
                <p className="text-sm text-muted-foreground">Horas ahorradas por semana</p>
              </div>
              <div className="text-center p-4 bg-info/10 rounded-lg">
                <div className="text-3xl font-bold text-info mb-2">
                  {Math.round(teamMetrics.wellnessCorrelation * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Correlación con bienestar</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">{teamMetrics.efficiency}%</div>
                <p className="text-sm text-muted-foreground">Eficiencia del sistema</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex gap-2 mb-6">
            <Button variant="outline" onClick={handleAutoAssign} disabled={assigning}>
              <RefreshCw className={`w-4 h-4 mr-2 ${assigning ? 'animate-spin' : ''}`} />
              Generar Horarios IA
            </Button>
            <Button onClick={handleAutoAssign} disabled={assigning}>
              <Brain className="w-4 h-4 mr-2" />
              {assigning ? 'Optimizando con IA...' : 'Asignación Inteligente'}
            </Button>
          </div>
          <ShiftAssignmentCalendar />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <EmployeePreferences />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{teamMetrics.equityIndex.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Índice de equidad (0-1)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Correlación Bienestar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-info">{Math.round(teamMetrics.wellnessCorrelation * 100)}%</div>
                <p className="text-sm text-muted-foreground">Turnos vs bienestar</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eficiencia IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{teamMetrics.efficiency}%</div>
                <p className="text-sm text-muted-foreground">Optimización automática</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas Inteligentes Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                  <div>
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Riesgo de burnout crítico
                    </h4>
                    <p className="text-sm text-muted-foreground">Carlos López: 5 turnos consecutivos + bienestar 62%</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="destructive">Crítico</Badge>
                    <Button size="sm">
                      <Zap className="h-4 w-4 mr-1" />
                      Auto-resolver
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border-l-4 border-warning">
                  <div>
                    <h4 className="font-medium flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Distribución desigual detectada
                    </h4>
                    <p className="text-sm text-muted-foreground">Turnos nocturnos concentrados en 2 empleados (40% vs 10%)</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">Medio</Badge>
                    <Button size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Rebalancear
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border-l-4 border-success">
                  <div>
                    <h4 className="font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Optimización completada
                    </h4>
                    <p className="text-sm text-muted-foreground">Sistema ajustó automáticamente 8 turnos para mejorar equidad</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Resuelto</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correlación Bienestar-Turnos */}
          <Card>
            <CardHeader>
              <CardTitle>Correlación Bienestar y Asignación de Turnos</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Insight IA:</strong> Los empleados con turnos nocturnos &gt;30% muestran 
                  15% menos bienestar. El sistema está redistribuyendo automáticamente para optimizar.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftManagement;