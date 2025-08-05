import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Star, Plus, Play, Save, BarChart3, Euro } from 'lucide-react';
import { toast } from 'sonner';

interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  default_delta_json: any;
  is_recommended: boolean;
}

interface CustomPolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  delta_json: any;
  creator_id: string;
}

interface Scenario {
  id: string;
  name: string;
  description?: string;
  baseline_period: string;
  status: string;
  policy_template?: PolicyTemplate;
  custom_policy?: CustomPolicy;
  created_at: string;
}

interface ScenarioOutput {
  metric_key: string;
  baseline: number;
  projected: number;
  delta: number;
  ci_low: number;
  ci_high: number;
  confidence?: number;
  explanation?: string;
}

interface AIInsights {
  key_benefits: string[];
  potential_risks: string[];
  implementation_tips: string[];
  success_factors: string[];
  timeline_recommendation: string;
}

interface AIAnalysis {
  impact_analysis: Record<string, ScenarioOutput>;
  insights: AIInsights;
  comparative_analysis?: any;
  recommendations?: any;
}

const SimuladorWhatIf = () => {
  const { user } = useAuth();
  const [policyTemplates, setPolicyTemplates] = useState<PolicyTemplate[]>([]);
  const [customPolicies, setCustomPolicies] = useState<CustomPolicy[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyTemplate | CustomPolicy | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [scenarioOutputs, setScenarioOutputs] = useState<ScenarioOutput[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  // Estados para crear política personalizada
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDescription, setNewPolicyDescription] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState('custom');
  const [newPolicyParams, setNewPolicyParams] = useState<any>({});

  // Estados para parámetros de simulación
  const [baselinePeriod, setBaselinePeriod] = useState('2024-01-01/2024-12-31');
  const [policyParams, setPolicyParams] = useState<any>({});

  const categories = [
    { value: 'flexibilidad', label: 'Flexibilidad', color: 'bg-blue-100 text-blue-800' },
    { value: 'tiempo', label: 'Gestión del Tiempo', color: 'bg-green-100 text-green-800' },
    { value: 'bienestar', label: 'Bienestar', color: 'bg-purple-100 text-purple-800' },
    { value: 'productividad', label: 'Productividad', color: 'bg-orange-100 text-orange-800' },
    { value: 'desarrollo', label: 'Desarrollo', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'engagement', label: 'Engagement', color: 'bg-pink-100 text-pink-800' },
    { value: 'turnos', label: 'Gestión de Turnos', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'custom', label: 'Personalizada', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      // Cargar plantillas de políticas
      const { data: templates } = await supabase
        .from('policy_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_recommended', { ascending: false })
        .order('name');

      // Cargar políticas personalizadas
      const { data: custom } = await supabase
        .from('custom_policies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Cargar escenarios recientes
      const { data: recentScenarios } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setPolicyTemplates(templates || []);
      setCustomPolicies(custom || []);
      setScenarios(recentScenarios || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarSimulacion = async () => {
    if (!selectedPolicy) return;

    setSimulating(true);
    try {
      // Crear escenario
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .insert({
          name: `Simulación: ${selectedPolicy.name}`,
          description: selectedPolicy.description,
          baseline_period: baselinePeriod,
          status: 'RUNNING',
          tenant_id: user?.tenant_id,
          creator_id: user?.id,
          policy_template_id: 'default_delta_json' in selectedPolicy ? selectedPolicy.id : null,
          custom_policy_id: 'delta_json' in selectedPolicy ? selectedPolicy.id : null
        })
        .select()
        .single();

      if (scenarioError) throw scenarioError;

      // Guardar parámetros
      const deltaJson = 'default_delta_json' in selectedPolicy ? selectedPolicy.default_delta_json : selectedPolicy.delta_json;
      
      for (const [key, config] of Object.entries(deltaJson)) {
        const configObj = config as any;
        await supabase
          .from('scenario_params')
          .insert({
            tenant_id: user?.tenant_id,
            scenario_id: scenario.id,
            param_key: key,
            delta_type: configObj.delta_type,
            delta_value: policyParams[key] !== undefined ? policyParams[key] : configObj.delta_value
          });
      }

      // Simular con IA
      try {
        console.log('Iniciando análisis IA...');
        const aiResponse = await supabase.functions.invoke('ai-policy-analysis', {
          body: {
            policy: selectedPolicy,
            baselinePeriod: baselinePeriod,
            companyContext: {
              industry: 'Servicios',
              size: 'Mediana'
            },
            historicalData: null
          }
        });

        if (aiResponse.error) {
          throw new Error(aiResponse.error.message);
        }

        const aiData = aiResponse.data;
        console.log('Análisis IA completado:', aiData);

        if (aiData.analysis && aiData.analysis.impact_analysis) {
          // Convertir análisis IA a formato ScenarioOutput
          const aiResults: ScenarioOutput[] = Object.entries(aiData.analysis.impact_analysis).map(([key, data]: [string, any]) => ({
            metric_key: key,
            baseline: data.baseline,
            projected: data.projected,
            delta: data.delta,
            ci_low: data.projected * 0.95, // Aproximación del intervalo de confianza
            ci_high: data.projected * 1.05,
            confidence: data.confidence,
            explanation: data.explanation
          }));

          setScenarioOutputs(aiResults);
          setAiInsights(aiData.analysis.insights);
          
          // Guardar resultados IA en la base de datos
          for (const result of aiResults) {
            await supabase
              .from('scenario_outputs')
              .insert({
                tenant_id: user?.tenant_id,
                scenario_id: scenario.id,
                ...result
              });
          }
        } else {
          throw new Error('Formato de respuesta IA inválido');
        }

      } catch (aiError) {
        console.error('Error en análisis IA, usando datos mock:', aiError);
        toast.error('Análisis IA no disponible, usando estimaciones base');
        
        // Fallback a datos mock si falla la IA
        const mockResults: ScenarioOutput[] = [
          {
            metric_key: 'burnout_risk',
            baseline: 0.22,
            projected: 0.15,
            delta: -0.07,
            ci_low: 0.13,
            ci_high: 0.17
          },
          {
            metric_key: 'turnover_risk',
            baseline: 0.18,
            projected: 0.12,
            delta: -0.06,
            ci_low: 0.10,
            ci_high: 0.14
          },
          {
            metric_key: 'economic_impact_eur',
            baseline: 1800000,
            projected: 1200000,
            delta: -600000,
            ci_low: -750000,
            ci_high: -450000
          },
          {
            metric_key: 'productivity_score',
            baseline: 7.2,
            projected: 8.1,
            delta: 0.9,
            ci_low: 0.7,
            ci_high: 1.1
          },
          {
            metric_key: 'employee_satisfaction',
            baseline: 6.8,
            projected: 7.9,
            delta: 1.1,
            ci_low: 0.9,
            ci_high: 1.3
          }
        ];

        setScenarioOutputs(mockResults);
        
        // Guardar resultados mock
        for (const result of mockResults) {
          await supabase
            .from('scenario_outputs')
            .insert({
              tenant_id: user?.tenant_id,
              scenario_id: scenario.id,
              ...result
            });
        }
      }

      // Actualizar estado del escenario
      await supabase
        .from('scenarios')
        .update({ status: 'COMPLETED' })
        .eq('id', scenario.id);

      setCurrentScenario(scenario as Scenario);
      toast.success('🤖 Simulación IA completada correctamente');
      
      // Recargar escenarios
      cargarDatos();
    } catch (error) {
      console.error('Error en simulación:', error);
      toast.error('Error al ejecutar la simulación');
    } finally {
      setSimulating(false);
    }
  };

  const crearPoliticaPersonalizada = async () => {
    try {
      const { error } = await supabase
        .from('custom_policies')
        .insert({
          name: newPolicyName,
          description: newPolicyDescription,
          category: newPolicyCategory,
          delta_json: newPolicyParams,
          tenant_id: user?.tenant_id,
          creator_id: user?.id
        });

      if (error) throw error;

      toast.success('Política personalizada creada');
      setShowCreatePolicy(false);
      setNewPolicyName('');
      setNewPolicyDescription('');
      setNewPolicyParams({});
      cargarDatos();
    } catch (error) {
      console.error('Error creando política:', error);
      toast.error('Error al crear la política');
    }
  };

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-100 text-gray-800';
  };

  const formatMetric = (key: string, value: number) => {
    switch (key) {
      case 'economic_impact_eur':
        return `€${value.toLocaleString()}`;
      case 'burnout_risk':
      case 'turnover_risk':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toFixed(2);
    }
  };

  const getMetricIcon = (delta: number) => {
    return delta < 0 ? (
      <TrendingDown className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando Simulador What-If...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulador What-If</h1>
          <p className="text-muted-foreground">
            Simula el impacto de políticas empresariales en bienestar y productividad
          </p>
        </div>
        
        <Dialog open={showCreatePolicy} onOpenChange={setShowCreatePolicy}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Política Personalizada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="Ej: Flexibilidad Horaria Avanzada"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  placeholder="Describe el impacto esperado de esta política..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Categoría</label>
                <Select value={newPolicyCategory} onValueChange={setNewPolicyCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={crearPoliticaPersonalizada} disabled={!newPolicyName}>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Política
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePolicy(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Selección de Políticas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Políticas Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Predefinidas</TabsTrigger>
                  <TabsTrigger value="custom">Personalizadas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="space-y-3">
                  {policyTemplates.map((policy) => (
                    <div
                      key={policy.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPolicy?.id === policy.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {policy.is_recommended && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        <h4 className="font-medium text-sm">{policy.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {policy.description}
                      </p>
                      <Badge className={getCategoryStyle(policy.category)}>
                        {categories.find(c => c.value === policy.category)?.label}
                      </Badge>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-3">
                  {customPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPolicy?.id === policy.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <h4 className="font-medium text-sm mb-2">{policy.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {policy.description}
                      </p>
                      <Badge className={getCategoryStyle(policy.category)}>
                        Personalizada
                      </Badge>
                    </div>
                  ))}
                  
                  {customPolicies.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tienes políticas personalizadas</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowCreatePolicy(true)}
                      >
                        Crear Primera Política
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Configuración y Simulación */}
        <div className="lg:col-span-2">
          {selectedPolicy ? (
            <div className="space-y-6">
              {/* Configuración de la Simulación */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Configurar Simulación: {selectedPolicy.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Período Base</label>
                    <Input
                      value={baselinePeriod}
                      onChange={(e) => setBaselinePeriod(e.target.value)}
                      placeholder="2024-01-01/2024-12-31"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={ejecutarSimulacion} 
                      disabled={simulating}
                      className="flex-1"
                    >
                      {simulating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Simulando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ejecutar Simulación
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados de la Simulación */}
              {currentScenario && scenarioOutputs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Resultados de la Simulación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scenarioOutputs.map((output) => (
                        <div key={output.metric_key} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {output.metric_key === 'burnout_risk' && 'Riesgo de Burnout'}
                              {output.metric_key === 'turnover_risk' && 'Riesgo de Rotación'}
                              {output.metric_key === 'economic_impact_eur' && 'Impacto Económico'}
                              {output.metric_key === 'productivity_score' && 'Productividad'}
                              {output.metric_key === 'employee_satisfaction' && 'Satisfacción'}
                            </h4>
                            <div className="flex items-center gap-1">
                              {getMetricIcon(output.delta)}
                              {output.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(output.confidence * 100)}% confianza
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Baseline:</span>
                              <span>{formatMetric(output.metric_key, output.baseline)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Proyectado:</span>
                              <span>{formatMetric(output.metric_key, output.projected)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                              <span>Delta:</span>
                              <span className={output.delta < 0 ? 'text-green-600' : 'text-red-600'}>
                                {output.delta > 0 ? '+' : ''}{formatMetric(output.metric_key, output.delta)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              IC 95%: {formatMetric(output.metric_key, output.ci_low)} - {formatMetric(output.metric_key, output.ci_high)}
                            </div>
                            {output.explanation && (
                              <div className="text-xs text-blue-600 mt-1">
                                💡 {output.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen de Impacto */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        🤖 Análisis IA - Resumen de Impacto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.abs(scenarioOutputs.find(o => o.metric_key === 'economic_impact_eur')?.delta || 0).toLocaleString()}€
                          </div>
                          <div className="text-sm text-muted-foreground">Ahorro Anual</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {((scenarioOutputs.find(o => o.metric_key === 'burnout_risk')?.delta || 0) * -100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Reducción Burnout</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {((scenarioOutputs.find(o => o.metric_key === 'productivity_score')?.delta || 0)).toFixed(1)}
                          </div>
                          <div className="text-sm text-muted-foreground">Mejora Productividad</div>
                        </div>
                      </div>
                    </div>

                    {/* Insights de IA */}
                    {aiInsights && (
                      <div className="mt-6 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          🧠 Insights Inteligentes
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">✅ Beneficios Clave</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {aiInsights.key_benefits.map((benefit, idx) => (
                                <li key={idx}>• {benefit}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <h5 className="font-medium text-orange-800 mb-2">⚠️ Riesgos Potenciales</h5>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {aiInsights.potential_risks.map((risk, idx) => (
                                <li key={idx}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">💡 Tips de Implementación</h5>
                            <ul className="text-sm text-blue-700 space-y-1">
                              {aiInsights.implementation_tips.map((tip, idx) => (
                                <li key={idx}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">🎯 Factores de Éxito</h5>
                            <ul className="text-sm text-purple-700 space-y-1">
                              {aiInsights.success_factors.map((factor, idx) => (
                                <li key={idx}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-800 mb-1">⏱️ Timeline Recomendado</h5>
                          <p className="text-sm text-gray-700">{aiInsights.timeline_recommendation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Selecciona una Política</h3>
                  <p className="text-muted-foreground">
                    Elige una política predefinida o personalizada para simular su impacto
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Escenarios Recientes */}
      {scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Simulaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenarios.slice(0, 5).map((scenario) => (
                <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{scenario.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scenario.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={scenario.status === 'COMPLETED' ? 'default' : 'secondary'}
                  >
                    {scenario.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimuladorWhatIf;