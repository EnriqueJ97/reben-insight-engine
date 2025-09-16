import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SCIENTIFIC_INSTRUMENTS } from '@/data/scientific-instruments';
import { Clock, CheckCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react';

interface EvaluationCampaign {
  id: string;
  name: string;
  description: string;
  template_data: {
    components: Array<{
      id: string;
      type: string;
      instrumentId: string;
      dimensionId?: string;
      order: number;
      required: boolean;
    }>;
    configuration: {
      anonymous: boolean;
      gamification?: {
        enabled: boolean;
        progressBar: boolean;
        motivationalMessages: boolean;
      };
    };
  };
  anonymous: boolean;
  status: string;
  completed_responses?: number;
}

interface Question {
  id: string;
  text: string;
  scale: string;
  category: string;
  instrumentId: string;
  dimensionId?: string;
}

export default function EvaluationResponse() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<EvaluationCampaign | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const { data: campaignData, error } = await supabase
        .from('evaluation_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      setCampaign(campaignData as any);
      generateQuestions(campaignData as any);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la evaluación",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  };

  const generateQuestions = (campaignData: EvaluationCampaign) => {
    const generatedQuestions: Question[] = [];

    campaignData.template_data.components.forEach(component => {
      const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === component.instrumentId);
      if (!instrument) return;

      if (component.dimensionId) {
        // Use specific dimension
        const dimension = instrument.dimensions.find(d => d.id === component.dimensionId);
        if (dimension && dimension.items && dimension.description) {
          // Use first few items as sample
          const sampleItems = [
            dimension.description + " - Item 1",
            dimension.description + " - Item 2"
          ];
          sampleItems.forEach((item, index) => {
            generatedQuestions.push({
              id: `${component.id}_${index}`,
              text: item,
              scale: "0=Nunca, 4=Siempre",
              category: instrument.category,
              instrumentId: instrument.id,
              dimensionId: dimension.id
            });
          });
        }
      } else {
        // Use full instrument (sample items for demo)
        instrument.dimensions.forEach(dimension => {
          if (dimension.items && dimension.description) {
            const sampleItems = [
              dimension.description + " - Ejemplo 1",
              dimension.description + " - Ejemplo 2"
            ];
            sampleItems.slice(0, 2).forEach((item, index) => {
              generatedQuestions.push({
                id: `${component.id}_${dimension.id}_${index}`,
                text: item,
                scale: "0=Nunca, 4=Siempre",
                category: instrument.category,
                instrumentId: instrument.id,
                dimensionId: dimension.id
              });
            });
          }
        });
      }
    });

    setQuestions(generatedQuestions);
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitEvaluation = async () => {
    if (!campaign || !user) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60));
      const userAlias = campaign.anonymous ? 
        await generateAnonymousAlias() : undefined;

      const { error } = await supabase
        .from('evaluation_responses')
        .insert({
          tenant_id: user.tenant_id,
          campaign_id: campaignId!,
          user_id: campaign.anonymous ? null : user.id,
          user_alias: userAlias,
          responses: responses,
          completion_status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent_minutes: timeSpent
        });

      if (error) throw error;

      // Update campaign completed responses count
      const { error: updateError } = await supabase
        .from('evaluation_campaigns')
        .update({ 
          completed_responses: (campaign.completed_responses || 0) + 1 
        })
        .eq('id', campaignId);

      // Trigger analytics calculation
      await supabase.functions.invoke('calculate-evaluation-analytics', {
        body: { campaignId }
      });

      toast({
        title: "¡Evaluación completada!",
        description: "Gracias por completar la evaluación",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la evaluación",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generateAnonymousAlias = async () => {
    const { data, error } = await supabase.rpc('generate_evaluation_alias', {
      campaign_uuid: campaignId,
      user_uuid: user?.id
    });
    if (error) throw error;
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (!campaign || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Evaluación no disponible</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta evaluación no está disponible o ha expirado.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = responses[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{campaign.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {campaign.description}
                </p>
              </div>
              {campaign.anonymous && (
                <Badge variant="secondary">Anónima</Badge>
              )}
            </div>
            
            {campaign.template_data.configuration.gamification?.progressBar && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progreso</span>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} de {questions.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                Pregunta {currentQuestionIndex + 1}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.category}
              </Badge>
            </div>
            <CardTitle className="text-lg font-medium">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escala: {currentQuestion.scale}
              </p>
              
              <RadioGroup
                value={responses[currentQuestion.id]?.toString()}
                onValueChange={(value) => handleResponse(currentQuestion.id, parseInt(value))}
              >
                {[0, 1, 2, 3, 4].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value.toString()} id={`q${currentQuestion.id}_${value}`} />
                    <Label htmlFor={`q${currentQuestion.id}_${value}`} className="cursor-pointer">
                      {value} - {value === 0 ? 'Nunca' : value === 4 ? 'Siempre' : ''}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            <Clock className="w-4 h-4 inline mr-1" />
            ~{Math.round((questions.length - currentQuestionIndex - 1) * 0.5)} min restantes
          </div>

          {isLastQuestion ? (
            <Button
              onClick={submitEvaluation}
              disabled={!canProceed || submitting}
            >
              {submitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Completar
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={!canProceed}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Motivational Message */}
        {campaign.template_data.configuration.gamification?.motivationalMessages && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700">
                ¡Excelente progreso! Has completado {Math.round(progress)}% de la evaluación.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}