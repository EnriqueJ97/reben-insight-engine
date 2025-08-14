import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CSRDQuickActionsProps {
  onRefresh: () => void;
  complianceData: any;
}

export const CSRDQuickActions = ({ onRefresh, complianceData }: CSRDQuickActionsProps) => {
  const { user } = useAuth();
  const [showDataPointDialog, setShowDataPointDialog] = useState(false);
  const [newDataPoint, setNewDataPoint] = useState({
    code: '',
    title: '',
    description: '',
    esrs_standard: 'S1',
    unit: '',
    data_type: 'numeric'
  });

  const handleCreateDataPoint = async () => {
    try {
      const { error } = await supabase
        .from('esrs_data_points')
        .insert({
          ...newDataPoint,
          tenant_id: user?.tenant_id,
          is_mandatory: false,
          owner_role: 'HR_ADMIN',
          source_system: 'manual'
        });

      if (error) throw error;

      toast.success('Data point creado correctamente');
      setShowDataPointDialog(false);
      setNewDataPoint({
        code: '',
        title: '',
        description: '',
        esrs_standard: 'S1',
        unit: '',
        data_type: 'numeric'
      });
      onRefresh();
    } catch (error) {
      console.error('Error creando data point:', error);
      toast.error('Error al crear el data point');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const { error } = await supabase
        .from('report_versions')
        .insert({
          tenant_id: user?.tenant_id,
          version_number: `v${Date.now()}`,
          reporting_period: new Date().getFullYear(),
          status: 'DRAFT',
          generated_by: user?.id,
          metadata: {
            compliance_index: complianceData.complianceIndex,
            data_points_completed: complianceData.completedDataPoints,
            generated_at: new Date().toISOString()
          }
        });

      if (error) throw error;
      toast.success('Borrador de reporte generado');
      onRefresh();
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    }
  };

  const exportTemplateCSV = () => {
    const headers = ['code', 'esrs_standard', 'title', 'description', 'unit', 'data_type', 'value'];
    const csvContent = headers.join(',') + '\n' +
      'S1-1,S1,"Total empleados","Número total de empleados por género",number,numeric,\n' +
      'S1-2,S1,"Rotación empleados","Tasa de rotación anual",percentage,percentage,\n' +
      'E1-1,E1,"Emisiones Scope 1","Emisiones directas de GEI",tCO2e,numeric,';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_esrs_datapoints.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUrgencyColor = (days: number) => {
    if (days < 90) return 'text-red-600';
    if (days < 180) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={showDataPointDialog} onOpenChange={setShowDataPointDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Crear Data Point
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Data Point ESRS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Código</label>
                    <Input
                      value={newDataPoint.code}
                      onChange={(e) => setNewDataPoint(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="S1-XX"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Estándar ESRS</label>
                    <Select
                      value={newDataPoint.esrs_standard}
                      onValueChange={(value) => setNewDataPoint(prev => ({ ...prev, esrs_standard: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['E1', 'E2', 'E3', 'E4', 'E5', 'S1', 'S2', 'S3', 'S4', 'G1', 'G2'].map(std => (
                          <SelectItem key={std} value={std}>{std}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={newDataPoint.title}
                    onChange={(e) => setNewDataPoint(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del data point"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    value={newDataPoint.description}
                    onChange={(e) => setNewDataPoint(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción detallada"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Unidad</label>
                    <Input
                      value={newDataPoint.unit}
                      onChange={(e) => setNewDataPoint(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="number, %, tCO2e"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Dato</label>
                    <Select
                      value={newDataPoint.data_type}
                      onValueChange={(value) => setNewDataPoint(prev => ({ ...prev, data_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numérico</SelectItem>
                        <SelectItem value="percentage">Porcentaje</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="boolean">Sí/No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateDataPoint} className="w-full">
                  Crear Data Point
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleGenerateReport}>
            <FileText className="w-4 h-4 mr-2" />
            Generar Reporte
          </Button>

          <Button variant="outline" className="w-full justify-start" size="sm" onClick={exportTemplateCSV}>
            <Download className="w-4 h-4 mr-2" />
            Plantilla CSV
          </Button>
        </CardContent>
      </Card>

      {/* Estado del Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado del Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Progreso General</span>
              <Badge variant="outline">{complianceData.complianceIndex}%</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Completado: {complianceData.completedDataPoints}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Pendiente: {complianceData.pendingTasks}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tiempo restante</span>
                <span className={`text-sm font-medium ${getUrgencyColor(complianceData.daysToDeadline)}`}>
                  {complianceData.daysToDeadline} días
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximas Tareas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximas Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Revisión Mensual</p>
                <p className="text-xs text-muted-foreground">Datos ESRS S1</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Análisis Materialidad</p>
                <p className="text-xs text-muted-foreground">Actualizar matriz</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Carga Datos Q1</p>
                <p className="text-xs text-muted-foreground">Métricas ambientales</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};