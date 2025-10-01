import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Link2, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface CalendarAnalysisResult {
  userId: string;
  userName: string;
  period: { start: string; end: string };
  metrics: {
    totalMeetingHours: number;
    avgMeetingHoursPerDay: number;
    maxMeetingHoursInDay: number;
    daysWithOverload: number;
    focusTimeHours: number;
    afterHoursMeetings: number;
    weekendMeetings: number;
    declinedMeetings: number;
    cancelledRecurringMeetings: number;
  };
  riskIndicators: Array<{
    indicator: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    value: number;
    threshold: number;
    description: string;
  }>;
  recommendations: string[];
}

export const CalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CalendarAnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const connectCalendar = async () => {
    if (!user?.tenant_id) return;

    try {
      const { data, error } = await supabase.functions.invoke('calendar-integration', {
        body: {
          action: 'get_oauth_url',
          userId: user.id,
          tenantId: user.tenant_id,
        }
      });

      if (error) throw error;

      if (data.success && data.authUrl) {
        // Open OAuth flow in new window
        window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        toast({
          title: "Conectando con Google Calendar",
          description: "Autoriza el acceso en la ventana emergente",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Connect calendar error:', error);
      toast({
        title: "Error al conectar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  };

  const analyzeCalendar = async () => {
    if (!user?.tenant_id) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-integration', {
        body: {
          action: 'analyze',
          userId: user.id,
          tenantId: user.tenant_id,
          timeRange: 30, // Last 30 days
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        toast({
          title: "✅ Análisis completado",
          description: "Patrones de reuniones analizados",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Analyze calendar error:', error);
      toast({
        title: "Error en análisis",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              Detecta patrones de burnout en tu calendario
            </p>
          </div>
        </div>
        {!isConnected ? (
          <Button onClick={connectCalendar} className="gap-2">
            <Link2 className="w-4 h-4" />
            Conectar Calendar
          </Button>
        ) : (
          <Button onClick={analyzeCalendar} disabled={isAnalyzing} className="gap-2">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analizar Calendario
              </>
            )}
          </Button>
        )}
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold text-primary">
                {analysis.metrics.avgMeetingHoursPerDay.toFixed(1)}h
              </div>
              <div className="text-xs text-muted-foreground">
                Reuniones / día promedio
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {analysis.metrics.daysWithOverload}
              </div>
              <div className="text-xs text-muted-foreground">
                Días con sobrecarga ({'>'}6h)
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {(analysis.metrics.focusTimeHours / 30).toFixed(1)}h
              </div>
              <div className="text-xs text-muted-foreground">
                Focus time / día
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {analysis.metrics.afterHoursMeetings + analysis.metrics.weekendMeetings}
              </div>
              <div className="text-xs text-muted-foreground">
                Reuniones fuera de horario
              </div>
            </Card>
          </div>

          {/* Risk Indicators */}
          {analysis.riskIndicators.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Indicadores de Riesgo Detectados
              </h4>
              {analysis.riskIndicators.map((indicator, idx) => (
                <Card key={idx} className="p-4 space-y-3 border-l-4" style={{
                  borderLeftColor: 
                    indicator.severity === 'critical' ? 'rgb(239, 68, 68)' :
                    indicator.severity === 'high' ? 'rgb(249, 115, 22)' :
                    indicator.severity === 'medium' ? 'rgb(234, 179, 8)' :
                    'rgb(34, 197, 94)'
                }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(indicator.severity)}
                      <span className="font-medium">{indicator.indicator}</span>
                    </div>
                    <Badge variant={getSeverityColor(indicator.severity)}>
                      {indicator.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {indicator.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Valor actual: {indicator.value.toFixed(1)}</span>
                      <span>Umbral: {indicator.threshold}</span>
                    </div>
                    <Progress 
                      value={(indicator.value / indicator.threshold) * 100} 
                      className="h-2"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recomendaciones
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Período analizado:</strong>{' '}
              {new Date(analysis.period.start).toLocaleDateString('es-ES')} -{' '}
              {new Date(analysis.period.end).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-2">
            Conecta tu Google Calendar para analizar patrones
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Detectamos sobrecarga de reuniones, falta de focus time y más
          </p>
        </div>
      )}

      <div className="p-4 bg-primary/5 rounded-lg space-y-2">
        <h5 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          ¿Qué analizamos?
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Densidad de reuniones (horas/día)</li>
          <li>Bloques sin descanso ({'>'}3h consecutivas)</li>
          <li>Reuniones fuera de horario laboral</li>
          <li>Actividad en fines de semana</li>
          <li>Tiempo de concentración disponible</li>
        </ul>
      </div>
    </Card>
  );
};
