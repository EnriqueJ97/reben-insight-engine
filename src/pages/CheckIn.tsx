import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { useAlerts } from '@/hooks/useAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, CheckCircle, RotateCcw, CalendarPlus, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { WELLNESS_QUESTIONS, getRandomDailyQuestion } from '@/data/questions';
import { Question } from '@/types/wellness';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
const CheckIn = () => {
  const { user } = useAuth();
  const { createCheckin, fetchCheckins, getCurrentStreak } = useCheckins();
  const { checkForBurnoutAlerts } = useAlerts();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [openFeedback, setOpenFeedback] = useState('');
  const { generateComprehensiveReport } = useAIAnalysis();
  const [aiRecommendations, setAiRecommendations] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [downloadingICS, setDownloadingICS] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSlack, setSendingSlack] = useState(false);

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
        
        // Fetch current streak
        try {
          const { current } = await getCurrentStreak();
          setStreak(current);
        } catch (e) {
          console.error('Error fetching streak:', e);
        }
        
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

      // Optionally store anonymous open feedback
      if (openFeedback.trim()) {
        await supabase.from('anonymous_feedback').insert({
          tenant_id: user.tenant_id,
          category: 'wellness',
          message: openFeedback.trim(),
          metadata: {
            question_id: currentQuestion.id,
            score: selectedScore + 1,
            source_category: currentQuestion.category,
          },
        });
      }

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

      // Trigger AI recommendations (non-blocking)
      try {
        setAiLoading(true);
        const analysis = await generateComprehensiveReport({
          wellness_score: ((selectedScore + 1) / 5) * 100,
          total_checkins: 1,
          trend: 'neutral',
          notes: openFeedback.trim(),
        });
        setAiRecommendations(analysis);
      } catch (e) {
        console.error('AI analysis error:', e);
      } finally {
        setAiLoading(false);
      }

      // Refresh checkins data
      await fetchCheckins();
      // Update streak after saving
      try {
        const { current } = await getCurrentStreak();
        setStreak(current);
      } catch (e) {
        console.error('Error updating streak:', e);
      }

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

  // Helpers: reminders and calendar
  const handleDownloadICS = async () => {
    try {
      setDownloadingICS(true);
      const now = new Date();
      const dtStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
      const format = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;

      const uid = `${crypto.randomUUID()}@reben`;
      const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//REBEN//Check-in Reminder//ES\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${format(now)}\nDTSTART:${format(dtStart)}\nDURATION:PT10M\nRRULE:FREQ=DAILY\nSUMMARY:Recordatorio Check-in de Bienestar\nDESCRIPTION:Completa tu check-in diario en REBEN\nEND:VEVENT\nEND:VCALENDAR`;

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reben-checkin-reminder.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Añadido', description: 'Descargamos un archivo .ics para tu calendario.' });
    } finally {
      setDownloadingICS(false);
    }
  };

  const handleSendEmailReminder = async () => {
    if (!user?.email) return;
    try {
      setSendingEmail(true);
      await supabase.functions.invoke('send-daily-question', {
        body: { testEmail: user.email, questionId: currentQuestion?.id || 'S1' },
      });
      toast({ title: 'Email enviado', description: 'Te enviamos un recordatorio a tu correo.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'No pudimos enviar el email.', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendSlackReminder = async () => {
    if (!user?.email) return;
    try {
      setSendingSlack(true);
      const link = window.location.origin + '/dashboard/checkin';
      await supabase.functions.invoke('send-slack-reminder', {
        body: { email: user.email, message: `Recuerda completar tu check-in de bienestar hoy: ${link}`, tenantId: user.tenant_id },
      });
      toast({ title: 'Slack enviado', description: 'Te enviamos un DM en Slack (si tu email está vinculado).' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'No pudimos enviar el mensaje de Slack.', variant: 'destructive' });
    } finally {
      setSendingSlack(false);
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    100% Completado
                  </Badge>
                  <Badge variant="outline">{streak} días de racha</Badge>
                </div>
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

        {/* AI Suggestions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Sugerencias y recursos</CardTitle>
            <CardDescription>
              Recomendaciones generadas con IA en base a tu check-in de hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Generando recomendaciones...
              </div>
            )}
            {!aiLoading && aiRecommendations && (
              <div className="space-y-4">
                {Array.isArray(aiRecommendations.immediate_actions) && (
                  <div>
                    <div className="text-sm font-medium mb-2">Acciones inmediatas</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiRecommendations.immediate_actions.map((a: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(aiRecommendations.key_insights) && (
                  <div>
                    <div className="text-sm font-medium mb-2">Insights clave</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiRecommendations.key_insights.map((a: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(aiRecommendations.recommendations) && aiRecommendations.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recursos sugeridos</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {aiRecommendations.recommendations.slice(0,3).map((rec: any, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          <span className="font-medium">{rec.title}:</span> {rec.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Recordatorios</CardTitle>
            <CardDescription>Que no se te pase el check-in de mañana</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Button onClick={handleDownloadICS} variant="outline" disabled={downloadingICS}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Calendario (.ics)
            </Button>
            <Button onClick={handleSendEmailReminder} variant="outline" disabled={sendingEmail}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar email ahora
            </Button>
            <Button onClick={handleSendSlackReminder} variant="outline" disabled={sendingSlack}>
              <MessageCircle className="h-4 w-4 mr-2" />
              DM por Slack
            </Button>
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

          {/* Open Anonymous Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">¿Quieres contarnos algo? (anónimo)</label>
            <Textarea
              value={openFeedback}
              onChange={(e) => setOpenFeedback(e.target.value)}
              placeholder="Opcional: describe con tus palabras cómo te sientes o si hay algo que debamos saber."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Se guardará de forma anónima para generar mejoras y recursos.
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