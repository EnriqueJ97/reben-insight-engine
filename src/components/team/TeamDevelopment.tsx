import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, BookOpen, Trophy, Calendar, TrendingDown, CheckCircle, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentPlan {
  id: string;
  employee: string;
  objective: string;
  activities: Activity[];
  startDate: string;
  endDate: string;
  progress: number;
  successMetrics: string[];
  status: 'Activo' | 'Completado' | 'En pausa';
  turnoverReduction: number;
  feedback: string[];
  teamObjectiveAlignment: string;
}

interface Activity {
  id: string;
  title: string;
  type: 'Formación' | 'Mentoring' | 'Proyecto' | 'Certificación';
  completed: boolean;
  dueDate: string;
  description: string;
}

const TeamDevelopment = () => {
  const { toast } = useToast();
  const [developmentPlans, setDevelopmentPlans] = useState<DevelopmentPlan[]>([
    {
      id: '1',
      employee: 'Carlos López',
      objective: 'Mejorar skills en gestión de proyectos',
      activities: [
        {
          id: '1',
          title: 'Curso PMP Fundamentals',
          type: 'Formación',
          completed: true,
          dueDate: '2024-02-15',
          description: 'Fundamentos de gestión de proyectos según PMI'
        },
        {
          id: '2',
          title: 'Mentoring con Sarah Johnson',
          type: 'Mentoring',
          completed: false,
          dueDate: '2024-04-30',
          description: 'Sesiones semanales con Senior PM'
        },
        {
          id: '3',
          title: 'Liderar proyecto CRM Migration',
          type: 'Proyecto',
          completed: false,
          dueDate: '2024-05-15',
          description: 'Aplicar metodologías aprendidas'
        }
      ],
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 45,
      successMetrics: ['Completar certificación PMP', 'Liderar 2 proyectos exitosos', 'Feedback 360° > 4.0'],
      status: 'Activo',
      turnoverReduction: 20,
      feedback: ['Muy comprometido con el aprendizaje', 'Aplicando conocimientos inmediatamente'],
      teamObjectiveAlignment: 'Objetivo Q2: Mejorar delivery de proyectos'
    },
    {
      id: '2',
      employee: 'Ana Rodríguez',
      objective: 'Desarrollo en liderazgo técnico',
      activities: [
        {
          id: '4',
          title: 'Workshop de Technical Leadership',
          type: 'Formación',
          completed: true,
          dueDate: '2024-03-01',
          description: 'Liderazgo para perfiles técnicos'
        },
        {
          id: '5',
          title: 'Certificación AWS Solutions Architect',
          type: 'Certificación',
          completed: false,
          dueDate: '2024-05-30',
          description: 'Certificación en arquitectura cloud'
        }
      ],
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      progress: 30,
      successMetrics: ['Obtener certificación AWS', 'Liderar arquitectura de 1 proyecto', 'Mentorizar a 2 juniors'],
      status: 'Activo',
      turnoverReduction: 15,
      feedback: ['Excelente progreso técnico', 'Necesita trabajar soft skills'],
      teamObjectiveAlignment: 'Objetivo Q3: Modernizar arquitectura técnica'
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-500';
      case 'Activo': return 'bg-blue-500';
      case 'En pausa': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'Formación': return <BookOpen className="w-4 h-4" />;
      case 'Mentoring': return <Users className="w-4 h-4" />;
      case 'Proyecto': return <Target className="w-4 h-4" />;
      case 'Certificación': return <Trophy className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handleCreatePlan = () => {
    toast({
      title: "Plan de desarrollo creado",
      description: "El nuevo plan se ha añadido correctamente.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleActivity = (planId: string, activityId: string) => {
    setDevelopmentPlans(plans =>
      plans.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              activities: plan.activities.map(activity =>
                activity.id === activityId
                  ? { ...activity, completed: !activity.completed }
                  : activity
              )
            }
          : plan
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Planes de Desarrollo</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Plan de Desarrollo</DialogTitle>
              <DialogDescription>
                Define un plan de crecimiento personalizado para un miembro del equipo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">Empleado</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">María García</SelectItem>
                      <SelectItem value="carlos">Carlos López</SelectItem>
                      <SelectItem value="ana">Ana Rodríguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Duración del plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">3 meses</SelectItem>
                      <SelectItem value="6m">6 meses</SelectItem>
                      <SelectItem value="12m">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="objective">Objetivo de Desarrollo</Label>
                <Input id="objective" placeholder="Ej: Mejorar skills en liderazgo de equipos" />
              </div>
              <div>
                <Label htmlFor="metrics">Métricas de Éxito</Label>
                <Textarea id="metrics" placeholder="Define cómo medirás el éxito de este plan..." />
              </div>
              <div>
                <Label htmlFor="alignment">Alineación con Objetivos del Equipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Conectar con objetivo del equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm">Implementar nuevo sistema CRM</SelectItem>
                    <SelectItem value="satisfaction">Mejorar satisfacción del cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePlan}>
                Crear Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Planes Activos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="analytics">Impacto</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {developmentPlans.filter(plan => plan.status === 'Activo').map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.employee}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(plan.status)}>
                        <span className="text-white">{plan.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.objective}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Progreso General</p>
                      <div className="flex items-center gap-2">
                        <Progress value={plan.progress} className="flex-1" />
                        <span className="text-sm font-medium">{plan.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Reducción Riesgo Rotación</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">-{plan.turnoverReduction}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Actividades Próximas</p>
                    <div className="space-y-2">
                      {plan.activities.slice(0, 2).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Checkbox
                            checked={activity.completed}
                            onCheckedChange={() => handleToggleActivity(plan.id, activity.id)}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {getActivityTypeIcon(activity.type)}
                            <span className={`text-sm ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {activity.title}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {plan.startDate} - {plan.endDate}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Los planes completados aparecerán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Planes Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">-18%</p>
                    <p className="text-sm text-muted-foreground">Reducción Rotación</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">37%</p>
                    <p className="text-sm text-muted-foreground">Progreso Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impacto en Bienestar y Retención</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-900 mb-2">Correlación Positiva</h4>
                <p className="text-sm text-blue-800">
                  Los empleados con planes de desarrollo activos muestran un 25% menos riesgo de rotación.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-900 mb-2">Engagement Mejorado</h4>
                <p className="text-sm text-green-800">
                  El bienestar promedio del equipo ha aumentado 12% desde la implementación de planes personalizados.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-semibold text-purple-900 mb-2">Alineación Estratégica</h4>
                <p className="text-sm text-purple-800">
                  100% de los planes están conectados con objetivos del equipo, mejorando el performance general.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Development Plan Detail Dialog */}
      {selectedPlan && (
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan de Desarrollo - {selectedPlan.employee}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Objetivo</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.objective}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Actividades</h4>
                  <div className="space-y-3">
                    {selectedPlan.activities.map((activity) => (
                      <div key={activity.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {activity.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-500" />
                            )}
                            <span className={`font-medium ${activity.completed ? 'line-through' : ''}`}>
                              {activity.title}
                            </span>
                          </div>
                          <Badge variant="outline">{activity.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Fecha límite: {new Date(activity.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Métricas de Éxito</h4>
                  <ul className="space-y-2">
                    {selectedPlan.successMetrics.map((metric, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-blue-500" />
                        {metric}
                      </li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mt-6 mb-3">Feedback Recibido</h4>
                  <div className="space-y-2">
                    {selectedPlan.feedback.map((feedback, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        "{feedback}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Alineación Estratégica</h4>
                <p className="text-sm text-muted-foreground">{selectedPlan.teamObjectiveAlignment}</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Añadir Actividad</Button>
                <Button>Registrar Progreso</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamDevelopment;