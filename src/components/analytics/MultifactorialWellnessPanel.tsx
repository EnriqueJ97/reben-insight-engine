import { useEffect, useState } from 'react';
import { useAdvancedWellnessAnalysis } from '@/hooks/useAdvancedWellnessAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Heart, Zap, Users, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface MultifactorialWellnessPanelProps {
  period?: string;
  scope?: string;
}

const MultifactorialWellnessPanel = ({ period = '30', scope = 'all' }: MultifactorialWellnessPanelProps) => {
  const { user } = useAuth();
  const { loading, wellness, burnout, calculateMultifactorialWellness, calculateBurnoutRiskML } = useAdvancedWellnessAnalysis();
  const { handleAsyncError } = useErrorHandler();
  const [hasError, setHasError] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setHasError(false);
        const periodDays = parseInt(period.replace('d', ''));
        
        const wellnessResult = await handleAsyncError(
          () => calculateMultifactorialWellness(user.id, undefined, periodDays),
          { showToast: false }
        );
        
        const burnoutResult = await handleAsyncError(
          () => calculateBurnoutRiskML(user.id, periodDays),
          { showToast: false }
        );

        if (!wellnessResult && !burnoutResult) {
          setHasError(true);
        }
      }
    };

    loadData();
  }, [user?.id, period, calculateMultifactorialWellness, calculateBurnoutRiskML, handleAsyncError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (hasError || (!loading && !wellness && !burnout)) {
    // Datos simulados para demo
    const simulatedWellness = {
      multifactorial_score: 7.2,
      mood_component: 7.8,
      engagement_component: 6.9,
      workload_component: 6.5,
      relationships_component: 8.1,
      autonomy_component: 7.4,
      consistency_factor: 0.78,
      temporal_trend: 0.05,
      confidence_level: 0.82
    };

    const simulatedBurnout = {
      risk_score: 35,
      risk_level: 'medium' as const,
      emotional_exhaustion: 42,
      depersonalization: 28,
      personal_accomplishment: 75,
      workload_intensity: 65,
      recovery_time: 70,
      social_support: 80,
      trend_direction: 'improving' as const,
      volatility: 18,
      response_consistency: 85,
      prediction_confidence: 78,
      contributing_factors: ['Carga de trabajo alta', 'Horarios inflexibles']
    };

    return (
      <div className="space-y-6">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            📊 <strong>Datos de demostración:</strong> Estos son datos simulados para mostrar las capacidades del sistema.
          </p>
        </div>

        {/* Wellness Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Análisis Multifactorial de Bienestar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(simulatedWellness.multifactorial_score)}`}>
                  {simulatedWellness.multifactorial_score.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Puntuación Global</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estado de Ánimo</span>
                  <span className="font-medium">{simulatedWellness.mood_component.toFixed(1)}</span>
                </div>
                <Progress value={simulatedWellness.mood_component * 10} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement</span>
                  <span className="font-medium">{simulatedWellness.engagement_component.toFixed(1)}</span>
                </div>
                <Progress value={simulatedWellness.engagement_component * 10} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Carga de Trabajo</span>
                  <span className="font-medium">{simulatedWellness.workload_component.toFixed(1)}</span>
                </div>
                <Progress value={simulatedWellness.workload_component * 10} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Relaciones</span>
                  <span className="font-medium">{simulatedWellness.relationships_component.toFixed(1)}</span>
                </div>
                <Progress value={simulatedWellness.relationships_component * 10} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold">{(simulatedWellness.consistency_factor * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Consistencia</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold">{(simulatedWellness.confidence_level * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Confianza</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Análisis de Burnout ML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={getRiskColor(simulatedBurnout.risk_level)} variant="outline">
                  {simulatedBurnout.risk_level.toUpperCase()}
                </Badge>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{simulatedBurnout.risk_score.toFixed(0)}%</div>
                  <p className="text-sm text-muted-foreground">Riesgo de Burnout</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agotamiento Emocional</span>
                  <span className="font-medium">{simulatedBurnout.emotional_exhaustion.toFixed(1)}</span>
                </div>
                <Progress value={simulatedBurnout.emotional_exhaustion} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Despersonalización</span>
                  <span className="font-medium">{simulatedBurnout.depersonalization.toFixed(1)}</span>
                </div>
                <Progress value={simulatedBurnout.depersonalization} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Realización Personal</span>
                  <span className="font-medium">{simulatedBurnout.personal_accomplishment.toFixed(1)}</span>
                </div>
                <Progress value={simulatedBurnout.personal_accomplishment} className="h-2" />
              </div>

              {simulatedBurnout.contributing_factors && simulatedBurnout.contributing_factors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Factores Contribuyentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {simulatedBurnout.contributing_factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wellness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Análisis Multifactorial de Bienestar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wellness && (
              <>
                <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(wellness.multifactorial_score)}`}>
                  {wellness.multifactorial_score.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">Puntuación Global</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estado de Ánimo</span>
                    <span className="font-medium">{wellness.mood_component.toFixed(1)}</span>
                  </div>
                  <Progress value={wellness.mood_component * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Engagement</span>
                    <span className="font-medium">{wellness.engagement_component.toFixed(1)}</span>
                  </div>
                  <Progress value={wellness.engagement_component * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Carga de Trabajo</span>
                    <span className="font-medium">{wellness.workload_component.toFixed(1)}</span>
                  </div>
                  <Progress value={wellness.workload_component * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Relaciones</span>
                    <span className="font-medium">{wellness.relationships_component.toFixed(1)}</span>
                  </div>
                  <Progress value={wellness.relationships_component * 10} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{(wellness.consistency_factor * 100).toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Consistencia</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="font-semibold">{(wellness.confidence_level * 100).toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Confianza</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Análisis de Burnout ML
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {burnout && (
              <>
                <div className="text-center">
                  <Badge className={getRiskColor(burnout.risk_level)} variant="outline">
                    {burnout.risk_level.toUpperCase()}
                  </Badge>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{burnout.risk_score.toFixed(0)}%</div>
                    <p className="text-sm text-muted-foreground">Riesgo de Burnout</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Agotamiento Emocional</span>
                    <span className="font-medium">{burnout.emotional_exhaustion.toFixed(1)}</span>
                  </div>
                  <Progress value={burnout.emotional_exhaustion} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Despersonalización</span>
                    <span className="font-medium">{burnout.depersonalization.toFixed(1)}</span>
                  </div>
                  <Progress value={burnout.depersonalization} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Realización Personal</span>
                    <span className="font-medium">{burnout.personal_accomplishment.toFixed(1)}</span>
                  </div>
                  <Progress value={burnout.personal_accomplishment} className="h-2" />
                </div>

                {burnout.contributing_factors && burnout.contributing_factors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Factores Contribuyentes:</p>
                    <div className="flex flex-wrap gap-2">
                      {burnout.contributing_factors.map((factor, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultifactorialWellnessPanel;