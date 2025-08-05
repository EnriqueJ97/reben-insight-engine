import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Plus, Edit3, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ESRSDataPoint {
  id: string;
  code: string;
  esrs_standard: string;
  title: string;
  description?: string;
  unit: string;
  data_type: string;
  is_mandatory: boolean;
  owner_role: string;
  source_system: string;
  current_value?: {
    value_numeric?: number;
    value_text?: string;
    value_boolean?: boolean;
    coverage_status: string;
    quality_score?: number;
  };
}

const DataHubESRS = () => {
  const { user } = useAuth();
  const [dataPoints, setDataPoints] = useState<ESRSDataPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<ESRSDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStandard, setFilterStandard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingPoint, setEditingPoint] = useState<ESRSDataPoint | null>(null);

  const standards = ['E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1', 'G2'];

  useEffect(() => {
    if (user) {
      cargarDataPoints();
    }
  }, [user]);

  useEffect(() => {
    aplicarFiltros();
  }, [dataPoints, filterStandard, filterStatus]);

  const cargarDataPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('esrs_data_points')
        .select(`
          *,
          esrs_values:esrs_values!inner (
            value_numeric,
            value_text,
            value_boolean,
            coverage_status,
            quality_score,
            reporting_period
          )
        `)
        .order('code');

      if (error) throw error;

      const pointsWithValues = data?.map(point => ({
        ...point,
        current_value: point.esrs_values?.[0] || {
          coverage_status: 'MISSING'
        }
      })) || [];

      setDataPoints(pointsWithValues);
    } catch (error) {
      console.error('Error cargando data points:', error);
      toast.error('Error al cargar los puntos de datos ESRS');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = dataPoints;

    if (filterStandard !== 'all') {
      filtered = filtered.filter(point => point.esrs_standard === filterStandard);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(point => point.current_value?.coverage_status === filterStatus);
    }

    setFilteredPoints(filtered);
  };

  const actualizarValor = async (pointId: string, value: any, coverageStatus: 'OK' | 'MISSING' | 'ESTIMATE' = 'OK') => {
    try {
      const currentYear = new Date().getFullYear();
      
      const { error } = await supabase
        .from('esrs_values')
        .upsert({
          data_point_id: pointId,
          tenant_id: user?.tenant_id,
          reporting_period: currentYear,
          value_numeric: typeof value === 'number' ? value : null,
          value_text: typeof value === 'string' ? value : null,
          value_boolean: typeof value === 'boolean' ? value : null,
          coverage_status: coverageStatus as any,
          quality_score: coverageStatus === 'OK' ? 95 : 50,
          last_updated_by: user?.id
        });

      if (error) throw error;

      await cargarDataPoints();
      toast.success('Valor actualizado correctamente');
      setEditingPoint(null);
    } catch (error) {
      console.error('Error actualizando valor:', error);
      toast.error('Error al actualizar el valor');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-50';
      case 'ESTIMATE': return 'text-yellow-600 bg-yellow-50';
      case 'MISSING': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle className="w-4 h-4" />;
      case 'ESTIMATE': return <AlertTriangle className="w-4 h-4" />;
      case 'MISSING': return <X className="w-4 h-4" />;
      default: return <X className="w-4 h-4" />;
    }
  };

  const renderValueInput = (point: ESRSDataPoint) => {
    const currentValue = point.current_value;
    
    switch (point.data_type) {
      case 'numeric':
      case 'percentage':
        return (
          <Input
            type="number"
            step="0.01"
            defaultValue={currentValue?.value_numeric}
            placeholder={`Ingresa ${point.unit}`}
            onBlur={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                actualizarValor(point.id, value);
              }
            }}
          />
        );
      case 'text':
        return (
          <Textarea
            defaultValue={currentValue?.value_text}
            placeholder="Ingresa la descripción..."
            onBlur={(e) => {
              if (e.target.value.trim()) {
                actualizarValor(point.id, e.target.value);
              }
            }}
          />
        );
      case 'boolean':
        return (
          <Select
            defaultValue={currentValue?.value_boolean?.toString()}
            onValueChange={(value) => {
              actualizarValor(point.id, value === 'true');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            defaultValue={currentValue?.value_text}
            placeholder="Ingresa el valor..."
            onBlur={(e) => {
              if (e.target.value.trim()) {
                actualizarValor(point.id, e.target.value);
              }
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando Data Hub ESRS...</span>
        </div>
      </div>
    );
  }

  const estadisticas = {
    total: dataPoints.length,
    completos: dataPoints.filter(p => p.current_value?.coverage_status === 'OK').length,
    estimados: dataPoints.filter(p => p.current_value?.coverage_status === 'ESTIMATE').length,
    faltantes: dataPoints.filter(p => p.current_value?.coverage_status === 'MISSING').length
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Data Hub ESRS</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Punto de Datos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Punto de Datos ESRS</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Funcionalidad disponible próximamente
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">Total Puntos de Datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{estadisticas.completos}</div>
            <p className="text-xs text-muted-foreground">Completos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.estimados}</div>
            <p className="text-xs text-muted-foreground">Estimados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{estadisticas.faltantes}</div>
            <p className="text-xs text-muted-foreground">Faltantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterStandard} onValueChange={setFilterStandard}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estándares</SelectItem>
                {standards.map(std => (
                  <SelectItem key={std} value={std}>{std}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="OK">Completos</SelectItem>
                <SelectItem value="ESTIMATE">Estimados</SelectItem>
                <SelectItem value="MISSING">Faltantes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Datos */}
      <Card>
        <CardHeader>
          <CardTitle>Puntos de Datos ESRS ({filteredPoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPoints.map((point) => (
              <div key={point.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{point.code}</Badge>
                      <Badge variant="secondary">{point.esrs_standard}</Badge>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(point.current_value?.coverage_status || 'MISSING')}`}>
                        {getStatusIcon(point.current_value?.coverage_status || 'MISSING')}
                        {point.current_value?.coverage_status || 'MISSING'}
                      </div>
                    </div>
                    <h3 className="font-semibold">{point.title}</h3>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Unidad: {point.unit}</span>
                      <span>Propietario: {point.owner_role}</span>
                      <span>Sistema: {point.source_system}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPoint(point)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="w-full max-w-md">
                  {renderValueInput(point)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edición Avanzada */}
      <Dialog open={!!editingPoint} onOpenChange={(open) => !open && setEditingPoint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Punto de Datos - {editingPoint?.code}</DialogTitle>
          </DialogHeader>
          {editingPoint && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{editingPoint.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{editingPoint.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Valor</label>
                {renderValueInput(editingPoint)}
              </div>
              
              <div>
                <label className="text-sm font-medium">Estado de Cobertura</label>
                <Select
                  defaultValue={editingPoint.current_value?.coverage_status}
                  onValueChange={(value) => {
                    // Actualizar estado solo
                    const currentVal = editingPoint.current_value?.value_numeric || 
                                     editingPoint.current_value?.value_text || 
                                     editingPoint.current_value?.value_boolean;
                    if (currentVal !== undefined) {
                      actualizarValor(editingPoint.id, currentVal, value as 'OK' | 'MISSING' | 'ESTIMATE');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK">Completo</SelectItem>
                    <SelectItem value="ESTIMATE">Estimado</SelectItem>
                    <SelectItem value="MISSING">Faltante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataHubESRS;