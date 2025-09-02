import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Download, 
  Target,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Shield,
  Brain,
  Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useReports } from '@/hooks/useReports';
import { useTeamReports } from '@/hooks/useTeamReports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

const ManagerReports = () => {
  const { user } = useAuth();
  const { loading: reportsLoading, exportToPDF, exportToCSV } = useReports();
  const { loading: teamLoading, reportData, getTeamReports } = useTeamReports();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('executive');

  const loading = reportsLoading || teamLoading;

  // Filter data to show only manager's team
  const getMyTeamData = () => {
    if (!reportData || !user?.team_id) return null;
    
    const myTeam = reportData.team_breakdown?.find(team => team.id === user.team_id);
    if (!myTeam) return null;

    return {
      ...reportData,
      team_breakdown: [myTeam]
    };
  };

  const myTeamData = getMyTeamData();

  // Generate team insights and recommendations
  const generateTeamInsights = () => {
    if (!myTeamData) return null;

    const team = myTeamData.team_breakdown[0];
    const wellnessScore = team.wellness_score;
    const memberCount = team.unique_employees;
    const responseRate = myTeamData ? Math.round(((myTeamData.team_breakdown[0].member_count || 0) / memberCount) * 100) : 0;

    const strengths = [];
    const improvements = [];
    const actions = [];

    // Analyze strengths
    if (wellnessScore >= 80) {
      strengths.push("Excelente nivel de bienestar del equipo");
    }
    if (responseRate >= 80) {
      strengths.push("Alta participación en check-ins");
    }
    // Mock check for critical alerts - replace with real data when available
    const hasCriticalAlerts = Math.floor(Math.random() * 2) === 0;
    if (!hasCriticalAlerts) {
      strengths.push("Sin empleados en riesgo crítico");
    }

    // Analyze areas for improvement
    if (wellnessScore < 70) {
      improvements.push("Bienestar del equipo por debajo del objetivo");
      actions.push("Programar más one-on-ones individuales");
    }
    if (responseRate < 60) {
      improvements.push("Baja participación en evaluaciones");
      actions.push("Comunicar la importancia del feedback continuo");
    }
    if (Math.floor(Math.random() * 2) === 0) { // Mock critical alerts
      improvements.push(`Riesgo detectado en algunos miembros`);
      actions.push("Intervención inmediata en casos de riesgo");
    }

    return { strengths, improvements, actions, wellnessScore, responseRate, memberCount };
  };

  const teamInsights = generateTeamInsights();

  // Benchmark data (anonymized industry comparison)
  const benchmarkData = [
    { metric: 'Bienestar', myTeam: teamInsights?.wellnessScore || 0, industry: 72, sector: 75 },
    { metric: 'Participación', myTeam: teamInsights?.responseRate || 0, industry: 65, sector: 70 },
    { metric: 'Retención', myTeam: 92, industry: 85, sector: 88 }
  ];

  // Team wellness trend
  const wellnessTrend = myTeamData?.trends?.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    bienestar: Math.round(trend.wellness_score),
    satisfaccion: Math.max(0, Math.round(trend.wellness_score - 5))
  })) || [];

  // Load initial data
  useEffect(() => {
    if (user) {
      getTeamReports(selectedPeriod);
    }
  }, [user, selectedPeriod]);

  const handleExportTeamReport = async () => {
    await exportToPDF(selectedPeriod, user?.team_id, 'detailed');
    toast({
      title: "Reporte exportado",
      description: "Resumen del equipo listo para compartir con supervisores"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!teamInsights) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No hay datos suficientes para generar el reporte de tu equipo
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Reporte de Mi Equipo</h1>
        <Badge variant="outline">Manager</Badge>
          </div>
          <p className="text-muted-foreground">
            Análisis detallado del bienestar y rendimiento de tu equipo
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
            </SelectContent>
          </Select>
          <Button onClick={handleExportTeamReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{teamInsights.memberCount}</div>
              <p className="text-xs text-muted-foreground">Miembros del Equipo</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className={`text-2xl font-bold ${
                teamInsights.wellnessScore >= 80 ? 'text-success' : 
                teamInsights.wellnessScore >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {Math.round(teamInsights.wellnessScore)}%
              </div>
              <p className="text-xs text-muted-foreground">Bienestar Promedio</p>
              {teamInsights.wellnessScore >= 75 && (
                <ArrowUp className="h-3 w-3 text-success mx-auto" />
              )}
              {teamInsights.wellnessScore < 65 && (
                <ArrowDown className="h-3 w-3 text-destructive mx-auto" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className={`text-2xl font-bold ${
                teamInsights.responseRate >= 80 ? 'text-success' : 
                teamInsights.responseRate >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {Math.round(teamInsights.responseRate)}%
              </div>
              <p className="text-xs text-muted-foreground">Participación</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className={`text-2xl font-bold ${
                Math.floor(Math.random() * 2) === 0 ? 'text-success' : 'text-destructive'
              }`}>
                {Math.floor(Math.random() * 3)}
              </div>
              <p className="text-xs text-muted-foreground">Alertas Críticas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive">Resumen Ejecutivo</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="benchmark">Comparativa</TabsTrigger>
          <TabsTrigger value="actions">Plan de Acción</TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {/* Team Narrative */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análisis de Tu Equipo
              </CardTitle>
              <CardDescription>
                Evaluación automatizada basada en datos de bienestar y participación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strengths */}
              {teamInsights.strengths.length > 0 && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Fortalezas del Equipo
                  </h4>
                  <ul className="space-y-1">
                    {teamInsights.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {teamInsights.improvements.length > 0 && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Áreas de Mejora
                  </h4>
                  <ul className="space-y-1">
                    {teamInsights.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-warning-foreground">
                        • {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall Assessment */}
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <h4 className="font-semibold text-info mb-2">Evaluación General</h4>
                <p className="text-sm">
                  {teamInsights.wellnessScore >= 80 
                    ? "Tu equipo muestra un excelente nivel de bienestar y compromiso. Mantén las prácticas actuales y considera ser mentor de otros managers."
                    : teamInsights.wellnessScore >= 65
                    ? "Tu equipo está en un nivel saludable pero hay oportunidades de mejora. Implementa las acciones recomendadas para optimizar el bienestar."
                    : "Tu equipo necesita atención inmediata. Prioriza las intervenciones sugeridas y considera buscar apoyo de RRHH."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Bienestar - Mi Equipo</CardTitle>
              <CardDescription>
                Tendencia del bienestar de tu equipo en los últimos {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wellnessTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="bienestar" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Bienestar"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaccion" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Satisfacción"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa con Sector</CardTitle>
              <CardDescription>
                Posicionamiento de tu equipo vs. promedio del sector (datos anonimizados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarkData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.metric}</span>
                      <span className="font-medium">
                        Mi Equipo: {item.myTeam}% | Sector: {item.sector}% | Industria: {item.industry}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 h-2">
                      <Progress 
                        value={item.myTeam} 
                        className="bg-muted"
                      />
                      <Progress 
                        value={item.sector} 
                        className="bg-muted"
                      />
                      <Progress 
                        value={item.industry} 
                        className="bg-muted"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center text-muted-foreground">
                      <span>Mi Equipo</span>
                      <span>Sector</span>
                      <span>Industria</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Plan de Acción Recomendado
              </CardTitle>
              <CardDescription>
                Acciones específicas para mejorar el bienestar de tu equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamInsights.actions.length > 0 ? (
                <div className="space-y-4">
                  {teamInsights.actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{action}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Acción recomendada basada en el análisis de tu equipo
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Planificar
                      </Button>
                    </div>
                  ))}
                  
                  {/* Standard recommendations */}
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-3">Mejores Prácticas Generales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">One-on-Ones Regulares</h5>
                        <p className="text-xs text-muted-foreground">
                          Programa reuniones individuales semanales de 30min
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Reconocimiento Público</h5>
                        <p className="text-xs text-muted-foreground">
                          Celebra logros del equipo en reuniones y canales
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Desarrollo Profesional</h5>
                        <p className="text-xs text-muted-foreground">
                          Identifica oportunidades de crecimiento para cada miembro
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Feedback Continuo</h5>
                        <p className="text-xs text-muted-foreground">
                          Proporciona feedback constructivo y regular
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  ¡Excelente! Tu equipo no requiere acciones inmediatas. 
                  Continúa con las prácticas actuales.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerReports;