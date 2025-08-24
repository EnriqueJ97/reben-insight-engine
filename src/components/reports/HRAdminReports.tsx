import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Download, 
  Filter,
  Globe,
  Building,
  FileText,
  Shield,
  Search,
  Settings,
  Eye,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useReports } from '@/hooks/useReports';
import { useTeamReports } from '@/hooks/useTeamReports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

const HRAdminReports = () => {
  const { user } = useAuth();
  const { loading: reportsLoading, exportToPDF, exportToCSV } = useReports();
  const { loading: teamLoading, reportData, getTeamReports } = useTeamReports();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedScope, setSelectedScope] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Advanced filters
  const [filters, setFilters] = useState({
    ageRange: '',
    tenure: '',
    gender: '',
    contractType: '',
    department: '',
    location: ''
  });

  const loading = reportsLoading || teamLoading;

  // Global metrics
  const globalMetrics = {
    totalEmployees: reportData?.team_breakdown?.reduce((sum, team) => sum + team.unique_employees, 0) || 0,
    totalTeams: reportData?.team_breakdown?.length || 0,
    avgWellness: reportData?.wellness_score || 0,
    criticalAlerts: reportData?.critical_alerts || 0,
    participationRate: 78,
    retentionRate: 94,
    costSavings: 125000
  };

  // Team comparison data
  const teamComparisonData = reportData?.team_breakdown?.map(team => ({
    id: team.id,
    name: team.team_name || team.name,
    members: team.unique_employees,
    wellness: Math.round(team.wellness_score),
    participation: Math.round(((team.member_count || 0) / team.unique_employees) * 100), // Mock calculation
    alerts: Math.floor(Math.random() * 5), // Mock data - replace with real data
    riskLevel: team.wellness_score >= 80 ? 'low' : team.wellness_score >= 60 ? 'medium' : 'high'
  })) || [];

  // Organizational trends
  const organizationalTrends = reportData?.trends?.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    bienestar: Math.round(trend.wellness_score),
    participacion: Math.round(Math.random() * 20 + 70), // Mock data
    rotacion: Math.round(Math.random() * 10 + 5) // Mock data
  })) || [];

  // Demographics distribution (mock data)
  const demographicsData = [
    { name: '18-25', value: 15, color: '#3b82f6' },
    { name: '26-35', value: 35, color: '#10b981' },
    { name: '36-45', value: 30, color: '#f59e0b' },
    { name: '46-55', value: 15, color: '#ef4444' },
    { name: '56+', value: 5, color: '#8b5cf6' }
  ];

  const departmentData = [
    { dept: 'Desarrollo', wellness: 85, members: 45, alerts: 2 },
    { dept: 'Operaciones', wellness: 68, members: 32, alerts: 8 },
    { dept: 'Marketing', wellness: 78, members: 23, alerts: 3 },
    { dept: 'Ventas', wellness: 72, members: 28, alerts: 5 },
    { dept: 'RRHH', wellness: 88, members: 12, alerts: 0 }
  ];

  // Load initial data
  useEffect(() => {
    if (user) {
      getTeamReports(selectedPeriod);
    }
  }, [user, selectedPeriod]);

  const handleExportExecutive = async () => {
    await exportToPDF(selectedPeriod, undefined, 'executive');
    toast({
      title: "Reporte ejecutivo exportado",
      description: "Resumen para la dirección generado exitosamente"
    });
  };

  const handleExportCompliance = async () => {
    await exportToPDF(selectedPeriod, undefined, 'detailed');
    toast({
      title: "Reporte de compliance exportado",
      description: "Documento para auditorías y cumplimiento normativo"
    });
  };

  const handleExportCSRD = async () => {
    await exportToPDF(selectedPeriod, undefined, 'detailed');
    toast({
      title: "Reporte CSRD exportado", 
      description: "Datos preparados para reporting de sostenibilidad"
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Analytics Organizacional</h1>
            <Badge variant="outline">HR Admin</Badge>
          </div>
          <p className="text-muted-foreground">
            Análisis avanzado y comparativo del bienestar organizacional
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
          <Select value={selectedScope} onValueChange={setSelectedScope}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda la Organización</SelectItem>
              <SelectItem value="departments">Por Departamentos</SelectItem>
              <SelectItem value="regions">Por Regiones</SelectItem>
              <SelectItem value="teams">Por Equipos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{globalMetrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Empleados Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-info">{globalMetrics.totalTeams}</div>
              <p className="text-xs text-muted-foreground">Equipos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className={`text-2xl font-bold ${
                globalMetrics.avgWellness >= 80 ? 'text-success' : 
                globalMetrics.avgWellness >= 60 ? 'text-warning' : 'text-destructive'
              }`}>
                {Math.round(globalMetrics.avgWellness)}%
              </div>
              <p className="text-xs text-muted-foreground">Bienestar Global</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">{globalMetrics.participationRate}%</div>
              <p className="text-xs text-muted-foreground">Participación</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-destructive">{globalMetrics.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Alertas Críticas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-accent">€{globalMetrics.costSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ahorro Anual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vista Global</TabsTrigger>
          <TabsTrigger value="comparative">Comparativa</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="exports">Exportaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Organizational Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Organizacionales</CardTitle>
              <CardDescription>
                Evolución de métricas clave a nivel empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={organizationalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
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
                      dataKey="participacion" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Participación"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rotacion" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Rotación"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {demographicsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bienestar por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dept" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="wellness" fill="#3b82f6" name="Bienestar %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-6">
          {/* Advanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avanzados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="ageRange">Rango de Edad</Label>
                  <Select value={filters.ageRange} onValueChange={(value) => setFilters({...filters, ageRange: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="26-35">26-35</SelectItem>
                      <SelectItem value="36-45">36-45</SelectItem>
                      <SelectItem value="46+">46+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tenure">Antigüedad</Label>
                  <Select value={filters.tenure} onValueChange={(value) => setFilters({...filters, tenure: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="0-1">0-1 años</SelectItem>
                      <SelectItem value="1-3">1-3 años</SelectItem>
                      <SelectItem value="3-5">3-5 años</SelectItem>
                      <SelectItem value="5+">5+ años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={filters.gender} onValueChange={(value) => setFilters({...filters, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contractType">Tipo Contrato</Label>
                  <Select value={filters.contractType} onValueChange={(value) => setFilters({...filters, contractType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="dev">Desarrollo</SelectItem>
                      <SelectItem value="ops">Operaciones</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="madrid">Madrid</SelectItem>
                      <SelectItem value="barcelona">Barcelona</SelectItem>
                      <SelectItem value="valencia">Valencia</SelectItem>
                      <SelectItem value="remote">Remoto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Equipos</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento por equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamComparisonData.map((team, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getRiskBg(team.riskLevel)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">{team.members} miembros</p>
                        </div>
                        <div>
                          <p className={`font-bold ${getRiskColor(team.riskLevel)}`}>{team.wellness}%</p>
                          <p className="text-xs text-muted-foreground">Bienestar</p>
                        </div>
                        <div>
                          <p className="font-bold">{team.participation}%</p>
                          <p className="text-xs text-muted-foreground">Participación</p>
                        </div>
                        <div>
                          <p className={`font-bold ${team.alerts > 0 ? 'text-destructive' : 'text-success'}`}>
                            {team.alerts}
                          </p>
                          <p className="text-xs text-muted-foreground">Alertas</p>
                        </div>
                        <div>
                          <Badge className={`${getRiskBg(team.riskLevel)} ${getRiskColor(team.riskLevel)} border-0`}>
                            {team.riskLevel === 'high' ? 'Alto Riesgo' : 
                             team.riskLevel === 'medium' ? 'Riesgo Medio' : 'Bajo Riesgo'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Analizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Correlation Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Correlaciones</CardTitle>
                <CardDescription>
                  Relación entre bienestar y productividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Bienestar → Productividad</span>
                    <span className="font-bold text-success">+0.78</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Participación → Retención</span>
                    <span className="font-bold text-success">+0.65</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Burnout → Rotación</span>
                    <span className="font-bold text-destructive">+0.82</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Check-ins → Satisfacción</span>
                    <span className="font-bold text-info">+0.58</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Predicciones de Riesgo</CardTitle>
                <CardDescription>
                  Análisis predictivo próximos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Riesgo Alto Burnout</span>
                      <Badge variant="destructive">8 empleados</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Intervención recomendada en 48h
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Posible Rotación</span>
                      <Badge variant="outline">3 empleados</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seguimiento recomendado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cumplimiento Normativo
              </CardTitle>
              <CardDescription>
                Estado del cumplimiento de regulaciones laborales y de bienestar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Auditoría de Bienestar</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Evaluaciones regulares</span>
                      <Badge variant="default">Cumple</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Privacidad de datos</span>
                      <Badge variant="default">GDPR Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Intervenciones documentadas</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Reporting CSRD</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Métricas sociales</span>
                      <Badge variant="default">Listo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Diversidad e inclusión</span>
                      <Badge variant="default">Completo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bienestar laboral</span>
                      <Badge variant="default">Actualizado</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reporte Ejecutivo</CardTitle>
                <CardDescription>
                  Resumen para dirección y stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="text-sm space-y-1">
                    <li>• KPIs organizacionales</li>
                    <li>• Tendencias y insights</li>
                    <li>• Recomendaciones estratégicas</li>
                    <li>• ROI del bienestar</li>
                  </ul>
                  <Button className="w-full" onClick={handleExportExecutive}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance & Auditoría</CardTitle>
                <CardDescription>
                  Documentación para auditorías internas/externas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="text-sm space-y-1">
                    <li>• Datos detallados por empleado</li>
                    <li>• Intervenciones realizadas</li>
                    <li>• Cumplimiento normativo</li>
                    <li>• Trazabilidad completa</li>
                  </ul>
                  <Button className="w-full" onClick={handleExportCompliance}>
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Compliance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSRD Sustainability</CardTitle>
                <CardDescription>
                  Datos para reporting de sostenibilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="text-sm space-y-1">
                    <li>• Métricas sociales S1-S4</li>
                    <li>• Diversidad e inclusión</li>
                    <li>• Condiciones laborales</li>
                    <li>• Formación y desarrollo</li>
                  </ul>
                  <Button className="w-full" onClick={handleExportCSRD}>
                    <Globe className="h-4 w-4 mr-2" />
                    Exportar CSRD
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRAdminReports;