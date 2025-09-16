import React from 'react';
import { useRiskScore } from '@/hooks/useRiskScore';
import { useROITracking } from '@/hooks/useROITracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Euro, 
  RefreshCw,
  Activity,
  Target,
  Clock,
  Users,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface RiskScoreDashboardProps {
  userRole: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
}

const RiskScoreDashboard: React.FC<RiskScoreDashboardProps> = ({ userRole }) => {
  const { 
    loading, 
    currentScore, 
    teamScores, 
    getRiskColor, 
    getCurrentUserScore,
    getTeamRiskScores
  } = useRiskScore();
  
  const { 
    roiSummary, 
    getROISummary,
    generateCSRDReport,
    getInterventionTypeName
  } = useROITracking();

  const handleRefresh = async () => {
    await getCurrentUserScore();
    if (userRole !== 'EMPLOYEE') {
      await getTeamRiskScores();
      await getROISummary();
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'VERDE': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'AMARILLO': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'ROJO': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getRecommendations = (score: any) => {
    if (!score?.factors) return [];
    
    const recommendations: string[] = [];
    
    score.factors.forEach((factor: any) => {
      switch (factor.factor) {
        case 'HORAS_EXCESIVAS':
          recommendations.push('Reduce tu jornada laboral a máximo 45h/semana');
          break;
        case 'MOTIVACION_BAJA':
          recommendations.push('Solicita una reunión 1:1 con tu manager');
          break;
        case 'REUNIONES_EXCESIVAS':
          recommendations.push('Bloquea tiempo de foco en tu calendario');
          break;
        case 'FOCO_INSUFICIENTE':
          recommendations.push('Programa mínimo 4h diarias de trabajo concentrado');
          break;
      }
    });

    return recommendations;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vista para EMPLEADO
  if (userRole === 'EMPLOYEE') {
    const recommendations = getRecommendations(currentScore);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tu Score de Riesgo</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {currentScore && (
          <Card className={`border-2 ${
            currentScore.level === 'VERDE' ? 'border-green-300 bg-green-50' :
            currentScore.level === 'AMARILLO' ? 'border-yellow-300 bg-yellow-50' :
            'border-red-300 bg-red-50'
          }`}>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                {getRiskIcon(currentScore.level)}
                <CardTitle className="text-3xl">
                  {currentScore.level}
                </CardTitle>
              </div>
              <CardDescription>
                Score: {currentScore.score}/100 • Calculado hace {
                  Math.round((Date.now() - new Date(currentScore.calculated_at).getTime()) / (1000 * 60))
                } minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress 
                  value={currentScore.score} 
                  className="h-3"
                />

                {recommendations.length > 0 && (
                  <div className="bg-white/80 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Recomendaciones para ti:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista para MANAGER
  if (userRole === 'MANAGER') {
    const teamRiskDistribution = teamScores.reduce((acc, score) => {
      acc[score.level] = (acc[score.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Estado del Equipo</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-green-700">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                VERDE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teamRiskDistribution.VERDE || 0}
              </div>
              <p className="text-sm text-muted-foreground">Sin riesgo detectado</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-yellow-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                AMARILLO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {teamRiskDistribution.AMARILLO || 0}
              </div>
              <p className="text-sm text-muted-foreground">Seguimiento requerido</p>
            </CardContent>
          </Card>

          <Card className="border-red-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-red-700">
                <XCircle className="h-5 w-5 mr-2" />
                ROJO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {teamRiskDistribution.ROJO || 0}
              </div>
              <p className="text-sm text-muted-foreground">Intervención inmediata</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Sugeridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(teamRiskDistribution.ROJO || 0) > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-800">🚨 Acción Inmediata</p>
                  <p className="text-sm text-red-600">
                    {teamRiskDistribution.ROJO} empleado(s) en riesgo alto. Se han activado intervenciones automáticas.
                  </p>
                </div>
              )}
              
              {(teamRiskDistribution.AMARILLO || 0) > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-medium text-yellow-800">⚠️ Supervisión</p>
                  <p className="text-sm text-yellow-600">
                    Programa reuniones 1:1 con {teamRiskDistribution.AMARILLO} empleado(s) en seguimiento.
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-800">📊 Redistribución de Carga</p>
                <p className="text-sm text-blue-600">
                  Evalúa redistribuir tareas desde empleados en riesgo hacia empleados en estado verde.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista para HR_ADMIN / CFO
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Ejecutivo - REBEN</h2>
        <div className="flex space-x-2">
          <Button onClick={generateCSRDReport} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reporte CSRD
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Euro className="h-4 w-4 mr-2" />
              AHORRO MENSUAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{roiSummary?.monthly_savings?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              ROI: {roiSummary?.roi_percentage || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              PROYECCIÓN ANUAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              €{roiSummary?.annual_projection?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {roiSummary?.events_count || 0} intervenciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              INTERVENCIÓN TOP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {getInterventionTypeName(roiSummary?.top_intervention_type || '')}
            </div>
            <p className="text-xs text-muted-foreground">
              Mayor impacto en ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              RIESGO GLOBAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {teamScores.filter(s => s.level === 'ROJO').length} / {teamScores.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Empleados en riesgo alto
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
          <CardDescription>
            REBEN ha detectado y actuado sobre {roiSummary?.events_count || 0} situaciones de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((roiSummary?.annual_projection || 0) / (roiSummary?.investment_cost || 1))}x
              </div>
              <div className="text-sm text-muted-foreground">
                Retorno de Inversión
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {teamScores.filter(s => s.level !== 'ROJO').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Empleados protegidos
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                Compliance CSRD
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskScoreDashboard;