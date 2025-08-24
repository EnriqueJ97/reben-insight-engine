import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, TrendingUp, TrendingDown, Target, 
  Calendar, BarChart3, AlertCircle, CheckCircle,
  Activity, Users, Zap, Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
  BarChart, Bar, ComposedChart, ScatterChart, Scatter
} from 'recharts';

interface LongTermTrendsProps {
  reportData: any;
  period: string;
  scope: string;
}

const LongTermTrends = ({ reportData, period, scope }: LongTermTrendsProps) => {
  const [trendPeriod, setTrendPeriod] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data de tendencias históricas (en producción vendría de la API)
  const historicalData = [
    { month: 'Ene 2024', wellness: 78, productivity: 82, retention: 91, engagement: 75, alerts: 23 },
    { month: 'Feb 2024', wellness: 80, productivity: 84, retention: 92, engagement: 78, alerts: 19 },
    { month: 'Mar 2024', wellness: 82, productivity: 86, retention: 93, engagement: 80, alerts: 15 },
    { month: 'Abr 2024', wellness: 85, productivity: 87, retention: 94, engagement: 83, alerts: 12 },
    { month: 'May 2024', wellness: 83, productivity: 89, retention: 95, engagement: 85, alerts: 14 },
    { month: 'Jun 2024', wellness: 87, productivity: 91, retention: 96, engagement: 87, alerts: 10 },
    { month: 'Jul 2024', wellness: 89, productivity: 93, retention: 97, engagement: 89, alerts: 8 },
    { month: 'Ago 2024', wellness: 91, productivity: 94, retention: 98, engagement: 91, alerts: 6 },
    { month: 'Sep 2024', wellness: 88, productivity: 92, retention: 96, engagement: 88, alerts: 9 },
    { month: 'Oct 2024', wellness: 90, productivity: 95, retention: 97, engagement: 92, alerts: 7 },
    { month: 'Nov 2024', wellness: 92, productivity: 96, retention: 98, engagement: 94, alerts: 5 },
    { month: 'Dic 2024', wellness: 94, productivity: 97, retention: 99, engagement: 95, alerts: 3 }
  ];

  // Predicciones futuras basadas en tendencias
  const predictions = {
    next3Months: {
      wellness: { current: 94, predicted: 96, confidence: 87 },
      retention: { current: 99, predicted: 99.2, confidence: 92 },
      productivity: { current: 97, predicted: 98, confidence: 85 },
      engagement: { current: 95, predicted: 96, confidence: 89 }
    },
    next6Months: {
      wellness: { current: 94, predicted: 97, confidence: 78 },
      retention: { current: 99, predicted: 99.1, confidence: 83 },
      productivity: { current: 97, predicted: 98.5, confidence: 75 },
      engagement: { current: 95, predicted: 97, confidence: 81 }
    },
    risks: [
      {
        factor: 'Crecimiento acelerado',
        impact: 'Posible estrés en equipos existentes',
        probability: 35,
        mitigation: 'Contratar 15% más personal Q1'
      },
      {
        factor: 'Cambios tecnológicos',
        impact: 'Necesidad de reentrenamiento',
        probability: 60,
        mitigation: 'Programa de upskilling continuo'
      },
      {
        factor: 'Competencia salarial',
        impact: 'Riesgo de rotación en roles senior',
        probability: 25,
        mitigation: 'Revisión salarial anual Q2'
      }
    ]
  };

  // Análisis de ciclos y estacionalidad
  const seasonalPatterns = {
    quarterly: [
      { quarter: 'Q1', wellness: 85, productivity: 88, historical: 'Recuperación post-vacaciones' },
      { quarter: 'Q2', wellness: 90, productivity: 93, historical: 'Pico de productividad' },
      { quarter: 'Q3', wellness: 87, productivity: 91, historical: 'Impacto vacaciones verano' },
      { quarter: 'Q4', wellness: 92, productivity: 95, historical: 'Sprint final del año' }
    ],
    weeklyPatterns: {
      monday: 78,
      tuesday: 89,
      wednesday: 92,
      thursday: 88,
      friday: 85,
      insight: 'Martes-miércoles son los días de mayor rendimiento'
    }
  };

  // Métricas de evolución a largo plazo
  const evolutionMetrics = {
    yearOverYear: {
      wellness: { change: 18, direction: 'up', significance: 'high' },
      retention: { change: 12, direction: 'up', significance: 'high' },
      productivity: { change: 15, direction: 'up', significance: 'high' },
      alerts: { change: -67, direction: 'down', significance: 'high' }
    },
    milestones: [
      { date: 'Mar 2024', event: 'Implementación trabajo híbrido', impact: '+12% bienestar' },
      { date: 'Jun 2024', event: 'Nuevo programa 1:1s semanales', impact: '+8% engagement' },
      { date: 'Sep 2024', event: 'Políticas bienestar mejoradas', impact: '-40% alertas' },
      { date: 'Nov 2024', event: 'Sistema feedback 360°', impact: '+6% productividad' }
    ]
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-blue-600 bg-blue-100';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Controles de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Configuración de Análisis Temporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Período de Análisis</label>
              <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                  <SelectItem value="24m">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Métrica Principal</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las métricas</SelectItem>
                  <SelectItem value="wellness">Bienestar</SelectItem>
                  <SelectItem value="productivity">Productividad</SelectItem>
                  <SelectItem value="retention">Retención</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolución Histórica Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolución de Indicadores Clave - 12 Meses
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tendencias históricas con identificación de puntos de inflexión
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="wellness"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="Bienestar %"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="productivity"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Productividad %"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Engagement %"
                />
                <Bar
                  yAxisId="right"
                  dataKey="alerts"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Alertas (#)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Hitos Importantes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Hitos Clave del Período
              </h4>
              <div className="space-y-2">
                {evolutionMetrics.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">{milestone.date}:</span>
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {milestone.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Cambios Interanuales
              </h4>
              <div className="space-y-3">
                {Object.entries(evolutionMetrics.yearOverYear).map(([metric, data]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(data.direction)}
                      <span className="text-sm capitalize">{metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={data.direction === 'up' ? 'default' : 'destructive'}>
                        {data.direction === 'up' ? '+' : ''}{data.change}%
                      </Badge>
                      {data.significance === 'high' && 
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicciones y Proyecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Predicciones IA - Próximos 6 Meses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Proyecciones basadas en modelos de tendencias históricas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(predictions.next6Months).map(([metric, data]) => (
                <div key={metric} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium capitalize">{metric}</span>
                    <Badge className={getConfidenceColor(data.confidence)}>
                      {data.confidence}% confianza
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Actual</span>
                    <span className="font-bold">{data.current}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Predicho</span>
                    <span className="font-bold text-green-600">{data.predicted}%</span>
                  </div>
                  
                  <Progress 
                    value={(data.predicted / 100) * 100} 
                    className="h-2"
                  />
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Mejora esperada: +{(data.predicted - data.current).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Factores de Riesgo Identificados
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Escenarios que podrían impactar las tendencias positivas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.risks.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{risk.factor}</h4>
                    <Badge 
                      variant={risk.probability > 50 ? 'destructive' : risk.probability > 30 ? 'secondary' : 'outline'}
                    >
                      {risk.probability}% prob.
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {risk.impact}
                  </p>
                  
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Mitigación</span>
                    </div>
                    <p className="text-sm text-blue-700">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patrones Estacionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Análisis de Patrones Estacionales
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Identificación de ciclos naturales para optimización de recursos
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patrones Trimestrales */}
            <div>
              <h4 className="font-semibold mb-4">Tendencias Trimestrales</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonalPatterns.quarterly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="wellness" fill="#8b5cf6" name="Bienestar" />
                    <Bar dataKey="productivity" fill="#3b82f6" name="Productividad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {seasonalPatterns.quarterly.map((q) => (
                  <div key={q.quarter} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{q.quarter}</span>
                    <span className="text-muted-foreground">{q.historical}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Patrones Semanales */}
            <div>
              <h4 className="font-semibold mb-4">Patrones Semanales</h4>
              <div className="space-y-3">
                {Object.entries(seasonalPatterns.weeklyPatterns).map(([day, value]) => {
                  if (day === 'insight') return null;
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{day}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={value as number} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{value}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Insight</span>
                </div>
                <p className="text-sm text-blue-700">
                  {seasonalPatterns.weeklyPatterns.insight}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LongTermTrends;