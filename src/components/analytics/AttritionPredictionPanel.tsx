import { useEffect } from 'react';
import { useAttritionPredictor } from '@/hooks/useAttritionPredictor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { UserX, TrendingDown, DollarSign, Clock, AlertTriangle, Users, Target } from 'lucide-react';

interface AttritionPredictionPanelProps {
  period?: string;
  scope?: string;
}

const AttritionPredictionPanel = ({ period = '30', scope = 'all' }: AttritionPredictionPanelProps) => {
  const { loading, prediction, refreshPrediction } = useAttritionPredictor();

  useEffect(() => {
    refreshPrediction();
  }, [period, refreshPrediction]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const highRiskEmployees = prediction?.individual.filter(emp => 
    emp.riskLevel === 'high' || emp.riskLevel === 'critical'
  ) || [];

  return (
    <div className="space-y-6">
      {prediction && (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Riesgo Organizacional</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {(prediction.organizationalRisk * 100).toFixed(0)}%
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Empleados Alto Riesgo</p>
                    <p className="text-2xl font-bold text-red-600">{highRiskEmployees.length}</p>
                  </div>
                  <UserX className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Impacto Económico</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(prediction.costImpact)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Confianza del Modelo</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(prediction.confidenceLevel * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Risk Employees Alert */}
          {highRiskEmployees.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Empleados de Alto Riesgo - Acción Inmediata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highRiskEmployees.slice(0, 4).map((employee, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{employee.employeeName}</h4>
                          <Badge className={getRiskColor(employee.riskLevel)}>
                            {employee.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Probabilidad supervivencia</p>
                          <p className="font-bold text-lg">{(employee.survivalProbability * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Riesgo de Salida</span>
                          <span>{(employee.riskScore * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={employee.riskScore * 100} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Tiempo Estimado</span>
                          <span>{employee.timeToAttrition} meses</span>
                        </div>
                      </div>

                      {employee.recommendedActions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Acciones Recomendadas:</p>
                          {employee.recommendedActions.slice(0, 2).map((action, actionIndex) => (
                            <p key={actionIndex} className="text-xs text-muted-foreground">
                              • {action}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Employees Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Análisis Completo de Riesgo de Rotación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.individual.length > 0 ? (
                  prediction.individual.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{employee.employeeName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRiskColor(employee.riskLevel)}>
                              {employee.riskLevel.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Riesgo: {(employee.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{employee.timeToAttrition} meses</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Supervivencia: {(employee.survivalProbability * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay datos suficientes para el análisis</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Necesitamos más datos de check-ins para realizar predicciones precisas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AttritionPredictionPanel;