import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Users
} from 'lucide-react';

interface BurnoutPrediction {
  userId: string;
  userName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedDaysUntilBurnout: number | null;
  confidence: number;
  keyFactors: Array<{
    factor: string;
    impact: number;
    trend: 'improving' | 'stable' | 'deteriorating';
    description: string;
  }>;
  recommendations: string[];
  nextCheckDate: string;
}

interface BurnoutPredictionPanelProps {
  userId?: string;
  analysisType?: 'individual' | 'team';
}

export const BurnoutPredictionPanel = ({ userId, analysisType = 'individual' }: BurnoutPredictionPanelProps) => {
  const [predictions, setPredictions] = useState<BurnoutPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const runPrediction = async () => {
    if (!user?.tenant_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-burnout-predictor', {
        body: {
          userId: analysisType === 'individual' ? userId : undefined,
          tenantId: user.tenant_id,
          analysisType,
        }
      });

      if (error) throw error;

      if (data.success) {
        setPredictions(data.predictions);
        setLastAnalysis(data.analyzedAt);
        toast({
          title: "✨ Análisis completado",
          description: `${data.totalAnalyzed} empleado(s) analizados con IA`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Error en predicción",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Minus className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'deteriorating':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Predicción de Burnout con IA</h3>
            <p className="text-sm text-muted-foreground">
              {analysisType === 'individual' ? 'Análisis individual' : 'Análisis de equipo'}
            </p>
          </div>
        </div>
        <Button
          onClick={runPrediction}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Ejecutar Predicción IA
            </>
          )}
        </Button>
      </div>

      {lastAnalysis && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Último análisis: {new Date(lastAnalysis).toLocaleString('es-ES')}
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <Card key={prediction.userId} className="p-5 space-y-4 border-l-4" style={{
              borderLeftColor: 
                prediction.riskLevel === 'critical' ? 'rgb(239, 68, 68)' :
                prediction.riskLevel === 'high' ? 'rgb(249, 115, 22)' :
                prediction.riskLevel === 'medium' ? 'rgb(234, 179, 8)' :
                'rgb(34, 197, 94)'
            }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{prediction.userName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRiskColor(prediction.riskLevel)} className="gap-1">
                      {getRiskIcon(prediction.riskLevel)}
                      Riesgo {prediction.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Confianza: {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{
                    color: 
                      prediction.riskScore >= 85 ? 'rgb(239, 68, 68)' :
                      prediction.riskScore >= 60 ? 'rgb(249, 115, 22)' :
                      prediction.riskScore >= 30 ? 'rgb(234, 179, 8)' :
                      'rgb(34, 197, 94)'
                  }}>
                    {prediction.riskScore}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Nivel de riesgo</span>
                  <span className="font-medium">{prediction.riskScore}/100</span>
                </div>
                <Progress value={prediction.riskScore} className="h-2" />
              </div>

              {prediction.predictedDaysUntilBurnout !== null && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div className="text-sm">
                    <span className="font-semibold">Predicción: </span>
                    Burnout probable en aproximadamente{' '}
                    <span className="font-bold text-orange-600">
                      {prediction.predictedDaysUntilBurnout} días
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h5 className="font-semibold text-sm">Factores Clave:</h5>
                {prediction.keyFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(factor.trend)}
                        <span className="text-sm font-medium">{factor.factor}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Impacto: {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>

              {prediction.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-sm">Recomendaciones:</h5>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Próxima revisión sugerida: {new Date(prediction.nextCheckDate).toLocaleDateString('es-ES')}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && predictions.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">
            No hay predicciones disponibles
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Ejecuta el análisis predictivo para obtener insights con IA
          </p>
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h5 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Sobre el Modelo Predictivo
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Analiza patrones de check-ins, alertas y comportamiento temporal</li>
          <li>Detecta tendencias de deterioro 30-60 días antes del burnout</li>
          <li>Correlaciona múltiples señales (mood, respuestas, timing)</li>
          <li>Generado con Gemini 2.5 Flash - actualizaciones continuas</li>
        </ul>
      </div>
    </Card>
  );
};
