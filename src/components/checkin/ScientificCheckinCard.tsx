import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useScientificCheckin } from '@/hooks/useScientificCheckin';
import { CheckCircle, Sun, Moon, Brain, TrendingUp } from 'lucide-react';

interface ScientificCheckinCardProps {
  timing: 'morning' | 'evening';
  onComplete?: () => void;
}

export const ScientificCheckinCard = ({ timing, onComplete }: ScientificCheckinCardProps) => {
  const {
    loading,
    currentQuestion,
    getNextQuestion,
    submitQuestionResponse,
    hasCheckedInToday,
    getGlobalProgress
  } = useScientificCheckin();

  const [responseValue, setResponseValue] = useState<number>(3);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [progress, setProgress] = useState<{ average: number; scales: number; completed?: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const checkedIn = await hasCheckedInToday(timing);
      setAlreadyCheckedIn(checkedIn);
      
      if (!checkedIn) {
        await getNextQuestion(timing);
      }

      const prog = await getGlobalProgress();
      setProgress(prog);
    };

    init();
  }, [timing]);

  const getScaleLabels = (scale: string): string[] => {
    switch (scale) {
      case '0-6_frequency':
        return ['Nunca', 'Pocas veces al año', 'Una vez al mes', 'Pocas veces al mes', 'Una vez a la semana', 'Pocas veces a la semana', 'Todos los días'];
      case '1-5_agreement':
        return ['Totalmente en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Totalmente de acuerdo'];
      case '0-4_frequency':
        return ['Nunca', 'Casi nunca', 'A veces', 'A menudo', 'Muy a menudo'];
      case '0-5_frequency':
        return ['En ningún momento', 'Raramente', 'Menos de la mitad del tiempo', 'Más de la mitad del tiempo', 'La mayor parte del tiempo', 'Todo el tiempo'];
      case '1-5_frequency':
        return ['Nunca', 'Raramente', 'Ocasionalmente', 'Frecuentemente', 'Muy frecuentemente'];
      default:
        return [];
    }
  };

  const getScaleMaxValue = (scale: string): number => {
    if (scale.startsWith('0-6')) return 6;
    if (scale.startsWith('0-5')) return 5;
    if (scale.startsWith('0-4')) return 4;
    if (scale.startsWith('1-5')) return 5;
    return 5;
  };

  const getScaleMinValue = (scale: string): number => {
    if (scale.startsWith('0-')) return 0;
    if (scale.startsWith('1-')) return 1;
    return 0;
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    setSubmitting(true);
    const success = await submitQuestionResponse(
      currentQuestion.question_id,
      responseValue,
      timing
    );

    if (success) {
      setAlreadyCheckedIn(true);
      onComplete?.();
    }
    setSubmitting(false);
  };

  if (alreadyCheckedIn) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            {timing === 'morning' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">Check-in {timing === 'morning' ? 'Matutino' : 'Vespertino'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <CheckCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">¡Check-in completado!</p>
              <p className="text-sm">Gracias por compartir tu estado hoy</p>
            </div>
          </div>

          {progress && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Progreso General
                </span>
                <span className="font-bold">{progress.average}%</span>
              </div>
              <Progress value={progress.average} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.scales} escalas en progreso</span>
                <span>{progress.completed} completadas</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading || !currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando pregunta...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const labels = getScaleLabels(currentQuestion.response_scale);
  const maxValue = getScaleMaxValue(currentQuestion.response_scale);
  const minValue = getScaleMinValue(currentQuestion.response_scale);

  return (
    <Card className="border-primary/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {timing === 'morning' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
            <CardTitle className="text-lg">Check-in {timing === 'morning' ? 'Matutino' : 'Vespertino'}</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            {currentQuestion.scale_code}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {currentQuestion.scale_name} • {currentQuestion.dimension}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pregunta */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <p className="text-base font-medium leading-relaxed">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Slider con etiquetas */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Slider
              value={[responseValue]}
              onValueChange={(values) => setResponseValue(values[0])}
              min={minValue}
              max={maxValue}
              step={1}
              className="w-full"
            />
            
            {/* Valor seleccionado */}
            <div className="text-center py-2">
              <span className="text-2xl font-bold text-primary">{responseValue}</span>
              {labels[responseValue - minValue] && (
                <p className="text-sm text-muted-foreground mt-1">
                  {labels[responseValue - minValue]}
                </p>
              )}
            </div>
          </div>

          {/* Etiquetas de los extremos */}
          {labels.length > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span className="text-left max-w-[45%]">{labels[0]}</span>
              <span className="text-right max-w-[45%]">{labels[labels.length - 1]}</span>
            </div>
          )}
        </div>

        {/* Botón de envío */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Enviar Respuesta
            </>
          )}
        </Button>

        {/* Progreso */}
        {progress && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <TrendingUp className="h-3 w-3" />
            <span>Progreso: {progress.average}% • {progress.scales} escalas activas</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
