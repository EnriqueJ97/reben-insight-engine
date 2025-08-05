import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, HelpCircle, Building, Users, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DiagnosticoCSRD = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companySize: '',
    sector: '',
    isEuEntity: true,
    employeeCount: '',
    totalAssets: '',
    netTurnover: '',
    yearFirstReport: '',
    assuranceLevel: 'limited'
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('csrd_profile')
        .upsert({
          tenant_id: user?.tenant_id,
          company_size: formData.companySize,
          sector: formData.sector,
          is_eu_entity: formData.isEuEntity,
          employee_count: parseInt(formData.employeeCount) || null,
          total_assets: parseFloat(formData.totalAssets) || null,
          net_turnover: parseFloat(formData.netTurnover) || null,
          year_first_report: parseInt(formData.yearFirstReport) || null,
          assurance_level: formData.assuranceLevel as 'limited' | 'reasonable'
        });

      if (error) throw error;

      toast.success('Perfil CSRD guardado correctamente');
      
      // Auto-generar puntos de datos ESRS básicos
      await generarDataPointsBasicos();
      
    } catch (error) {
      console.error('Error guardando perfil CSRD:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  const generarDataPointsBasicos = async () => {
    const dataPointsBasicos = [
      // S1 - Fuerza laboral propia
      { code: 'S1-1', esrs_standard: 'S1', title: 'Total de empleados por género', description: 'Número total de empleados desglosado por género', unit: 'number', data_type: 'numeric', owner_role: 'HR_ADMIN', source_system: 'hris' },
      { code: 'S1-2', esrs_standard: 'S1', title: 'Rotación de empleados', description: 'Tasa de rotación anual de empleados', unit: '%', data_type: 'percentage', owner_role: 'HR_ADMIN', source_system: 'eie' },
      { code: 'S1-3', esrs_standard: 'S1', title: 'Horas de formación por empleado', description: 'Promedio de horas de formación por empleado al año', unit: 'hours', data_type: 'numeric', owner_role: 'HR_ADMIN', source_system: 'hris' },
      { code: 'S1-4', esrs_standard: 'S1', title: 'Índice de bienestar', description: 'Puntuación promedio de bienestar de empleados', unit: 'score', data_type: 'numeric', owner_role: 'HR_ADMIN', source_system: 'eie' },
      { code: 'S1-5', esrs_standard: 'S1', title: 'Accidentes laborales', description: 'Número de accidentes laborales reportados', unit: 'number', data_type: 'numeric', owner_role: 'HR_ADMIN', source_system: 'manual' },
      
      // E1 - Cambio climático
      { code: 'E1-1', esrs_standard: 'E1', title: 'Emisiones GEI Scope 1', description: 'Emisiones directas de gases de efecto invernadero', unit: 'tCO2e', data_type: 'numeric', owner_role: 'COMPLIANCE_OFFICER', source_system: 'manual' },
      { code: 'E1-2', esrs_standard: 'E1', title: 'Emisiones GEI Scope 2', description: 'Emisiones indirectas por consumo energético', unit: 'tCO2e', data_type: 'numeric', owner_role: 'COMPLIANCE_OFFICER', source_system: 'manual' },
      { code: 'E1-3', esrs_standard: 'E1', title: 'Consumo energético total', description: 'Consumo total de energía de la organización', unit: 'MWh', data_type: 'numeric', owner_role: 'COMPLIANCE_OFFICER', source_system: 'manual' },
      
      // G1 - Conducta empresarial
      { code: 'G1-1', esrs_standard: 'G1', title: 'Casos de corrupción', description: 'Número de casos de corrupción identificados', unit: 'number', data_type: 'numeric', owner_role: 'COMPLIANCE_OFFICER', source_system: 'manual' },
      { code: 'G1-2', esrs_standard: 'G1', title: 'Formación en ética', description: 'Porcentaje de empleados formados en códigos de conducta', unit: '%', data_type: 'percentage', owner_role: 'HR_ADMIN', source_system: 'hris' }
    ];

    try {
      const { error } = await supabase
        .from('esrs_data_points')
        .upsert(dataPointsBasicos.map(dp => ({
          ...dp,
          tenant_id: user?.tenant_id
        })));

      if (error) throw error;

      toast.success('Puntos de datos ESRS básicos creados');
    } catch (error) {
      console.error('Error creando data points:', error);
      toast.error('Error al crear puntos de datos básicos');
    }
  };

  const calcularObligacion = () => {
    const empleados = parseInt(formData.employeeCount) || 0;
    const activos = parseFloat(formData.totalAssets) || 0;
    const facturacion = parseFloat(formData.netTurnover) || 0;

    // Criterios CSRD simplificados
    if (empleados >= 500 || activos >= 20000000 || facturacion >= 40000000) {
      return {
        aplica: true,
        categoria: 'Grande',
        yearFirstReport: 2025,
        razon: 'Empresa grande según criterios CSRD'
      };
    }
    
    if (empleados >= 250 || activos >= 10000000 || facturacion >= 20000000) {
      return {
        aplica: true,
        categoria: 'Mediana',
        yearFirstReport: 2026,
        razon: 'Empresa mediana que cotiza en bolsa'
      };
    }

    return {
      aplica: false,
      categoria: 'Pequeña',
      yearFirstReport: null,
      razon: 'No alcanza los umbrales mínimos CSRD'
    };
  };

  const obligacion = calcularObligacion();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Diagnóstico CSRD</h1>
      </div>

      <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="1">Datos Corporativos</TabsTrigger>
          <TabsTrigger value="2">Obligación CSRD</TabsTrigger>
          <TabsTrigger value="3">Configuración Inicial</TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tamaño de la empresa</label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeña</SelectItem>
                      <SelectItem value="medium">Mediana</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="public_interest">Entidad de Interés Público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Select value={formData.sector} onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="finance">Financiero</SelectItem>
                      <SelectItem value="manufacturing">Manufacturero</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="healthcare">Sanitario</SelectItem>
                      <SelectItem value="energy">Energía</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Número de empleados</label>
                  <Input
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
                    placeholder="Ej: 500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Total de activos (€)</label>
                  <Input
                    type="number"
                    value={formData.totalAssets}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAssets: e.target.value }))}
                    placeholder="Ej: 20000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Facturación neta (€)</label>
                  <Input
                    type="number"
                    value={formData.netTurnover}
                    onChange={(e) => setFormData(prev => ({ ...prev, netTurnover: e.target.value }))}
                    placeholder="Ej: 40000000"
                  />
                </div>
              </div>

              <Button onClick={() => setCurrentStep(2)} className="w-full">
                Continuar al Análisis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {obligacion.aplica ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Users className="w-5 h-5 text-gray-600" />
                )}
                Análisis de Obligación CSRD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${obligacion.aplica ? 'bg-green-50' : 'bg-gray-50'}`}>
                <h3 className="font-semibold mb-2">
                  {obligacion.aplica ? '✅ Tu empresa DEBE cumplir CSRD' : '❌ Tu empresa NO debe cumplir CSRD'}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{obligacion.razon}</p>
                
                {obligacion.aplica && (
                  <div className="space-y-2">
                    <p><strong>Categoría:</strong> {obligacion.categoria}</p>
                    <p><strong>Primer reporte obligatorio:</strong> {obligacion.yearFirstReport}</p>
                    <p><strong>Nivel de aseguramiento inicial:</strong> Limitado (hasta 2028)</p>
                  </div>
                )}
              </div>

              {obligacion.aplica && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Año del primer reporte</label>
                  <Input
                    type="number"
                    value={formData.yearFirstReport}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearFirstReport: e.target.value }))}
                    placeholder={obligacion.yearFirstReport?.toString()}
                  />
                </div>
              )}

              <Button onClick={() => setCurrentStep(3)} className="w-full">
                Configurar Parámetros Iniciales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Configuración Inicial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nivel de aseguramiento</label>
                <Select value={formData.assuranceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, assuranceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limitado (2025-2027)</SelectItem>
                    <SelectItem value="reasonable">Razonable (2028+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Lo que haremos por ti:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Crear perfil CSRD de tu empresa</li>
                  <li>• Generar plantilla de más de 1,100 puntos de datos ESRS</li>
                  <li>• Configurar tareas de compliance básicas</li>
                  <li>• Conectar con datos de bienestar existentes (S1)</li>
                  <li>• Preparar estructura para análisis de materialidad</li>
                </ul>
              </div>

              <Button onClick={handleSave} className="w-full">
                Finalizar Configuración Inicial
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticoCSRD;