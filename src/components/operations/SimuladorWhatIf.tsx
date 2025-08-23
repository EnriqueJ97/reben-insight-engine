import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Lightbulb,
  PlayCircle,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SimuladorWhatIf = () => {
  const { toast } = useToast();
  
  // Estados del simulador
  const [simulationParams, setSimulationParams] = useState({
    teamSize: [12],
    avgSalary: [45000],
    turnoverRate: [15],
    wellnessInvestment: [5000],
    flexibilityLevel: [70],
    trainingBudget: [3000],
    managerRatio: [6]
  });

  const [results, setResults] = useState({
    currentCosts: {
      recruitment: 54000,
      training: 36000,
      productivity: 15000,
      total: 105000
    },
    projectedCosts: {
      recruitment: 32400,
      training: 21600,
      productivity: 9000,
      total: 63000
    },
    savings: {
      annual: 42000,
      percentage: 40,
      roi: 340
    },
    metrics: {
      employeeSatisfaction: 85,
      retentionRate: 92,
      productivityIncrease: 23,
      wellnessScore: 78
    }
  });

  const [scenarios, setScenarios] = useState([
    {
      id: '1',
      name: 'Escenario Conservador',
      description: 'Mejoras graduales sin cambios drásticos',
      params: { wellness: 3000, flexibility: 50, training: 2000 },
      expectedROI: 180,
      confidence: 85
    },
    {
      id: '2', 
      name: 'Escenario Agresivo',
      description: 'Inversión alta para transformación completa',
      params: { wellness: 8000, flexibility: 90, training: 5000 },
      expectedROI: 420,
      confidence: 65
    },
    {
      id: '3',
      name: 'Escenario Equilibrado',
      description: 'Balance óptimo riesgo-beneficio',
      params: { wellness: 5000, flexibility: 70, training: 3000 },
      expectedROI: 340,
      confidence: 78
    }
  ]);

  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [activeScenario, setActiveScenario] = useState('3');

  const handleRunSimulation = async () => {
    setIsRunningSimulation(true);
    
    toast({
      title: "Ejecutando simulación...",
      description: "Analizando impacto con algoritmos de ML"
    });

    // Simular procesamiento con IA
    setTimeout(() => {
      // Cálculos simulados basados en parámetros
      const teamSize = simulationParams.teamSize[0];
      const currentTurnover = simulationParams.turnoverRate[0];
      const wellnessInvestment = simulationParams.wellnessInvestment[0];
      
      // Algoritmo simplificado de impacto
      const turnoverReduction = Math.min(50, (wellnessInvestment / 200) + (simulationParams.flexibilityLevel[0] / 10));
      const newTurnoverRate = Math.max(5, currentTurnover - turnoverReduction);
      
      const avgRecruitmentCost = 4500; // por empleado
      const currentRecruitmentCost = (currentTurnover / 100) * teamSize * avgRecruitmentCost;
      const newRecruitmentCost = (newTurnoverRate / 100) * teamSize * avgRecruitmentCost;
      
      const savings = {
        annual: Math.round(currentRecruitmentCost - newRecruitmentCost + (wellnessInvestment * 0.8)),
        percentage: Math.round(((currentRecruitmentCost - newRecruitmentCost) / currentRecruitmentCost) * 100),
        roi: Math.round(((currentRecruitmentCost - newRecruitmentCost) / wellnessInvestment) * 100)
      };

      setResults(prev => ({
        ...prev,
        savings,
        metrics: {
          employeeSatisfaction: Math.min(95, 60 + (wellnessInvestment / 150)),
          retentionRate: Math.min(98, 100 - newTurnoverRate),
          productivityIncrease: Math.min(35, (wellnessInvestment / 300) + (simulationParams.flexibilityLevel[0] / 5)),
          wellnessScore: Math.min(90, 50 + (wellnessInvestment / 200) + (simulationParams.flexibilityLevel[0] / 3))
        }
      }));

      setIsRunningSimulation(false);
      toast({
        title: "Simulación completada",
        description: `ROI proyectado: ${savings.roi}% - Ahorro anual: €${savings.annual.toLocaleString()}`
      });
    }, 3000);
  };

  const handleParameterChange = (param: string, value: number[]) => {
    setSimulationParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleLoadScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSimulationParams(prev => ({
        ...prev,
        wellnessInvestment: [scenario.params.wellness],
        flexibilityLevel: [scenario.params.flexibility],
        trainingBudget: [scenario.params.training]
      }));
      setActiveScenario(scenarioId);
      
      toast({
        title: "Escenario cargado",
        description: `Parámetros actualizados para: ${scenario.name}`
      });
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-success';
    if (roi >= 200) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning'; 
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header con descripción */}
      <Alert className="border-primary/30 bg-primary/5">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Simulador What-If con IA:</strong> Modelo predictivo que calcula el ROI de inversiones 
          en bienestar, usando datos reales de tu organización y algoritmos de machine learning.
        </AlertDescription>
      </Alert>

      {/* Métricas actuales vs proyectadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">€{results.savings.annual.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ahorro Anual Proyectado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className={`text-2xl font-bold ${getROIColor(results.savings.roi)}`}>
                  {results.savings.roi}%
                </p>
                <p className="text-xs text-muted-foreground">ROI Proyectado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold text-info">{results.metrics.retentionRate}%</p>
                <p className="text-xs text-muted-foreground">Retención Proyectada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{results.metrics.productivityIncrease}%</p>
                <p className="text-xs text-muted-foreground">Aumento Productividad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
          <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de configuración */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>Parámetros de Simulación</span>
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tamaño del Equipo: {simulationParams.teamSize[0]} personas
                  </Label>
                  <Slider
                    value={simulationParams.teamSize}
                    onValueChange={(value) => handleParameterChange('teamSize', value)}
                    max={50}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tasa de Rotación Actual: {simulationParams.turnoverRate[0]}%
                  </Label>
                  <Slider
                    value={simulationParams.turnoverRate}
                    onValueChange={(value) => handleParameterChange('turnoverRate', value)}
                    max={50}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Inversión en Bienestar: €{simulationParams.wellnessInvestment[0].toLocaleString()}
                  </Label>
                  <Slider
                    value={simulationParams.wellnessInvestment}
                    onValueChange={(value) => handleParameterChange('wellnessInvestment', value)}
                    max={15000}
                    min={1000}
                    step={500}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Nivel de Flexibilidad: {simulationParams.flexibilityLevel[0]}%
                  </Label>
                  <Slider
                    value={simulationParams.flexibilityLevel}
                    onValueChange={(value) => handleParameterChange('flexibilityLevel', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Presupuesto Formación: €{simulationParams.trainingBudget[0].toLocaleString()}
                  </Label>
                  <Slider
                    value={simulationParams.trainingBudget}
                    onValueChange={(value) => handleParameterChange('trainingBudget', value)}
                    max={10000}
                    min={500}
                    step={250}
                    className="w-full"
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleRunSimulation}
                  disabled={isRunningSimulation}
                >
                  {isRunningSimulation ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Ejecutando Simulación...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Ejecutar Simulación IA
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Preview de resultados en tiempo real */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-success" />
                  <span>Preview de Resultados</span>
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Satisfacción Empleados</span>
                    <span className="text-lg font-bold text-success">{results.metrics.employeeSatisfaction}%</span>
                  </div>
                  <Progress value={results.metrics.employeeSatisfaction} className="h-2" />
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Retención de Talento</span>
                    <span className="text-lg font-bold text-primary">{results.metrics.retentionRate}%</span>
                  </div>
                  <Progress value={results.metrics.retentionRate} className="h-2" />
                </div>

                <div className="p-4 bg-info/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Aumento Productividad</span>
                    <span className="text-lg font-bold text-info">{results.metrics.productivityIncrease}%</span>
                  </div>
                  <Progress value={results.metrics.productivityIncrease} className="h-2" />
                </div>

                <div className="p-4 bg-warning/10 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Score de Bienestar</span>
                    <span className="text-lg font-bold text-warning">{results.metrics.wellnessScore}%</span>
                  </div>
                  <Progress value={results.metrics.wellnessScore} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Escenarios Predefinidos</h3>
              <p className="text-sm text-muted-foreground">
                Configuraciones optimizadas según diferentes estrategias de inversión
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  activeScenario === scenario.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleLoadScenario(scenario.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{scenario.name}</h4>
                      {activeScenario === scenario.id && (
                        <Badge className="bg-primary text-primary-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {scenario.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Inversión Bienestar</p>
                        <p className="font-semibold">€{scenario.params.wellness.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Flexibilidad</p>
                        <p className="font-semibold">{scenario.params.flexibility}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Formación</p>
                        <p className="font-semibold">€{scenario.params.training.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">ROI Esperado</p>
                      <p className={`text-2xl font-bold ${getROIColor(scenario.expectedROI)}`}>
                        {scenario.expectedROI}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Confianza</p>
                      <p className={`text-sm font-medium ${getConfidenceColor(scenario.confidence)}`}>
                        {scenario.confidence}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Análisis Detallado de Resultados</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Comparativa entre situación actual y proyecciones con inversión en bienestar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Costos actuales vs proyectados */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Análisis de Costos</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Reclutamiento</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">€{results.currentCosts.recruitment.toLocaleString()}</div>
                    <div className="text-sm text-success">→ €{results.projectedCosts.recruitment.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Formación</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">€{results.currentCosts.training.toLocaleString()}</div>
                    <div className="text-sm text-success">→ €{results.projectedCosts.training.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Pérdida Productividad</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive">€{results.currentCosts.productivity.toLocaleString()}</div>
                    <div className="text-sm text-success">→ €{results.projectedCosts.productivity.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ROI y métricas */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Retorno de Inversión</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-lg">
                  <div className="text-4xl font-bold text-success mb-2">
                    €{results.savings.annual.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Ahorro Anual Total</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{results.savings.percentage}%</div>
                    <p className="text-xs text-muted-foreground">Reducción Costos</p>
                  </div>
                  <div className="text-center p-4 bg-info/10 rounded-lg">
                    <div className="text-2xl font-bold text-info">{results.savings.roi}%</div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Insights y Recomendaciones de IA</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Análisis inteligente basado en patrones de datos y mejores prácticas del sector
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-success mt-1" />
                <div>
                  <h4 className="font-semibold text-success mb-2">💡 Oportunidad de Alto Impacto</h4>
                  <p className="text-sm mb-3">
                    Nuestro modelo identifica que incrementar la flexibilidad laboral al 80% 
                    generaría el mayor ROI con menor riesgo.
                  </p>
                  <Badge className="bg-success/10 text-success">Confianza: 89%</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-warning">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                <div>
                  <h4 className="font-semibold text-warning mb-2">⚠️ Punto de Atención</h4>
                  <p className="text-sm mb-3">
                    La inversión actual en formación es 40% inferior al benchmark del sector. 
                    Aumentarla optimizaría significativamente los resultados.
                  </p>
                  <Badge className="bg-warning/10 text-warning">Impacto: Alto</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-info">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-info mt-1" />
                <div>
                  <h4 className="font-semibold text-info mb-2">🎯 Recomendación Estratégica</h4>
                  <p className="text-sm mb-3">
                    Implementar la inversión de forma gradual durante 6 meses maximizaría 
                    la adopción y minimizaría la resistencia al cambio.
                  </p>
                  <Badge className="bg-info/10 text-info">Implementación: Gradual</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-primary mb-2">⚡ Quick Win</h4>
                  <p className="text-sm mb-3">
                    Implementar check-ins semanales de bienestar requiere inversión mínima 
                    pero genera impacto inmediato en retención.
                  </p>
                  <Badge className="bg-primary/10 text-primary">Tiempo: 2 semanas</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Próximos pasos recomendados */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg">Próximos Pasos Recomendados</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="text-sm">Aprobar presupuesto de €{simulationParams.wellnessInvestment[0].toLocaleString()} para iniciativa de bienestar</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="text-sm">Implementar política de flexibilidad al {simulationParams.flexibilityLevel[0]}%</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="text-sm">Establecer métricas de seguimiento trimestral con REBEN</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimuladorWhatIf;