import { useEffect } from 'react';
import { useAdvancedWellnessAnalysis } from '@/hooks/useAdvancedWellnessAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Brain, Heart, Zap, Users, Shield, TrendingUp } from 'lucide-react';

interface MultifactorialWellnessPanelProps {
  period?: string;
  scope?: string;
}

const MultifactorialWellnessPanel = ({ period = '30', scope = 'all' }: MultifactorialWellnessPanelProps) => {
  const { user } = useAuth();
  const { loading, wellness, burnout, calculateMultifactorialWellness, calculateBurnoutRiskML } = useAdvancedWellnessAnalysis();

  useEffect(() => {
    if (user?.id) {
      const periodDays = parseInt(period.replace('d', ''));
      calculateMultifactorialWellness(user.id, undefined, periodDays);
      calculateBurnoutRiskML(user.id, periodDays);
    }
  }, [user?.id, period, calculateMultifactorialWellness, calculateBurnoutRiskML]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

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