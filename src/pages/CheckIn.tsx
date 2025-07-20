import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';
import { WELLNESS_QUESTIONS, getRandomDailyQuestion } from '@/data/questions';
import { Question } from '@/types/wellness';
import { useToast } from '@/hooks/use-toast';

const CheckIn = () => {
  const { user } = useAuth();
  const { createCheckin, fetchCheckins } = useCheckins();
  const { checkForBurnoutAlerts } = useAlerts();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDailyCompletion();
  }, [user]);

  const checkDailyCompletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user has completed today's check-in by querying Supabase
      const { data, error } = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .limit(1);

      if (error) {
        console.error('Error checking daily completion:', error);
      } else {
        const hasCompleted = data && data.length > 0;
        setHasCompletedToday(hasCompleted);
        
        if (!hasCompleted) {
          // Get today's question
          const question = getRandomDailyQuestion([user.id]);
          setCurrentQuestion(question);
        }
      }
    } catch (error) {
      console.error('Error checking daily completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || selectedScore === null || !user) return;

    setIsSubmitting(true);
    try {
      // Create checkin in Supabase
      await createCheckin(
        currentQuestion.id,
        selectedScore + 1, // Convert 0-4 scale to 1-5 scale for mood
        selectedScore
      );

      // Check for burnout alerts
      await checkForBurnoutAlerts(user.id);

      setHasCompletedToday(true);
      setQuestionsCompleted(1);

      // Show success message with personalized response
      const responses = getResponseForScore(selectedScore);
      toast({
        title: "¡Check-in completado!",
        description: responses.message,
      });

      // Refresh checkins data
      fetchCheckins();

    } catch (error) {
      console.error('Error submitting checkin:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu respuesta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponseForScore = (score: number) => {
    switch (score) {
      case 0: // Nunca
        return {
          message: "Gracias por tu honestidad. Si necesitas apoyo, no dudes en contactar a tu manager o RRHH.",
          type: "support"
        };
      case 1: // Rara vez
        return {
          message: "Entendemos que puede ser difícil. Recuerda tomar descansos regulares.",
          type: "neutral"
        };
      case 2: // Algunas veces
        return {
          message: "Es normal tener altos y bajos. Mantén un equilibrio saludable.",
          type: "neutral"
        };
      case 3: // A menudo
        return {
          message: "¡Bien! Sigue manteniendo esa actitud positiva.",
          type: "positive"
        };
      case 4: // Siempre
        return {
          message: "¡Excelente! Tu bienestar se refleja en tu energía positiva.",
          type: "positive"
        };
      default:
        return {
          message: "Gracias por completar tu check-in diario.",
          type: "neutral"
        };
    }
  };

  const resetForNewQuestion = () => {
    setSelectedScore(null);
    setCurrentQuestion(getRandomDailyQuestion([user?.id || '']));
    setHasCompletedToday(false);
  };

  const getScoreLabel = (score: number) => {
    const labels = ['Nunca', 'Rara vez', 'Algunas veces', 'A menudo', 'Siempre'];
    return labels[score];
  };

  const getScoreColor = (score: number, isSelected: boolean) => {
    if (!isSelected) return 'border-border bg-background hover:bg-muted/50';
    
    switch (score) {
      case 0:
      case 1:
        return 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100';
      case 2:
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
      case 3:
      case 4:
        return 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100';
      default:
        return 'border-border bg-background hover:bg-muted/50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (hasCompletedToday) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">¡Check-in Completado!</h1>
          <p className="text-muted-foreground mt-2">
            Ya has completado tu check-in diario. ¡Gracias por cuidar tu bienestar!
          </p>
        </div>

        {/* Completion Card */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Sesión de Hoy Completada</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Has registrado {questionsCompleted} respuesta hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Progreso Diario</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  100% Completado
                </Badge>
              </div>
              <Progress value={100} className="bg-green-100" />
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Pasos</CardTitle>
            <CardDescription>
              Mantén tu rutina de bienestar hasta mañana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Vuelve mañana para tu próximo check-in</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Recuerda tomar descansos regulares durante el día</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">Mantén un equilibrio saludable entre trabajo y vida personal</span>
            </div>
          </CardContent>
        </Card>

        {/* Debug/Reset Button for Testing */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                onClick={resetForNewQuestion}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar Check-in (Solo para pruebas)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground mt-2">
            No se pudo cargar la pregunta. Inténtalo de nuevo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold">Check-in Diario</h1>
        <p className="text-muted-foreground mt-2">
          Dedica un momento para reflexionar sobre tu bienestar
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso de Hoy</span>
              <span className="text-sm text-muted-foreground">0/1</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentQuestion.category}</Badge>
            <Badge variant="secondary">
              Pregunta {currentQuestion.id}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
          <CardDescription>
            Selecciona la opción que mejor describa tu experiencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Options */}
          <div className="grid gap-3">
            {[0, 1, 2, 3, 4].map((score) => (
              <button
                key={score}
                onClick={() => handleScoreSelect(score)}
                className={`p-4 text-left border rounded-lg transition-all ${getScoreColor(
                  score,
                  selectedScore === score
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getScoreLabel(score)}</div>
                    <div className="text-sm text-muted-foreground">Puntuación: {score}</div>
                  </div>
                  {selectedScore === score && (
                    <CheckCircle className="h-5 w-5 text-current" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Scale Description */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Escala:</strong> {currentQuestion.scale_description}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={selectedScore === null || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                Completar Check-in
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Tu respuesta es confidencial y solo se usa para generar métricas agregadas
              que ayuden a mejorar el bienestar del equipo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;