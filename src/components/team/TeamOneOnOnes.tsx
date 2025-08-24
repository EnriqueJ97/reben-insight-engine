import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, User, MessageSquare, CheckSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OneOnOne {
  id: string;
  employee: string;
  date: string;
  time: string;
  status: 'Programada' | 'Completada' | 'Reprogramada';
  duration: number;
  agenda: string[];
  emotionalState: 'Muy bien' | 'Bien' | 'Normal' | 'Preocupado' | 'Estresado';
  notes: string;
  actions: Action[];
  followUps: FollowUp[];
  wellbeingCheck: {
    mood: number;
    workload: number;
    satisfaction: number;
    blockers: string[];
  };
}

interface Action {
  id: string;
  description: string;
  assignee: 'Manager' | 'Employee';
  dueDate: string;
  completed: boolean;
}

interface FollowUp {
  id: string;
  topic: string;
  nextDate: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

const TeamOneOnOnes = () => {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<OneOnOne[]>([
    {
      id: '1',
      employee: 'María García',
      date: '2024-03-25',
      time: '10:00',
      status: 'Programada',
      duration: 30,
      agenda: [
        'Progreso en objetivos CRM',
        'Bloqueos actuales',
        'Estado de bienestar',
        'Feedback sobre el equipo'
      ],
      emotionalState: 'Bien',
      notes: '',
      actions: [],
      followUps: [],
      wellbeingCheck: {
        mood: 4,
        workload: 3,
        satisfaction: 4,
        blockers: []
      }
    },
    {
      id: '2',
      employee: 'Carlos López',
      date: '2024-03-20',
      time: '14:30',
      status: 'Completada',
      duration: 45,
      agenda: [
        'Revisión plan de desarrollo',
        'Feedback sobre certificación PMP',
        'Challenges en el proyecto actual',
        'Objetivos siguiente sprint'
      ],
      emotionalState: 'Preocupado',
      notes: 'Carlos se siente abrumado con la carga de trabajo. Necesita apoyo adicional en el proyecto CRM.',
      actions: [
        {
          id: '1',
          description: 'Reasignar 2 tareas del proyecto CRM',
          assignee: 'Manager',
          dueDate: '2024-03-22',
          completed: true
        },
        {
          id: '2',
          description: 'Preparar presentación para el equipo',
          assignee: 'Employee',
          dueDate: '2024-03-27',
          completed: false
        }
      ],
      followUps: [
        {
          id: '1',
          topic: 'Progreso en certificación PMP',
          nextDate: '2024-04-03',
          priority: 'Media'
        }
      ],
      wellbeingCheck: {
        mood: 2,
        workload: 5,
        satisfaction: 3,
        blockers: ['Demasiadas reuniones', 'Falta claridad en requirements']
      }
    }
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOne | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada': return 'bg-green-500';
      case 'Programada': return 'bg-blue-500';
      case 'Reprogramada': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'Muy bien': return 'text-green-600';
      case 'Bien': return 'text-blue-600';
      case 'Normal': return 'text-gray-600';
      case 'Preocupado': return 'text-yellow-600';
      case 'Estresado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleScheduleMeeting = () => {
    toast({
      title: "Reunión programada",
      description: "La reunión 1:1 se ha programado correctamente.",
    });
    setIsScheduleDialogOpen(false);
  };

  const suggestedAgenda = [
    'Estado de objetivos actuales',
    'Bloqueos y challenges',
    'Feedback sobre el equipo',
    'Estado de bienestar personal',
    'Oportunidades de desarrollo',
    'Reconocimiento y celebraciones'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reuniones One-on-One</h3>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Programar Reunión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Reunión 1:1</DialogTitle>
              <DialogDescription>
                Agenda una nueva reunión individual con un miembro de tu equipo.
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
                  <Label htmlFor="duration">Duración</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div>
                <Label>Agenda Sugerida</Label>
                <div className="mt-2 space-y-2">
                  {suggestedAgenda.map((item, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="customAgenda">Temas Adicionales</Label>
                <Textarea id="customAgenda" placeholder="Añade temas específicos a discutir..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleScheduleMeeting}>
                Programar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {meetings.filter(meeting => meeting.status === 'Programada').map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {meeting.employee}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(meeting.status)}>
                        <span className="text-white">{meeting.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(meeting.date).toLocaleDateString()} - {meeting.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{meeting.duration} minutos</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Agenda:</p>
                    <ul className="space-y-1">
                      {meeting.agenda.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          {item}
                        </li>
                      ))}
                      {meeting.agenda.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          +{meeting.agenda.length - 3} temas más...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Reprogramar
                    </Button>
                    <Button size="sm" onClick={() => setSelectedMeeting(meeting)}>
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {meetings.filter(meeting => meeting.status === 'Completada').map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {meeting.employee}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getEmotionalStateColor(meeting.emotionalState)}`}>
                        {meeting.emotionalState}
                      </span>
                      <Badge variant="outline" className={getStatusColor(meeting.status)}>
                        <span className="text-white">{meeting.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      <span>{meeting.actions.filter(a => a.completed).length}/{meeting.actions.length} acciones completadas</span>
                    </div>
                  </div>

                  {meeting.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        "{meeting.notes.substring(0, 150)}..."
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMeeting(meeting)}>
                      Ver Notas Completas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Vista de Calendario</h3>
            <p className="text-muted-foreground mb-4">
              Visualiza todas las reuniones programadas en un calendario interactivo
            </p>
            <Button variant="outline">Abrir Calendario</Button>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Reunión Semanal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-sm text-muted-foreground">Satisfacción Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-sm text-muted-foreground">Acciones Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Requiere Atención</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Bienestar del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-900 mb-2">Atención Requerida</h4>
                <p className="text-sm text-yellow-800">
                  Carlos López mostró signos de estrés en la última reunión. Carga de trabajo reducida y seguimiento programado.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-semibold text-green-900 mb-2">Progreso Positivo</h4>
                <p className="text-sm text-green-800">
                  María García ha mostrado mejora constante en bienestar y engagement durante las últimas 3 reuniones.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-900 mb-2">Recomendación</h4>
                <p className="text-sm text-blue-800">
                  Aumentar frecuencia de 1:1s durante períodos de alta carga de trabajo para mejor seguimiento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Detail Dialog */}
      {selectedMeeting && (
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                1:1 con {selectedMeeting.employee}
                <Badge variant="outline" className={getStatusColor(selectedMeeting.status)}>
                  <span className="text-white">{selectedMeeting.status}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Información de la Reunión</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Fecha:</strong> {new Date(selectedMeeting.date).toLocaleDateString()}</p>
                    <p><strong>Hora:</strong> {selectedMeeting.time}</p>
                    <p><strong>Duración:</strong> {selectedMeeting.duration} minutos</p>
                    <p>
                      <strong>Estado Emocional:</strong> 
                      <span className={`ml-1 ${getEmotionalStateColor(selectedMeeting.emotionalState)}`}>
                        {selectedMeeting.emotionalState}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Check-in de Bienestar</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ánimo:</span>
                      <span>{selectedMeeting.wellbeingCheck.mood}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carga de Trabajo:</span>
                      <span>{selectedMeeting.wellbeingCheck.workload}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Satisfacción:</span>
                      <span>{selectedMeeting.wellbeingCheck.satisfaction}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Agenda Discutida</h4>
                <ul className="space-y-1">
                  {selectedMeeting.agenda.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckSquare className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedMeeting.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                    {selectedMeeting.notes}
                  </p>
                </div>
              )}

              {selectedMeeting.actions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Acciones Asignadas</h4>
                  <div className="space-y-2">
                    {selectedMeeting.actions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <CheckSquare className={`w-4 h-4 ${action.completed ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${action.completed ? 'line-through' : ''}`}>
                            {action.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {action.assignee}
                        </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(action.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Programar Seguimiento</Button>
                <Button>Exportar Notas</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamOneOnOnes;