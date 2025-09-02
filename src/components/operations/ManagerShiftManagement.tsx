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
  Calendar as CalendarIcon, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  Activity,
  Target,
  BarChart3,
  Brain,
  Zap,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShiftAssignmentCalendar from '@/components/shifts/ShiftAssignmentCalendar';
import EmployeePreferences from '@/components/shifts/EmployeePreferences';

const ManagerShiftManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('workload');
  const [assigning, setAssigning] = useState(false);
  const [metrics, setMetrics] = useState<{ equityIndex: number; preferenceMatch: number; averageWorkload: number } | null>(null);
  
  // Estados para gestión de cargas del equipo
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

  const [teamMetrics, setTeamMetrics] = useState({
    averageLoad: 78,
    activeAlerts: 6,
    efficiency: 87,
    equityIndex: 0.73,
    wellnessCorrelation: 0.82,
    teamSize: 8
  });

  const handleAutoAssign = async () => {
    if (!user?.tenant_id) {
      toast({ title: 'Error', description: 'No se pudo detectar el tenant', variant: 'destructive' });
      return;
    }
    setAssigning(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 13);
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
        toast({ title: 'Asignación completada', description: `${data.assignmentsCreated} turnos generados para mi equipo` });
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
      title: "Rebalanceando mi equipo...",
      description: "Optimizando distribución con IA"
    });
    
    setTimeout(() => {
      setWorkloadData(prev => prev.map(emp => ({
        ...emp,
        currentLoad: Math.max(60, Math.min(80, emp.currentLoad + (Math.random() - 0.5) * 20)),
        riskLevel: emp.currentLoad > 85 ? 'high' : emp.currentLoad > 75 ? 'medium' : 'low'
      })));
      
      toast({
        title: "Rebalanceo completado",
        description: "Cargas de mi equipo redistribuidas"
      });
    }, 2000);
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
      {/* Alert específico para manager */}
      <Alert className="border-primary/30 bg-primary/5">
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          <strong>MANAGER:</strong> Gestiona turnos y cargas de tu equipo. 
          La IA te ayuda a prevenir burnout y optimizar la distribución.
        </AlertDescription>
      </Alert>

      {/* Métricas del equipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{teamMetrics.teamSize}</p>
                <p className="text-xs text-muted-foreground">Mi Equipo</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-xs text-muted-foreground">Eficiencia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workload" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Mi Equipo
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
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workload" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Gestión de Cargas - Mi Equipo</h3>
              <p className="text-sm text-muted-foreground">
                Monitoreo y optimización de la carga de trabajo de tu equipo
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRebalanceWorkload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebalancear
              </Button>
              <Button onClick={handleAutoAssign} disabled={assigning}>
                <Brain className="h-4 w-4 mr-2" />
                {assigning ? 'Optimizando...' : 'Optimizar Turnos'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {workloadData.map((employee) => (
              <Card key={employee.id} className={`p-6 border-l-4 ${
                employee.riskLevel === 'high' ? 'border-l-destructive' :
                employee.riskLevel === 'medium' ? 'border-l-warning' : 'border-l-success'
              }`}>
                <div className="flex items-start justify-between">
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
                    
                    <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Brain className="h-4 w-4 text-info" />
                        <span className="text-sm font-medium text-info">Recomendación Inteligente:</span>
                      </div>
                      <p className="text-sm">{employee.recommendedAction}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
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

        <TabsContent value="schedule" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Calendario de Turnos - Mi Equipo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visualiza y gestiona los turnos asignados a tu equipo
            </p>
            <ShiftAssignmentCalendar />
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Preferencias del Equipo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona las preferencias de horarios de tu equipo
            </p>
            <EmployeePreferences />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Índice de Equidad</span>
                  <span className="font-bold text-success">{Math.round(teamMetrics.equityIndex * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Correlación Bienestar</span>
                  <span className="font-bold text-info">{Math.round(teamMetrics.wellnessCorrelation * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Eficiencia IA</span>
                  <span className="font-bold text-primary">{teamMetrics.efficiency}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Carlos López: Riesgo alto de burnout - Acción requerida
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      3 empleados con turnos nocturnos consecutivos
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerShiftManagement;