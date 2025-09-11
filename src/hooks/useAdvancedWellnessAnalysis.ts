import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WELLNESS_QUESTIONS } from '@/data/questions';

export interface AdvancedWellnessMetrics {
  multifactorial_score: number;
  mood_component: number;
  engagement_component: number;
  workload_component: number;
  relationships_component: number;
  autonomy_component: number;
  consistency_factor: number;
  temporal_trend: number;
  confidence_level: number;
}

export interface BurnoutRiskML {
  risk_score: number; // 0-100
  risk_level: 'bajo' | 'medio' | 'alto' | 'crítico';
  emotional_exhaustion: number;
  depersonalization: number;
  personal_accomplishment: number;
  workload_intensity: number;
  recovery_time: number;
  social_support: number;
  trend_direction: 'mejorando' | 'estable' | 'empeorando';
  volatility: number;
  response_consistency: number;
  prediction_confidence: number;
  contributing_factors: string[];
}

export const useAdvancedWellnessAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [wellness, setWellness] = useState<AdvancedWellnessMetrics | null>(null);
  const [burnout, setBurnout] = useState<BurnoutRiskML | null>(null);

  const calculateMultifactorialWellness = async (userId: string, teamId?: string, period: number = 30): Promise<AdvancedWellnessMetrics | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      // Obtener check-ins del período
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const query = supabase
        .from('checkins')
        .select(`
          mood,
          response_value,
          question_id,
          created_at,
          profiles!inner(id, full_name, team_id, tenant_id)
        `)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (userId) {
        query.eq('user_id', userId);
      } else if (teamId) {
        query.eq('profiles.team_id', teamId);
      }

      const { data: checkins, error } = await query;
      if (error) throw error;

      if (!checkins || checkins.length === 0) {
        return null;
      }

      // Agrupar respuestas por componente
      const components = {
        mood: [] as number[],
        engagement: [] as number[],
        workload: [] as number[],
        relationships: [] as number[],
        autonomy: [] as number[]
      };

      checkins.forEach(checkin => {
        const componentKey = getComponentFromQuestionId(checkin.question_id);
        if (componentKey && components[componentKey]) {
          // Normalizar respuestas a escala 0-100
          const normalizedScore = normalizeResponse(checkin.mood, checkin.response_value);
          components[componentKey].push(normalizedScore);
        }
      });

      // Calcular promedios de componentes
      const mood_component = calculateAverage(components.mood);
      const engagement_component = calculateAverage(components.engagement);
      const workload_component = calculateAverage(components.workload);
      const relationships_component = calculateAverage(components.relationships);
      const autonomy_component = calculateAverage(components.autonomy);

      // Calcular factor de consistencia (menos variabilidad = más confiable)
      const consistency_factor = calculateConsistencyFactor(checkins);

      // Calcular tendencia temporal (últimos 7 días vs anteriores)
      const temporal_trend = calculateTemporalTrend(checkins);

      // Fórmula multifactorial ponderada científicamente
      const raw_score = (
        mood_component * 0.35 +
        engagement_component * 0.25 +
        workload_component * 0.20 +
        relationships_component * 0.15 +
        autonomy_component * 0.05
      );

      // Aplicar factores de ajuste
      const multifactorial_score = Math.max(0, Math.min(100, 
        raw_score * consistency_factor * temporal_trend
      ));

      // Calcular nivel de confianza basado en cantidad y distribución de datos
      const confidence_level = calculateConfidenceLevel(checkins, components);

      return {
        multifactorial_score: Math.round(multifactorial_score),
        mood_component: Math.round(mood_component),
        engagement_component: Math.round(engagement_component),
        workload_component: Math.round(workload_component),
        relationships_component: Math.round(relationships_component),
        autonomy_component: Math.round(autonomy_component),
        consistency_factor: Number(consistency_factor.toFixed(2)),
        temporal_trend: Number(temporal_trend.toFixed(2)),
        confidence_level: Math.round(confidence_level)
      };

    } catch (error) {
      console.error('Advanced wellness calculation error:', error);
      setWellness(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateBurnoutRiskML = async (userId: string, period: number = 30): Promise<BurnoutRiskML | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      // Obtener datos históricos más extensos para el modelo ML
      const extendedStartDate = new Date();
      extendedStartDate.setDate(extendedStartDate.getDate() - (period * 2)); // Doble período para análisis temporal

      const { data: checkins, error } = await supabase
        .from('checkins')
        .select(`
          mood,
          response_value,
          question_id,
          created_at,
          profiles!inner(id, full_name, role, tenant_id)
        `)
        .eq('user_id', userId)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', extendedStartDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!checkins || checkins.length < 5) return null; // Mínimo de datos requerido

      // Obtener alertas del usuario
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', extendedStartDate.toISOString());

      // Calcular componentes del Maslach Burnout Inventory
      const emotional_exhaustion = calculateEmotionalExhaustion(checkins);
      const depersonalization = calculateDepersonalization(checkins, alerts || []);
      const personal_accomplishment = calculatePersonalAccomplishment(checkins);

      // Calcular factores secundarios
      const workload_intensity = calculateWorkloadIntensity(checkins);
      const recovery_time = calculateRecoveryMetrics(checkins);
      const social_support = calculateSocialSupport(checkins);

      // Análisis de patrones temporales
      const trend_direction = calculateTrendDirection(checkins, period);
      const volatility = calculateVolatilityScore(checkins);
      const response_consistency = calculateResponseConsistency(checkins);

      // Modelo de scoring ML simplificado (en producción usaríamos un modelo entrenado)
      const primary_risk = (
        emotional_exhaustion * 0.40 +
        depersonalization * 0.35 +
        (100 - personal_accomplishment) * 0.25
      );

      const secondary_factors = (
        workload_intensity * 0.30 +
        (100 - recovery_time) * 0.25 +
        (100 - social_support) * 0.25 +
        volatility * 0.20
      );

      // Peso del análisis temporal
      const temporal_weight = trend_direction === 'empeorando' ? 1.2 : 
                            trend_direction === 'mejorando' ? 0.8 : 1.0;

      const risk_score = Math.min(100, Math.max(0, 
        (primary_risk * 0.70 + secondary_factors * 0.30) * temporal_weight
      ));

      // Determinar nivel de riesgo
      let risk_level: 'bajo' | 'medio' | 'alto' | 'crítico' = 'bajo';
      if (risk_score >= 80) risk_level = 'crítico';
      else if (risk_score >= 65) risk_level = 'alto';
      else if (risk_score >= 45) risk_level = 'medio';

      // Calcular confianza de la predicción
      const prediction_confidence = Math.min(100, 
        (checkins.length / 20) * 100 * response_consistency
      );

      // Identificar factores contribuyentes principales
      const contributing_factors = identifyContributingFactors({
        emotional_exhaustion,
        depersonalization,
        personal_accomplishment,
        workload_intensity,
        recovery_time,
        social_support,
        volatility
      });

      return {
        risk_score: Math.round(risk_score),
        risk_level,
        emotional_exhaustion: Math.round(emotional_exhaustion),
        depersonalization: Math.round(depersonalization),
        personal_accomplishment: Math.round(personal_accomplishment),
        workload_intensity: Math.round(workload_intensity),
        recovery_time: Math.round(recovery_time),
        social_support: Math.round(social_support),
        trend_direction,
        volatility: Math.round(volatility),
        response_consistency: Math.round(response_consistency * 100),
        prediction_confidence: Math.round(prediction_confidence),
        contributing_factors
      };

    } catch (error) {
      console.error('ML Burnout prediction error:', error);
      setBurnout(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getComponentFromQuestionId = (questionId: string): 'mood' | 'engagement' | 'workload' | 'relationships' | 'autonomy' | null => {
    // Mapear question_id a componente basado en los IDs de questions.ts
    if (questionId.startsWith('B')) return 'mood'; // Burnout questions -> mood
    if (questionId.startsWith('T')) return 'engagement'; // Turnover questions -> engagement
    if (questionId.startsWith('S')) return 'mood'; // Satisfaction questions -> mood
    if (questionId.startsWith('BE')) return 'mood'; // Wellbeing questions -> mood
    if (questionId.startsWith('FC')) return 'autonomy'; // Flexibility questions -> autonomy
    if (questionId.startsWith('DI')) return 'relationships'; // Diversity questions -> relationships
    if (questionId.startsWith('LC')) return 'relationships'; // Leadership questions -> relationships
    if (questionId.startsWith('EM')) return 'engagement'; // Engagement questions -> engagement
    if (questionId.startsWith('SR')) return 'workload'; // Sustainability questions -> workload
    if (questionId.startsWith('Extra')) return 'workload'; // Extra questions -> workload
    return 'mood'; // Default fallback
  };

  const normalizeResponse = (mood: number, responseValue: number): number => {
    // Convertir respuesta a escala 0-100
    if (mood) return (mood / 5) * 100;
    if (responseValue) return Math.min(100, responseValue * 20); // Asumiendo escala 1-5
    return 50; // Valor neutro si no hay datos
  };

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 50; // Valor neutro
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const calculateConsistencyFactor = (checkins: any[]): number => {
    if (checkins.length < 3) return 1.0;
    
    const values = checkins.map(c => c.mood || 3);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean; // Coeficiente de variación
    
    // Factor de consistencia: mayor consistencia = factor más alto
    return Math.max(0.7, Math.min(1.3, 1 - (cv * 0.5)));
  };

  const calculateTemporalTrend = (checkins: any[]): number => {
    if (checkins.length < 7) return 1.0;
    
    const recent = checkins.slice(0, 7).map(c => c.mood || 3);
    const previous = checkins.slice(7, 14).map(c => c.mood || 3);
    
    if (previous.length === 0) return 1.0;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    const change = (recentAvg - previousAvg) / previousAvg;
    
    // Factor temporal: mejora = factor > 1, empeora = factor < 1
    return Math.max(0.8, Math.min(1.2, 1 + change));
  };

  const calculateConfidenceLevel = (checkins: any[], components: any): number => {
    const totalResponses = checkins.length;
    const componentCoverage = Object.values(components).filter((comp: any) => comp.length > 0).length;
    
    // Confianza basada en cantidad y cobertura
    const quantityScore = Math.min(100, (totalResponses / 20) * 100);
    const coverageScore = (componentCoverage / 5) * 100;
    
    return (quantityScore * 0.6 + coverageScore * 0.4);
  };

  // Funciones específicas del modelo de burnout
  const calculateEmotionalExhaustion = (checkins: any[]): number => {
    const burnoutCheckins = checkins.filter(c => 
      c.question_id?.startsWith('B') && 
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(c.question_id) // Agotamiento emocional
    );
    
    if (burnoutCheckins.length === 0) return 30; // Valor base
    
    const avgExhaustion = burnoutCheckins.reduce((sum, c) => sum + (5 - c.mood), 0) / burnoutCheckins.length;
    return (avgExhaustion / 4) * 100; // Invertir escala: mayor mood = menor agotamiento
  };

  const calculateDepersonalization = (checkins: any[], alerts: any[]): number => {
    const cynicismCheckins = checkins.filter(c =>
      c.question_id && ['B7', 'B8', 'B9', 'B14'].includes(c.question_id) // Despersonalización
    );
    
    const alertPenalty = alerts.filter(a => a.type === 'ALERTA_CINISMO').length * 15;
    
    if (cynicismCheckins.length === 0) return Math.min(100, 25 + alertPenalty);
    
    const avgCynicism = cynicismCheckins.reduce((sum, c) => sum + (5 - c.mood), 0) / cynicismCheckins.length;
    return Math.min(100, (avgCynicism / 4) * 100 + alertPenalty);
  };

  const calculatePersonalAccomplishment = (checkins: any[]): number => {
    const accomplishmentCheckins = checkins.filter(c =>
      c.question_id && (['B10', 'B11', 'B12', 'B13'].includes(c.question_id) || // Baja realización (invertir)
                        c.question_id.startsWith('EM')) // Engagement questions
    );
    
    if (accomplishmentCheckins.length === 0) return 60; // Valor medio
    
    const avgAccomplishment = accomplishmentCheckins.reduce((sum, c) => sum + c.mood, 0) / accomplishmentCheckins.length;
    return (avgAccomplishment / 5) * 100;
  };

  const calculateWorkloadIntensity = (checkins: any[]): number => {
    const workloadCheckins = checkins.filter(c =>
      c.question_id && (['BE1', 'Extra1'].includes(c.question_id)) // Workload related questions
    );
    
    if (workloadCheckins.length === 0) return 50;
    
    const avgWorkload = workloadCheckins.reduce((sum, c) => sum + (5 - c.mood), 0) / workloadCheckins.length;
    return (avgWorkload / 4) * 100;
  };

  const calculateRecoveryMetrics = (checkins: any[]): number => {
    const flexibilityCheckins = checkins.filter(c => 
      c.question_id && (['FC1', 'FC2', 'FC3', 'BE3', 'Extra2'].includes(c.question_id)) // Recovery/flexibility
    );
    
    if (flexibilityCheckins.length === 0) return 50;
    
    const avgRecovery = flexibilityCheckins.reduce((sum, c) => sum + c.mood, 0) / flexibilityCheckins.length;
    return (avgRecovery / 5) * 100;
  };

  const calculateSocialSupport = (checkins: any[]): number => {
    const supportCheckins = checkins.filter(c =>
      c.question_id && (c.question_id.startsWith('LC') || // Leadership questions
                        c.question_id.startsWith('DI') || // Diversity questions  
                        ['S4', 'S5'].includes(c.question_id)) // Recognition & relationships
    );
    
    if (supportCheckins.length === 0) return 60;
    
    const avgSupport = supportCheckins.reduce((sum, c) => sum + c.mood, 0) / supportCheckins.length;
    return (avgSupport / 5) * 100;
  };

  const calculateTrendDirection = (checkins: any[], period: number): 'mejorando' | 'estable' | 'empeorando' => {
    if (checkins.length < 6) return 'estable';
    
    const recent = checkins.slice(0, Math.floor(period / 2));
    const older = checkins.slice(Math.floor(period / 2));
    
    if (older.length === 0) return 'estable';
    
    const recentAvg = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.mood, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'mejorando';
    if (change < -5) return 'empeorando';
    return 'estable';
  };

  const calculateVolatilityScore = (checkins: any[]): number => {
    if (checkins.length < 3) return 0;
    
    const moods = checkins.map(c => c.mood);
    const changes = [];
    
    for (let i = 1; i < moods.length; i++) {
      changes.push(Math.abs(moods[i] - moods[i-1]));
    }
    
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    return Math.min(100, (avgChange / 2) * 100); // Normalizar a 0-100
  };

  const calculateResponseConsistency = (checkins: any[]): number => {
    if (checkins.length < 3) return 0.5;
    
    const moods = checkins.map(c => c.mood);
    const mean = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - mean, 2), 0) / moods.length;
    const stdDev = Math.sqrt(variance);
    
    // Consistencia: menor desviación = mayor consistencia
    return Math.max(0.1, Math.min(1.0, 1 - (stdDev / 2)));
  };

  const identifyContributingFactors = (factors: any): string[] => {
    const contributors: string[] = [];
    
    if (factors.emotional_exhaustion > 70) contributors.push('Agotamiento emocional alto');
    if (factors.depersonalization > 60) contributors.push('Desconexión del trabajo');
    if (factors.personal_accomplishment < 40) contributors.push('Baja sensación de logro');
    if (factors.workload_intensity > 75) contributors.push('Sobrecarga de trabajo');
    if (factors.recovery_time < 40) contributors.push('Tiempo de recuperación insuficiente');
    if (factors.social_support < 50) contributors.push('Falta de apoyo social/organizacional');
    if (factors.volatility > 60) contributors.push('Inestabilidad emocional');
    
    return contributors.length > 0 ? contributors : ['Perfil de riesgo dentro de rangos normales'];
  };

  const calculateAndSetWellness = async (userId: string, teamId?: string, period: number = 30) => {
    const result = await calculateMultifactorialWellness(userId, teamId, period);
    setWellness(result);
    return result;
  };

  const calculateAndSetBurnout = async (userId: string, period: number = 30) => {
    const result = await calculateBurnoutRiskML(userId, period);
    setBurnout(result);
    return result;
  };

  return {
    loading,
    wellness,
    burnout,
    calculateMultifactorialWellness: calculateAndSetWellness,
    calculateBurnoutRiskML: calculateAndSetBurnout
  };
};