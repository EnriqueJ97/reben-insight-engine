import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mail, Download, FileText, Eye, Calendar, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportVersion {
  id: string;
  version_number: string;
  reporting_period: number;
  status: 'DRAFT' | 'SUBMITTED' | 'QA' | 'FINAL';
  generated_by: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

const ReportesCSRD = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    completedDataPoints: 0,
    totalDataPoints: 0,
    complianceIndex: 0
  });

  useEffect(() => {
    if (user) {
      cargarReportes();
      cargarEstadisticas();
    }
  }, [user]);

  const cargarReportes = async () => {
    try {
      const { data, error } = await supabase
        .from('report_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      // Cargar estadísticas de puntos de datos
      const { data: dataPoints, error: dpError } = await supabase
        .from('esrs_data_points')
        .select('id');

      if (dpError) throw dpError;

      const { data: values, error: valError } = await supabase
        .from('esrs_values')
        .select('data_point_id, coverage_status')
        .eq('coverage_status', 'OK');

      if (valError) throw valError;

      const total = dataPoints?.length || 0;
      const completed = values?.length || 0;
      const complianceIndex = total > 0 ? Math.round((completed / total) * 100) : 0;

      setEstadisticas({
        totalDataPoints: total,
        completedDataPoints: completed,
        complianceIndex
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const generarReporte = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const newVersion = `v${reports.length + 1}.0`;

      const { data, error } = await supabase
        .from('report_versions')
        .insert({
          tenant_id: user?.tenant_id,
          version_number: newVersion,
          reporting_period: currentYear,
          status: 'DRAFT',
          generated_by: user?.id,
          metadata: {
            generated_at: new Date().toISOString(),
            compliance_index: estadisticas.complianceIndex,
            total_data_points: estadisticas.totalDataPoints,
            completed_data_points: estadisticas.completedDataPoints
          }
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINAL': return 'bg-green-100 text-green-800';
      case 'QA': return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FINAL': return 'Final';
      case 'QA': return 'En Revisión';
      case 'SUBMITTED': return 'Enviado';
      default: return 'Borrador';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando reportes CSRD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Reportes CSRD</h1>
        </div>
        
        <Button onClick={generarReporte}>
          <FileText className="w-4 h-4 mr-2" />
          Generar Nuevo Reporte
        </Button>
      </div>

      {/* Resumen de Preparación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estado de Preparación del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Índice de Compliance</span>
                <span className="text-sm text-muted-foreground">{estadisticas.complianceIndex}%</span>
              </div>
              <Progress value={estadisticas.complianceIndex} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {estadisticas.completedDataPoints} de {estadisticas.totalDataPoints} puntos completos
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Estado General</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Datos Ambientales (E)</span>
                  <Badge variant="outline">30%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Datos Sociales (S)</span>
                  <Badge variant="secondary">75%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Datos de Gobernanza (G)</span>
                  <Badge variant="outline">45%</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Próximos Hitos</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline Q1 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Revisión Q4 2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reportes Generados</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="schedule">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes ({reports.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">Reporte CSRD {report.version_number}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {getStatusLabel(report.status)}
                            </Badge>
                            <Badge variant="outline">
                              Periodo: {report.reporting_period}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Generado:</span>
                              <br />
                              {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Actualizado:</span>
                              <br />
                              {new Date(report.updated_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Compliance:</span>
                              <br />
                              {report.metadata?.compliance_index || 0}%
                            </div>
                            <div>
                              <span className="font-medium">Datos:</span>
                              <br />
                              {report.metadata?.completed_data_points || 0} / {report.metadata?.total_data_points || 0}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                          {report.status === 'FINAL' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              XHTML
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay reportes generados aún</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Genera tu primer reporte CSRD cuando tengas suficientes datos completados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Plantilla ESRS Estándar</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Plantilla completa con todos los estándares ESRS requeridos
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Plantilla XBRL</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Etiquetas XBRL para cumplimiento ESEF
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Reporting CSRD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">2024 - Año de Preparación</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diagnóstico inicial</span>
                      <Badge variant="default">Completado</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Análisis de materialidad</span>
                      <Badge variant="secondary">En progreso</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recolección de datos base</span>
                      <Badge variant="outline">Pendiente</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">2025 - Primer Reporte</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completar recolección de datos</span>
                      <Badge variant="outline">Q1 2025</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Generación reporte borrador</span>
                      <Badge variant="outline">Q2 2025</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revisión y finalización</span>
                      <Badge variant="outline">Q3 2025</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Publicación reporte final</span>
                      <Badge variant="outline">Q4 2025</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportesCSRD;