import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  Euro,
  Play,
  Star,
  ArrowRight
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  recommendation_type: string;
  current_metrics: any;
  recommended_changes: any;
  expected_impact: any;
  confidence_score: number;
  reasoning: string;
  status: string;
  generated_at: string;
}

interface AIAnalysisProps {
  onRecommendationGenerated?: (recommendation: AIRecommendation) => void;
}

const AIAssistant: React.FC<AIAnalysisProps> = ({ onRecommendationGenerated }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_policy_recommendations')
        .select('*')
        .eq('status', 'pending')
        .order('generated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecommendations((data || []).map(rec => ({
        ...rec,
        recommended_changes: Array.isArray(rec.recommended_changes) ? rec.recommended_changes : []
      })));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateAnalysis = async (analysisType: string) => {
    setAnalyzing(true);
    try {
      // Get current metrics and policies
      const [metricsData, policiesData] = await Promise.all([
        supabase.from('productivity_metrics').select('*').limit(100),
        supabase.from('hr_policy_configs').select('*')
      ]);

      const tenantData = {
        employee_count: 150,
        industry: 'Tecnología',
        company_size: 'Mediana'
      };

      // Call AI assistant
      const { data, error } = await supabase.functions.invoke('hr-policy-assistant', {
        body: {
          analysisType,
          tenantData,
          currentPolicies: policiesData.data || [],
          performanceMetrics: metricsData.data || []
        }
      });

      if (error) throw error;

      if (data.success && data.recommendation_id) {
        toast.success('🤖 Análisis IA completado');
        loadRecommendations();
        if (onRecommendationGenerated) {
          // Find the new recommendation
          const newRec = await supabase
            .from('ai_policy_recommendations')
            .select('*')
            .eq('id', data.recommendation_id)
            .single();
          
          if (newRec.data) {
            onRecommendationGenerated({
              ...newRec.data,
              recommended_changes: Array.isArray(newRec.data.recommended_changes) ? newRec.data.recommended_changes : []
            });
          }
        }
      } else {
        throw new Error(data.error || 'Error en el análisis');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Error generando análisis IA');
    } finally {
      setAnalyzing(false);
      setShowAnalysisModal(false);
    }
  };

  const applyRecommendation = async (recommendation: AIRecommendation) => {
    try {
      // Mark as applied
      const { error } = await supabase
        .from('ai_policy_recommendations')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: user?.id
        })
        .eq('id', recommendation.id);

      if (error) throw error;

      toast.success('Recomendación aplicada exitosamente');
      loadRecommendations();
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast.error('Error aplicando recomendación');
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_policy_recommendations')
        .update({ status: 'dismissed' })
        .eq('id', recommendationId);

      if (error) throw error;
      loadRecommendations();
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast.error('Error descartando recomendación');
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'turnover_reduction': return <Users className="w-5 h-5" />;
      case 'satisfaction_improvement': return <Star className="w-5 h-5" />;
      case 'policy_optimization': return <Target className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'turnover_reduction': return 'Reducción de Rotación';
      case 'satisfaction_improvement': return 'Mejora de Satisfacción';
      case 'policy_optimization': return 'Optimización de Políticas';
      default: return 'Análisis General';
    }
  };

  const formatImpact = (impact: any) => {
    if (typeof impact === 'number') {
      return impact > 0 ? `+${impact}%` : `${impact}%`;
    }
    return JSON.stringify(impact);
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-900">
                  Asistente IA de Políticas
                </CardTitle>
                <p className="text-purple-700">
                  Análisis inteligente basado en datos de rotación y satisfacción
                </p>
              </div>
            </div>
            
            <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Nuevo Análisis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tipo de Análisis IA</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Button 
                    onClick={() => generateAnalysis('turnover_reduction')}
                    disabled={analyzing}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Users className="w-5 h-5 text-red-500" />
                      <div className="text-left">
                        <div className="font-medium">Reducción de Rotación</div>
                        <div className="text-sm text-muted-foreground">
                          Analiza patrones de abandono y sugiere políticas
                        </div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => generateAnalysis('satisfaction_improvement')}
                    disabled={analyzing}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div className="text-left">
                        <div className="font-medium">Mejora de Satisfacción</div>
                        <div className="text-sm text-muted-foreground">
                          Identifica oportunidades de engagement
                        </div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => generateAnalysis('policy_optimization')}
                    disabled={analyzing}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Target className="w-5 h-5 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Optimización de Políticas</div>
                        <div className="text-sm text-muted-foreground">
                          Revisa eficiencia y encuentra gaps
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
                
                {analyzing && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">Generando análisis IA...</span>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Active Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Recomendaciones Activas ({recommendations.length})
          </h3>
          
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAnalysisTypeIcon(recommendation.recommendation_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {getAnalysisTypeLabel(recommendation.recommendation_type)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Generado {new Date(recommendation.generated_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50">
                      <Star className="w-3 h-3 mr-1" />
                      {Math.round(recommendation.confidence_score * 100)}% confianza
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Expected Impact */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Impacto Esperado
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(recommendation.expected_impact).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-bold text-green-700">
                          {formatImpact(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Recommendations */}
                <div>
                  <h4 className="font-medium mb-2">Principales Cambios Sugeridos:</h4>
                  <div className="space-y-2">
                    {Array.isArray(recommendation.recommended_changes) && recommendation.recommended_changes.slice(0, 3).map((change: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{change.policy_type}</p>
                          <p className="text-xs text-muted-foreground">{change.description}</p>
                          {change.expected_impact && (
                            <p className="text-xs text-green-600 mt-1">
                              Impacto: +{Math.round(change.expected_impact.satisfaction_improvement * 100)}% satisfacción
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => applyRecommendation(recommendation)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aplicar Recomendación
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => dismissRecommendation(recommendation.id)}
                  >
                    Descartar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No recommendations state */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay recomendaciones activas</h3>
            <p className="text-muted-foreground mb-6">
              El asistente IA está listo para analizar tus datos y generar recomendaciones personalizadas.
            </p>
            <Button onClick={() => setShowAnalysisModal(true)} className="bg-purple-600 hover:bg-purple-700">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Primer Análisis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;