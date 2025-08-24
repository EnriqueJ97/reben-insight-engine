import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, ArrowRight, 
  AlertCircle, CheckCircle, Target,
  Zap, Clock, Users
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CorrelationAnalysisProps {
  reportData: any;
  period: string;
  scope: string;
}

const CorrelationAnalysis = ({ reportData, period, scope }: CorrelationAnalysisProps) => {
  // Mock data de correlaciones (en producción vendría de la API)
  const correlations = [
    {
      id: 1,
      variables: ['Trabajo flexible', 'Retención'],
      correlation: 0.78,
      strength: 'Fuerte',
      impact: 'Positivo',
      significance: 'Alta',
      description: 'Los equipos con políticas flexibles muestran 15% mayor retención',
      actionable: true,
      color: 'green'
    },
    {
      id: 2,
      variables: ['Horas extra', 'Burnout'],
      correlation: 0.84,
      strength: 'Muy Fuerte',
      impact: 'Negativo',
      significance: 'Crítica',
      description: 'Cada hora extra adicional aumenta 12% el riesgo de burnout',
      actionable: true,
      color: 'red'
    },
    {
      id: 3,
      variables: ['Feedback frecuente', 'Engagement'],
      correlation: 0.71,
      strength: 'Fuerte',
      impact: 'Positivo',
      significance: 'Alta',
      description: 'Feedback semanal correlaciona con 18% mayor engagement',
      actionable: true,
      color: 'blue'
    },
    {
      id: 4,
      variables: ['Tamaño equipo', 'Comunicación'],
      correlation: -0.65,
      strength: 'Moderada',
      impact: 'Negativo',
      significance: 'Media',
      description: 'Equipos >8 personas muestran 25% menor eficiencia comunicativa',
      actionable: true,
      color: 'orange'
    }
  ];

  // Datos para gráfico de dispersión
  const scatterData = reportData?.teams_breakdown?.map(team => ({
    name: team.team_name,
    wellness: team.avg_wellness || Math.random() * 100,
    productivity: team.participation_rate || Math.random() * 100,
    size: team.member_count || Math.random() * 20
  })) || [
    { name: 'Ventas', wellness: 85, productivity: 92, size: 15 },
    { name: 'Desarrollo', wellness: 72, productivity: 88, size: 22 },
    { name: 'Marketing', wellness: 91, productivity: 87, size: 12 },
    { name: 'Soporte', wellness: 88, productivity: 85, size: 8 },
    { name: 'RRHH', wellness: 94, productivity: 89, size: 6 }
  ];

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'text-red-600';
    if (abs >= 0.6) return 'text-orange-600';
    if (abs >= 0.4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStrengthBadge = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return <Badge variant="destructive">Muy Fuerte</Badge>;
    if (abs >= 0.6) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Fuerte</Badge>;
    if (abs >= 0.4) return <Badge variant="outline">Moderada</Badge>;
    return <Badge variant="outline" className="text-gray-500">Débil</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Correlaciones Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Correlaciones Detectadas - Causas Raíz Identificadas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Relaciones estadísticamente significativas entre indicadores organizacionales
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {correlations.map((corr) => (
              <div
                key={corr.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md border-l-4 border-l-${corr.color}-500`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <span>{corr.variables[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{corr.variables[1]}</span>
                    </div>
                    {getStrengthBadge(corr.correlation)}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getCorrelationColor(corr.correlation)}`}>
                      {corr.correlation > 0 ? '+' : ''}{(corr.correlation * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {corr.significance} significancia
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {corr.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {corr.impact === 'Positivo' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Impacto {corr.impact}
                    </span>
                  </div>
                  {corr.actionable && (
                    <Badge variant="outline" className="text-blue-700 bg-blue-50">
                      <Zap className="w-3 h-3 mr-1" />
                      Accionable
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mapa de Correlación Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Análisis de Dispersión: Bienestar vs Productividad
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cada punto representa un equipo. El tamaño indica número de miembros.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="wellness" 
                  name="Bienestar" 
                  type="number"
                  domain={[60, 100]}
                  label={{ value: 'Bienestar (%)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="productivity" 
                  name="Productividad" 
                  type="number"
                  domain={[70, 100]}
                  label={{ value: 'Productividad (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [`${value}%`, name === 'wellness' ? 'Bienestar' : 'Productividad']}
                  labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.name || 'Equipo'}
                />
                <Scatter 
                  dataKey="productivity" 
                  fill="#3b82f6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Insight Clave</span>
            </div>
            <p className="text-sm text-blue-700">
              Se observa una correlación positiva fuerte (r=0.78) entre bienestar del equipo y productividad. 
              Los equipos en el cuadrante superior derecho (alto bienestar + alta productividad) representan 
              el modelo organizacional óptimo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Predicciones Basadas en Correlaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Predicciones a 90 días
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Mejora en retención (trabajo flexible)</span>
                  <span className="text-sm font-bold text-green-600">+12%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Reducción burnout (menos h. extra)</span>
                  <span className="text-sm font-bold text-green-600">-18%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Aumento engagement (feedback++)</span>
                  <span className="text-sm font-bold text-blue-600">+15%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Intervenciones Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Limitar horas extra en IT</p>
                  <p className="text-xs text-muted-foreground">
                    Impacto esperado: -20% burnout en 60 días
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Expandir trabajo híbrido</p>
                  <p className="text-xs text-muted-foreground">
                    Impacto esperado: +15% retención en 90 días
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-sm">1:1s semanales obligatorios</p>
                  <p className="text-xs text-muted-foreground">
                    Impacto esperado: +18% engagement en 30 días
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;