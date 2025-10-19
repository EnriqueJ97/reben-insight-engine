import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Target,
  Calendar,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

interface Playbook {
  key: string;
  title: string;
  category: 'immediate' | 'short_term' | 'long_term';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  targetScore: 'burnout' | 'load' | 'churn' | 'wellbeing';
  expectedImprovement: string;
  steps: string[];
  metrics: string[];
}

export const PlaybookRecommendations = () => {
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);

  // Playbooks basados en el brief (sección 7)
  const playbooks: Playbook[] = [
    {
      key: 'reduce_meetings',
      title: 'Higiene de Reuniones',
      category: 'immediate',
      impact: 'high',
      effort: 'low',
      targetScore: 'load',
      expectedImprovement: '-12 pts LoadScore en 2 semanas',
      steps: [
        'Establece 2 franjas "no-meeting" semanales por equipo (ej: martes y jueves mañana)',
        'Revisa reuniones >45min y divídelas en sesiones más cortas',
        'Convierte status semanal a async con doc de 1 página',
        'Elimina reuniones recurrentes sin agenda clara'
      ],
      metrics: ['f_meeting_load7', 'f_afterhours7', 'wellbeing_score']
    },
    {
      key: 'afterhours_limits',
      title: 'Límites After-Hours',
      category: 'immediate',
      impact: 'high',
      effort: 'low',
      targetScore: 'burnout',
      expectedImprovement: '-15 pts BurnoutRisk en 3 semanas',
      steps: [
        'Configura "quiet hours" en Slack/Teams (19:00-08:00)',
        'Desactiva notificaciones push fuera de horario',
        'Política "no emails después de las 18:00"',
        'Rotación de guardias para soporte crítico'
      ],
      metrics: ['f_afterhours7', 'f_energy7', 'burnout_risk']
    },
    {
      key: 'recognition_program',
      title: 'Programa de Reconocimiento',
      category: 'short_term',
      impact: 'medium',
      effort: 'medium',
      targetScore: 'churn',
      expectedImprovement: '-8 pts ChurnRisk en 1 mes',
      steps: [
        'Implementa "kudos" semanales en reuniones de equipo',
        'Canal Slack dedicado a celebrar logros',
        'Reconocimiento público en All-Hands mensual',
        'Sistema de puntos canjeables (gift cards, días libres)'
      ],
      metrics: ['engagement_score', 'churn_risk', 'f_energy7']
    },
    {
      key: 'flexible_schedule',
      title: 'Horarios Flexibles',
      category: 'short_term',
      impact: 'high',
      effort: 'medium',
      targetScore: 'wellbeing',
      expectedImprovement: '+10 pts WellbeingScore en 4 semanas',
      steps: [
        'Permite horarios de entrada entre 7:00-10:00',
        'Core hours: 10:00-15:00 (presencia obligatoria)',
        'Opción de 4 días/semana con jornadas 9h',
        'Trabajo remoto flexible 2-3 días/semana'
      ],
      metrics: ['wellbeing_score', 'f_afterhours7', 'f_energy7']
    },
    {
      key: 'focus_time',
      title: 'Bloques de Foco',
      category: 'immediate',
      impact: 'medium',
      effort: 'low',
      targetScore: 'load',
      expectedImprovement: '-8 pts LoadScore en 2 semanas',
      steps: [
        'Bloquea 2h diarias en calendario para "deep work"',
        'Status "do not disturb" automático durante bloques',
        'Capacitación en técnica Pomodoro',
        'Métricas de productividad por foco (commits, tasks)'
      ],
      metrics: ['f_focus7', 'f_commits7', 'load_score']
    },
    {
      key: 'burnout_intervention',
      title: 'Intervención Burnout',
      category: 'immediate',
      impact: 'high',
      effort: 'high',
      targetScore: 'burnout',
      expectedImprovement: '-20 pts BurnoutRisk en 6 semanas',
      steps: [
        'Reunión 1-on-1 urgente con manager y RRHH',
        'Reducción temporal de carga 30% (4 semanas)',
        'Días de salud mental (2-3 días pagados)',
        'Plan de retorno progresivo con check-ins semanales',
        'Derivación a EAP (programa asistencia empleados)'
      ],
      metrics: ['burnout_risk', 'f_stress7', 'f_energy7', 'ee_maslach']
    }
  ];

  const getCategoryColor = (category: Playbook['category']) => {
    switch (category) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'short_term': return 'bg-orange-100 text-orange-800';
      case 'long_term': return 'bg-blue-100 text-blue-800';
    }
  };

  const getImpactColor = (impact: Playbook['impact']) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
    }
  };

  const getCategoryIcon = (category: Playbook['category']) => {
    switch (category) {
      case 'immediate': return <Zap className="w-4 h-4" />;
      case 'short_term': return <Clock className="w-4 h-4" />;
      case 'long_term': return <Target className="w-4 h-4" />;
    }
  };

  const getScoreIcon = (score: Playbook['targetScore']) => {
    switch (score) {
      case 'burnout': return <Shield className="w-4 h-4" />;
      case 'load': return <Zap className="w-4 h-4" />;
      case 'churn': return <Users className="w-4 h-4" />;
      case 'wellbeing': return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Recomendaciones Basadas en Playbooks</h3>
              <p className="text-sm text-muted-foreground">
                Acciones accionables y probadas para mejorar scores específicos. 
                Cada playbook incluye pasos concretos, métricas de seguimiento y estimación de impacto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold">🚨 Acciones Inmediatas (0-2 semanas)</h3>
        </div>
        
        <div className="grid gap-4">
          {playbooks.filter(p => p.category === 'immediate').map((playbook) => (
            <Card key={playbook.key} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getScoreIcon(playbook.targetScore)}
                      {playbook.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(playbook.category)}>
                        {getCategoryIcon(playbook.category)}
                        Inmediato
                      </Badge>
                      <Badge variant={getImpactColor(playbook.impact)}>
                        Impacto {playbook.impact.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        Esfuerzo {playbook.effort.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPlaybook(
                      expandedPlaybook === playbook.key ? null : playbook.key
                    )}
                  >
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        expandedPlaybook === playbook.key ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              
              {expandedPlaybook === playbook.key && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {playbook.expectedImprovement}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-3">Pasos de Implementación:</h4>
                    <ol className="space-y-2">
                      {playbook.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Métricas de Seguimiento:</h4>
                    <div className="flex flex-wrap gap-2">
                      {playbook.metrics.map((metric) => (
                        <Badge key={metric} variant="secondary" className="font-mono text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Aplicar Playbook
                    </Button>
                    <Button size="sm" variant="outline">
                      Ver Caso de Éxito
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Short-term Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">⏱️ Corto Plazo (2-8 semanas)</h3>
        </div>
        
        <div className="grid gap-4">
          {playbooks.filter(p => p.category === 'short_term').map((playbook) => (
            <Card key={playbook.key} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getScoreIcon(playbook.targetScore)}
                      {playbook.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(playbook.category)}>
                        {getCategoryIcon(playbook.category)}
                        Corto Plazo
                      </Badge>
                      <Badge variant={getImpactColor(playbook.impact)}>
                        Impacto {playbook.impact.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      {playbook.expectedImprovement}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPlaybook(
                      expandedPlaybook === playbook.key ? null : playbook.key
                    )}
                  >
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        expandedPlaybook === playbook.key ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              
              {expandedPlaybook === playbook.key && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Pasos:</h4>
                    <ol className="space-y-2">
                      {playbook.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Programar Implementación
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Impacto de Playbooks Aplicados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">-18%</div>
              <p className="text-sm font-medium">BurnoutRisk Promedio</p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 90 días</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <p className="text-sm font-medium">Playbooks Activos</p>
              <p className="text-xs text-muted-foreground mt-1">En 8 equipos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">85%</div>
              <p className="text-sm font-medium">Tasa de Adopción</p>
              <p className="text-xs text-muted-foreground mt-1">Managers comprometidos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
