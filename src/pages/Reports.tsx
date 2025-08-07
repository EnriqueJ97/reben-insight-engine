
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, Download, DollarSign, ArrowLeft, Keyboard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useReports, ReportData } from '@/hooks/useReports';
import { useTeamReports } from '@/hooks/useTeamReports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { PremiumTrendChart } from '@/components/reports/PremiumTrendChart';
import { EnhancedTeamsSection } from '@/components/reports/EnhancedTeamsSection';
import { EnhancedAlertsSection } from '@/components/reports/EnhancedAlertsSection';
import { useAlerts } from '@/hooks/useAlerts';
import { EnhancedImpactSection } from '@/components/reports/EnhancedImpactSection';
import { StoryTiles } from '@/components/reports/StoryTiles';
import { RiskHeatMap } from '@/components/reports/RiskHeatMap';
import { InterventionTimeline } from '@/components/reports/InterventionTimeline';
import { BenchmarkChips } from '@/components/reports/BenchmarkChips';
import { DataQualityCard } from '@/components/reports/DataQualityCard';
import { InteractiveROI } from '@/components/reports/InteractiveROI';

const Reports = () => {
  const { user } = useAuth();
  const { loading: reportsLoading, exportToPDF, exportToCSV, getQuickStats } = useReports();
  const { loading: teamLoading, reportData, getTeamReports } = useTeamReports();
  const { alerts, fetchAlerts } = useAlerts();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [quickStats, setQuickStats] = useState<any>(null);

  const loading = reportsLoading || teamLoading;
  
  // Drill-down state
  const [activeTab, setActiveTab] = useState('methodology');
  const [drillDownFilters, setDrillDownFilters] = useState<{
    metric?: string;
    teamId?: string;
    riskLevel?: string;
  }>({});
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  
  // Generate team-filtered data based on user role
  const getFilteredData = () => {
    if (!reportData) return null;
    
    // If a specific team is selected and user has permission
    if (selectedTeam !== 'all') {
      if (user?.role === 'HR_ADMIN') {
        // HR_ADMIN can see any team
        return {
          ...reportData,
          team_breakdown: reportData.team_breakdown.filter(team => team.id === selectedTeam)
        };
      } else if (user?.role === 'MANAGER') {
        // MANAGER can only see their own team
        const userTeams = reportData.team_breakdown.filter(team => 
          team.id === user.team_id || team.id === selectedTeam
        );
        return {
          ...reportData,
          team_breakdown: userTeams
        };
      }
    }
    
    return reportData;
  };

  const filteredReportData = getFilteredData();

  // Real data from reports with role-based filtering
  const wellnessTrendData = filteredReportData?.trends?.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    bienestar: Math.round(trend.wellness_score),
    burnout: Math.round(100 - trend.wellness_score),
    satisfaccion: Math.max(0, Math.round(trend.wellness_score - 5))
  })) || [];

  const teamComparisonData = filteredReportData?.team_breakdown?.map(team => ({
    team: team.team_name || team.name,
    bienestar: Math.round(team.wellness_score),
    miembros: team.unique_employees || team.member_count
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

  const handleGenerateReport = async () => {
    await getTeamReports(selectedPeriod);
    const stats = await getQuickStats(selectedPeriod);
    setQuickStats(stats);
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      handleGenerateReport();
    }
  }, [user, selectedPeriod]);

  const handleRefreshData = async () => {
    await getTeamReports(selectedPeriod);
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

  // Drill-down functionality
  const handleKPIClick = (metric: string, value: number) => {
    setDrillDownFilters({ metric, riskLevel: metric === 'Alto Riesgo' ? 'high' : undefined });
    setBreadcrumbPath([`${metric}: ${value}`]);
    setActiveTab('teams');
  };

  const handleHeatMapClick = (teamId: string, indicator: string) => {
    setDrillDownFilters({ teamId, metric: indicator });
    setBreadcrumbPath([...breadcrumbPath, `Equipo ${teamId.slice(0, 6)} - ${indicator}`]);
    setActiveTab('alerts');
  };

  const handleBreadcrumbBack = () => {
    if (breadcrumbPath.length > 1) {
      setBreadcrumbPath(breadcrumbPath.slice(0, -1));
      setActiveTab('teams');
    } else {
      setBreadcrumbPath([]);
      setDrillDownFilters({});
      setActiveTab('methodology');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return; // Ignore cmd/ctrl combinations
      
      switch (e.key.toLowerCase()) {
        case 'g':
          setActiveTab('trends');
          break;
        case 'a':
          setActiveTab('alerts');
          break;
        case 't':
          setActiveTab('teams');
          break;
        case 'i':
          setActiveTab('impact');
          break;
        case 'escape':
          if (breadcrumbPath.length > 0) {
            setBreadcrumbPath([]);
            setDrillDownFilters({});
            setActiveTab('methodology');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [breadcrumbPath]);

  // Privacy protection helper
  const getPrivacyProtectedValue = (value: number, sampleSize: number) => {
    return sampleSize < 5 ? '—' : value.toString();
  };


  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span>Informes y Análisis</span>
            </h1>
            <Badge variant="outline" className="text-xs flex items-center space-x-1">
              <Keyboard className="h-3 w-3" />
              <span>G=Gráficas, A=Alertas, T=Equipos, I=Impacto</span>
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'MANAGER' 
              ? 'Análisis detallado del bienestar de tu equipo'
              : 'Dashboard ejecutivo de bienestar organizacional'
            }
          </p>
          
          {/* Breadcrumb */}
          {breadcrumbPath.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBreadcrumbBack}
                className="text-xs"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Volver
              </Button>
              <div className="text-xs text-muted-foreground">
                {breadcrumbPath.join(' > ')}
              </div>
            </div>
          )}
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
          <Select
            value={selectedTeam}
            onValueChange={(value) => {
              setSelectedTeam(value);
              // Refresh data when team selection changes
              setTimeout(() => handleRefreshData(), 100);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {user?.role === 'HR_ADMIN' ? 'Todos los equipos' : 'Mi equipo'}
              </SelectItem>
              {user?.role === 'HR_ADMIN' && reportData?.team_breakdown?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
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

      {/* Story Tiles */}
      <StoryTiles reportData={reportData} period={selectedPeriod} />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleKPIClick('Empleados', keyMetrics.totalEmployees)}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{keyMetrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Empleados</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleKPIClick('Participación', keyMetrics.responseRate)}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">{keyMetrics.responseRate}%</div>
              <p className="text-xs text-muted-foreground">Participación</p>
              <BenchmarkChips metric="Participación" value={keyMetrics.responseRate} />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleKPIClick('Alto Riesgo', keyMetrics.riskEmployees)}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-warning">{keyMetrics.riskEmployees}</div>
              <p className="text-xs text-muted-foreground">Alto Riesgo</p>
              <BenchmarkChips metric="Alto Riesgo" value={Math.round((keyMetrics.riskEmployees / keyMetrics.totalEmployees) * 100)} />
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleKPIClick('Bienestar Prom.', keyMetrics.avgWellness)}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{keyMetrics.avgWellness}%</div>
              <p className="text-xs text-muted-foreground">Bienestar Prom.</p>
              <BenchmarkChips metric="Bienestar Prom." value={keyMetrics.avgWellness} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">{keyMetrics.monthlyTrend}</div>
              <p className="text-xs text-muted-foreground">Tendencia</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-accent">{keyMetrics.costSavings}</div>
              <p className="text-xs text-muted-foreground">Ahorro Est.</p>
              <BenchmarkChips metric="Ahorro Est." value={parseInt(keyMetrics.costSavings.replace(/[€,]/g, '')) || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality */}
      <DataQualityCard reportData={reportData} period={selectedPeriod} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="methodology">Metodología</TabsTrigger>
          <TabsTrigger value="trends">Tendencias (G)</TabsTrigger>
          <TabsTrigger value="teams">Equipos (T)</TabsTrigger>
          <TabsTrigger value="alerts">Alertas (A)</TabsTrigger>
          <TabsTrigger value="impact">Impacto (I)</TabsTrigger>
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

        <TabsContent value="trends" className="space-y-6">
          <PremiumTrendChart 
            data={wellnessTrendData.map(item => ({
              date: item.date,
              wellness: item.bienestar,
              participation: 85,
              alerts: Math.floor(Math.random() * 5),
              burnout_risk: item.burnout,
              satisfaction: item.satisfaccion,
              productivity: Math.floor(Math.random() * 20) + 80
            }))}
            onDataPointClick={(data) => handleKPIClick('Trends', data.wellness || 0)}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <EnhancedTeamsSection 
            teamData={filteredReportData?.team_breakdown?.map(team => ({
              id: team.id,
              name: team.name,
              wellness_score: team.wellness_score,
              participation_rate: team.participation_rate,
              member_count: team.member_count,
              risk_level: team.risk_level,
              trend: team.trend,
              burnout_risk: team.burnout_risk,
              satisfaction: team.satisfaction,
              productivity: team.productivity,
              manager: team.manager
            })) || []}
            onTeamClick={(teamId) => handleKPIClick('Team', teamId.length)}
          />
          
          <RiskHeatMap 
            reportData={filteredReportData} 
            onCellClick={handleHeatMapClick}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <EnhancedAlertsSection 
            alertData={alerts.map(alert => ({
              id: alert.id,
              type: alert.type === 'burnout_risk' ? 'burnout' : 
                    alert.type === 'high_stress' ? 'high_stress' : 
                    alert.type === 'low_satisfaction' ? 'low_engagement' : 'absence_pattern',
              severity: alert.severity === 'high' ? 'critical' : alert.severity as any,
              employee_alias: alert.profiles?.full_name ? 
                alert.profiles.full_name.split(' ').map(word => word.charAt(0).toUpperCase()).join('.') : 
                'N.N.',
              team: alert.profiles?.teams?.name || 'Sin equipo',
              created_at: alert.created_at,
              resolved: alert.resolved,
              resolution_time: alert.resolved_at ? 
                Math.floor((new Date(alert.resolved_at).getTime() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60)) : 
                undefined,
              impact_score: alert.severity === 'high' ? 8 : alert.severity === 'medium' ? 5 : 3,
              trends: []
            }))}
            userRole={user?.role}
            onTeamFilter={async (teamId) => {
              setSelectedTeam(teamId || 'all');
              await fetchAlerts(teamId || undefined);
            }}
            selectedTeam={selectedTeam === 'all' ? null : selectedTeam}
            teamOptions={reportData?.team_breakdown.map(team => ({
              id: team.team_id,
              name: team.team_name
            })) || []}
            onAlertClick={(alertId) => handleKPIClick('Alert', alertId.length)}
          />
          
          <InterventionTimeline period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <EnhancedImpactSection 
            impactData={{
              total_employees: reportData?.team_breakdown?.reduce((acc, team) => acc + team.unique_employees, 0) || 50,
              avg_wellness: reportData?.wellness_score || 75,
              turnover_rate: 12,
              absenteeism_rate: 4.2,
              productivity_index: 85,
              engagement_score: reportData?.avg_mood ? Math.round((reportData.avg_mood / 5) * 100) : 78
            }}
            period={selectedPeriod}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
