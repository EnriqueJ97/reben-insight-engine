import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ROIEvent {
  id: string;
  type: 'ROTACION_EVITADA' | 'ABSENTISMO_EVITADO' | 'PRODUCTIVIDAD_MEJORADA';
  employee_id: string;
  intervention_id?: string;
  estimated_savings: number;
  actual_savings?: number;
  calculated_at: string;
  description: string;
  tenant_id: string;
}

export interface ROISummary {
  monthly_savings: number;
  annual_projection: number;
  events_count: number;
  top_intervention_type: string;
  roi_percentage: number;
  investment_cost: number;
}

export const useROITracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roiSummary, setRoiSummary] = useState<ROISummary | null>(null);
  const [roiEvents, setRoiEvents] = useState<ROIEvent[]>([]);

  // Fórmulas base para cálculo de ROI
  const ROI_FORMULAS = {
    ROTACION_EVITADA: {
      // Coste de reemplazo = 0.6 × salario medio anual
      calculate: (avgSalary: number) => avgSalary * 0.6,
      description: 'Coste de reemplazo evitado'
    },
    ABSENTISMO_EVITADO: {
      // Días × coste medio diario × factor productividad
      calculate: (dailyCost: number, days: number, productivityFactor: number = 1.2) => 
        dailyCost * days * productivityFactor,
      description: 'Coste de absentismo evitado'
    },
    PRODUCTIVIDAD_MEJORADA: {
      // Incremento productividad × valor hora × horas
      calculate: (hourlyValue: number, improvementPercent: number, hours: number) =>
        hourlyValue * (improvementPercent / 100) * hours,
      description: 'Valor de productividad adicional'
    }
  };

  const calculateROIEvent = async (
    type: 'ROTACION_EVITADA' | 'ABSENTISMO_EVITADO' | 'PRODUCTIVIDAD_MEJORADA',
    employeeId: string,
    params: any,
    interventionId?: string
  ): Promise<number> => {
    let estimatedSavings = 0;

    try {
      // Obtener datos del empleado para cálculos
      const { data: employee } = await supabase
        .from('profiles')
        .select('full_name, email, tenant_id')
        .eq('id', employeeId)
        .single();

      if (!employee) throw new Error('Employee not found');

      // Obtener configuración de costes del tenant (o usar defaults)
      const avgSalary = params.avgSalary || 45000; // Default €45k
      const dailyCost = avgSalary / 365;

      switch (type) {
        case 'ROTACION_EVITADA':
          estimatedSavings = ROI_FORMULAS.ROTACION_EVITADA.calculate(avgSalary);
          break;
        
        case 'ABSENTISMO_EVITADO':
          const days = params.daysAvoided || 5;
          estimatedSavings = ROI_FORMULAS.ABSENTISMO_EVITADO.calculate(dailyCost, days);
          break;
        
        case 'PRODUCTIVIDAD_MEJORADA':
          const hourlyValue = avgSalary / (365 * 8); // Valor hora
          const improvement = params.improvementPercent || 15;
          const hours = params.hours || 40; // Semana estándar
          estimatedSavings = ROI_FORMULAS.PRODUCTIVIDAD_MEJORADA.calculate(hourlyValue, improvement, hours);
          break;
      }

      // Guardar evento ROI
      const { data: roiEvent, error } = await supabase
        .from('roi_events')
        .insert({
          type,
          employee_id: employeeId,
          intervention_id: interventionId,
          estimated_savings: Math.round(estimatedSavings),
          description: generateROIDescription(type, params),
          tenant_id: user?.tenant_id,
          calculated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return estimatedSavings;
    } catch (error) {
      console.error('Error calculating ROI event:', error);
      return 0;
    }
  };

  const generateROIDescription = (type: string, params: any): string => {
    switch (type) {
      case 'ROTACION_EVITADA':
        return `Retención de empleado tras intervención preventiva (Score: ${params.riskScore})`;
      case 'ABSENTISMO_EVITADO':
        return `${params.daysAvoided || 5} días de ausencia evitados por mejora en bienestar`;
      case 'PRODUCTIVIDAD_MEJORADA':
        return `${params.improvementPercent || 15}% mejora en productividad tras optimización`;
      default:
        return 'Ahorro generado por intervención REBEN';
    }
  };

  const getROISummary = async (period: 'monthly' | 'annual' = 'monthly') => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = new Date();
      if (period === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const { data: events, error } = await supabase
        .from('roi_events')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .gte('calculated_at', startDate.toISOString());

      if (error) throw error;

      // Calcular métricas
      const totalSavings = events?.reduce((sum, event) => sum + event.estimated_savings, 0) || 0;
      const eventsCount = events?.length || 0;

      // Calcular coste de inversión (licencias + implementación)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', user.tenant_id);

      const employeeCount = profiles?.length || 1;
      const monthlyCostPerEmployee = 25; // €25/empleado/mes
      const investmentCost = employeeCount * monthlyCostPerEmployee;

      // Tipo de intervención más efectiva
      const interventionTypes = events?.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + event.estimated_savings;
        return acc;
      }, {} as Record<string, number>) || {};

      const topInterventionType = Object.keys(interventionTypes).reduce((a, b) => 
        interventionTypes[a] > interventionTypes[b] ? a : b, 'ROTACION_EVITADA');

      const summary: ROISummary = {
        monthly_savings: period === 'monthly' ? totalSavings : totalSavings / 12,
        annual_projection: period === 'monthly' ? totalSavings * 12 : totalSavings,
        events_count: eventsCount,
        top_intervention_type: topInterventionType,
        roi_percentage: investmentCost > 0 ? Math.round((totalSavings / investmentCost - 1) * 100) : 0,
        investment_cost: investmentCost
      };

      setRoiSummary(summary);
      setRoiEvents(events || []);

      return summary;
    } catch (error) {
      console.error('Error getting ROI summary:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateCSRDReport = async () => {
    if (!user || !roiSummary) return null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-csrd-report', {
        body: {
          tenant_id: user.tenant_id,
          roi_data: roiSummary,
          events: roiEvents,
          period: 'annual'
        }
      });

      if (error) throw error;

      // Crear blob para descarga
      const reportContent = JSON.stringify(data.report, null, 2);
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-csrd-reben-${new Date().getFullYear()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Reporte CSRD Generado",
        description: "El reporte de compliance se ha descargado exitosamente"
      });

      return data.report;
    } catch (error) {
      console.error('Error generating CSRD report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte CSRD",
        variant: "destructive"
      });
      return null;
    }
  };

  const trackInterventionROI = async (interventionId: string, type: string, employeeId: string) => {
    // Simular diferentes tipos de ahorro según la intervención
    let roiParams = {};
    
    switch (type) {
      case 'FOCO_BLOQUEO':
        roiParams = { improvementPercent: 15, hours: 40 };
        await calculateROIEvent('PRODUCTIVIDAD_MEJORADA', employeeId, roiParams, interventionId);
        break;
      
      case 'DESCONEXION_MODO':
        roiParams = { daysAvoided: 3 };
        await calculateROIEvent('ABSENTISMO_EVITADO', employeeId, roiParams, interventionId);
        break;
      
      case 'REDISTRIBUCION_CARGA':
        roiParams = { avgSalary: 45000, riskScore: 85 };
        await calculateROIEvent('ROTACION_EVITADA', employeeId, roiParams, interventionId);
        break;
    }
  };

  const getInterventionTypeName = (type: string): string => {
    switch (type) {
      case 'ROTACION_EVITADA': return 'Retención de Talento';
      case 'ABSENTISMO_EVITADO': return 'Reducción de Absentismo';
      case 'PRODUCTIVIDAD_MEJORADA': return 'Mejora de Productividad';
      default: return type;
    }
  };

  useEffect(() => {
    if (user) {
      getROISummary();
    }
  }, [user]);

  return {
    loading,
    roiSummary,
    roiEvents,
    calculateROIEvent,
    getROISummary,
    generateCSRDReport,
    trackInterventionROI,
    getInterventionTypeName,
    ROI_FORMULAS
  };
};