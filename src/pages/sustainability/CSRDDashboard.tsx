import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Leaf, AlertTriangle, CheckCircle, Clock, TrendingUp, Settings, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSRDQuickActions } from '@/components/sustainability/CSRDQuickActions';
import { useNavigate } from 'react-router-dom';

const CSRDDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complianceData, setComplianceData] = useState<any>({
    complianceIndex: 0,
    totalDataPoints: 0,
    completedDataPoints: 0,
    pendingTasks: 0,
    criticalTasks: 0,
    daysToDeadline: 0
  });
  const [csrdProfile, setCsrdProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      await Promise.all([
        cargarPerfilCSRD(),
        cargarEstadisticasCompliance()
      ]);
    } catch (error) {
      console.error('Error cargando datos CSRD:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPerfilCSRD = async () => {
    const { data, error } = await supabase
      .from('csrd_profile')
      .select('*')
      .eq('tenant_id', user?.tenant_id)
      .maybeSingle();

    if (error) {
      console.error('Error cargando perfil CSRD:', error);
      return;
    }

    setCsrdProfile(data);
  };

  const cargarEstadisticasCompliance = async () => {
    try {
      // Cargar estadísticas reales de ESRS data points
      const { data: dataPoints, error: dataError } = await supabase
        .from('esrs_data_points')
        .select('id')
        .eq('tenant_id', user?.tenant_id);

      const { data: values, error: valuesError } = await supabase
        .from('esrs_values')
        .select('*')
        .eq('tenant_id', user?.tenant_id)
        .not('value_numeric', 'is', null)
        .not('value_text', 'is', null);

      if (dataError || valuesError) {
        console.error('Error cargando estadísticas:', dataError || valuesError);
        return;
      }

      const totalDataPoints = dataPoints?.length || 0;
      const completedDataPoints = values?.length || 0;
      const complianceIndex = totalDataPoints > 0 
        ? Math.round((completedDataPoints / totalDataPoints) * 100) 
        : 0;

      // Calcular días hasta deadline basado en el año del primer reporte
      const currentYear = new Date().getFullYear();
      const targetYear = csrdProfile?.year_first_report || currentYear + 1;
      const deadline = new Date(targetYear, 2, 31); // 31 de marzo
      const today = new Date();
      const daysToDeadline = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

      setComplianceData({
        complianceIndex,
        totalDataPoints,
        completedDataPoints,
        pendingTasks: totalDataPoints - completedDataPoints,
        criticalTasks: Math.floor((totalDataPoints - completedDataPoints) * 0.1), // 10% críticas
        daysToDeadline
      });
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      // Fallback a datos simulados
      setComplianceData({
        complianceIndex: 0,
        totalDataPoints: 0,
        completedDataPoints: 0,
        pendingTasks: 0,
        criticalTasks: 0,
        daysToDeadline: 365
      });
    }
  };

  const getComplianceColor = (index: number) => {
    if (index >= 80) return 'text-green-600';
    if (index >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (index: number) => {
    if (index >= 80) return 'Excelente';
    if (index >= 60) return 'En Progreso';
    return 'Requiere Atención';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando dashboard CSRD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <h1 className="text-3xl font-bold">Dashboard CSRD</h1>
          {csrdProfile?.year_first_report && (
            <Badge variant="outline">
              Primer Reporte: {csrdProfile.year_first_report}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/sustainability/datahub-esrs')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Data Hub ESRS
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/sustainability/diagnostico-csrd')}>
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Índice de Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              <span className={getComplianceColor(complianceData.complianceIndex)}>
                {complianceData.complianceIndex}%
              </span>
            </div>
            <Progress value={complianceData.complianceIndex} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {getComplianceStatus(complianceData.complianceIndex)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datos ESRS</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceData.completedDataPoints}/{complianceData.totalDataPoints}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((complianceData.completedDataPoints / complianceData.totalDataPoints) * 100)}% completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.pendingTasks}</div>
            <p className="text-xs text-red-600">
              {complianceData.criticalTasks} críticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días al Deadline</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.daysToDeadline}</div>
            <p className="text-xs text-muted-foreground">
              días restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Impacto Económico del Bienestar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Impacto Económico del Bienestar (ESRS S1)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">€45,000</div>
              <p className="text-sm text-muted-foreground">Ahorro anual estimado</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15%</div>
              <p className="text-sm text-muted-foreground">Reducción rotación</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <p className="text-sm text-muted-foreground">Índice de bienestar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Panel */}
      <CSRDQuickActions onRefresh={cargarDatos} complianceData={complianceData} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="standards">Estándares ESRS</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!csrdProfile ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Configuración Requerida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para comenzar con el módulo CSRD, necesitas completar el diagnóstico inicial de tu empresa.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Paso 1: Diagnóstico CSRD</Badge>
                  <Badge variant="outline">Paso 2: Análisis de Materialidad</Badge>
                  <Badge variant="outline">Paso 3: Configurar Data Points ESRS</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Perfil de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tamaño</p>
                    <p className="text-sm text-muted-foreground">{csrdProfile.company_size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sector</p>
                    <p className="text-sm text-muted-foreground">{csrdProfile.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Empleados</p>
                    <p className="text-sm text-muted-foreground">{csrdProfile.employee_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nivel de Aseguramiento</p>
                    <Badge variant="outline">{csrdProfile.assurance_level}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['E1', 'E2', 'E3', 'S1', 'S2', 'S3', 'G1', 'G2'].map((standard) => (
              <Card key={standard}>
                <CardHeader>
                  <CardTitle className="text-lg">{standard}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {standard.startsWith('E') && 'Ambiental'}
                      {standard.startsWith('S') && 'Social'}
                      {standard.startsWith('G') && 'Gobernanza'}
                    </span>
                    <Badge variant="outline">0% completo</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma CSRD 2024-2028</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">2025</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full w-[45%]"></div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Preparación</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">2026</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-secondary rounded-full w-[0%]"></div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Primer Reporte</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">2028</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-muted rounded-full w-[0%]"></div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Aseguramiento Limitado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSRDDashboard;