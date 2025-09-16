import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useEIECore from '@/hooks/useEIECore';
import { useROITracking } from '@/hooks/useROITracking';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Clock, 
  Target,
  Brain,
  DollarSign,
  Award,
  Activity,
  Zap,
  Download
} from 'lucide-react';

interface AnalyticsData {
  campaigns: {
    total: number;
    active: number;
    completed: number;
    response_rate: number;
  };
  instruments: {
    most_used: string[];
    reliability_scores: { [key: string]: number };
    completion_rates: { [key: string]: number };
  };
  results: {
    burnout_risk: number;
    engagement_score: number;
    satisfaction_score: number;
    wellbeing_score: number;
    turnover_risk: number;
  };
  trends: Array<{
    month: string;
    burnout: number;
    engagement: number;
    satisfaction: number;
    wellbeing: number;
  }>;
  correlations: {
    burnout_turnover: number;
    engagement_satisfaction: number;
    leadership_engagement: number;
  };
  interventions: {
    triggered: number;
    successful: number;
    roi_generated: number;
  };
}

const RISK_COLORS = {
  low: '#10B981',    // green
  medium: '#F59E0B', // yellow  
  high: '#EF4444'    // red
};

const BENCHMARK_DATA = [
  { name: 'Tu Organización', burnout: 2.1, engagement: 4.2, satisfaction: 3.8 },
  { name: 'Promedio Industria', burnout: 2.4, engagement: 3.9, satisfaction: 3.6 },
  { name: 'Top 25%', burnout: 1.8, engagement: 4.5, satisfaction: 4.1 }
];

export const EvaluationAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last_12_months');
  const { loading: eieLoading } = useEIECore();
  const { roiSummary, loading: roiLoading } = useROITracking();

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setAnalytics({
      campaigns: {
        total: 24,
        active: 3,
        completed: 21,
        response_rate: 87.3
      },
      instruments: {
        most_used: ['MBI', 'UWES', 'JSS', 'GHQ-12', 'WHO-5'],
        reliability_scores: {
          'MBI': 0.89,
          'UWES': 0.91,
          'JSS': 0.86,
          'GHQ-12': 0.88,
          'WHO-5': 0.84
        },
        completion_rates: {
          'MBI': 92.1,
          'UWES': 94.5,
          'JSS': 88.7,
          'GHQ-12': 96.2,
          'WHO-5': 97.8
        }
      },
      results: {
        burnout_risk: 2.1,
        engagement_score: 4.2,
        satisfaction_score: 3.8,
        wellbeing_score: 4.0,
        turnover_risk: 1.8
      },
      trends: [
        { month: 'Ene', burnout: 2.3, engagement: 3.9, satisfaction: 3.6, wellbeing: 3.8 },
        { month: 'Feb', burnout: 2.2, engagement: 4.0, satisfaction: 3.7, wellbeing: 3.9 },
        { month: 'Mar', burnout: 2.1, engagement: 4.1, satisfaction: 3.8, wellbeing: 4.0 },
        { month: 'Abr', burnout: 2.0, engagement: 4.2, satisfaction: 3.8, wellbeing: 4.1 },
        { month: 'May', burnout: 2.1, engagement: 4.2, satisfaction: 3.8, wellbeing: 4.0 }
      ],
      correlations: {
        burnout_turnover: 0.74,
        engagement_satisfaction: 0.68,
        leadership_engagement: 0.61
      },
      interventions: {
        triggered: 156,
        successful: 134,
        roi_generated: 245000
      }
    });
  }, []);

  const getRiskLevel = (score: number, type: 'burnout' | 'turnover') => {
    if (type === 'burnout') {
      if (score <= 2.0) return 'low';
      if (score <= 3.0) return 'medium';
      return 'high';
    } else {
      if (score <= 2.0) return 'low';
      if (score <= 3.0) return 'medium';
      return 'high';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 4.0) return 'high';
    if (score >= 3.0) return 'medium';
    return 'low';
  };

  if (!analytics) {
    return <div>Cargando análisis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Riesgo Burnout</p>
                <p className="text-2xl font-bold text-red-900">{analytics.results.burnout_risk.toFixed(1)}</p>
                <Badge 
                  className={`mt-1 ${getRiskLevel(analytics.results.burnout_risk, 'burnout') === 'low' ? 'bg-green-100 text-green-800' : 
                    getRiskLevel(analytics.results.burnout_risk, 'burnout') === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                >
                  {getRiskLevel(analytics.results.burnout_risk, 'burnout') === 'low' ? 'Bajo' : 
                   getRiskLevel(analytics.results.burnout_risk, 'burnout') === 'medium' ? 'Medio' : 'Alto'}
                </Badge>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Engagement</p>
                <p className="text-2xl font-bold text-blue-900">{analytics.results.engagement_score.toFixed(1)}</p>
                <Badge 
                  className={`mt-1 ${getEngagementLevel(analytics.results.engagement_score) === 'high' ? 'bg-green-100 text-green-800' : 
                    getEngagementLevel(analytics.results.engagement_score) === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                >
                  {getEngagementLevel(analytics.results.engagement_score) === 'high' ? 'Alto' : 
                   getEngagementLevel(analytics.results.engagement_score) === 'medium' ? 'Medio' : 'Bajo'}
                </Badge>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Satisfacción</p>
                <p className="text-2xl font-bold text-green-900">{analytics.results.satisfaction_score.toFixed(1)}</p>
                <div className="mt-1">
                  <Progress value={analytics.results.satisfaction_score * 20} className="h-2" />
                </div>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Bienestar</p>
                <p className="text-2xl font-bold text-purple-900">{analytics.results.wellbeing_score.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5.2%</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">ROI Generado</p>
                <p className="text-2xl font-bold text-orange-900">€{(analytics.interventions.roi_generated / 1000).toFixed(0)}K</p>
                <p className="text-xs text-orange-600 mt-1">{analytics.interventions.successful} intervenciones</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          <TabsTrigger value="instruments">Instrumentos</TabsTrigger>
          <TabsTrigger value="interventions">Intervenciones</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolución Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toFixed(2), 
                      name === 'burnout' ? 'Burnout' : 
                      name === 'engagement' ? 'Engagement' :
                      name === 'satisfaction' ? 'Satisfacción' : 'Bienestar'
                    ]}
                  />
                  <Line type="monotone" dataKey="burnout" stroke="#EF4444" strokeWidth={2} name="burnout" />
                  <Line type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} name="engagement" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={2} name="satisfaction" />
                  <Line type="monotone" dataKey="wellbeing" stroke="#8B5CF6" strokeWidth={2} name="wellbeing" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Comparación con Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={BENCHMARK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="burnout" fill="#EF4444" name="Burnout" />
                  <Bar dataKey="engagement" fill="#3B82F6" name="Engagement" />
                  <Bar dataKey="satisfaction" fill="#10B981" name="Satisfacción" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {(analytics.correlations.burnout_turnover * 100).toFixed(0)}%
                </div>
                <h3 className="font-medium mb-1">Burnout ↔ Rotación</h3>
                <p className="text-sm text-muted-foreground">Correlación fuerte</p>
                <Progress value={analytics.correlations.burnout_turnover * 100} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {(analytics.correlations.engagement_satisfaction * 100).toFixed(0)}%
                </div>
                <h3 className="font-medium mb-1">Engagement ↔ Satisfacción</h3>
                <p className="text-sm text-muted-foreground">Correlación moderada</p>
                <Progress value={analytics.correlations.engagement_satisfaction * 100} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(analytics.correlations.leadership_engagement * 100).toFixed(0)}%
                </div>
                <h3 className="font-medium mb-1">Liderazgo ↔ Engagement</h3>
                <p className="text-sm text-muted-foreground">Correlación moderada</p>
                <Progress value={analytics.correlations.leadership_engagement * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instruments" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instrumentos Más Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.instruments.most_used.map((instrument, index) => (
                    <div key={instrument} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{instrument}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        α = {analytics.instruments.reliability_scores[instrument]?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasas de Finalización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.instruments.completion_rates).map(([instrument, rate]) => (
                    <div key={instrument} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{instrument}</span>
                        <span className="text-sm text-muted-foreground">{rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <div className="text-2xl font-bold mb-1">{analytics.interventions.triggered}</div>
                <h3 className="font-medium text-blue-600">Intervenciones Disparadas</h3>
                <p className="text-sm text-muted-foreground mt-1">Por alta en riesgo</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <div className="text-2xl font-bold mb-1">{analytics.interventions.successful}</div>
                <h3 className="font-medium text-green-600">Intervenciones Exitosas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {((analytics.interventions.successful / analytics.interventions.triggered) * 100).toFixed(1)}% efectividad
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <div className="text-2xl font-bold mb-1">€{(analytics.interventions.roi_generated / 1000).toFixed(0)}K</div>
                <h3 className="font-medium text-orange-600">ROI Generado</h3>
                <p className="text-sm text-muted-foreground mt-1">Ahorro estimado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Efectividad por Tipo de Intervención</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Bloques de Foco', triggered: 45, successful: 41, roi: 85000 },
                  { name: 'Modo Desconexión', triggered: 38, successful: 34, roi: 62000 },
                  { name: 'Redistribución Carga', triggered: 23, successful: 21, roi: 98000 },
                  { name: 'Coaching 1:1', triggered: 28, successful: 24, roi: 76000 },
                  { name: 'Flexibilidad Horaria', triggered: 22, successful: 18, roi: 54000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="triggered" fill="#94A3B8" name="Disparadas" />
                  <Bar dataKey="successful" fill="#10B981" name="Exitosas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte CSRD
        </Button>
      </div>
    </div>
  );
};