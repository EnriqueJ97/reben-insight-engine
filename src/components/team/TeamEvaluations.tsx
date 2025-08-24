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
import { Progress } from '@/components/ui/progress';
import { TrendingUp, User, Plus, Eye, Star, BarChart3, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Evaluation {
  id: string;
  employee: string;
  type: '1:1' | '360°';
  date: string;
  status: 'Completada' | 'Pendiente' | 'En curso';
  scores: {
    leadership: number;
    communication: number;
    teamwork: number;
    innovation: number;
    productivity: number;
  };
  wellbeingScore: number;
  comments: string;
  overallScore: number;
}

const TeamEvaluations = () => {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: '1',
      employee: 'María García',
      type: '1:1',
      date: '2024-03-15',
      status: 'Completada',
      scores: {
        leadership: 4.5,
        communication: 4.2,
        teamwork: 4.8,
        innovation: 4.0,
        productivity: 4.3
      },
      wellbeingScore: 82,
      comments: 'Excelente desempeño en liderazgo de equipo. Área de mejora en innovación.',
      overallScore: 4.4
    },
    {
      id: '2',
      employee: 'Carlos López',
      type: '360°',
      date: '2024-03-10',
      status: 'En curso',
      scores: {
        leadership: 3.8,
        communication: 4.1,
        teamwork: 4.5,
        innovation: 3.5,
        productivity: 4.0
      },
      wellbeingScore: 75,
      comments: 'Pendiente feedback de peers. Buena evolución en comunicación.',
      overallScore: 3.98
    }
  ]);

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada': return 'bg-green-500';
      case 'En curso': return 'bg-blue-500';
      case 'Pendiente': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    return 'text-orange-600';
  };

  const handleCreateEvaluation = () => {
    toast({
      title: "Evaluación iniciada",
      description: "La nueva evaluación se ha creado correctamente.",
    });
    setIsCreateDialogOpen(false);
  };

  const competencyLabels = {
    leadership: 'Liderazgo',
    communication: 'Comunicación',
    teamwork: 'Trabajo en Equipo',
    innovation: 'Innovación',
    productivity: 'Productividad'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Evaluaciones de Desempeño</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Evaluación</DialogTitle>
              <DialogDescription>
                Inicia una nueva evaluación de desempeño para un miembro del equipo.
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
                  <Label htmlFor="type">Tipo de Evaluación</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1on1">Evaluación 1:1 (Manager → Empleado)</SelectItem>
                      <SelectItem value="360">Feedback 360° (Peers, Manager, Auto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notas Iniciales</Label>
                <Textarea id="notes" placeholder="Objetivos de la evaluación, áreas a revisar..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvaluation}>
                Crear Evaluación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {evaluation.employee}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{evaluation.type}</Badge>
                      <Badge variant="outline" className={getStatusColor(evaluation.status)}>
                        <span className="text-white">{evaluation.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Puntuación General</p>
                      <div className="flex items-center gap-2">
                        <Star className={`w-5 h-5 ${getScoreColor(evaluation.overallScore)}`} />
                        <span className={`text-lg font-semibold ${getScoreColor(evaluation.overallScore)}`}>
                          {evaluation.overallScore.toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bienestar Asociado</p>
                      <div className="flex items-center gap-2">
                        <Progress value={evaluation.wellbeingScore} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{evaluation.wellbeingScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Competencias Clave</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(evaluation.scores).slice(0, 3).map(([key, score]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-muted-foreground">{competencyLabels[key as keyof typeof competencyLabels]}</p>
                          <p className={`font-semibold ${getScoreColor(score)}`}>{score.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      Fecha: {new Date(evaluation.date).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedEvaluation(evaluation)}>
                      <Eye className="w-4 h-4 mr-1" />
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
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Las evaluaciones completadas aparecerán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">4.2</p>
                    <p className="text-sm text-muted-foreground">Puntuación Media</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-sm text-muted-foreground">Bienestar Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">+12%</p>
                    <p className="text-sm text-muted-foreground">Mejora vs Anterior</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Mejor Competencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Insights Automáticos (IA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm">
                  <strong>Correlación positiva:</strong> Los empleados con bienestar alto son 23% más productivos en evaluaciones.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm">
                  <strong>Fortaleza del equipo:</strong> Trabajo en equipo es la competencia más desarrollada (4.65 promedio).
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm">
                  <strong>Área de mejora:</strong> Innovación requiere atención (3.75 promedio). Considerar capacitación.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evaluación 1:1 Estándar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Plantilla para evaluaciones manager-empleado con competencias básicas.
                </p>
                <Button variant="outline" className="w-full">Usar Plantilla</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Feedback 360° Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Evaluación integral con peers, subordinados y autoevaluación.
                </p>
                <Button variant="outline" className="w-full">Usar Plantilla</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Evaluation Detail Dialog */}
      {selectedEvaluation && (
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Evaluación de {selectedEvaluation.employee}
                <Badge variant="outline">{selectedEvaluation.type}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Competencias</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedEvaluation.scores).map(([key, score]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm">{competencyLabels[key as keyof typeof competencyLabels]}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(score / 5) * 100} className="w-20 h-2" />
                          <span className={`font-semibold ${getScoreColor(score)}`}>
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Resumen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Puntuación General:</span>
                      <span className={`font-semibold ${getScoreColor(selectedEvaluation.overallScore)}`}>
                        {selectedEvaluation.overallScore.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bienestar Asociado:</span>
                      <span className="font-semibold">{selectedEvaluation.wellbeingScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fecha:</span>
                      <span>{new Date(selectedEvaluation.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Comentarios y Observaciones</h4>
                <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                  {selectedEvaluation.comments}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Exportar PDF</Button>
                <Button>Programar Seguimiento</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamEvaluations;