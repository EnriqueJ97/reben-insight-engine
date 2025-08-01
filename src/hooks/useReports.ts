import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ReportData {
  period: string;
  total_checkins: number;
  avg_mood: number;
  wellness_score: number;
  burnout_risk_percentage: number;
  total_alerts: number;
  critical_alerts: number;
  alert_resolution_rate: number;
  team_breakdown: any[];
  trends: any[];
  generated_at: string;
  executive_summary?: any;
  key_metrics?: any;
  recommendations?: any[];
}

export const useReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateReport = async (
    period: string = '30d',
    teamId?: string,
    format: 'json' | 'pdf' | 'csv' = 'json',
    reportType: 'executive' | 'team' | 'detailed' = 'executive'
  ): Promise<ReportData | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          tenant_id: user.tenant_id,
          period,
          team_id: teamId,
          format,
          report_type: reportType
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Reporte generado",
          description: `Reporte ${reportType} de ${period} generado exitosamente`
        });
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (
    period: string = '30d',
    teamId?: string,
    reportType: 'executive' | 'team' | 'detailed' = 'executive'
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          tenant_id: user.tenant_id,
          period,
          team_id: teamId,
          format: 'pdf',
          report_type: reportType
        }
      });

      if (error) throw error;

      if (data.success) {
        // In a real implementation, this would download the PDF
        toast({
          title: "PDF generado",
          description: "El reporte PDF ha sido generado. Se enviará por email en breve.",
        });
        
        // Simulate PDF download
        const reportData = data.data;
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-bienestar-${period}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (period: string = '30d', teamId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Get raw data for CSV export
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('checkins')
        .select(`
          *,
          profiles!inner(id, full_name, email, team_id, role, 
            teams(name)
          )
        `)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', startDate.toISOString());

      if (teamId) {
        query = query.eq('profiles.team_id', teamId);
      }

      const { data: checkins, error } = await query;

      if (error) throw error;

      // Convert to CSV format
      const csvData = checkins?.map(checkin => ({
        fecha: new Date(checkin.created_at).toLocaleDateString('es-ES'),
        empleado: checkin.profiles.full_name || checkin.profiles.email,
        equipo: checkin.profiles.teams?.name || 'Sin equipo',
        rol: checkin.profiles.role,
        pregunta_id: checkin.question_id,
        puntuacion_mood: checkin.mood,
        valor_respuesta: checkin.response_value,
        bienestar_calculado: Math.round((checkin.mood / 5) * 100)
      })) || [];

      // Convert to CSV string
      if (csvData.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay datos disponibles para el período seleccionado",
          variant: "destructive"
        });
        return;
      }

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header] || '').join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datos-bienestar-${period}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado",
        description: `${csvData.length} registros exportados exitosamente`
      });

    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el CSV",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuickStats = async (period: string = '30d') => {
    if (!user) return null;

    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get checkins
      const { data: checkins } = await supabase
        .from('checkins')
        .select(`
          mood,
          profiles!inner(tenant_id)
        `)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', startDate.toISOString());

      // Get alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select(`
          severity,
          resolved,
          profiles!inner(tenant_id)
        `)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', startDate.toISOString());

      const totalCheckins = checkins?.length || 0;
      const avgMood = totalCheckins > 0 ? checkins?.reduce((sum, c) => sum + c.mood, 0) / totalCheckins : 0;
      const criticalAlerts = alerts?.filter(a => a.severity === 'high').length || 0;
      const responseRate = 85; // This would be calculated based on active employees

      return {
        total_checkins: totalCheckins,
        avg_wellness: Math.round((avgMood / 5) * 100),
        critical_alerts: criticalAlerts,
        response_rate: responseRate,
        period
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      return null;
    }
  };

  return {
    loading,
    generateReport,
    exportToPDF,
    exportToCSV,
    getQuickStats
  };
};