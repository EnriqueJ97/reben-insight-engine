import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  TrendingUp,
  BarChart3,
  Brain,
  Zap,
  Play,
  Pause,
  Edit,
  Activity,
  AlertTriangle,
  Target,
  Clock,
  Building,
  Shield,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HRShiftManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('global');
  
  const [automationRules, setAutomationRules] = useState([
    {
      id: '1',
      name: 'Prevención Burnout Crítico',
      condition: 'Carga > 90% AND Bienestar < 65%',
      action: 'Redistribuir turnos automáticamente',
      status: 'active',
      triggered: 12,
      lastTriggered: '2024-01-14T10:30:00Z',
      coverage: 'Toda la organización'
    },
    {
      id: '2',
      name: 'Equidad de Turnos Nocturnos',
      condition: 'Turnos nocturnos > 3 consecutivos',
      action: 'Rotar asignación + Alerta manager',
      status: 'active',
      triggered: 5,
      lastTriggered: '2024-01-12T22:15:00Z',
      coverage: 'Equipos operativos'
    },
    {
      id: '3',
      name: 'Optimización Fin de Semana',
      condition: 'Distribución desigual > 20%',
      action: 'Rebalancear automáticamente',
      status: 'paused',
      triggered: 8,
      lastTriggered: '2024-01-10T14:45:00Z',
      coverage: 'Departamentos críticos'
    }
  ]);

  const [globalMetrics, setGlobalMetrics] = useState({
    totalEmployees: 247,
    averageLoad: 78,
    activeAlerts: 23,
    aiEfficiency: 91,
    automationSavings: 45.5,
    teamsAtRisk: 3,
    companyEquityIndex: 0.85,
    wellnessCorrelation: 0.79
  });

  const [teamComparison, setTeamComparison] = useState([
    {
      teamName: 'Desarrollo',
      manager: 'Ana García',
      employees: 12,
      avgLoad: 82,
      wellnessScore: 85,
      alertsCount: 2,
      riskLevel: 'low'
    },
    {
      teamName: 'Operaciones',
      manager: 'Carlos López',
      employees: 18,
      avgLoad: 95,
      wellnessScore: 68,
      alertsCount: 8,
      riskLevel: 'high'
    },
    {
      teamName: 'Marketing',
      manager: 'María Rodríguez',
      employees: 8,
      avgLoad: 75,
      wellnessScore: 88,
      alertsCount: 1,
      riskLevel: 'low'
    },
    {
      teamName: 'Ventas',
      manager: 'Pedro Martín',
      employees: 15,
      avgLoad: 88,
      wellnessScore: 72,
      alertsCount: 4,
      riskLevel: 'medium'
    }
  ]);

  const [aiConfiguration, setAiConfiguration] = useState({
    burnoutThreshold: 85,
    wellnessMinimum: 65,
    maxConsecutiveShifts: 4,
    autoRebalancing: true,
    predictiveAnalysis: true,
    realTimeMonitoring: true
  });

  const handleToggleAutomation = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ));
    
    toast({
      title: "Regla global actualizada",
      description: "Los cambios se aplicarán en toda la organización"
    });
  };

  const handleConfigurationChange = (key: string, value: any) => {
    setAiConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Configuración actualizada",
      description: "Nuevos parámetros aplicados globalmente"
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

  return (
    <div className="space-y-6">
      {/* Alert específico para HR */}
      <Alert className="border-primary/30 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>ADMIN RRHH:</strong> Vista estratégica y configuración global de turnos inteligentes. 
          Controla políticas, IA y rendimiento organizacional.
        </AlertDescription>
      </Alert>

      {/* Métricas globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{globalMetrics.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Empleados Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{globalMetrics.averageLoad}%</p>
                <p className="text-xs text-muted-foreground">Carga Global</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{globalMetrics.activeAlerts}</p>
                <p className="text-xs text-muted-foreground">Alertas Globales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{globalMetrics.aiEfficiency}%</p>
                <p className="text-xs text-muted-foreground">IA Global</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Vista Global
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automatización
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración IA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Comparativa de Equipos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Análisis comparativo del rendimiento y bienestar por equipo
            </p>
          </div>

          <div className="space-y-4">
            {teamComparison.map((team, index) => (
              <Card key={index} className={`p-6 border-l-4 ${
                team.riskLevel === 'high' ? 'border-l-destructive' :
                team.riskLevel === 'medium' ? 'border-l-warning' : 'border-l-success'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-semibold text-lg">{team.teamName}</h4>
                      <Badge className={`${getRiskBg(team.riskLevel)} ${getRiskColor(team.riskLevel)} border-0`}>
                        Riesgo {team.riskLevel === 'high' ? 'Alto' : team.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Manager: {team.manager}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Empleados</p>
                        <p className="text-lg font-bold">{team.employees}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Carga Promedio</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={team.avgLoad} className="flex-1 h-2" />
                          <span className={`text-lg font-bold ${
                            team.avgLoad >= 90 ? 'text-destructive' : 
                            team.avgLoad >= 80 ? 'text-warning' : 'text-success'
                          }`}>
                            {team.avgLoad}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Bienestar</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={team.wellnessScore} className="flex-1 h-2" />
                          <span className={`text-lg font-bold ${
                            team.wellnessScore >= 80 ? 'text-success' : 
                            team.wellnessScore >= 60 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {team.wellnessScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Alertas Activas</p>
                        <p className={`text-lg font-bold ${
                          team.alertsCount >= 5 ? 'text-destructive' : 
                          team.alertsCount >= 2 ? 'text-warning' : 'text-success'
                        }`}>
                          {team.alertsCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analizar
                    </Button>
                    {team.riskLevel !== 'low' && (
                      <Button size="sm" variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Intervenir
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
              <h3 className="text-lg font-semibold">Reglas de Automatización Global</h3>
              <p className="text-sm text-muted-foreground">
                Configura y gestiona las reglas de IA aplicadas en toda la organización
              </p>
            </div>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Nueva Regla
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-success">
                      {automationRules.filter(r => r.status === 'active').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Reglas Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-info" />
                  <div>
                    <p className="text-2xl font-bold text-info">
                      {automationRules.reduce((sum, rule) => sum + rule.triggered, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Activaciones Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold text-warning">{globalMetrics.automationSavings}h</p>
                    <p className="text-xs text-muted-foreground">Ahorro Semanal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{rule.name}</h4>
                      <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                        {rule.status === 'active' ? 'Activa' : 'Pausada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Condición</p>
                        <p className="text-sm font-medium">{rule.condition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Acción</p>
                        <p className="text-sm font-medium">{rule.action}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cobertura</p>
                        <p className="text-sm font-medium">{rule.coverage}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <span>Activaciones: <strong>{rule.triggered}</strong></span>
                      <span>Última activación: <strong>{new Date(rule.lastTriggered).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Switch
                      checked={rule.status === 'active'}
                      onCheckedChange={() => handleToggleAutomation(rule.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Configuración de IA Global</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajusta los parámetros de la inteligencia artificial para toda la organización
            </p>
          </div>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Parámetros de Prevención de Burnout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Umbral de Burnout (% carga de trabajo)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="range" 
                      min="70" 
                      max="100" 
                      value={aiConfiguration.burnoutThreshold}
                      onChange={(e) => handleConfigurationChange('burnoutThreshold', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-bold">{aiConfiguration.burnoutThreshold}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Bienestar Mínimo Requerido (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="range" 
                      min="50" 
                      max="80" 
                      value={aiConfiguration.wellnessMinimum}
                      onChange={(e) => handleConfigurationChange('wellnessMinimum', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-bold">{aiConfiguration.wellnessMinimum}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Máximo de Turnos Consecutivos
                  </label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="range" 
                      min="2" 
                      max="6" 
                      value={aiConfiguration.maxConsecutiveShifts}
                      onChange={(e) => handleConfigurationChange('maxConsecutiveShifts', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-bold">{aiConfiguration.maxConsecutiveShifts}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rebalanceo Automático</p>
                    <p className="text-sm text-muted-foreground">Permitir redistribución automática de cargas</p>
                  </div>
                  <Switch
                    checked={aiConfiguration.autoRebalancing}
                    onCheckedChange={(value) => handleConfigurationChange('autoRebalancing', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Análisis Predictivo</p>
                    <p className="text-sm text-muted-foreground">Predicción de riesgos y burnout</p>
                  </div>
                  <Switch
                    checked={aiConfiguration.predictiveAnalysis}
                    onCheckedChange={(value) => handleConfigurationChange('predictiveAnalysis', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Monitoreo en Tiempo Real</p>
                    <p className="text-sm text-muted-foreground">Análisis continuo de bienestar y carga</p>
                  </div>
                  <Switch
                    checked={aiConfiguration.realTimeMonitoring}
                    onCheckedChange={(value) => handleConfigurationChange('realTimeMonitoring', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Global IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Eficiencia General</span>
                  <span className="font-bold text-success">{globalMetrics.aiEfficiency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Índice de Equidad</span>
                  <span className="font-bold text-info">{Math.round(globalMetrics.companyEquityIndex * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Correlación Bienestar</span>
                  <span className="font-bold text-primary">{Math.round(globalMetrics.wellnessCorrelation * 100)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipos en Riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alto Riesgo</span>
                    <span className="font-bold text-destructive">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Riesgo Medio</span>
                    <span className="font-bold text-warning">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bajo Riesgo</span>
                    <span className="font-bold text-success">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impacto de Automatización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Horas Ahorradas/Semana</span>
                  <span className="font-bold text-success">{globalMetrics.automationSavings}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Burnout Prevenidos</span>
                  <span className="font-bold text-info">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Satisfacción IA</span>
                  <span className="font-bold text-primary">94%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRShiftManagement;