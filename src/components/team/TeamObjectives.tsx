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
import { Target, User, Calendar, Plus, Edit, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Objective {
  id: string;
  title: string;
  owner: string;
  type: 'Individual' | 'Equipo';
  status: 'En curso' | 'En riesgo' | 'Completado';
  startDate: string;
  endDate: string;
  progress: number;
  wellbeingImpact: number;
  description: string;
  keyResults: string[];
  companyAlignment: string;
  recentActivity: string[];
  comments: string[];
}

const TeamObjectives = () => {
  const { toast } = useToast();
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: '1',
      title: 'Implementar nuevo sistema CRM',
      owner: 'María García',
      type: 'Equipo',
      status: 'En curso',
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      progress: 65,
      wellbeingImpact: 80,
      description: 'Migrar y configurar el nuevo sistema CRM para mejorar la gestión de clientes',
      keyResults: ['Configurar módulos principales', 'Migrar datos de clientes', 'Capacitar al equipo'],
      companyAlignment: 'Objetivo estratégico Q1: Digitalización',
      recentActivity: ['Completado módulo de ventas', 'Iniciada migración de datos'],
      comments: ['Progreso según lo planeado', 'Equipo muy comprometido']
    },
    {
      id: '2',
      title: 'Mejorar satisfacción del cliente',
      owner: 'Carlos López',
      type: 'Individual',
      status: 'En riesgo',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      progress: 35,
      wellbeingImpact: 65,
      description: 'Aumentar el NPS de 7 a 9 puntos implementando mejoras en atención al cliente',
      keyResults: ['Reducir tiempo de respuesta', 'Implementar sistema de seguimiento', 'Capacitación en soft skills'],
      companyAlignment: 'Objetivo estratégico Q1: Experiencia del cliente',
      recentActivity: ['Retraso en implementación de seguimiento'],
      comments: ['Necesita apoyo adicional', 'Revisar recursos asignados']
    }
  ]);

  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-500';
      case 'En curso': return 'bg-blue-500';
      case 'En riesgo': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completado': return <CheckCircle className="w-4 h-4" />;
      case 'En curso': return <Clock className="w-4 h-4" />;
      case 'En riesgo': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateObjective = () => {
    toast({
      title: "Objetivo creado",
      description: "El nuevo objetivo se ha añadido correctamente.",
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Objetivos del Equipo</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
              <DialogDescription>
                Define un nuevo objetivo para tu equipo con resultados clave medibles.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título del Objetivo</Label>
                  <Input id="title" placeholder="Ej: Implementar nuevo CRM" />
                </div>
                <div>
                  <Label htmlFor="owner">Responsable</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">María García</SelectItem>
                      <SelectItem value="carlos">Carlos López</SelectItem>
                      <SelectItem value="ana">Ana Rodríguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="equipo">Equipo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Describe el objetivo..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateObjective}>
                Crear Objetivo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {objectives.filter(obj => obj.status !== 'Completado').map((objective) => (
              <Card key={objective.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{objective.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(objective.status)}>
                        <span className="flex items-center gap-1 text-white">
                          {getStatusIcon(objective.status)}
                          {objective.status}
                        </span>
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{objective.owner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span>{objective.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{objective.startDate} - {objective.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span>Bienestar: {objective.wellbeingImpact}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{objective.progress}%</span>
                    </div>
                    <Progress value={objective.progress} className="h-2" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedObjective(objective)}>
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
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay objetivos completados este período</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Objetivos Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">50%</p>
                    <p className="text-sm text-muted-foreground">Progreso Promedio</p>
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
                    <p className="text-sm text-muted-foreground">En Riesgo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Objetivo Detail Dialog */}
      {selectedObjective && (
        <Dialog open={!!selectedObjective} onOpenChange={() => setSelectedObjective(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedObjective.title}
                <Badge variant="outline" className={getStatusColor(selectedObjective.status)}>
                  <span className="flex items-center gap-1 text-white">
                    {getStatusIcon(selectedObjective.status)}
                    {selectedObjective.status}
                  </span>
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Responsable:</strong> {selectedObjective.owner}</p>
                    <p><strong>Tipo:</strong> {selectedObjective.type}</p>
                    <p><strong>Período:</strong> {selectedObjective.startDate} - {selectedObjective.endDate}</p>
                    <p><strong>Impacto en Bienestar:</strong> {selectedObjective.wellbeingImpact}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Progreso</h4>
                  <div className="space-y-2">
                    <Progress value={selectedObjective.progress} className="h-3" />
                    <p className="text-sm text-center">{selectedObjective.progress}% completado</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{selectedObjective.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Resultados Clave</h4>
                <ul className="space-y-1">
                  {selectedObjective.keyResults.map((kr, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {kr}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Alineación Estratégica</h4>
                <p className="text-sm text-muted-foreground">{selectedObjective.companyAlignment}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Actividad Reciente</h4>
                <ul className="space-y-1">
                  {selectedObjective.recentActivity.map((activity, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {activity}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamObjectives;