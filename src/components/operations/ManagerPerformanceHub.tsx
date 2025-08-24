import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  AlertCircle,
  CheckCircle,
  Clock,
  MessageCircle,
  Calendar,
  Zap,
  Heart,
  ArrowRight,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManagerPerformanceHub = () => {
  const { toast } = useToast();
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  // Estado del equipo consolidado
  const teamStatus = {
    overall: 'amber', // green, amber, red
    wellnessScore: 78,
    productivityScore: 87,
    retentionRisk: 'low', // low, medium, high
    okrProgress: 68,
    burnoutRisk: 34
  };

  // Predicciones clave IA
  const aiPredictions = [
    {
      id: 'okr_completion',
      title: 'Probabilidad de cumplir OKRs',
      value: '78%',
      status: 'amber',
      detail: 'Objetivo CRM necesita atención'
    },
    {
      id: 'team_retention',
      title: 'Riesgo de rotación equipo',
      value: 'Bajo',
      status: 'green',
      detail: '91% probabilidad retención'
    },
    {
      id: 'burnout_alert',
      title: 'Alerta burnout',
      value: '2 personas',
      status: 'red',
      detail: 'Carlos y Ana requieren atención'
    }
  ];

  // Acciones recomendadas priorizadas (máximo 3)
  const recommendedActions = [
    {
      id: '1',
      title: 'Reunión 1:1 con Carlos',
      description: 'Señales de sobrecarga. Revisar carga de trabajo y ofrecer apoyo.',
      priority: 'high',
      effort: 'low',
      impact: 'high',
      timeframe: 'Esta semana',
      category: 'wellbeing'
    },
    {
      id: '2',
      title: 'Redistribuir tareas del proyecto CRM',
      description: 'El objetivo está en riesgo. Reasignar algunas tareas para cumplir deadline.',
      priority: 'medium',
      effort: 'medium',
      impact: 'high',
      timeframe: 'Próximos 3 días',
      category: 'performance'
    },
    {
      id: '3',
      title: 'Reconocer logros de María',
      description: 'Su feedback 360 es excelente y ha mostrado liderazgo excepcional.',
      priority: 'medium',
      effort: 'low',
      impact: 'medium',
      timeframe: 'Hoy',
      category: 'recognition'
    }
  ];

  // Objetivos con bienestar integrado
  const teamObjectives = [
    {
      id: '1',
      title: 'Implementar sistema CRM',
      progress: 75,
      dueDate: '2024-12-31',
      owner: 'María García',
      wellnessImpact: 'Positivo',
      wellnessScore: 85,
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Certificación AWS del equipo',
      progress: 40,
      dueDate: '2024-11-30',
      owner: 'Carlos López',
      wellnessImpact: 'Neutral',
      wellnessScore: 72,
      status: 'at-risk'
    }
  ];

  // Feedback 360 resumido
  const teamFeedback = [
    {
      employee: 'María García',
      overallScore: 4.5,
      wellnessContribution: 'Alta',
      keyStrength: 'Liderazgo excepcional',
      actionNeeded: false
    },
    {
      employee: 'Carlos López',
      overallScore: 3.8,
      wellnessContribution: 'Media',
      keyStrength: 'Conocimiento técnico',
      actionNeeded: true,
      action: 'Mejorar comunicación'
    }
  ];

  const completeAction = (actionId: string) => {
    setCompletedActions(prev => [...prev, actionId]);
    toast({
      title: "Acción completada",
      description: "El progreso se ha registrado automáticamente"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-success text-success-foreground';
      case 'amber': return 'bg-warning text-warning-foreground';
      case 'red': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <CheckCircle className="h-5 w-5" />;
      case 'amber': return <Clock className="h-5 w-5" />;
      case 'red': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Principal - Estado del Equipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getStatusColor(teamStatus.overall)}`}>
              {getStatusIcon(teamStatus.overall)}
            </div>
            <div>
              <h2 className="text-xl">Estado de Mi Equipo</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Visión consolidada de rendimiento y bienestar
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{teamStatus.wellnessScore}%</div>
              <div className="text-sm text-muted-foreground">Bienestar General</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-success">{teamStatus.productivityScore}%</div>
              <div className="text-sm text-muted-foreground">Productividad</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-info">{teamStatus.okrProgress}%</div>
              <div className="text-sm text-muted-foreground">Objetivos</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-warning">{teamStatus.burnoutRisk}%</div>
              <div className="text-sm text-muted-foreground">Riesgo Burnout</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicciones Clave IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Predicciones del Equipo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiPredictions.map((prediction) => (
              <div key={prediction.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{prediction.title}</span>
                  <Badge variant={prediction.status === 'green' ? 'default' : 
                                 prediction.status === 'amber' ? 'secondary' : 'destructive'}>
                    {prediction.value}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{prediction.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones Recomendadas - PRIORITARIO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Acciones Recomendadas Esta Semana</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Máximo impacto para tu equipo. Completa al menos 2 antes del viernes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedActions.map((action) => {
              const isCompleted = completedActions.includes(action.id);
              return (
                <div 
                  key={action.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    isCompleted ? 'opacity-60 bg-success/5 border-success/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          action.priority === 'high' ? 'bg-destructive' :
                          action.priority === 'medium' ? 'bg-warning' : 'bg-success'
                        }`} />
                        <h4 className="font-medium">{action.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {action.timeframe}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground pl-6">
                        {action.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 pl-6">
                        <span className="text-xs">
                          <span className="font-medium">Esfuerzo:</span> {action.effort}
                        </span>
                        <span className="text-xs">
                          <span className="font-medium">Impacto:</span> {action.impact}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {!isCompleted ? (
                        <Button 
                          size="sm"
                          onClick={() => completeAction(action.id)}
                        >
                          Completar
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-success border-success">
                          ✓ Hecho
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="objetivos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="objetivos">Mis Objetivos</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones de mi Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="objetivos" className="space-y-4">
          <div className="space-y-4">
            {teamObjectives.map((objective) => (
              <Card key={objective.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold">{objective.title}</h4>
                        <Badge className={getStatusColor(objective.status)}>
                          {objective.status === 'on-track' ? 'En curso' : 'En riesgo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {objective.owner} • Vence: {new Date(objective.dueDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      1:1 con {objective.owner.split(' ')[0]}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progreso del Objetivo</span>
                        <span>{objective.progress}%</span>
                      </div>
                      <Progress value={objective.progress} className="h-2 mb-2" />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          <span className="font-medium">Bienestar:</span> {objective.wellnessScore}%
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {objective.wellnessImpact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-4">
          <div className="space-y-4">
            {teamFeedback.map((feedback, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{feedback.employee}</h4>
                      <p className="text-sm text-muted-foreground">
                        Puntuación general: {feedback.overallScore}/5.0
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-warning fill-current" />
                      <span className="font-medium">{feedback.overallScore}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium">Fortaleza clave:</span>
                      <p className="text-sm text-muted-foreground">{feedback.keyStrength}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Impacto en bienestar:</span>
                      <Badge variant="outline" className="ml-2">
                        {feedback.wellnessContribution}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      {feedback.actionNeeded ? (
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          {feedback.action}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-success">
                          ✓ Desempeño óptimo
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Progreso de la semana */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Progreso Esta Semana</h3>
              <p className="text-sm text-muted-foreground">
                Has completado {completedActions.length} de {recommendedActions.length} acciones recomendadas
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((completedActions.length / recommendedActions.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Completado</div>
            </div>
          </div>
          <Progress 
            value={(completedActions.length / recommendedActions.length) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerPerformanceHub;