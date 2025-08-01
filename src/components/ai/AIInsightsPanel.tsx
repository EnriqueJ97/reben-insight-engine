import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Lightbulb, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AIInsightsPanel = () => {
  const { user } = useAuth();
  const { analyzeWellnessData, generateTeamInsights, loading: aiLoading } = useAIAnalysis();
  const { getAlertStats } = useAlerts();
  
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [teamRecommendations, setTeamRecommendations] = useState<any>(null);

  useEffect(() => {
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    if (!user) return;

    const alertStats = getAlertStats();
    const wellnessData = {
      wellness_score: 75, // Would be calculated from real data
      risk_employees: alertStats.unresolved,
      total_checkins: 45,
      trend: 'improving',
      critical_alerts: alertStats.bySeverity?.high || 0
    };

    // Generate wellness analysis
    const insights = await analyzeWellnessData(wellnessData);
    setAiInsights(insights);

    // Generate team recommendations if manager or HR admin
    if (user.role === 'MANAGER' || user.role === 'HR_ADMIN') {
      const teamData = {
        team_size: 8,
        avg_wellness: 75,
        manager_name: user.full_name,
        issues: 'Algunas alertas de burnout detectadas'
      };
      
      const recommendations = await generateTeamInsights(teamData);
      setTeamRecommendations(recommendations);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* AI Status Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>🤖 Z.AI GLM-4.5 activo</strong> - Generando insights inteligentes de bienestar
          </span>
          <Button 
            onClick={generateAIInsights} 
            disabled={aiLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </AlertDescription>
      </Alert>

      {/* AI Wellness Analysis */}
      <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>Análisis IA de Bienestar</span>
            {aiLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
          </CardTitle>
          <CardDescription>
            Insights automáticos generados por Z.AI GLM-4.5
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">📊 Evaluación General</h4>
                <p className="text-sm">{aiInsights.wellness_assessment}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={aiInsights.risk_level === 'alto' ? 'destructive' : aiInsights.risk_level === 'medio' ? 'secondary' : 'default'}>
                    Riesgo: {aiInsights.risk_level}
                  </Badge>
                  <Badge variant="outline">
                    Confianza: {aiInsights.confidence_score}%
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-amber-600 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Insights Clave
                </h4>
                <ul className="space-y-1">
                  {aiInsights.key_insights?.map((insight: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">🎯 Acciones Inmediatas</h4>
                <ul className="space-y-1">
                  {aiInsights.immediate_actions?.map((action: string, index: number) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="text-green-500 mr-2">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">🔮 Predicción 30 días</h4>
                <p className="text-sm">{aiInsights.predictions_30_days}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {aiLoading ? 'Generando análisis con IA...' : 'Haz clic para generar análisis con IA'}
              </p>
              <Button 
                onClick={generateAIInsights} 
                disabled={aiLoading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiLoading ? 'Analizando...' : 'Generar Análisis IA'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Recommendations */}
      {teamRecommendations && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Recomendaciones para tu Equipo</span>
            </CardTitle>
            <CardDescription>
              Sugerencias específicas generadas por IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamRecommendations.recommendations?.map((rec: any, index: number) => (
                <div key={index} className="p-4 bg-white/60 rounded-lg border-l-4 border-l-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-green-700">{rec.title}</h4>
                    <div className="flex space-x-2">
                      <Badge variant={rec.priority === 'alta' ? 'destructive' : rec.priority === 'media' ? 'secondary' : 'outline'}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.timeframe}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {rec.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Rendimiento IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">GLM-4.5</div>
              <div className="text-xs text-muted-foreground">Modelo Z.AI</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {aiInsights?.confidence_score || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Confianza</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {teamRecommendations?.recommendations?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Recomendaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};