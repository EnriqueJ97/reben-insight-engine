import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Brain,
  Target,
  Calendar,
  BarChart3,
  ArrowRight,
  Eye,
  MessageCircle,
  Shield,
  Clock,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ManagerRiskInsights from './ManagerRiskInsights';

const TurnoverPrediction = () => {
  const { user } = useAuth();
  
  // Si es manager, mostrar la vista específica para managers
  if (user?.role === 'MANAGER') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <span>Gestión de Riesgos del Equipo</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Identifica riesgos y aplica microacciones para mantener a tu equipo motivado
          </p>
        </div>
        <ManagerRiskInsights />
      </div>
    );
  }
  
  // Vista original para HR_ADMIN y otros roles
  const [predictions, setPredictions] = useState([
    {
      id: '1',
      employeeId: 'user_1',
      employeeName: 'María García',
      email: 'maria@empresa.com',
      role: 'Senior Developer',
      riskLevel: 'low',
      riskScore: 0.15,
      predictedDate: null,
      confidence: 0.92,
      factors: [
        { factor: 'Satisfacción laboral', impact: 0.8, trend: 'positive' },
        { factor: 'Carga de trabajo', impact: 0.3, trend: 'stable' },
        { factor: 'Relación con manager', impact: 0.9, trend: 'positive' },
        { factor: 'Oportunidades de crecimiento', impact: 0.7, trend: 'positive' }
      ],
      interventions: [],
      wellnessHistory: [85, 87, 83, 89, 91, 88, 90],
      lastUpdated: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      employeeId: 'user_2',
      employeeName: 'Carlos López',
      email: 'carlos@empresa.com',
      role: 'Product Manager',
      riskLevel: 'medium',
      riskScore: 0.65,
      predictedDate: '2024-04-15',
      confidence: 0.78,
      factors: [
        { factor: 'Satisfacción laboral', impact: 0.4, trend: 'negative' },
        { factor: 'Carga de trabajo', impact: 0.8, trend: 'negative' },
        { factor: 'Equilibrio vida-trabajo', impact: 0.3, trend: 'negative' },
        { factor: 'Compensación', impact: 0.6, trend: 'stable' }
      ],
      interventions: [
        { type: 'one_on_one', date: '2024-01-10', status: 'completed' },
        { type: 'workload_adjustment', date: '2024-01-12', status: 'pending' }
      ],
      wellnessHistory: [75, 72, 68, 65, 63, 60, 58],
      lastUpdated: '2024-01-15T09:30:00Z'
    },
    {
      id: '3',
      employeeId: 'user_3',
      employeeName: 'Ana Martínez',
      email: 'ana@empresa.com',
      role: 'Designer',
      riskLevel: 'high',
      riskScore: 0.85,
      predictedDate: '2024-02-28',
      confidence: 0.89,
      factors: [
        { factor: 'Satisfacción laboral', impact: 0.2, trend: 'negative' },
        { factor: 'Oportunidades de crecimiento', impact: 0.1, trend: 'negative' },
        { factor: 'Reconocimiento', impact: 0.3, trend: 'negative' },
        { factor: 'Ajuste cultural', impact: 0.4, trend: 'negative' }
      ],
      interventions: [
        { type: 'urgent_meeting', date: '2024-01-14', status: 'completed' },
        { type: 'development_plan', date: '2024-01-15', status: 'in_progress' },
        { type: 'mentor_assignment', date: '2024-01-16', status: 'pending' }
      ],
      wellnessHistory: [65, 58, 52, 48, 45, 42, 38],
      lastUpdated: '2024-01-15T11:15:00Z'
    }
  ]);

  const [teamMetrics, setTeamMetrics] = useState({
    totalEmployees: 12,
    riskDistribution: {
      low: 8,
      medium: 3,
      high: 1
    },
    avgRetentionRate: 0.89,
    predictedLosses: 2,
    interventionSuccess: 0.73,
    modelAccuracy: 0.86
  });

  const [retentionStrategies] = useState([
    {
      id: '1',
      title: 'Plan de Desarrollo Personalizado',
      description: 'Crear un plan de carrera específico con objetivos claros y timeline',
      applicableFor: ['medium', 'high'],
      impact: 0.8,
      duration: '6 semanas',
      resources: ['Manager time', 'HR support', 'Training budget']
    },
    {
      id: '2',
      title: 'Ajuste de Carga de Trabajo',
      description: 'Redistribuir tareas y responsabilidades para mejorar el balance',
      applicableFor: ['medium', 'high'],
      impact: 0.6,
      duration: '2 semanas',
      resources: ['Team coordination', 'Task reallocation']
    },
    {
      id: '3',
      title: 'Programa de Mentoring',
      description: 'Asignar un mentor senior para apoyo y desarrollo profesional',
      applicableFor: ['medium', 'high'],
      impact: 0.7,
      duration: '12 semanas',
      resources: ['Senior mentor', 'Regular meetings']
    },
    {
      id: '4',
      title: 'Reconocimiento y Recompensas',
      description: 'Implementar programa de reconocimiento específico',
      applicableFor: ['medium', 'high'],
      impact: 0.5,
      duration: '4 semanas',
      resources: ['Budget allocation', 'Recognition program']
    }
  ]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10';
      case 'medium': return 'bg-warning/10';
      case 'high': return 'bg-destructive/10';
      default: return 'bg-muted/10';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'high': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'negative': return <TrendingDown className="h-3 w-3 text-destructive" />;
      default: return <ArrowRight className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getInterventionIcon = (type: string) => {
    switch (type) {
      case 'one_on_one': return <MessageCircle className="h-4 w-4" />;
      case 'workload_adjustment': return <BarChart3 className="h-4 w-4" />;
      case 'development_plan': return <Target className="h-4 w-4" />;
      case 'mentor_assignment': return <Users className="h-4 w-4" />;
      case 'urgent_meeting': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getInterventionStatus = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success text-success-foreground">Completado</Badge>;
      case 'in_progress': return <Badge className="bg-info text-info-foreground">En Curso</Badge>;
      case 'pending': return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      default: return <Badge variant="outline">Estado Desconocido</Badge>;
    }
  };

  const formatPredictedDate = (date: string | null) => {
    if (!date) return 'No predicho';
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Fecha pasada';
    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} meses`;
    return targetDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  const getApplicableStrategies = (riskLevel: string) => {
    return retentionStrategies.filter(strategy => 
      strategy.applicableFor.includes(riskLevel)
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert de privacidad */}
      <Alert className="border-info/30 bg-info/5">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Protección de Datos:</strong> Las predicciones utilizan algoritmos de ML 
          que cumplen con RGPD. Los datos son procesados de forma agregada y confidencial.
        </AlertDescription>
      </Alert>

      {/* Métricas del equipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{teamMetrics.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Empleados Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{Math.round(teamMetrics.avgRetentionRate * 100)}%</p>
                <p className="text-xs text-muted-foreground">Retención Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{teamMetrics.predictedLosses}</p>
                <p className="text-xs text-muted-foreground">Pérdidas Predichas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{Math.round(teamMetrics.modelAccuracy * 100)}%</p>
                <p className="text-xs text-muted-foreground">Precisión del Modelo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          <TabsTrigger value="factors">Factores de Riesgo</TabsTrigger>
          <TabsTrigger value="interventions">Intervenciones</TabsTrigger>
          <TabsTrigger value="strategies">Estrategias</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Predicciones de Rotación</h3>
              <p className="text-sm text-muted-foreground">
                Análisis de ML para identificar empleados en riesgo de abandono
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Actualizado: {new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Distribución de riesgo */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Distribución de Riesgo del Equipo</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-lg font-bold text-success">{teamMetrics.riskDistribution.low}</p>
                  <p className="text-sm text-muted-foreground">Riesgo Bajo</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-lg font-bold text-warning">{teamMetrics.riskDistribution.medium}</p>
                  <p className="text-sm text-muted-foreground">Riesgo Medio</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-lg font-bold text-destructive">{teamMetrics.riskDistribution.high}</p>
                  <p className="text-sm text-muted-foreground">Riesgo Alto</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de predicciones */}
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className={`p-6 border-l-4 ${
                prediction.riskLevel === 'high' ? 'border-l-destructive' :
                prediction.riskLevel === 'medium' ? 'border-l-warning' : 'border-l-success'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {prediction.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg">{prediction.employeeName}</h4>
                        <Badge className={`${getRiskBg(prediction.riskLevel)} ${getRiskColor(prediction.riskLevel)} border-0`}>
                          {getRiskIcon(prediction.riskLevel)}
                          <span className="ml-1 capitalize">Riesgo {prediction.riskLevel === 'high' ? 'Alto' : prediction.riskLevel === 'medium' ? 'Medio' : 'Bajo'}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {prediction.role} • {prediction.email}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Score de Riesgo</p>
                          <p className="font-semibold text-lg">{Math.round(prediction.riskScore * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confianza</p>
                          <p className="font-semibold text-lg">{Math.round(prediction.confidence * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Predicción</p>
                          <p className="font-semibold text-lg">{formatPredictedDate(prediction.predictedDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Intervenciones</p>
                          <p className="font-semibold text-lg">{prediction.interventions.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalles
                    </Button>
                    {prediction.riskLevel !== 'low' && (
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Intervenir
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress de bienestar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tendencia de Bienestar (últimas 7 semanas)</span>
                    <span className={prediction.wellnessHistory[6] > prediction.wellnessHistory[0] ? 'text-success' : 'text-destructive'}>
                      {prediction.wellnessHistory[6] > prediction.wellnessHistory[0] ? '↗' : '↘'} 
                      {Math.abs(prediction.wellnessHistory[6] - prediction.wellnessHistory[0])} pts
                    </span>
                  </div>
                  <div className="flex items-end space-x-1 h-16">
                    {prediction.wellnessHistory.map((value, index) => (
                      <div
                        key={index}
                        className={`flex-1 rounded-t transition-all ${
                          value >= 80 ? 'bg-success' : 
                          value >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ height: `${(value / 100) * 100}%` }}
                        title={`Semana ${index + 1}: ${value}%`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Análisis de Factores de Riesgo</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Factores que influyen en la probabilidad de rotación de cada empleado
            </p>
          </div>

          <div className="space-y-6">
            {predictions.filter(p => p.riskLevel !== 'low').map((prediction) => (
              <Card key={prediction.id} className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {prediction.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{prediction.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{prediction.role}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(factor.trend)}
                        <span className="text-sm font-medium">{factor.factor}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24">
                          <Progress value={factor.impact * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-bold w-12 text-right">
                          {Math.round(factor.impact * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Intervenciones</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Crea y gestiona intervenciones para empleados en riesgo
            </p>
          </div>

          <InterventionManager 
            predictions={predictions} 
            setPredictions={setPredictions}
          />
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Estrategias de Retención</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Aplica estrategias personalizadas para empleados en riesgo
            </p>
          </div>

          <RetentionStrategies 
            strategies={retentionStrategies}
            predictions={predictions}
            onApplyStrategy={(strategyId, employeeId) => {
              console.log('Aplicando estrategia', strategyId, 'a empleado', employeeId);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para gestionar intervenciones
const InterventionManager = ({ predictions, setPredictions }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [interventionType, setInterventionType] = useState('');
  const [interventionDate, setInterventionDate] = useState('');
  const [interventionNotes, setInterventionNotes] = useState('');

  // Funciones helper locales
  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level) => {
    switch (level) {
      case 'low': return 'bg-success/10';
      case 'medium': return 'bg-warning/10';
      case 'high': return 'bg-destructive/10';
      default: return 'bg-muted/10';
    }
  };

  const interventionTypes = [
    { value: 'one_on_one', label: 'Reunión 1:1', icon: MessageCircle },
    { value: 'workload_adjustment', label: 'Ajuste de Carga', icon: BarChart3 },
    { value: 'development_plan', label: 'Plan de Desarrollo', icon: Target },
    { value: 'mentor_assignment', label: 'Asignación de Mentor', icon: Users },
    { value: 'recognition_program', label: 'Programa de Reconocimiento', icon: Star },
    { value: 'urgent_meeting', label: 'Reunión Urgente', icon: AlertTriangle }
  ];

  const handleCreateIntervention = () => {
    if (!selectedEmployee || !interventionType || !interventionDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newIntervention = {
      type: interventionType,
      date: interventionDate,
      status: 'pending',
      notes: interventionNotes,
      createdAt: new Date().toISOString(),
      createdBy: 'current_manager'
    };

    setPredictions(prevPredictions =>
      prevPredictions.map(prediction =>
        prediction.employeeId === selectedEmployee
          ? {
              ...prediction,
              interventions: [...prediction.interventions, newIntervention]
            }
          : prediction
      )
    );

    // Reset form
    setSelectedEmployee('');
    setInterventionType('');
    setInterventionDate('');
    setInterventionNotes('');
    setShowCreateForm(false);

    alert('Intervención creada exitosamente');
  };

  const handleUpdateInterventionStatus = (employeeId, interventionIndex, newStatus) => {
    setPredictions(prevPredictions =>
      prevPredictions.map(prediction =>
        prediction.employeeId === employeeId
          ? {
              ...prediction,
              interventions: prediction.interventions.map((intervention, index) =>
                index === interventionIndex
                  ? { ...intervention, status: newStatus }
                  : intervention
              )
            }
          : prediction
      )
    );
  };

  const getInterventionIcon = (type) => {
    const interventionTypeObj = interventionTypes.find(t => t.value === type);
    const IconComponent = interventionTypeObj?.icon || Zap;
    return <IconComponent className="h-4 w-4" />;
  };

  const getInterventionStatus = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success text-success-foreground">Completado</Badge>;
      case 'in_progress': return <Badge className="bg-info text-info-foreground">En Curso</Badge>;
      case 'pending': return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      default: return <Badge variant="outline">Estado Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario de creación */}
      {showCreateForm ? (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Crear Nueva Intervención</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Empleado</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Seleccionar empleado...</option>
                {predictions.filter(p => p.riskLevel !== 'low').map(prediction => (
                  <option key={prediction.employeeId} value={prediction.employeeId}>
                    {prediction.employeeName} ({prediction.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Intervención</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={interventionType}
                onChange={(e) => setInterventionType(e.target.value)}
              >
                <option value="">Seleccionar tipo...</option>
                {interventionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha Programada</label>
              <input 
                type="date"
                className="w-full p-2 border rounded-md"
                value={interventionDate}
                onChange={(e) => setInterventionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
              <textarea 
                className="w-full p-2 border rounded-md"
                rows={3}
                value={interventionNotes}
                onChange={(e) => setInterventionNotes(e.target.value)}
                placeholder="Detalles adicionales sobre la intervención..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateIntervention}>
              Crear Intervención
            </Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setShowCreateForm(true)}>
          <Target className="h-4 w-4 mr-2" />
          Nueva Intervención
        </Button>
      )}

      {/* Lista de intervenciones activas */}
      {predictions.filter(p => p.interventions.length > 0).length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No hay intervenciones activas</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.filter(p => p.interventions.length > 0).map((prediction) => (
            <Card key={prediction.id} className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {prediction.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{prediction.employeeName}</h4>
                  <p className="text-sm text-muted-foreground">{prediction.role}</p>
                </div>
                <Badge className={`${getRiskBg(prediction.riskLevel)} ${getRiskColor(prediction.riskLevel)} border-0`}>
                  Riesgo {prediction.riskLevel === 'high' ? 'Alto' : prediction.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                </Badge>
              </div>

              <div className="space-y-3">
                {prediction.interventions.map((intervention, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getInterventionIcon(intervention.type)}
                      <div>
                        <p className="font-medium capitalize">
                          {interventionTypes.find(t => t.value === intervention.type)?.label || intervention.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Programado: {new Date(intervention.date).toLocaleDateString('es-ES')}
                        </p>
                        {intervention.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{intervention.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getInterventionStatus(intervention.status)}
                      {intervention.status !== 'completed' && (
                        <select 
                          className="text-xs p-1 border rounded"
                          value={intervention.status}
                          onChange={(e) => handleUpdateInterventionStatus(prediction.employeeId, index, e.target.value)}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En Curso</option>
                          <option value="completed">Completado</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para estrategias de retención
const RetentionStrategies = ({ strategies, predictions, onApplyStrategy }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [implementationDate, setImplementationDate] = useState('');
  const [customizations, setCustomizations] = useState('');

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleApplyStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    setShowApplicationForm(true);
  };

  const handleConfirmApplication = () => {
    if (!selectedEmployee || !implementationDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Aquí se podría implementar la lógica para guardar en la base de datos
    onApplyStrategy(selectedStrategy.id, selectedEmployee);
    
    alert(`Estrategia "${selectedStrategy.title}" aplicada exitosamente a ${predictions.find(p => p.employeeId === selectedEmployee)?.employeeName}`);
    
    // Reset form
    setSelectedStrategy(null);
    setShowApplicationForm(false);
    setSelectedEmployee('');
    setImplementationDate('');
    setCustomizations('');
  };

  return (
    <div className="space-y-4">
      {/* Formulario de aplicación de estrategia */}
      {showApplicationForm && selectedStrategy && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Aplicar Estrategia: {selectedStrategy.title}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Empleado</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Seleccionar empleado...</option>
                {predictions.filter(p => selectedStrategy.applicableFor.includes(p.riskLevel)).map(prediction => (
                  <option key={prediction.employeeId} value={prediction.employeeId}>
                    {prediction.employeeName} ({prediction.riskLevel} risk)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Implementación</label>
              <input 
                type="date"
                className="w-full p-2 border rounded-md"
                value={implementationDate}
                onChange={(e) => setImplementationDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Personalizaciones (Opcional)</label>
              <textarea 
                className="w-full p-2 border rounded-md"
                rows={3}
                value={customizations}
                onChange={(e) => setCustomizations(e.target.value)}
                placeholder="Ajustes específicos para este empleado..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmApplication}>
              Aplicar Estrategia
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de estrategias disponibles */}
      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">{strategy.title}</h4>
                <p className="text-muted-foreground mb-4">{strategy.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Impacto Estimado</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${strategy.impact * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold">{Math.round(strategy.impact * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-semibold">{strategy.duration}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aplicable a</p>
                    <div className="flex space-x-1">
                      {strategy.applicableFor.map((risk) => (
                        <Badge 
                          key={risk} 
                          variant="outline" 
                          className={`text-xs ${getRiskColor(risk)}`}
                        >
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Candidatos</p>
                    <p className="font-semibold">
                      {predictions.filter(p => strategy.applicableFor.includes(p.riskLevel)).length} empleados
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleApplyStrategy(strategy)}>
                <Target className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">Recursos Necesarios:</h5>
              <div className="flex flex-wrap gap-2">
                {strategy.resources.map((resource, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TurnoverPrediction;