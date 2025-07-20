
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  useEffect(() => {
    // Check if user has completed today's check-in
    const todayKey = `checkin_${user?.id}_${new Date().toDateString()}`;
    const completedToday = localStorage.getItem(todayKey);
    
    if (completedToday) {
      setHasCompletedToday(true);
      setQuestionsCompleted(parseInt(completedToday));
    } else {
      // Get today's question
      loadTodaysQuestion();
    }
  }, [user?.id]);

  const loadTodaysQuestion = () => {
    // In a real app, this would be determined by the backend
    // For demo, we'll use a seeded random based on today's date
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const questionIndex = seed % WELLNESS_QUESTIONS.length;
    setCurrentQuestion(WELLNESS_QUESTIONS[questionIndex]);
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 0: return 'Nunca';
      case 1: return 'Rara vez';
      case 2: return 'Algunas veces';
      case 3: return 'A menudo';
      case 4: return 'Siempre';
      default: return '';
    }
  };

  const getScoreEmoji = (score: number) => {
    switch (score) {
      case 0: return '😊';
      case 1: return '🙂';
      case 2: return '😐';
      case 3: return '😕';
      case 4: return '😞';
      default: return '❓';
    }
  };

  const getResponseMessage = (score: number, category: string) => {
    if (category === 'satisfaction') {
      // For satisfaction questions, higher is better
      if (score >= 3) return "¡Excelente! Sigue así. 🌟";
      if (score === 2) return "Bien, hay espacio para mejorar. 💪";
      return "Gracias por tu honestidad. Considera hablar con tu líder si persiste. 🤝";
    } else {
      // For burnout and turnover, lower is better
      if (score <= 1) return "¡Genial! Estás en buen camino. 🌟";
      if (score === 2) return "Atención: programa 15 min de descanso hoy. ⏰";
      return "Gracias por contarlo. Programa descansos y considera hablar con tu líder. 🤝";
    }
  };

  const handleSubmit = async () => {
    if (selectedScore === null || !currentQuestion) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage (in real app, this would be API)
      const todayKey = `checkin_${user?.id}_${new Date().toDateString()}`;
      localStorage.setItem(todayKey, '1');

      const responseMessage = getResponseMessage(selectedScore, currentQuestion.category);
      
      setHasCompletedToday(true);
      setQuestionsCompleted(1);

      toast({
        title: "Check-in completado ✅",
        description: responseMessage,
      });

      // Simulate alert generation for high-risk scores
      if (selectedScore >= 3 && currentQuestion.category !== 'satisfaction') {
        setTimeout(() => {
          toast({
            title: "Recomendación de bienestar",
            description: "Te hemos enviado algunos consejos personalizados. Revisa tu email.",
            variant: "default",
          });
        }, 2000);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar tu respuesta. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCheckIn = () => {
    const todayKey = `checkin_${user?.id}_${new Date().toDateString()}`;
    localStorage.removeItem(todayKey);
    setHasCompletedToday(false);
    setSelectedScore(null);
    setQuestionsCompleted(0);
    loadTodaysQuestion();
  };

  if (hasCompletedToday) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-success mb-2">¡Check-in Completado!</h1>
          <p className="text-muted-foreground">
            Gracias por compartir cómo te sientes hoy. Tu bienestar es importante para nosotros.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-success/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-success">{questionsCompleted}</div>
              <p className="text-sm text-muted-foreground">Pregunta respondida hoy</p>
              
              <div className="flex items-center justify-center space-x-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl">📈</div>
                  <p className="text-xs text-muted-foreground">Tu progreso</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl">🎯</div>
                  <p className="text-xs text-muted-foreground">Meta diaria</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl">💪</div>
                  <p className="text-xs text-muted-foreground">Seguimiento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📅 Próximo Check-in</CardTitle>
            <CardDescription>
              Podrás responder la siguiente pregunta mañana a las 9:00 AM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Recuerda: cada respuesta nos ayuda a cuidar mejor tu bienestar
              </span>
              <Button variant="outline" onClick={resetCheckIn} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar (Demo)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Check-in Diario</h1>
        <p className="text-muted-foreground">
          Una pregunta rápida para conocer cómo te sientes hoy
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Progreso diario</span>
            <span className="text-sm text-muted-foreground">1 de 1</span>
          </div>
          <Progress value={selectedScore !== null ? 100 : 0} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {currentQuestion.category === 'burnout' && '🔥 Burnout'}
                {currentQuestion.category === 'turnover' && '🚪 Rotación'}
                {currentQuestion.category === 'satisfaction' && '😊 Satisfacción'}
                {currentQuestion.category === 'extra' && '➕ Bienestar'}
              </Badge>
              <span className="text-sm text-muted-foreground">ID: {currentQuestion.id}</span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
            <CardDescription>
              {currentQuestion.scale_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm font-medium mb-4">Selecciona tu respuesta:</p>
              <div className="grid grid-cols-1 gap-3">
                {[0, 1, 2, 3, 4].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreSelect(score)}
                    className={`p-4 text-left rounded-lg border-2 transition-all hover:bg-muted/50 ${
                      selectedScore === score
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getScoreEmoji(score)}</span>
                        <div>
                          <div className="font-medium">{getScoreLabel(score)}</div>
                          <div className="text-sm text-muted-foreground">Puntuación: {score}</div>
                        </div>
                      </div>
                      {selectedScore === score && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={selectedScore === null || isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Guardando...
            </>
          ) : (
            <>
              Enviar Respuesta
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              🔒 Tus respuestas son confidenciales y se usan solo para generar insights agregados
            </p>
            <p className="text-xs text-muted-foreground">
              Sistema REBEN v1.0 - Científicamente validado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckIn;
