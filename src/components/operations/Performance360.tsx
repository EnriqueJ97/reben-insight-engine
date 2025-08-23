import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  MessageCircle, 
  BarChart3, 
  PieChart, 
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  Edit3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Performance360 = () => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2024');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [newObjective, setNewObjective] = useState({ title: '', description: '', dueDate: '', category: 'individual' });

  // Mock data - en producción vendría de la base de datos
  const [objectives, setObjectives] = useState([
    {
      id: '1',
      title: 'Implementar nuevo sistema CRM',
      progress: 75,
      dueDate: '2024-12-31',
      category: 'team',
      status: 'on-track',
      owner: 'María García',
      wellnessCorrelation: 0.8
    },
    {
      id: '2', 
      title: 'Certificación AWS Solutions Architect',
      progress: 40,
      dueDate: '2024-11-30',
      category: 'individual',
      status: 'at-risk',
      owner: 'Carlos López',
      wellnessCorrelation: 0.6
    }
  ]);

  const [feedback360, setFeedback360] = useState([
    {
      id: '1',
      evaluator: 'Manager',
      evaluated: 'María García',
      competencies: {
        leadership: 4.5,
        communication: 4.2,
        teamwork: 4.7,
        innovation: 3.8,
        productivity: 4.1
      },
      wellnessImpact: 0.75,
      comments: 'Excelente liderazgo del equipo, buena correlación con bienestar del equipo'
    }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState({
    teamProductivity: 87,
    wellnessAlignment: 0.82,
    objectiveCompletion: 68,
    feedbackSentiment: 4.2,
    retentionPrediction: 0.91
  });

  const wellnessPerformanceData = [
    { name: 'Bienestar Alto', productivity: 95, retention: 98 },
    { name: 'Bienestar Medio', productivity: 78, retention: 85 },
    { name: 'Bienestar Bajo', productivity: 62, retention: 71 }
  ];

  const handleCreateObjective = async () => {
    if (!newObjective.title.trim()) {
      toast({
        title: "Error",
        description: "El título del objetivo es obligatorio",
        variant: "destructive"
      });
      return;
    }

    const objective = {
      id: Date.now().toString(),
      ...newObjective,
      progress: 0,
      status: 'not-started',
      owner: 'Usuario Actual',
      wellnessCorrelation: Math.random() * 0.4 + 0.6 // Random entre 0.6-1.0
    };

    setObjectives(prev => [...prev, objective]);
    setNewObjective({ title: '', description: '', dueDate: '', category: 'individual' });
    
    toast({
      title: "Objetivo creado",
      description: "El nuevo objetivo ha sido añadido al sistema OKR"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-success text-success-foreground';
      case 'at-risk': return 'bg-warning text-warning-foreground';
      case 'delayed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.8) return 'text-success';
    if (correlation >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation >= 0.8) return <ArrowUp className="h-4 w-4" />;
    if (correlation >= 0.6) return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.teamProductivity}%</p>
                <p className="text-xs text-muted-foreground">Productividad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.objectiveCompletion}%</p>
                <p className="text-xs text-muted-foreground">OKRs Logrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{Math.round(performanceMetrics.wellnessAlignment * 100)}%</p>
                <p className="text-xs text-muted-foreground">Alineación Bienestar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.feedbackSentiment.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Feedback 360º</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{Math.round(performanceMetrics.retentionPrediction * 100)}%</p>
                <p className="text-xs text-muted-foreground">Retención Pred.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="okrs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="okrs">OKRs & Objetivos</TabsTrigger>
          <TabsTrigger value="feedback360">Feedback 360º</TabsTrigger>
          <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value="okrs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Objetivos y Resultados Clave (OKRs)</h3>
              <p className="text-sm text-muted-foreground">
                Gestión de objetivos alineados con bienestar del equipo
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Objetivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Objetivo</DialogTitle>
                  <DialogDescription>
                    Define un objetivo medible con fecha límite
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del Objetivo</Label>
                    <Input
                      id="title"
                      value={newObjective.title}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Reducir tiempo de respuesta en 20%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newObjective.description}
                      onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe cómo se medirá el éxito..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Fecha Límite</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newObjective.dueDate}
                        onChange={(e) => setNewObjective(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select value={newObjective.category} onValueChange={(value) => setNewObjective(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="team">Equipo</SelectItem>
                          <SelectItem value="company">Empresa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateObjective}>Crear Objetivo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {objectives.map((objective) => (
              <Card key={objective.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{objective.title}</h4>
                      <Badge className={getStatusColor(objective.status)}>
                        {objective.status === 'on-track' ? 'En curso' : 
                         objective.status === 'at-risk' ? 'En riesgo' : 'Retrasado'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {objective.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Owner: {objective.owner} • Vence: {new Date(objective.dueDate).toLocaleDateString('es-ES')}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso</span>
                          <span>{objective.progress}%</span>
                        </div>
                        <Progress value={objective.progress} className="h-2" />
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${getCorrelationColor(objective.wellnessCorrelation)}`}>
                        {getCorrelationIcon(objective.wellnessCorrelation)}
                        <span className="text-sm font-medium">
                          Bienestar: {Math.round(objective.wellnessCorrelation * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback360" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Evaluaciones 360º</h3>
              <p className="text-sm text-muted-foreground">
                Feedback multidireccional con correlación de bienestar
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Evaluación
            </Button>
          </div>

          {feedback360.map((feedback) => (
            <Card key={feedback.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{feedback.evaluated}</h4>
                  <p className="text-sm text-muted-foreground">Evaluado por: {feedback.evaluator}</p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  Impacto Bienestar: {Math.round(feedback.wellnessImpact * 100)}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(feedback.competencies).map(([competency, score]) => (
                  <div key={competency} className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{score.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{competency}</div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm">{feedback.comments}</p>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Correlaciones Bienestar-Rendimiento</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Análisis de la relación entre bienestar del equipo y métricas de rendimiento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Productividad vs Bienestar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {wellnessPerformanceData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{item.productivity}%</div>
                          <div className="text-xs text-muted-foreground">Productividad</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">{item.retention}%</div>
                          <div className="text-xs text-muted-foreground">Retención</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Insights Automáticos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Correlación Positiva</span>
                    </div>
                    <p className="text-sm">Empleados con bienestar alto muestran 23% más productividad</p>
                  </div>
                  
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-info" />
                      <span className="text-sm font-medium text-info">Oportunidad</span>
                    </div>
                    <p className="text-sm">Mejorar bienestar podría incrementar retención en 15%</p>
                  </div>
                  
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Atención Requerida</span>
                    </div>
                    <p className="text-sm">2 empleados con bajo bienestar afectan OKRs del equipo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Analytics Avanzado de Rendimiento</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Métricas profundas y predicciones basadas en IA
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Predicciones ML</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Probabilidad de Cumplir OKRs Q4</span>
                      <span className="text-lg font-bold text-primary">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Retención del Equipo (12 meses)</span>
                      <span className="text-lg font-bold text-success">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Riesgo de Burnout del Equipo</span>
                      <span className="text-lg font-bold text-warning">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Recomendaciones IA</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                    <p className="text-sm font-medium mb-1">💡 Optimización de OKRs</p>
                    <p className="text-xs text-muted-foreground">
                      Redistribuir carga del objetivo "CRM" para mejorar probabilidad de éxito
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-success bg-success/5 rounded-r-lg">
                    <p className="text-sm font-medium mb-1">🎯 Plan de Retención</p>
                    <p className="text-xs text-muted-foreground">
                      Implementar 1:1 mensuales con Carlos López para mejorar engagement
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-warning bg-warning/5 rounded-r-lg">
                    <p className="text-sm font-medium mb-1">⚠️ Prevención Burnout</p>
                    <p className="text-xs text-muted-foreground">
                      Reducir carga de trabajo en 15% para mantener sostenibilidad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance360;