import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, TrendingUp, Users, Target, AlertTriangle, 
  CheckCircle, Calendar, Award, Brain, Download 
} from 'lucide-react';

interface TeamMetrics {
  performance: {
    objectivesCompleted: number;
    averageEvaluationScore: number;
    teamComparison: number;
  };
  wellbeing: {
    teamWellbeingScore: number;
    burnoutRisk: string;
    retentionProjection: number;
  };
  insights: {
    highPerformanceCorrelation: string;
    atRiskMembers: number;
    objectivesProbability: number;
  };
  trends: {
    period: string;
    wellbeingChange: number;
    performanceChange: number;
    engagementChange: number;
  };
}

const TeamAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2024');
  const [metrics] = useState<TeamMetrics>({
    performance: {
      objectivesCompleted: 78,
      averageEvaluationScore: 4.2,
      teamComparison: 15
    },
    wellbeing: {
      teamWellbeingScore: 82,
      burnoutRisk: 'Bajo',
      retentionProjection: 94
    },
    insights: {
      highPerformanceCorrelation: '23% más productivos',
      atRiskMembers: 1,
      objectivesProbability: 87
    },
    trends: {
      period: 'vs. período anterior',
      wellbeingChange: 12,
      performanceChange: 8,
      engagementChange: 15
    }
  });

  const teamMembers = [
    {
      name: 'María García',
      wellbeing: 85,
      performance: 4.4,
      risk: 'Bajo',
      trend: 'up',
      keyStrengths: ['Liderazgo', 'Innovación'],
      developmentAreas: ['Delegación']
    },
    {
      name: 'Carlos López',
      wellbeing: 68,
      performance: 3.8,
      risk: 'Medio',
      trend: 'down',
      keyStrengths: ['Técnico', 'Detallista'],
      developmentAreas: ['Comunicación', 'Gestión de estrés']
    },
    {
      name: 'Ana Rodríguez',
      wellbeing: 90,
      performance: 4.1,
      risk: 'Bajo',
      trend: 'up',
      keyStrengths: ['Colaboración', 'Aprendizaje'],
      developmentAreas: ['Autonomía']
    }
  ];

  const aiInsights = [
    {
      type: 'positive',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: 'Correlación Bienestar-Rendimiento',
      description: 'Los empleados con bienestar alto son 23% más productivos en evaluaciones.',
      action: 'Mantener programas de bienestar actuales'
    },
    {
      type: 'attention',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      title: 'Riesgo de Burnout Detectado',
      description: '1 persona en riesgo medio. Carga de trabajo y estrés requieren atención.',
      action: 'Revisar distribución de tareas para Carlos López'
    },
    {
      type: 'opportunity',
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      title: 'Probabilidad de Éxito Q4',
      description: 'Equipo con 87% probabilidad de cumplir OKRs Q4 según tendencias actuales.',
      action: 'Optimizar proceso de seguimiento de objetivos'
    },
    {
      type: 'growth',
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      title: 'Potencial de Desarrollo',
      description: '2 miembros muestran alta receptividad a nuevos challenges y responsabilidades.',
      action: 'Considerar proyectos de stretch para María y Ana'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Alto': return 'bg-red-500';
      case 'Medio': return 'bg-yellow-500';
      case 'Bajo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-400';
      case 'attention': return 'border-l-yellow-400';
      case 'opportunity': return 'border-l-blue-400';
      case 'growth': return 'border-l-purple-400';
      default: return 'border-l-gray-400';
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50';
      case 'attention': return 'bg-yellow-50';
      case 'opportunity': return 'bg-blue-50';
      case 'growth': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics del Equipo</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1-2024">Q1 2024</SelectItem>
              <SelectItem value="Q2-2024">Q2 2024</SelectItem>
              <SelectItem value="Q3-2024">Q3 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="wellbeing">Bienestar</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.performance.objectivesCompleted}%</p>
                    <p className="text-sm text-muted-foreground">Objetivos Cumplidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.performance.averageEvaluationScore}</p>
                    <p className="text-sm text-muted-foreground">Evaluación Media</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.wellbeing.teamWellbeingScore}%</p>
                    <p className="text-sm text-muted-foreground">Bienestar Equipo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.wellbeing.retentionProjection}%</p>
                    <p className="text-sm text-muted-foreground">Retención Proyectada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativa vs otros equipos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Comparativa con Otros Equipos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rendimiento General</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-32 h-2" />
                  <Badge variant="outline" className="bg-green-500">
                    <span className="text-white">+{metrics.performance.teamComparison}%</span>
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bienestar del Equipo</span>
                <div className="flex items-center gap-2">
                  <Progress value={82} className="w-32 h-2" />
                  <Badge variant="outline" className="bg-blue-500">
                    <span className="text-white">Top 10%</span>
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Retención de Talento</span>
                <div className="flex items-center gap-2">
                  <Progress value={94} className="w-32 h-2" />
                  <Badge variant="outline" className="bg-green-500">
                    <span className="text-white">Excelente</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tendencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendencias {metrics.trends.period}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Bienestar</p>
                    <p className="text-lg font-bold text-green-600">+{metrics.trends.wellbeingChange}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Rendimiento</p>
                    <p className="text-lg font-bold text-blue-600">+{metrics.trends.performanceChange}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Engagement</p>
                    <p className="text-lg font-bold text-purple-600">+{metrics.trends.engagementChange}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(member.trend)}
                      <Badge variant="outline" className={getRiskColor(member.risk)}>
                        <span className="text-white">{member.risk} Riesgo</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Puntuación Evaluación</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(member.performance / 5) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{member.performance}/5.0</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bienestar</p>
                      <div className="flex items-center gap-2">
                        <Progress value={member.wellbeing} className="flex-1" />
                        <span className="text-sm font-medium">{member.wellbeing}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Fortalezas Clave</p>
                      <div className="flex flex-wrap gap-1">
                        {member.keyStrengths.map((strength) => (
                          <Badge key={strength} variant="secondary" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Áreas de Desarrollo</p>
                      <div className="flex flex-wrap gap-1">
                        {member.developmentAreas.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wellbeing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.wellbeing.teamWellbeingScore}%</p>
                    <p className="text-sm text-muted-foreground">Score Bienestar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.wellbeing.burnoutRisk}</p>
                    <p className="text-sm text-muted-foreground">Riesgo Burnout</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.wellbeing.retentionProjection}%</p>
                    <p className="text-sm text-muted-foreground">Retención Proyectada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Bienestar por Miembro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="outline" className={getRiskColor(member.risk)}>
                        <span className="text-white">{member.risk}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={member.wellbeing} className="w-24 h-2" />
                      <span className="text-sm font-medium w-12">{member.wellbeing}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${getInsightBorderColor(insight.type)}`}>
                <CardContent className={`p-6 ${getInsightBgColor(insight.type)}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Acción Sugerida
                        </Badge>
                        <span className="text-xs text-muted-foreground">{insight.action}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Predicciones Avanzadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Probabilidad de Cumplir Objetivos Q4</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={metrics.insights.objectivesProbability} className="flex-1" />
                  <span className="font-bold text-blue-900">{metrics.insights.objectivesProbability}%</span>
                </div>
                <p className="text-sm text-blue-800">
                  Basado en tendencias actuales de rendimiento, bienestar y progreso de objetivos.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Factores de Éxito Identificados</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Alto nivel de colaboración entre miembros del equipo</li>
                  <li>• Feedback regular y constructivo mejora el rendimiento</li>
                  <li>• Planes de desarrollo personalizados aumentan la retención</li>
                  <li>• Reuniones 1:1 regulares correlacionan con mejor bienestar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamAnalytics;