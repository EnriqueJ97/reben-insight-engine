import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Users, 
  Target,
  Calendar,
  MessageCircle,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  Heart,
  Zap
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamRisk {
  category: string;
  currentLevel: number;
  industryAverage: number;
  trend: 'up' | 'down' | 'stable';
  riskEmployees: number;
  totalEmployees: number;
}

interface MicroAction {
  id: string;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  category: 'recognition' | 'communication' | 'development' | 'wellbeing';
  icon: any;
}

interface AtRiskEmployee {
  id: string;
  name: string;
  riskLevel: number;
  primaryFactors: string[];
  suggestedActions: string[];
}

const ManagerRiskInsights = () => {
  const [teamRisks] = useState<TeamRisk[]>([
    {
      category: 'Burnout',
      currentLevel: 34,
      industryAverage: 28,
      trend: 'up',
      riskEmployees: 3,
      totalEmployees: 8
    },
    {
      category: 'Engagement',
      currentLevel: 72,
      industryAverage: 68,
      trend: 'stable',
      riskEmployees: 2,
      totalEmployees: 8
    },
    {
      category: 'Satisfacción',
      currentLevel: 78,
      industryAverage: 75,
      trend: 'up',
      riskEmployees: 1,
      totalEmployees: 8
    }
  ]);

  const [microActions] = useState<MicroAction[]>([
    {
      id: '1',
      title: 'Check-in individual semanal',
      description: 'Programa 15 min semanales con cada miembro para escuchar inquietudes',
      effort: 'medium',
      impact: 'high',
      timeframe: 'Esta semana',
      category: 'communication',
      icon: MessageCircle
    },
    {
      id: '2',
      title: 'Reconocimiento público',
      description: 'Destaca logros del equipo en la próxima reunión general',
      effort: 'low',
      impact: 'medium',
      timeframe: 'Hoy',
      category: 'recognition',
      icon: Star
    },
    {
      id: '3',
      title: 'Redistribuir carga de trabajo',
      description: 'Analiza la distribución actual y reasigna tareas críticas',
      effort: 'high',
      impact: 'high',
      timeframe: 'Esta semana',
      category: 'wellbeing',
      icon: Target
    }
  ]);

  const [atRiskEmployees] = useState<AtRiskEmployee[]>([
    {
      id: '1',
      name: 'Carlos M.',
      riskLevel: 78,
      primaryFactors: ['Sobrecarga de trabajo', 'Stress'],
      suggestedActions: ['Reducir horas extra', 'Ofrecer apoyo adicional']
    },
    {
      id: '2',
      name: 'Ana L.',
      riskLevel: 65,
      primaryFactors: ['Falta de reconocimiento', 'Monotonía'],
      suggestedActions: ['Feedback positivo', 'Asignar proyecto desafiante']
    }
  ]);

  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const getRiskColor = (level: number, average: number) => {
    const diff = level - average;
    if (diff > 15) return 'destructive';
    if (diff > 5) return 'secondary';
    return 'default';
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completeAction = (actionId: string) => {
    setCompletedActions(prev => [...prev, actionId]);
  };

  return (
    <div className="space-y-6">
      {/* Header con resumen ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Estado de Riesgo del Equipo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamRisks.map((risk, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{risk.category}</span>
                  <div className="flex items-center space-x-2">
                    {risk.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : risk.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : null}
                    <Badge variant={getRiskColor(risk.currentLevel, risk.industryAverage)}>
                      {risk.currentLevel}%
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={risk.currentLevel} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Promedio industria: {risk.industryAverage}%
                    {risk.currentLevel > risk.industryAverage && (
                      <span className="text-red-600 font-medium">
                        {' '}(+{risk.currentLevel - risk.industryAverage}% sobre promedio)
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{risk.riskEmployees}</span> de{' '}
                    <span className="font-medium">{risk.totalEmployees}</span> empleados en riesgo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empleados en riesgo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Empleados que Requieren Atención</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Nivel de riesgo: {employee.riskLevel}%
                      </div>
                    </div>
                  </div>
                  <Badge variant={employee.riskLevel > 70 ? 'destructive' : 'secondary'}>
                    {employee.riskLevel > 70 ? 'Alto riesgo' : 'Riesgo moderado'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">Factores principales:</div>
                    <div className="space-y-1">
                      {employee.primaryFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Acciones sugeridas:</div>
                    <ul className="text-sm space-y-1">
                      {employee.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <ArrowRight className="h-3 w-3 text-primary" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Microacciones recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Acciones Recomendadas</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Microacciones de alto impacto para reducir el riesgo del equipo
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {microActions.map((action) => {
              const isCompleted = completedActions.includes(action.id);
              const IconComponent = action.icon;
              
              return (
                <div 
                  key={action.id} 
                  className={`border rounded-lg p-4 transition-opacity ${
                    isCompleted ? 'opacity-50 bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-100' : 'bg-primary/10'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <IconComponent className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{action.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getEffortColor(action.effort)}>
                              Esfuerzo: {action.effort}
                            </Badge>
                            <Badge className={getImpactColor(action.impact)}>
                              Impacto: {action.impact}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{action.timeframe}</span>
                          </div>
                          
                          {!isCompleted ? (
                            <Button 
                              size="sm" 
                              onClick={() => completeAction(action.id)}
                              className="shrink-0"
                            >
                              Marcar como hecho
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              ✓ Completado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progreso semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Progreso Esta Semana</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedActions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Acciones completadas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {microActions.length - completedActions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Pendientes
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((completedActions.length / microActions.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progreso total
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={(completedActions.length / microActions.length) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerta de seguimiento */}
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          <strong>Próximo seguimiento:</strong> Revisión de progreso programada para el viernes. 
          Completa al menos 2 acciones antes de esa fecha para maximizar el impacto.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ManagerRiskInsights;