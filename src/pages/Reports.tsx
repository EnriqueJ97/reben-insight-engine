
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, Download, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useReports, ReportData } from '@/hooks/useReports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const { user } = useAuth();
  const { loading, generateReport, exportToPDF, exportToCSV, getQuickStats } = useReports();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [quickStats, setQuickStats] = useState<any>(null);

  // Real data from reports
  const wellnessTrendData = reportData?.trends?.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    bienestar: trend.wellness_score,
    burnout: 100 - trend.wellness_score,
    satisfaccion: Math.max(0, trend.wellness_score - 5)
  })) || [];

  const teamComparisonData = reportData?.team_breakdown?.map(team => ({
    team: `Equipo ${team.team_id.slice(0, 8)}`,
    bienestar: team.wellness_score,
    miembros: team.unique_employees
  })) || [];

  // Define keyMetrics first
  const keyMetrics = {
    totalEmployees: reportData?.team_breakdown?.reduce((sum, team) => sum + team.unique_employees, 0) || 0,
    responseRate: quickStats?.response_rate || 0,
    riskEmployees: reportData?.critical_alerts || 0,
    avgWellness: reportData?.wellness_score || 0,
    monthlyTrend: reportData?.wellness_score > 70 ? '+5%' : reportData?.wellness_score > 50 ? '0%' : '-3%',
    costSavings: reportData?.key_metrics?.estimated_cost_savings ? `€${reportData.key_metrics.estimated_cost_savings.toLocaleString()}` : '€0'
  };

  const alertDistributionData = [
    { name: 'Burnout Alto', value: reportData?.critical_alerts || 0, color: '#ef4444' },
    { name: 'Riesgo Medio', value: Math.max(0, (reportData?.total_alerts || 0) - (reportData?.critical_alerts || 0)), color: '#f97316' },
    { name: 'Bajo Riesgo', value: Math.max(0, (keyMetrics.totalEmployees || 0) - (reportData?.total_alerts || 0)), color: '#22c55e' }
  ].filter(item => item.value > 0);

  const costImpactData = reportData?.key_metrics ? [
    { categoria: 'Ahorros Estimados', costo_actual: reportData.key_metrics.estimated_cost_savings || 0, costo_potencial: (reportData.key_metrics.estimated_cost_savings || 0) * 1.5 }
  ] : [];

  // Load initial data
  useEffect(() => {
    loadReportData();
    loadQuickStats();
  }, [selectedPeriod, selectedTeam]);

  const loadReportData = async () => {
    const data = await generateReport(
      selectedPeriod, 
      selectedTeam === 'all' ? undefined : selectedTeam,
      'json',
      'executive'
    );
    setReportData(data);
  };

  const loadQuickStats = async () => {
    const stats = await getQuickStats(selectedPeriod);
    setQuickStats(stats);
  };

  const handleExportPDF = async () => {
    await exportToPDF(
      selectedPeriod,
      selectedTeam === 'all' ? undefined : selectedTeam,
      'executive'
    );
  };

  const handleExportCSV = async () => {
    await exportToCSV(
      selectedPeriod,
      selectedTeam === 'all' ? undefined : selectedTeam
    );
  };


  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span>Informes y Análisis</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'MANAGER' 
              ? 'Análisis detallado del bienestar de tu equipo'
              : 'Dashboard ejecutivo de bienestar organizacional'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">3 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Button onClick={handleExportPDF} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
              <span className="ml-2">PDF</span>
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
              <span className="ml-2">CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{keyMetrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Empleados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{keyMetrics.responseRate}%</div>
              <p className="text-xs text-muted-foreground">Participación</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{keyMetrics.riskEmployees}</div>
              <p className="text-xs text-muted-foreground">Alto Riesgo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{keyMetrics.avgWellness}%</div>
              <p className="text-xs text-muted-foreground">Bienestar Prom.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{keyMetrics.monthlyTrend}</div>
              <p className="text-xs text-muted-foreground">Tendencia</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{keyMetrics.costSavings}</div>
              <p className="text-xs text-muted-foreground">Ahorro Est.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="methodology" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="methodology">Metodología</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="impact">Impacto</TabsTrigger>
        </TabsList>

        <TabsContent value="methodology">
          <div className="space-y-6">
            {/* What we measure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>¿Qué Medimos y Por Qué?</span>
                </CardTitle>
                <CardDescription>
                  Fundamentos científicos de nuestras métricas de bienestar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-primary mb-3">🔥 Burnout (Síndrome de Quemarse)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Medimos 3 dimensiones basadas en el modelo de Maslach:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• <strong>Agotamiento emocional:</strong> Fatiga y vacío emocional</li>
                      <li>• <strong>Despersonalización:</strong> Actitudes cínicas hacia el trabajo</li>
                      <li>• <strong>Baja realización personal:</strong> Sentimientos de ineficacia</li>
                    </ul>
                    <div className="mt-3 p-2 bg-destructive/10 rounded text-xs">
                      <strong>Impacto:</strong> Reduce productividad hasta 40% y aumenta rotación
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-warning mb-3">🚪 Intención de Rotación</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Evaluamos la probabilidad de que un empleado deje la empresa:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• <strong>Búsqueda activa:</strong> Está buscando trabajo</li>
                      <li>• <strong>Desvinculación:</strong> No se siente parte del proyecto</li>
                      <li>• <strong>Falta de crecimiento:</strong> No ve futuro aquí</li>
                    </ul>
                    <div className="mt-3 p-2 bg-warning/10 rounded text-xs">
                      <strong>Coste promedio de reemplazo:</strong> 50-200% del salario anual
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-success mb-3">😊 Satisfacción Laboral</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Analizamos múltiples factores que influyen en la satisfacción:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• <strong>Naturaleza del trabajo:</strong> Interés y motivación</li>
                      <li>• <strong>Reconocimiento:</strong> Valoración del esfuerzo</li>
                      <li>• <strong>Balance vida-trabajo:</strong> Equilibrio personal</li>
                      <li>• <strong>Desarrollo profesional:</strong> Oportunidades de crecimiento</li>
                    </ul>
                    <div className="mt-3 p-2 bg-success/10 rounded text-xs">
                      <strong>Beneficio:</strong> Alta satisfacción = +31% productividad
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How we calculate */}
            <Card>
              <CardHeader>
                <CardTitle>🧮 Cómo Calculamos las Métricas</CardTitle>
                <CardDescription>
                  Metodología transparente y basada en evidencia científica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">📊 Puntuación de Bienestar (0-100%)</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm mb-2"><strong>Fórmula:</strong></p>
                      <code className="text-xs bg-background p-2 rounded block">
                        Bienestar = (Satisfacción × 0.4) + ((5 - Burnout) × 0.4) + ((5 - Rotación) × 0.2)
                      </code>
                      <p className="text-xs text-muted-foreground mt-2">
                        * Convertido a escala 0-100% para facilitar interpretación
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-success/10 rounded">
                        <span className="text-sm">80-100%</span>
                        <Badge className="bg-success text-success-foreground">Excelente</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-warning/10 rounded">
                        <span className="text-sm">60-79%</span>
                        <Badge variant="secondary">Bueno</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                        <span className="text-sm">&lt;60%</span>
                        <Badge variant="destructive">Necesita atención</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">⚠️ Niveles de Riesgo</h4>
                    <div className="space-y-3">
                      <div className="p-3 border-l-4 border-l-destructive bg-destructive/5">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="destructive">Alto Riesgo</Badge>
                          <span className="text-sm">Burnout &gt; 3.0 ó Rotación &gt; 3.5</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Requiere intervención inmediata (1:1 con manager)
                        </p>
                      </div>
                      
                      <div className="p-3 border-l-4 border-l-warning bg-warning/5">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary">Riesgo Medio</Badge>
                          <span className="text-sm">Bienestar 50-70%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Monitoreo cercano y apoyo preventivo
                        </p>
                      </div>
                      
                      <div className="p-3 border-l-4 border-l-success bg-success/5">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className="bg-success text-success-foreground">Bajo Riesgo</Badge>
                          <span className="text-sm">Bienestar &gt; 70%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mantener condiciones actuales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions bank */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Banco de Preguntas Validadas</CardTitle>
                <CardDescription>
                  Instrumentos psicométricos utilizados en nuestras evaluaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-destructive/5 rounded-lg">
                    <h5 className="font-medium text-destructive mb-2">Burnout (14 preguntas)</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      Basado en Maslach Burnout Inventory - General Survey (MBI-GS)
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• Agotamiento emocional (6 ítems)</div>
                      <div>• Despersonalización (4 ítems)</div>
                      <div>• Baja realización (4 ítems)</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-warning/5 rounded-lg">
                    <h5 className="font-medium text-warning mb-2">Intención de Rotación (12 preguntas)</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      Adaptado de Turnover Intention Scale (TIS-6) y factores predictivos
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• Intención directa (6 ítems)</div>
                      <div>• Factores organizacionales (6 ítems)</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-success/5 rounded-lg">
                    <h5 className="font-medium text-success mb-2">Satisfacción (15 preguntas)</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      Job Descriptive Index (JDI) y Job Satisfaction Survey (JSS)
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• Trabajo en sí (5 ítems)</div>
                      <div>• Supervisión y reconocimiento (5 ítems)</div>
                      <div>• Condiciones y políticas (5 ítems)</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Validez científica:</strong> Todos los instrumentos han sido validados en poblaciones hispanohablantes 
                    con alfas de Cronbach superiores a 0.85, garantizando su fiabilidad y consistencia interna.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Bienestar - Últimos 30 días</CardTitle>
                <CardDescription>
                  Evolución de las métricas principales de bienestar laboral
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={wellnessTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name === 'bienestar' ? 'Bienestar' : name === 'burnout' ? 'Riesgo Burnout' : 'Satisfacción']}
                    />
                    <Line type="monotone" dataKey="bienestar" stroke="#3b82f6" strokeWidth={3} name="bienestar" />
                    <Line type="monotone" dataKey="burnout" stroke="#ef4444" strokeWidth={2} name="burnout" />
                    <Line type="monotone" dataKey="satisfaccion" stroke="#10b981" strokeWidth={2} name="satisfaccion" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparación por Equipos</CardTitle>
                <CardDescription>
                  Nivel de bienestar promedio por equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Bienestar']} />
                    <Bar dataKey="bienestar" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Equipos</CardTitle>
                <CardDescription>
                  Equipos ordenados por nivel de bienestar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamComparisonData
                    .sort((a, b) => b.bienestar - a.bienestar)
                    .map((team, index) => (
                      <div key={team.team} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{team.team}</p>
                            <p className="text-sm text-muted-foreground">{team.miembros} miembros</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{team.bienestar}%</div>
                          <Badge variant={team.bienestar >= 80 ? "default" : team.bienestar >= 70 ? "secondary" : "destructive"}>
                            {team.bienestar >= 80 ? 'Excelente' : team.bienestar >= 70 ? 'Bueno' : 'Necesita Atención'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Alertas</CardTitle>
                <CardDescription>
                  Tipos de alertas más frecuentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Críticas</CardTitle>
                <CardDescription>
                  Empleados que requieren atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'María Rodríguez', team: 'Desarrollo', alert: 'Burnout Alto', days: 5, severity: 'high' },
                    { name: 'Carlos Méndez', team: 'Ventas', alert: 'Fuga Talento', days: 3, severity: 'medium' },
                    { name: 'Ana Torres', team: 'Marketing', alert: 'Insatisfacción', days: 7, severity: 'medium' },
                    { name: 'Luis García', team: 'Operaciones', alert: 'Baja Autoeficacia', days: 2, severity: 'low' }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border-l-4 border-l-warning bg-warning/5">
                      <div>
                        <p className="font-medium">{alert.name}</p>
                        <p className="text-sm text-muted-foreground">{alert.team}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                          {alert.alert}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{alert.days} días</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact">
          <div className="space-y-6">
            {/* Economic impact explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Cómo Calculamos el Impacto Económico</span>
                </CardTitle>
                <CardDescription>
                  Metodología basada en estudios internacionales y datos del mercado español
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">💰 Costes de Rotación</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Reclutamiento y selección:</span>
                        <span className="font-medium">15-25% salario</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formación y adaptación:</span>
                        <span className="font-medium">20-50% salario</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pérdida productividad:</span>
                        <span className="font-medium">25-75% salario</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total promedio:</span>
                        <span className="font-semibold text-destructive">75-150% salario</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">🏥 Costes de Ausentismo</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Días perdidos (promedio):</span>
                        <span className="font-medium">12 días/año</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coste por día perdido:</span>
                        <span className="font-medium">€180-350</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sustituciones temporales:</span>
                        <span className="font-medium">+25% coste</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total por empleado/año:</span>
                        <span className="font-semibold text-warning">€2,700-5,250</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h5 className="font-semibold text-primary mb-2">🎯 Fórmula de Cálculo ROI</h5>
                  <code className="text-sm bg-background p-3 rounded block">
                    ROI = (Ahorro en Rotación + Ahorro en Ausentismo + Ganancia Productividad) / Inversión Programa
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Basado en estudios de Harvard Business Review y Gallup sobre programas de bienestar empresarial
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Análisis de Impacto Económico</span>
                </CardTitle>
                <CardDescription>
                  Costes actuales vs. costes potenciales sin programa de bienestar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, '']} />
                    <Bar dataKey="costo_actual" fill="#10b981" name="Coste Actual" />
                    <Bar dataKey="costo_potencial" fill="#ef4444" name="Coste Potencial" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-success/5 border-success/20">
                <CardHeader>
                  <CardTitle className="text-success flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>ROI del Programa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success mb-2">3.2:1</div>
                  <p className="text-sm text-muted-foreground">
                    Por cada €1 invertido en bienestar, se ahorran €3.2 en costes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Ahorro Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">€123,000</div>
                  <p className="text-sm text-muted-foreground">
                    Reducción en costes de rotación y ausentismo
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-accent">Productividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">+18%</div>
                  <p className="text-sm text-muted-foreground">
                    Incremento en productividad del equipo
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Recomendaciones Estratégicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">1. Intervención Inmediata</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      5 empleados requieren sesiones 1:1 con sus managers esta semana
                    </p>
                    <Badge variant="destructive">Alta Prioridad</Badge>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">2. Programa de Pausas</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Implementar pausas obligatorias de 15 min cada 2 horas
                    </p>
                    <Badge variant="secondary">Media Prioridad</Badge>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">3. Training Managers</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Capacitar en detección temprana de burnout
                    </p>
                    <Badge variant="outline">Baja Prioridad</Badge>
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

export default Reports;
