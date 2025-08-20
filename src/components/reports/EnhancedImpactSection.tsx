import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Calculator,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';

interface ImpactData {
  total_employees: number;
  avg_wellness: number;
  turnover_rate: number;
  absenteeism_rate: number;
  productivity_index: number;
  engagement_score: number;
}

interface EnhancedImpactSectionProps {
  impactData: ImpactData;
  period: string;
}

export const EnhancedImpactSection = ({ impactData, period }: EnhancedImpactSectionProps) => {
  const [avgSalary, setAvgSalary] = useState([45000]);
  const [programInvestment, setProgramInvestment] = useState([25000]);
  const [activeTab, setActiveTab] = useState<'roi' | 'savings' | 'projections' | 'business-case'>('roi');
  
  // AI Recommendations
  const { generateTeamInsights, loading: aiLoading } = useAIAnalysis();
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // ROI Calculations
  const calculateROI = () => {
    const salary = avgSalary[0];
    const investment = programInvestment[0];
    
    // Productivity gains (based on engagement improvement)
    const productivityGain = (impactData.engagement_score / 100) * 0.15; // 15% max gain
    const productivitySavings = impactData.total_employees * salary * productivityGain;
    
    // Retention savings (reduced turnover costs)
    const turnoverCost = salary * 0.5; // 50% of salary per turnover
    const turnoverReduction = (impactData.avg_wellness / 100) * 0.3; // 30% max reduction
    const retentionSavings = impactData.total_employees * (impactData.turnover_rate / 100) * turnoverReduction * turnoverCost;
    
    // Absenteeism savings
    const dailySalary = salary / 252; // Working days per year
    const absenteeismReduction = (impactData.avg_wellness / 100) * 0.25; // 25% max reduction
    const absenteeismSavings = impactData.total_employees * (impactData.absenteeism_rate / 100) * 10 * absenteeismReduction * dailySalary;
    
    // Healthcare cost savings
    const healthcareCostPerEmployee = 3000;
    const healthcareReduction = (impactData.avg_wellness / 100) * 0.2; // 20% max reduction
    const healthcareSavings = impactData.total_employees * healthcareCostPerEmployee * healthcareReduction;
    
    const totalSavings = productivitySavings + retentionSavings + absenteeismSavings + healthcareSavings;
    const roiPercentage = ((totalSavings - investment) / investment) * 100;
    const paybackMonths = investment / (totalSavings / 12);
    
    return {
      totalSavings,
      roiPercentage,
      paybackMonths,
      productivitySavings,
      retentionSavings,
      absenteeismSavings,
      healthcareSavings,
      netBenefit: totalSavings - investment,
      multiple: totalSavings / investment
    };
  };

  const metrics = calculateROI();

  // Generate AI recommendations for ROI optimization
  const generateROIRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const roiData = {
        current_roi: metrics.roiPercentage,
        roi_status: getROIStatus(metrics.roiPercentage),
        total_savings: metrics.totalSavings,
        investment: programInvestment[0],
        payback_months: metrics.paybackMonths,
        employees: impactData.total_employees,
        wellness_score: impactData.avg_wellness,
        engagement_score: impactData.engagement_score,
        productivity_index: impactData.productivity_index,
        turnover_rate: impactData.turnover_rate,
        absenteeism_rate: impactData.absenteeism_rate,
        savings_breakdown: {
          productivity: metrics.productivitySavings,
          retention: metrics.retentionSavings,
          absenteeism: metrics.absenteeismSavings,
          healthcare: metrics.healthcareSavings
        }
      };

      const recommendations = await generateTeamInsights(roiData);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating ROI recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Auto-generate recommendations when ROI changes significantly
  useEffect(() => {
    if (metrics.roiPercentage && !aiRecommendations) {
      generateROIRecommendations();
    }
  }, [metrics.roiPercentage, programInvestment[0], avgSalary[0]]);

  // Helper function to safely render content that might be string or object
  const renderSafeContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      if (content.title) return content.title;
      if (content.description) return content.description;
      return JSON.stringify(content);
    }
    return String(content || '');
  };

  // Helper function to safely render array content
  const renderSafeArray = (items: any[]): React.ReactNode[] => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item: any, index: number) => (
      <li key={index} className="flex items-start gap-2">
        <span className="mt-1">•</span>
        <div>
          {typeof item === 'string' ? item : (
            <>
              <div className="font-medium">{item.title || 'Recomendación'}</div>
              {item.description && <div className="text-xs mt-1 text-muted-foreground">{item.description}</div>}
            </>
          )}
        </div>
      </li>
    ));
  };

  const getROIStatus = (roi: number) => {
    if (roi > 200) return 'Excelente';
    if (roi > 100) return 'Muy Bueno';
    if (roi > 50) return 'Bueno';
    if (roi > 0) return 'Positivo';
    return 'Negativo';
  };

  const getROIColor = (roi: number) => {
    if (roi > 200) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (roi > 100) return 'text-green-700 bg-green-100 border-green-300';
    if (roi > 50) return 'text-blue-700 bg-blue-100 border-blue-300';
    if (roi > 0) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  // Sample projection data
  const projectionData = [
    { year: 'Año 1', investment: programInvestment[0], savings: metrics.totalSavings, cumulative: metrics.netBenefit },
    { year: 'Año 2', investment: programInvestment[0], savings: metrics.totalSavings * 1.1, cumulative: metrics.netBenefit + (metrics.totalSavings * 1.1 - programInvestment[0]) },
    { year: 'Año 3', investment: programInvestment[0], savings: metrics.totalSavings * 1.2, cumulative: metrics.netBenefit + (metrics.totalSavings * 1.1 - programInvestment[0]) + (metrics.totalSavings * 1.2 - programInvestment[0]) },
  ];

  const savingsBreakdown = [
    { name: 'Productividad', value: metrics.productivitySavings, color: '#10b981', percentage: (metrics.productivitySavings / metrics.totalSavings) * 100 },
    { name: 'Retención', value: metrics.retentionSavings, color: '#3b82f6', percentage: (metrics.retentionSavings / metrics.totalSavings) * 100 },
    { name: 'Absentismo', value: metrics.absenteeismSavings, color: '#f59e0b', percentage: (metrics.absenteeismSavings / metrics.totalSavings) * 100 },
    { name: 'Salud', value: metrics.healthcareSavings, color: '#8b5cf6', percentage: (metrics.healthcareSavings / metrics.totalSavings) * 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Análisis de Impacto Económico
          </h3>
          <p className="text-sm text-muted-foreground">
            ROI interactivo y proyecciones del programa de bienestar
          </p>
        </div>
      </div>

      {/* Interactive controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Salario Promedio Anual: €{avgSalary[0].toLocaleString()}
                </label>
                <Slider
                  value={avgSalary}
                  onValueChange={setAvgSalary}
                  max={80000}
                  min={25000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>€25k</span>
                  <span>€80k</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Inversión en Programa: €{programInvestment[0].toLocaleString()}
                </label>
                <Slider
                  value={programInvestment}
                  onValueChange={setProgramInvestment}
                  max={100000}
                  min={10000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>€10k</span>
                  <span>€100k</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.roiPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">ROI Anual</div>
            <Badge className={`${getROIColor(metrics.roiPercentage)} border text-xs mt-1`}>
              {getROIStatus(metrics.roiPercentage)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              €{metrics.totalSavings.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Ahorro Total</div>
            <div className="flex items-center justify-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">vs inversión</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.paybackMonths.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Meses Payback</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.multiple.toFixed(1)}x
            </div>
            <div className="text-sm text-muted-foreground">Múltiplo</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analysis tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roi">ROI Detallado</TabsTrigger>
          <TabsTrigger value="savings">Desglose Ahorros</TabsTrigger>
          <TabsTrigger value="projections">Proyecciones</TabsTrigger>
          <TabsTrigger value="business-case">Business Case</TabsTrigger>
        </TabsList>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Retorno de Inversión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Inversión Total</span>
                  <span className="font-semibold">€{programInvestment[0].toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm">Ahorros Anuales</span>
                  <span className="font-semibold text-green-600">€{metrics.totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm">Beneficio Neto</span>
                  <span className="font-semibold text-blue-600">€{metrics.netBenefit.toLocaleString()}</span>
                </div>
                <div className="text-center pt-4 border-t">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {metrics.roiPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI Primer Año</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métricas de Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Empleados Impactados</span>
                    <span className="font-semibold">{impactData.total_employees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bienestar Promedio</span>
                    <span className="font-semibold">{impactData.avg_wellness}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Índice Engagement</span>
                    <span className="font-semibold">{impactData.engagement_score}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Productividad</span>
                    <span className="font-semibold">{impactData.productivity_index}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Section */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Recomendaciones de IA para Maximizar ROI
                </CardTitle>
                <Button 
                  onClick={generateROIRecommendations} 
                  disabled={loadingRecommendations}
                  variant="outline"
                  size="sm"
                >
                  {loadingRecommendations ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Lightbulb className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {loadingRecommendations ? 'Generando...' : 'Actualizar'}
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Analizando datos y generando recomendaciones personalizadas...
                    </p>
                  </div>
                </div>
              ) : aiRecommendations ? (
                <div className="space-y-4">
                  {/* Priority Recommendations */}
                  {aiRecommendations.priority_actions && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Acciones Prioritarias
                      </h4>
                      <ul className="text-sm text-red-700 space-y-2">
                        {Array.isArray(aiRecommendations.priority_actions) ? 
                          aiRecommendations.priority_actions.map((action: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <div>
                                {typeof action === 'string' ? action : (
                                  <>
                                    <div className="font-medium">{action.title}</div>
                                    {action.description && <div className="text-xs mt-1">{action.description}</div>}
                                  </>
                                )}
                              </div>
                            </li>
                          )) : 
                          <li className="text-sm">{aiRecommendations.priority_actions}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* Quick Wins */}
                  {aiRecommendations.quick_wins && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Mejoras Rápidas (ROI Inmediato)
                      </h4>
                      <ul className="text-sm text-green-700 space-y-2">
                        {Array.isArray(aiRecommendations.quick_wins) ? 
                          aiRecommendations.quick_wins.map((win: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <div>
                                {typeof win === 'string' ? win : (
                                  <>
                                    <div className="font-medium">{win.title}</div>
                                    {win.description && <div className="text-xs mt-1">{win.description}</div>}
                                  </>
                                )}
                              </div>
                            </li>
                          )) :
                          <li className="text-sm">{aiRecommendations.quick_wins}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* Investment Optimization */}
                  {aiRecommendations.investment_optimization && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Optimización de Inversión
                      </h4>
                      <p className="text-sm text-blue-700">
                        {typeof aiRecommendations.investment_optimization === 'string' 
                          ? aiRecommendations.investment_optimization
                          : aiRecommendations.investment_optimization.description || aiRecommendations.investment_optimization.title || 'Recomendación disponible'
                        }
                      </p>
                    </div>
                  )}

                  {/* Long-term Strategy */}
                  {aiRecommendations.long_term_strategy && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Estrategia a Largo Plazo
                      </h4>
                      <ul className="text-sm text-purple-700 space-y-2">
                        {Array.isArray(aiRecommendations.long_term_strategy) ? 
                          aiRecommendations.long_term_strategy.map((strategy: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-500 mt-1">•</span>
                              <div>
                                {typeof strategy === 'string' ? strategy : (
                                  <>
                                    <div className="font-medium">{strategy.title}</div>
                                    {strategy.description && <div className="text-xs mt-1">{strategy.description}</div>}
                                  </>
                                )}
                              </div>
                            </li>
                          )) :
                          <li className="text-sm">{aiRecommendations.long_term_strategy}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* Potential ROI Impact */}
                  {aiRecommendations.potential_roi_increase && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Impacto Potencial en ROI
                      </h4>
                      <p className="text-sm text-amber-700">
                        Implementando estas recomendaciones, podrías aumentar tu ROI hasta un{' '}
                        <strong>{aiRecommendations.potential_roi_increase}%</strong> adicional.
                      </p>
                    </div>
                  )}

                  {/* Fallback content if no specific recommendations */}
                  {!aiRecommendations.priority_actions && !aiRecommendations.quick_wins && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Recomendaciones Generales</h4>
                      <p className="text-sm text-gray-700">
                        {renderSafeContent(aiRecommendations.summary) || 
                         renderSafeContent(aiRecommendations.recommendations) || 
                         'Basándose en tu ROI actual, te recomendamos continuar monitoreando las métricas clave y ajustar la inversión según los resultados.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Haz clic en "Actualizar" para generar recomendaciones personalizadas
                  </p>
                  <Button onClick={generateROIRecommendations} variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generar Recomendaciones
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribución de Ahorros</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={savingsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    >
                      {savingsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalle por Categoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savingsBreakdown.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" style={{ color: item.color }}>
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold">
                        €{item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}% del total
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proyección a 3 Años</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                  <Bar dataKey="investment" fill="#f59e0b" name="Inversión" />
                  <Bar dataKey="savings" fill="#10b981" name="Ahorros" />
                  <Bar dataKey="cumulative" fill="#3b82f6" name="Acumulado" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  €{(metrics.totalSavings * 3).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Ahorro Total 3 Años</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  €{(metrics.netBenefit * 3).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Beneficio Acumulado</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((metrics.totalSavings * 3) / (programInvestment[0] * 3)).toFixed(1)}x
                </div>
                <div className="text-sm text-muted-foreground">ROI Acumulado</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-case" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Justificación de Inversión</h4>
                <p className="text-sm text-blue-700">
                  La inversión de <strong>€{programInvestment[0].toLocaleString()}</strong> en el programa de bienestar 
                  genera un retorno del <strong>{metrics.roiPercentage.toFixed(0)}%</strong> en el primer año, 
                  con un período de recuperación de <strong>{metrics.paybackMonths.toFixed(1)} meses</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-green-700">Beneficios Cuantificables</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Ahorro en rotación: €{metrics.retentionSavings.toLocaleString()}</li>
                    <li>• Mejora productividad: €{metrics.productivitySavings.toLocaleString()}</li>
                    <li>• Reducción absentismo: €{metrics.absenteeismSavings.toLocaleString()}</li>
                    <li>• Menores costes sanitarios: €{metrics.healthcareSavings.toLocaleString()}</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium text-blue-700">Beneficios Intangibles</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Mayor satisfacción empleados</li>
                    <li>• Mejor imagen como empleador</li>
                    <li>• Reducción riesgos psicosociales</li>
                    <li>• Cumplimiento normativo</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-800">Consideraciones</h5>
                    <p className="text-sm text-amber-700 mt-1">
                      Los cálculos se basan en benchmarks del sector y pueden variar según la implementación. 
                      Se recomienda revisión trimestral para ajustar proyecciones.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};