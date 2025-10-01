import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, RotateCcw, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useCSRDCompliance } from '@/hooks/useCSRDCompliance';
import { toast } from 'sonner';

interface ScenarioParameter {
  key: string;
  label: string;
  category: 'social' | 'environmental' | 'governance';
  unit: string;
  min: number;
  max: number;
  current: number;
  default: number;
}

export const CSRDScenarioSimulator = () => {
  const { metrics, simulateScenario } = useCSRDCompliance();
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [parameters, setParameters] = useState<ScenarioParameter[]>([
    // Social (S1)
    {
      key: 'wellbeing_improvement',
      label: 'Mejora en bienestar laboral',
      category: 'social',
      unit: '%',
      min: 0,
      max: 50,
      current: 0,
      default: 0
    },
    {
      key: 'turnover_reduction',
      label: 'Reducción de rotación',
      category: 'social',
      unit: '%',
      min: 0,
      max: 40,
      current: 0,
      default: 0
    },
    {
      key: 'training_hours_increase',
      label: 'Aumento horas formación',
      category: 'social',
      unit: '%',
      min: 0,
      max: 100,
      current: 0,
      default: 0
    },
    // Ambiental (E1)
    {
      key: 'emissions_reduction',
      label: 'Reducción emisiones GEI',
      category: 'environmental',
      unit: '%',
      min: 0,
      max: 50,
      current: 0,
      default: 0
    },
    {
      key: 'renewable_energy_increase',
      label: 'Aumento energía renovable',
      category: 'environmental',
      unit: '%',
      min: 0,
      max: 100,
      current: 0,
      default: 0
    },
    // Gobernanza (G1)
    {
      key: 'ethics_training_increase',
      label: 'Aumento formación ética',
      category: 'governance',
      unit: '%',
      min: 0,
      max: 100,
      current: 0,
      default: 0
    }
  ]);

  const handleParameterChange = (key: string, value: number[]) => {
    setParameters(prev =>
      prev.map(p => (p.key === key ? { ...p, current: value[0] } : p))
    );
  };

  const resetParameters = () => {
    setParameters(prev => prev.map(p => ({ ...p, current: p.default })));
    setResults(null);
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const changes = parameters.reduce((acc, p) => {
        if (p.current !== p.default) {
          acc[p.key] = p.current;
        }
        return acc;
      }, {} as Record<string, number>);

      const simulationResults = await simulateScenario(changes);
      
      // Calcular impactos proyectados
      const projectedImpacts = {
        compliance_index_change: calculateComplianceImpact(changes),
        financial_impact: calculateFinancialImpact(changes),
        esg_score_change: calculateESGImpact(changes),
        csrd_gaps_reduced: calculateGapsReduction(changes),
        estimated_savings: calculateSavings(changes),
        implementation_cost: calculateCost(changes)
      };

      setResults({
        ...simulationResults,
        impacts: projectedImpacts,
        applied_changes: changes
      });

      toast.success('Simulación completada');
    } catch (error) {
      console.error('Error in simulation:', error);
      toast.error('Error ejecutando simulación');
    } finally {
      setSimulating(false);
    }
  };

  const calculateComplianceImpact = (changes: Record<string, number>) => {
    // Lógica simplificada: cada mejora del 10% en parámetros sociales mejora 2% el índice
    const socialImpact = Object.entries(changes)
      .filter(([key]) => parameters.find(p => p.key === key)?.category === 'social')
      .reduce((sum, [, value]) => sum + value, 0);
    
    return Math.min(15, Math.round(socialImpact * 0.2));
  };

  const calculateFinancialImpact = (changes: Record<string, number>) => {
    // ROI proyectado basado en mejoras
    const turnoverReduction = changes.turnover_reduction || 0;
    const wellbeingImprovement = changes.wellbeing_improvement || 0;
    
    return Math.round((turnoverReduction * 800 + wellbeingImprovement * 500) * metrics.totalDataPoints / 100);
  };

  const calculateESGImpact = (changes: Record<string, number>) => {
    return Math.min(20, Math.round(Object.values(changes).reduce((a, b) => a + b, 0) * 0.15));
  };

  const calculateGapsReduction = (changes: Record<string, number>) => {
    return Math.min(metrics.criticalGaps, Math.round(Object.keys(changes).length * 1.5));
  };

  const calculateSavings = (changes: Record<string, number>) => {
    return calculateFinancialImpact(changes);
  };

  const calculateCost = (changes: Record<string, number>) => {
    // Costo estimado de implementación
    return Math.round(Object.values(changes).reduce((a, b) => a + b, 0) * 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return '👥';
      case 'environmental': return '🌍';
      case 'governance': return '⚖️';
      default: return '📊';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Simulador What-If CSRD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parameters">Parámetros</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-6">
            {/* Parámetros por categoría */}
            {['social', 'environmental', 'governance'].map(category => {
              const categoryParams = parameters.filter(p => p.category === category);
              
              return (
                <div key={category} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>{getCategoryIcon(category)}</span>
                    {category === 'social' && 'Social (S1)'}
                    {category === 'environmental' && 'Ambiental (E1-E5)'}
                    {category === 'governance' && 'Gobernanza (G1-G2)'}
                  </h3>
                  
                  <div className="space-y-4">
                    {categoryParams.map(param => (
                      <div key={param.key}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">
                            {param.label}
                          </label>
                          <Badge variant="outline">
                            {param.current}{param.unit}
                          </Badge>
                        </div>
                        <Slider
                          value={[param.current]}
                          onValueChange={(value) => handleParameterChange(param.key, value)}
                          min={param.min}
                          max={param.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Acciones */}
            <div className="flex gap-2">
              <Button onClick={runSimulation} disabled={simulating} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                {simulating ? 'Simulando...' : 'Ejecutar Simulación'}
              </Button>
              <Button onClick={resetParameters} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {results && (
              <>
                {/* Impacto en Compliance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Impacto en Cumplimiento CSRD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Índice Actual</div>
                        <div className="text-2xl font-bold">{metrics.complianceIndex}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Índice Proyectado</div>
                        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                          {metrics.complianceIndex + results.impacts.compliance_index_change}%
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm font-medium">Mejora proyectada:</span>
                      <Badge className="bg-green-600">
                        +{results.impacts.compliance_index_change}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Impacto Económico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Impacto Económico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Ahorro Anual</div>
                        <div className="text-xl font-bold text-green-600">
                          €{results.impacts.estimated_savings.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Inversión</div>
                        <div className="text-xl font-bold text-orange-600">
                          €{results.impacts.implementation_cost.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">ROI</div>
                        <div className="text-xl font-bold text-primary">
                          {Math.round((results.impacts.estimated_savings / results.impacts.implementation_cost) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gaps Reducidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reducción de Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Gaps críticos actuales</div>
                        <div className="text-2xl font-bold text-red-600">{metrics.criticalGaps}</div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Gaps tras implementación</div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.max(0, metrics.criticalGaps - results.impacts.csrd_gaps_reduced)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score ESG */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mejora Score ESG</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        +{results.impacts.esg_score_change}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Puntos adicionales en evaluación ESG
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
