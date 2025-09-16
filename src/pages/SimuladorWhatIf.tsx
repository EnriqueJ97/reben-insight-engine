import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, TrendingDown, Euro, Users, RotateCcw, Sparkles, Target, Shield, Lightbulb, Activity, FileBarChart } from 'lucide-react';
import { toast } from 'sonner';
import { useROITracking } from '@/hooks/useROITracking';
import { InteractiveROI } from '@/components/reports/InteractiveROI';

interface InputParams {
  teamSize: number;
  currentTurnoverRate: number;
  avgTurnoverCost: number;
  currentAbsenteeism: number;
  wellnessInvestment: number;
  flexibilityLevel: number;
}

interface PolicyCategory {
  id: string;
  name: string;
  icon: string;
  policies: Policy[];
}

interface Policy {
  id: string;
  name: string;
  impact: {
    turnoverReduction: number;
    absenteeismReduction: number;
    productivityIncrease: number;
    wellnessScore: number;
    csrdCompliance: number;
    implementationCost: number;
  };
}

interface Scenario {
  name: string;
  roi: number;
  annualSavings: number;
  retentionImprovement: number;
  burnoutReduction: number;
  productivityIncrease: number;
  csrdScore: number;
}

const POLICY_CATEGORIES: PolicyCategory[] = [
  {
    id: 'flexibility',
    name: 'Flexibilidad Laboral',
    icon: '⚖️',
    policies: [
      {
        id: 'remote_partial',
        name: 'Teletrabajo parcial (2 días/semana)',
        impact: {
          turnoverReduction: 15,
          absenteeismReduction: 20,
          productivityIncrease: 12,
          wellnessScore: 18,
          csrdCompliance: 10,
          implementationCost: 5000
        }
      },
      {
        id: 'flexible_hours',
        name: 'Flexibilidad entrada/salida ±1h',
        impact: {
          turnoverReduction: 10,
          absenteeismReduction: 15,
          productivityIncrease: 8,
          wellnessScore: 12,
          csrdCompliance: 8,
          implementationCost: 2000
        }
      },
      {
        id: 'four_day_week',
        name: 'Semana comprimida (4 días)',
        impact: {
          turnoverReduction: 25,
          absenteeismReduction: 30,
          productivityIncrease: 20,
          wellnessScore: 35,
          csrdCompliance: 15,
          implementationCost: 15000
        }
      }
    ]
  },
  {
    id: 'burnout_prevention',
    name: 'Prevención del Burnout',
    icon: '🛡️',
    policies: [
      {
        id: 'emotional_checkins',
        name: 'Check-ins emocionales semanales',
        impact: {
          turnoverReduction: 20,
          absenteeismReduction: 25,
          productivityIncrease: 15,
          wellnessScore: 30,
          csrdCompliance: 20,
          implementationCost: 8000
        }
      },
      {
        id: 'active_breaks',
        name: 'Pausas activas / mindfulness',
        impact: {
          turnoverReduction: 12,
          absenteeismReduction: 18,
          productivityIncrease: 10,
          wellnessScore: 25,
          csrdCompliance: 12,
          implementationCost: 4000
        }
      },
      {
        id: 'manager_training',
        name: 'Formación de managers en gestión de carga',
        impact: {
          turnoverReduction: 18,
          absenteeismReduction: 15,
          productivityIncrease: 22,
          wellnessScore: 20,
          csrdCompliance: 15,
          implementationCost: 12000
        }
      }
    ]
  },
  {
    id: 'diversity_inclusion',
    name: 'Diversidad e Inclusión',
    icon: '🤝',
    policies: [
      {
        id: 'mentoring_program',
        name: 'Mentoring para colectivos subrepresentados',
        impact: {
          turnoverReduction: 22,
          absenteeismReduction: 10,
          productivityIncrease: 15,
          wellnessScore: 20,
          csrdCompliance: 30,
          implementationCost: 10000
        }
      },
      {
        id: 'diversity_goals',
        name: 'Objetivos de diversidad en liderazgo',
        impact: {
          turnoverReduction: 15,
          absenteeismReduction: 8,
          productivityIncrease: 12,
          wellnessScore: 15,
          csrdCompliance: 35,
          implementationCost: 6000
        }
      },
      {
        id: 'bias_training',
        name: 'Formación en sesgos inconscientes',
        impact: {
          turnoverReduction: 12,
          absenteeismReduction: 5,
          productivityIncrease: 8,
          wellnessScore: 12,
          csrdCompliance: 25,
          implementationCost: 7000
        }
      }
    ]
  },
  {
    id: 'development',
    name: 'Desarrollo y Formación',
    icon: '📚',
    policies: [
      {
        id: 'digital_reskilling',
        name: 'Reskilling digital',
        impact: {
          turnoverReduction: 20,
          absenteeismReduction: 5,
          productivityIncrease: 25,
          wellnessScore: 15,
          csrdCompliance: 10,
          implementationCost: 18000
        }
      },
      {
        id: 'leadership_training',
        name: 'Formación en liderazgo positivo',
        impact: {
          turnoverReduction: 18,
          absenteeismReduction: 12,
          productivityIncrease: 20,
          wellnessScore: 22,
          csrdCompliance: 18,
          implementationCost: 15000
        }
      },
      {
        id: 'training_budget',
        name: 'Presupuesto anual formación (€1000/empleado)',
        impact: {
          turnoverReduction: 25,
          absenteeismReduction: 8,
          productivityIncrease: 30,
          wellnessScore: 18,
          csrdCompliance: 12,
          implementationCost: 25000
        }
      }
    ]
  },
  {
    id: 'benefits',
    name: 'Beneficios y Compensación',
    icon: '💎',
    policies: [
      {
        id: 'flexible_compensation',
        name: 'Plan de retribución flexible',
        impact: {
          turnoverReduction: 30,
          absenteeismReduction: 12,
          productivityIncrease: 15,
          wellnessScore: 25,
          csrdCompliance: 8,
          implementationCost: 20000
        }
      },
      {
        id: 'parental_leave',
        name: 'Ampliación de permisos parentales',
        impact: {
          turnoverReduction: 35,
          absenteeismReduction: 20,
          productivityIncrease: 10,
          wellnessScore: 40,
          csrdCompliance: 25,
          implementationCost: 30000
        }
      },
      {
        id: 'mental_health_insurance',
        name: 'Seguro médico con salud mental',
        impact: {
          turnoverReduction: 28,
          absenteeismReduction: 35,
          productivityIncrease: 18,
          wellnessScore: 45,
          csrdCompliance: 20,
          implementationCost: 25000
        }
      }
    ]
  }
];

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const CalculadoraROI = () => {
  const { roiSummary, roiEvents, loading: roiLoading, generateCSRDReport } = useROITracking();
  
  const [inputs, setInputs] = useState<InputParams>({
    teamSize: 50,
    currentTurnoverRate: 15,
    avgTurnoverCost: 25000,
    currentAbsenteeism: 8,
    wellnessInvestment: 50000,
    flexibilityLevel: 30
  });

  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<{current: Scenario; projected: Scenario}>({
    current: {
      name: 'Escenario Actual',
      roi: 0,
      annualSavings: 0,
      retentionImprovement: 0,
      burnoutReduction: 0,
      productivityIncrease: 0,
      csrdScore: 25
    },
    projected: {
      name: 'Con Políticas Seleccionadas',
      roi: 0,
      annualSavings: 0,
      retentionImprovement: 0,
      burnoutReduction: 0,
      productivityIncrease: 0,
      csrdScore: 25
    }
  });

  const [insights, setInsights] = useState<string>('');

  useEffect(() => {
    calculateROI();
  }, [inputs, selectedPolicies]);

  const calculateROI = () => {
    // Current scenario calculations
    const currentTurnoverCost = (inputs.teamSize * inputs.currentTurnoverRate / 100) * inputs.avgTurnoverCost;
    const currentAbsenteeismCost = inputs.teamSize * inputs.currentAbsenteeism * 200; // €200 per absence day
    const currentTotalCosts = currentTurnoverCost + currentAbsenteeismCost;
    
    const currentScenario: Scenario = {
      name: 'Escenario Actual',
      roi: inputs.wellnessInvestment > 0 ? ((currentTotalCosts - inputs.wellnessInvestment) / inputs.wellnessInvestment) * 100 : 0,
      annualSavings: 0,
      retentionImprovement: 0,
      burnoutReduction: 0,
      productivityIncrease: 0,
      csrdScore: 25 + (inputs.flexibilityLevel * 0.5)
    };

    // Get selected policies data
    const selectedPolicyData = POLICY_CATEGORIES
      .flatMap(cat => cat.policies)
      .filter(policy => selectedPolicies.includes(policy.id));

    // Calculate combined impact
    const totalImpact = selectedPolicyData.reduce((acc, policy) => ({
      turnoverReduction: acc.turnoverReduction + policy.impact.turnoverReduction,
      absenteeismReduction: acc.absenteeismReduction + policy.impact.absenteeismReduction,
      productivityIncrease: acc.productivityIncrease + policy.impact.productivityIncrease,
      wellnessScore: acc.wellnessScore + policy.impact.wellnessScore,
      csrdCompliance: acc.csrdCompliance + policy.impact.csrdCompliance,
      implementationCost: acc.implementationCost + policy.impact.implementationCost
    }), {
      turnoverReduction: 0,
      absenteeismReduction: 0,
      productivityIncrease: 0,
      wellnessScore: 0,
      csrdCompliance: 0,
      implementationCost: 0
    });

    // Apply diminishing returns (cap at 80% improvement)
    const cappedTurnoverReduction = Math.min(totalImpact.turnoverReduction, 80);
    const cappedAbsenteeismReduction = Math.min(totalImpact.absenteeismReduction, 80);
    const cappedProductivityIncrease = Math.min(totalImpact.productivityIncrease, 50);

    // Calculate projected scenario
    const newTurnoverRate = inputs.currentTurnoverRate * (1 - cappedTurnoverReduction / 100);
    const newAbsenteeism = inputs.currentAbsenteeism * (1 - cappedAbsenteeismReduction / 100);
    
    const projectedTurnoverCost = (inputs.teamSize * newTurnoverRate / 100) * inputs.avgTurnoverCost;
    const projectedAbsenteeismCost = inputs.teamSize * newAbsenteeism * 200;
    const projectedTotalCosts = projectedTurnoverCost + projectedAbsenteeismCost;
    
    const totalInvestment = inputs.wellnessInvestment + totalImpact.implementationCost;
    const annualSavings = currentTotalCosts - projectedTotalCosts;
    const roi = totalInvestment > 0 ? (annualSavings / totalInvestment) * 100 : 0;

    const projectedScenario: Scenario = {
      name: 'Con Políticas Seleccionadas',
      roi: roi,
      annualSavings: annualSavings,
      retentionImprovement: cappedTurnoverReduction,
      burnoutReduction: Math.min(totalImpact.wellnessScore * 0.8, 60),
      productivityIncrease: cappedProductivityIncrease,
      csrdScore: Math.min(currentScenario.csrdScore + totalImpact.csrdCompliance, 100)
    };

    setScenarios({ current: currentScenario, projected: projectedScenario });
    generateInsights(currentScenario, projectedScenario, selectedPolicyData);
  };

  const generateInsights = (current: Scenario, projected: Scenario, policies: Policy[]) => {
    if (policies.length === 0) {
      setInsights('Selecciona políticas de RRHH para ver el impacto estimado en tu organización.');
      return;
    }

    const roiChange = projected.roi - current.roi;
    const topPolicies = policies
      .sort((a, b) => (b.impact.turnoverReduction + b.impact.productivityIncrease) - (a.impact.turnoverReduction + a.impact.productivityIncrease))
      .slice(0, 2)
      .map(p => p.name);

    const insight = `Al implementar ${policies.length} política${policies.length > 1 ? 's' : ''} seleccionada${policies.length > 1 ? 's' : ''} (destacando: ${topPolicies.join(' y ')}), el ROI ${roiChange > 0 ? 'aumenta' : 'cambia'} ${roiChange > 0 ? '+' : ''}${roiChange.toFixed(1)}% y generas €${projected.annualSavings.toLocaleString()} en ahorros anuales. La mejora en retención del ${projected.retentionImprovement.toFixed(1)}% y el incremento de productividad del ${projected.productivityIncrease.toFixed(1)}% crean un impacto sostenible en tu organización.`;

    setInsights(insight);
  };

  const handlePolicyToggle = (policyId: string) => {
    setSelectedPolicies(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId)
        : [...prev, policyId]
    );
  };

  const resetCalculator = () => {
    setInputs({
      teamSize: 50,
      currentTurnoverRate: 15,
      avgTurnoverCost: 25000,
      currentAbsenteeism: 8,
      wellnessInvestment: 50000,
      flexibilityLevel: 30
    });
    setSelectedPolicies([]);
    toast.success('Calculadora restablecida');
  };

  const comparisonData = [
    {
      name: 'ROI (%)',
      actual: scenarios.current.roi,
      proyectado: scenarios.projected.roi
    },
    {
      name: 'Retención (%)',
      actual: 100 - inputs.currentTurnoverRate,
      proyectado: 100 - inputs.currentTurnoverRate + scenarios.projected.retentionImprovement
    },
    {
      name: 'Productividad',
      actual: 100,
      proyectado: 100 + scenarios.projected.productivityIncrease
    },
    {
      name: 'CSRD Score',
      actual: scenarios.current.csrdScore,
      proyectado: scenarios.projected.csrdScore
    }
  ];

  const pieData = [
    { name: 'Ahorro Rotación', value: scenarios.projected.annualSavings * 0.7, color: COLORS[0] },
    { name: 'Ahorro Absentismo', value: scenarios.projected.annualSavings * 0.2, color: COLORS[1] },
    { name: 'Ganancia Productividad', value: scenarios.projected.annualSavings * 0.1, color: COLORS[2] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Calculator className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Calculadora ROI de Bienestar</h1>
                  <p className="text-lg text-white/90 mt-1">
                    Calcula el retorno de inversión de tus políticas de RRHH en 30 segundos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Cálculos en Tiempo Real
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Análisis Predictivo
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Compliance CSRD
                </div>
              </div>
            </div>
            
            <Button onClick={resetCalculator} className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-6 pb-12">
        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="simulator">Simulador de Políticas</TabsTrigger>
            <TabsTrigger value="tracking">ROI Tracking Real</TabsTrigger>
            <TabsTrigger value="reports">Reportes CSRD</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Section 1: Parámetros */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Parámetros Organizacionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Tamaño del equipo: {inputs.teamSize} empleados</label>
                  <Slider
                    value={[inputs.teamSize]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, teamSize: value }))}
                    max={500}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Tasa de rotación actual: {inputs.currentTurnoverRate}%</label>
                  <Slider
                    value={[inputs.currentTurnoverRate]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, currentTurnoverRate: value }))}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Coste medio rotación: €{inputs.avgTurnoverCost.toLocaleString()}</label>
                  <Slider
                    value={[inputs.avgTurnoverCost]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, avgTurnoverCost: value }))}
                    max={100000}
                    min={5000}
                    step={1000}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Absentismo actual: {inputs.currentAbsenteeism}%</label>
                  <Slider
                    value={[inputs.currentAbsenteeism]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, currentAbsenteeism: value }))}
                    max={20}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Inversión bienestar: €{inputs.wellnessInvestment.toLocaleString()}</label>
                  <Slider
                    value={[inputs.wellnessInvestment]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, wellnessInvestment: value }))}
                    max={200000}
                    min={0}
                    step={5000}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Nivel flexibilidad: {inputs.flexibilityLevel}%</label>
                  <Slider
                    value={[inputs.flexibilityLevel]}
                    onValueChange={([value]) => setInputs(prev => ({ ...prev, flexibilityLevel: value }))}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-violet-900">
                  <Sparkles className="w-5 h-5" />
                  Insights Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-violet-800 leading-relaxed">{insights}</p>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Políticas */}
          <div>
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Políticas de RRHH
                  <Badge variant="secondary" className="ml-auto">
                    {selectedPolicies.length} seleccionadas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[800px] overflow-y-auto">
                {POLICY_CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{category.icon}</span>
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                    </div>
                    
                    {category.policies.map((policy) => (
                      <div key={policy.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                        <Checkbox
                          id={policy.id}
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => handlePolicyToggle(policy.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <label htmlFor={policy.id} className="text-sm font-medium cursor-pointer">
                            {policy.name}
                          </label>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>↓{policy.impact.turnoverReduction}% rotación</span>
                            <span>↑{policy.impact.productivityIncrease}% productividad</span>
                            <span>€{policy.impact.implementationCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {category.id !== 'benefits' && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Resultados */}
          <div className="space-y-6">
            {/* ROI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {scenarios.projected.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-600">ROI Proyectado</div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    €{scenarios.projected.annualSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">Ahorro Anual</div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Chart */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Comparativa de Escenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="actual" fill="#94A3B8" name="Actual" />
                    <Bar dataKey="proyectado" fill="#8B5CF6" name="Proyectado" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            {scenarios.projected.annualSavings > 0 && (
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Desglose de Ahorros</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}: €{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Shield className="w-5 h-5" />
                  Métricas Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-800">Mejora Retención</span>
                  <span className="font-semibold text-amber-900">+{scenarios.projected.retentionImprovement.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-800">Reducción Burnout</span>
                  <span className="font-semibold text-amber-900">-{scenarios.projected.burnoutReduction.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-800">Incremento Productividad</span>
                  <span className="font-semibold text-amber-900">+{scenarios.projected.productivityIncrease.toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-800">Indicador CSRD Social</span>
                  <Badge variant={scenarios.projected.csrdScore >= 70 ? "default" : "secondary"}>
                    {scenarios.projected.csrdScore.toFixed(0)}/100
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking">
            <div className="space-y-6">
              {/* ROI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ROI Mensual</p>
                        <p className="text-2xl font-bold text-primary">
                          {roiSummary?.roi_percentage || 0}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ahorro Anual</p>
                        <p className="text-2xl font-bold text-success">
                          €{roiSummary?.annual_projection?.toLocaleString() || 0}
                        </p>
                      </div>
                      <Euro className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Eventos ROI</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {roiSummary?.events_count || 0}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Inversión</p>
                        <p className="text-2xl font-bold text-amber-600">
                          €{roiSummary?.investment_cost?.toLocaleString() || 0}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ROI Events Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Eventos de ROI Registrados</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roiEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {event.type === 'ROTACION_EVITADA' ? 'Retención' : 
                               event.type === 'ABSENTISMO_EVITADO' ? 'Absentismo' : 'Productividad'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.calculated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{event.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-success">
                            €{event.estimated_savings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {roiEvents.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No hay eventos de ROI registrados aún
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Interactive ROI Calculator */}
              <InteractiveROI reportData={{
                wellness_score: 75,
                team_breakdown: [{ unique_employees: inputs.teamSize }]
              }} />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileBarChart className="h-5 w-5" />
                    <span>Reportes de Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Reporte CSRD Automático</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Genera un reporte completo de sostenibilidad según los estándares CSRD/ESRS
                      con los datos de ROI capturados automáticamente.
                    </p>
                    <Button 
                      onClick={generateCSRDReport}
                      disabled={roiLoading}
                      className="w-full sm:w-auto"
                    >
                      <FileBarChart className="h-4 w-4 mr-2" />
                      {roiLoading ? 'Generando...' : 'Generar Reporte CSRD'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {roiSummary?.events_count || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Indicadores ESRS-S1</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        €{Math.round((roiSummary?.annual_projection || 0) / 1000)}K
                      </div>
                      <p className="text-sm text-muted-foreground">Impacto Económico</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {roiSummary?.roi_percentage || 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">ROI Medido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalculadoraROI;