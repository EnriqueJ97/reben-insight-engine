import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Users, Leaf, Shield, Award } from 'lucide-react';
import { useCSRDCompliance } from '@/hooks/useCSRDCompliance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6'
};

export const CSRDExecutiveDashboard = () => {
  const { metrics, materiality, profile } = useCSRDCompliance();

  // Datos para gráficos
  const complianceByStandard = [
    { name: 'E1 Clima', value: 65, required: 90 },
    { name: 'S1 Laboral', value: 85, required: 90 },
    { name: 'G1 Ética', value: 70, required: 90 }
  ];

  const materialityData = [
    { name: 'Muy Material', value: materiality.topicsCount.high_high, color: COLORS.red },
    { name: 'Material', value: materiality.topicsCount.high_low, color: COLORS.yellow },
    { name: 'Relevante', value: materiality.topicsCount.low_high, color: COLORS.blue },
    { name: 'No Material', value: materiality.topicsCount.low_low, color: COLORS.green }
  ];

  const evolutionData = [
    { month: 'Ene', compliance: 45, dataPoints: 120 },
    { month: 'Feb', compliance: 52, dataPoints: 180 },
    { month: 'Mar', compliance: 58, dataPoints: 245 },
    { month: 'Abr', compliance: 65, dataPoints: 310 },
    { month: 'May', compliance: 72, dataPoints: 380 },
    { month: 'Jun', compliance: metrics.complianceIndex, dataPoints: metrics.completedDataPoints }
  ];

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'warning': return 'Requiere Atención';
      default: return 'Crítica';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Ejecutivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparación CSRD</CardTitle>
            <Badge className={getReadinessColor(metrics.readinessLevel)}>
              {getReadinessLabel(metrics.readinessLevel)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{metrics.complianceIndex}%</div>
            <Progress value={metrics.complianceIndex} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {metrics.completedDataPoints}/{metrics.totalDataPoints} datos completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Bienestar-CSRD</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">€45.2K</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+15% vs año anterior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ahorro anual proyectado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tópicos Materiales</CardTitle>
            <Leaf className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {materiality.topicsCount.high_high + materiality.topicsCount.high_low}
            </div>
            <p className="text-xs text-muted-foreground">
              De {Object.values(materiality.topicsCount).reduce((a, b) => a + b, 0)} tópicos ESRS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.daysToDeadline}
            </div>
            <p className="text-xs text-muted-foreground">
              días hasta {profile?.year_first_report || 2025}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con análisis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="standards">Estándares</TabsTrigger>
          <TabsTrigger value="materiality">Materialidad</TabsTrigger>
          <TabsTrigger value="evolution">Evolución</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impacto Económico del Bienestar (S1)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reducción rotación</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">-15%</span>
                      <Badge variant="secondary">€25K ahorrados</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reducción absentismo</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">-12%</span>
                      <Badge variant="secondary">€12K ahorrados</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mejora productividad</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">+8%</span>
                      <Badge variant="secondary">€8.2K valor añadido</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gaps Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.criticalGaps > 0 ? (
                    <>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-800">
                            Datos ESRS obligatorios
                          </span>
                          <Badge variant="destructive">{metrics.criticalGaps}</Badge>
                        </div>
                        <Progress value={(metrics.criticalGaps / metrics.totalDataPoints) * 100} className="bg-red-200" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Estos gaps deben ser completados antes del deadline para cumplir con los requisitos mínimos.
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">
                        ¡Sin gaps críticos!
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Todos los datos obligatorios están completados
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cumplimiento por Estándar ESRS</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceByStandard}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={COLORS.primary} name="Actual" />
                  <Bar dataKey="required" fill={COLORS.secondary} name="Requerido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribución de Materialidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={materialityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {materialityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolución del Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="compliance" stroke={COLORS.primary} name="% Compliance" />
                  <Line yAxisId="right" type="monotone" dataKey="dataPoints" stroke={COLORS.accent} name="Datos Completados" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
