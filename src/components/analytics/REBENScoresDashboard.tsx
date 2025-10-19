import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Zap, 
  AlertTriangle, 
  UserX, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ElementType;
  trend: number;
  color: string;
  bgColor: string;
  explanation: string;
}

const ScoreCard = ({ title, score, description, icon: Icon, trend, color, bgColor, explanation }: ScoreCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Progress value={score} className="h-2" />
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600">+{trend}% vs mes anterior</span>
              </>
            ) : trend < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-xs text-red-600">{trend}% vs mes anterior</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 text-gray-600" />
                <span className="text-xs text-gray-600">Sin cambios</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const REBENScoresDashboard = () => {
  // Datos demo realistas basados en el brief
  const scores = {
    wellbeing: {
      score: 68,
      trend: 5,
      description: "Score de bienestar general",
      explanation: "Calculado con: stress (30%), afterhours (40%), energía (30%), ausencias (20%). Menor estrés + menos trabajo fuera de horas = mejor score."
    },
    load: {
      score: 62,
      trend: -8,
      description: "Carga de trabajo total",
      explanation: "Basado en: minutos en reuniones (25%), actividad fuera de horas (15%), volumen mensajes/commits (10%), variabilidad foco (10%). Score alto = sobrecarga."
    },
    burnout: {
      score: 45,
      trend: -12,
      description: "Riesgo de agotamiento",
      explanation: "Combina: LoadScore (60%), Agotamiento Emocional Maslach (30%), energía (20%), tendencia últimos 14d (10%). Predice burnout 30-60 días antes."
    },
    churn: {
      score: 28,
      trend: -5,
      description: "Probabilidad de rotación",
      explanation: "Calculado con: BurnoutRisk (40%), ausencias 30d (30%), caída productividad 14d (20%), antigüedad (10%). Identifica empleados en riesgo de salida."
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: 'Crítico', color: 'destructive' };
    if (score >= 50) return { label: 'Moderado', color: 'default' };
    if (score >= 30) return { label: 'Bajo', color: 'secondary' };
    return { label: 'Muy Bajo', color: 'outline' };
  };

  return (
    <div className="space-y-6">
      {/* Header con explicación */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">REBEN Impact Engine - Métricas Clave</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de análisis combinado (activo + pasivo) con scoring basado en reglas transparentes. 
                Todos los scores son calculados en tiempo real y se actualizan diariamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Wellbeing Score"
          score={scores.wellbeing.score}
          description={scores.wellbeing.description}
          icon={Heart}
          trend={scores.wellbeing.trend}
          color="text-primary"
          bgColor="bg-primary/10"
          explanation={scores.wellbeing.explanation}
        />

        <ScoreCard
          title="Load Score"
          score={scores.load.score}
          description={scores.load.description}
          icon={Zap}
          trend={scores.load.trend}
          color="text-orange-600"
          bgColor="bg-orange-100"
          explanation={scores.load.explanation}
        />

        <ScoreCard
          title="Burnout Risk"
          score={scores.burnout.score}
          description={scores.burnout.description}
          icon={AlertTriangle}
          trend={scores.burnout.trend}
          color="text-destructive"
          bgColor="bg-destructive/10"
          explanation={scores.burnout.explanation}
        />

        <ScoreCard
          title="Churn Risk"
          score={scores.churn.score}
          description={scores.churn.description}
          icon={UserX}
          trend={scores.churn.trend}
          color="text-purple-600"
          bgColor="bg-purple-100"
          explanation={scores.churn.explanation}
        />
      </div>

      {/* Distribución de Riesgos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Empleados por Nivel de Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-2">8</div>
              <Badge variant="destructive" className="mb-2">Crítico</Badge>
              <p className="text-xs text-muted-foreground">Score ≥ 70</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">24</div>
              <Badge variant="default" className="mb-2">Moderado</Badge>
              <p className="text-xs text-muted-foreground">Score 50-69</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">52</div>
              <Badge variant="secondary" className="mb-2">Bajo</Badge>
              <p className="text-xs text-muted-foreground">Score 30-49</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">66</div>
              <Badge variant="outline" className="mb-2">Muy Bajo</Badge>
              <p className="text-xs text-muted-foreground">Score &lt; 30</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factores de Riesgo Top */}
      <Card>
        <CardHeader>
          <CardTitle>Top Factores que Impactan los Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium">Afterhours Work (f_afterhours7)</p>
                  <p className="text-sm text-muted-foreground">38% de empleados con actividad &gt;30min fuera de horario</p>
                </div>
              </div>
              <Badge variant="destructive">-15 pts</Badge>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div>
                  <p className="font-medium">Meeting Overload (f_meeting_load7)</p>
                  <p className="text-sm text-muted-foreground">z-score +1.8 vs media del equipo (sobrecarga)</p>
                </div>
              </div>
              <Badge variant="default">-12 pts</Badge>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div>
                  <p className="font-medium">Energy Drop (f_energy7)</p>
                  <p className="text-sm text-muted-foreground">Energía promedio cayó a 2.3/5 (antes 3.8)</p>
                </div>
              </div>
              <Badge variant="secondary">-8 pts</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium">Absenteeism (f_absence30)</p>
                  <p className="text-sm text-muted-foreground">4.2 días de ausencia últimos 30d (↑ vs 1.8)</p>
                </div>
              </div>
              <Badge variant="outline">-5 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Datos de demostración:</strong> Estos scores se calculan automáticamente cada 24h usando el ETL pipeline. 
          En producción, los valores reales se basan en check-ins + datos pasivos (calendario, Slack, Git, HRIS).
        </p>
      </div>
    </div>
  );
};
