import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useProfiles } from '@/hooks/useProfiles';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Clock, 
  AlertTriangle, 
  Users, 
  Lightbulb,
  CheckCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface TeamInsight {
  title: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  timeframe: string;
  category: string;
}

const TeamAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { analyzeWellnessData, generateTeamInsights } = useAIAnalysis();
  const { profiles, fetchTeamMembers } = useProfiles();
  const { alerts, fetchAlerts } = useAlerts();
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [teamRecommendations, setTeamRecommendations] = useState<any>(null);

  useEffect(() => {
    generateAnalysis();
  }, []);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      // Fetch team data
      if (user?.role === 'MANAGER' && user?.team_id) {
        await fetchTeamMembers(user.team_id);
      }
      await fetchAlerts();

      // Prepare data for AI analysis
      const teamData = {
        wellness_score: 75,
        risk_employees: alerts.filter(a => a.type === 'burnout_risk').length,
        total_checkins: 42,
        trend: 'improving',
        critical_alerts: alerts.filter(a => !a.resolved).length,
        team_size: profiles.length,
        avg_wellness: 75,
        manager_name: user?.full_name,
        issues: 'Algunas preocupaciones sobre carga de trabajo'
      };

      // Generate AI wellness analysis
      const analysis = await analyzeWellnessData(teamData);
      setAiAnalysis(analysis);

      // Generate team recommendations
      const recommendations = await generateTeamInsights(teamData);
      setTeamRecommendations(recommendations);

      toast.success('Análisis de IA generado exitosamente');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Error al generar el análisis');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baja': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return <AlertTriangle className="h-4 w-4" />;
      case 'media': return <Clock className="h-4 w-4" />;
      case 'baja': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <div>
            <h2 className="text-xl font-semibold">Generando análisis inteligente...</h2>
            <p className="text-muted-foreground">La IA está analizando los datos de tu equipo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span>Análisis Inteligente del Equipo</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Insights estratégicos generados por IA para optimizar el bienestar de tu equipo
            </p>
          </div>
        </div>
        <Button onClick={generateAnalysis} disabled={isLoading}>
          <Sparkles className="h-4 w-4 mr-2" />
          Regenerar Análisis
        </Button>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Análisis General</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {aiAnalysis && (
            <>
              {/* Wellness Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Evaluación del Clima Laboral</span>
                    <Badge variant={aiAnalysis.risk_level === 'alto' ? 'destructive' : aiAnalysis.risk_level === 'medio' ? 'secondary' : 'outline'}>
                      Riesgo {aiAnalysis.risk_level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{aiAnalysis.wellness_assessment}</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Confianza del análisis:</span>
                    <Badge variant="outline">{aiAnalysis.confidence_score}%</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Insights Clave Detectados</span>
                  </CardTitle>
                  <CardDescription>
                    Patrones importantes identificados por la IA en los datos de tu equipo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiAnalysis.key_insights?.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Immediate Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span>Acciones Inmediatas Recomendadas</span>
                  </CardTitle>
                  <CardDescription>
                    Intervenciones específicas para implementar esta semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAnalysis.immediate_actions?.map((action: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {teamRecommendations?.recommendations && (
            <div className="grid gap-6">
              {teamRecommendations.recommendations.map((rec: TeamInsight, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getPriorityIcon(rec.priority)}
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getPriorityColor(rec.priority) as any}>
                              Prioridad {rec.priority}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {rec.timeframe}
                            </Badge>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{rec.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          {aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Proyecciones a 30 Días</span>
                </CardTitle>
                <CardDescription>
                  Predicciones basadas en tendencias actuales y patrones detectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-lg leading-relaxed">{aiAnalysis.predictions_30_days}</p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">Bienestar proyectado</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                    <div className="text-2xl font-bold">15%</div>
                    <p className="text-xs text-muted-foreground">Reducción de riesgo</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Target className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">Engagement esperado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamAnalysis;