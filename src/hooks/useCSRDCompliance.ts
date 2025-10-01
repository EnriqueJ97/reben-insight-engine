import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CSRDProfile {
  id: string;
  company_size: string;
  sector: string;
  employee_count: number;
  year_first_report: number;
  assurance_level: 'limited' | 'reasonable';
}

interface ComplianceMetrics {
  complianceIndex: number;
  totalDataPoints: number;
  completedDataPoints: number;
  estimatedDataPoints: number;
  missingDataPoints: number;
  criticalGaps: number;
  daysToDeadline: number;
  readinessLevel: 'critical' | 'warning' | 'good' | 'excellent';
}

interface MaterialityAnalysis {
  materialTopics: string[];
  nonMaterialTopics: string[];
  topicsCount: {
    high_high: number;
    high_low: number;
    low_high: number;
    low_low: number;
  };
}

export const useCSRDCompliance = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CSRDProfile | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    complianceIndex: 0,
    totalDataPoints: 0,
    completedDataPoints: 0,
    estimatedDataPoints: 0,
    missingDataPoints: 0,
    criticalGaps: 0,
    daysToDeadline: 0,
    readinessLevel: 'critical'
  });
  const [materiality, setMateriality] = useState<MaterialityAnalysis>({
    materialTopics: [],
    nonMaterialTopics: [],
    topicsCount: { high_high: 0, high_low: 0, low_high: 0, low_low: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.tenant_id) {
      loadCSRDData();
    }
  }, [user?.tenant_id]);

  const loadCSRDData = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadComplianceMetrics(),
        loadMaterialityAnalysis()
      ]);
    } catch (error) {
      console.error('Error loading CSRD data:', error);
      toast.error('Error cargando datos CSRD');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('csrd_profile')
      .select('*')
      .eq('tenant_id', user?.tenant_id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    setProfile(data);
  };

  const loadComplianceMetrics = async () => {
    // Cargar puntos de datos ESRS
    const { data: dataPoints } = await supabase
      .from('esrs_data_points')
      .select('id, is_mandatory')
      .eq('tenant_id', user?.tenant_id);

    const { data: values } = await supabase
      .from('esrs_values')
      .select('data_point_id, coverage_status')
      .eq('tenant_id', user?.tenant_id);

    const total = dataPoints?.length || 0;
    const completed = values?.filter(v => v.coverage_status === 'OK').length || 0;
    const estimated = values?.filter(v => v.coverage_status === 'ESTIMATE').length || 0;
    const missing = total - completed - estimated;

    // Calcular gaps críticos (puntos obligatorios sin datos)
    const mandatoryPoints = dataPoints?.filter(dp => dp.is_mandatory).map(dp => dp.id) || [];
    const coveredPoints = values?.map(v => v.data_point_id) || [];
    const criticalGaps = mandatoryPoints.filter(mp => !coveredPoints.includes(mp)).length;

    const complianceIndex = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calcular días hasta deadline
    const currentYear = new Date().getFullYear();
    const targetYear = profile?.year_first_report || currentYear + 1;
    const deadline = new Date(targetYear, 2, 31); // 31 de marzo
    const today = new Date();
    const daysToDeadline = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Determinar nivel de preparación
    let readinessLevel: ComplianceMetrics['readinessLevel'] = 'critical';
    if (complianceIndex >= 90) readinessLevel = 'excellent';
    else if (complianceIndex >= 75) readinessLevel = 'good';
    else if (complianceIndex >= 50) readinessLevel = 'warning';

    setMetrics({
      complianceIndex,
      totalDataPoints: total,
      completedDataPoints: completed,
      estimatedDataPoints: estimated,
      missingDataPoints: missing,
      criticalGaps,
      daysToDeadline,
      readinessLevel
    });
  };

  const loadMaterialityAnalysis = async () => {
    const { data: topics } = await supabase
      .from('materiality_matrix')
      .select('topic_code, is_material, quadrant')
      .eq('tenant_id', user?.tenant_id);

    if (!topics) return;

    const material = topics.filter(t => t.is_material).map(t => t.topic_code);
    const nonMaterial = topics.filter(t => !t.is_material).map(t => t.topic_code);

    const topicsCount = {
      high_high: topics.filter(t => t.quadrant === 'high_high').length,
      high_low: topics.filter(t => t.quadrant === 'high_low').length,
      low_high: topics.filter(t => t.quadrant === 'low_high').length,
      low_low: topics.filter(t => t.quadrant === 'low_low').length
    };

    setMateriality({
      materialTopics: material,
      nonMaterialTopics: nonMaterial,
      topicsCount
    });
  };

  // Análisis automático de doble materialidad
  const analyzeDoubleMateriality = async (topicCode: string) => {
    try {
      // Obtener datos del EIE relacionados con el tópico
      const { data: eieData } = await supabase
        .from('analytics_cache')
        .select('*')
        .eq('tenant_id', user?.tenant_id)
        .in('metric_key', getRelatedMetrics(topicCode));

      // Llamar a función edge para análisis IA
      const { data, error } = await supabase.functions.invoke('eie-csrd-map', {
        body: {
          topic: topicCode,
          metrics: eieData,
          tenant_id: user?.tenant_id
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error analyzing materiality:', error);
      toast.error('Error en análisis de materialidad');
      return null;
    }
  };

  // Detectar gaps de cumplimiento
  const detectComplianceGaps = async () => {
    const { data: missingPoints } = await supabase
      .from('esrs_data_points')
      .select(`
        id,
        code,
        title,
        esrs_standard,
        is_mandatory
      `)
      .eq('tenant_id', user?.tenant_id)
      .is('esrs_values.value_numeric', null)
      .is('esrs_values.value_text', null);

    return missingPoints || [];
  };

  // Generar alertas de cumplimiento
  const generateComplianceAlerts = async () => {
    const gaps = await detectComplianceGaps();
    const criticalGaps = gaps.filter(g => g.is_mandatory);

    if (criticalGaps.length > 0 && metrics.daysToDeadline < 90) {
      // Crear notificación para HR_ADMIN
      const { data: hrAdmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', user?.tenant_id)
        .eq('role', 'HR_ADMIN');

      if (hrAdmins && hrAdmins.length > 0) {
        await supabase.from('notifications').insert(
          hrAdmins.map(admin => ({
            tenant_id: user?.tenant_id,
            user_id: admin.id,
            type: 'alert',
            title: 'Gaps críticos en cumplimiento CSRD',
            message: `${criticalGaps.length} puntos de datos obligatorios sin completar. Deadline en ${metrics.daysToDeadline} días.`,
            priority: 'high'
          }))
        );
      }
    }
  };

  // Simular escenario What-If
  const simulateScenario = async (changes: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'csrd_scenario',
          current_metrics: metrics,
          proposed_changes: changes,
          tenant_id: user?.tenant_id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error simulating scenario:', error);
      return null;
    }
  };

  return {
    profile,
    metrics,
    materiality,
    loading,
    loadCSRDData,
    analyzeDoubleMateriality,
    detectComplianceGaps,
    generateComplianceAlerts,
    simulateScenario
  };
};

// Helper: Obtener métricas relacionadas con un tópico ESRS
function getRelatedMetrics(topicCode: string): string[] {
  const metricsMap: Record<string, string[]> = {
    'S1': ['wellbeing_score', 'burnout_risk', 'turnover_rate', 'absenteeism_rate', 'engagement_score'],
    'E1': ['carbon_footprint', 'energy_consumption', 'renewable_energy_pct'],
    'E2': ['waste_production', 'water_consumption', 'pollution_incidents'],
    'E3': ['water_usage', 'water_recycling_rate'],
    'E4': ['biodiversity_impact', 'land_use'],
    'E5': ['circular_economy_rate', 'recycling_rate'],
    'S2': ['supplier_compliance', 'fair_labor_practices'],
    'S3': ['community_investment', 'social_impact'],
    'S4': ['customer_satisfaction', 'product_safety'],
    'G1': ['ethics_violations', 'anti_corruption_training'],
    'G2': ['board_diversity', 'governance_score']
  };

  return metricsMap[topicCode] || [];
}
