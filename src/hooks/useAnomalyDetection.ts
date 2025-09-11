import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AnomalyAlert {
  id: string;
  user_id: string;
  user_name: string;
  team_id?: string;
  team_name?: string;
  anomaly_type: 'sudden_drop' | 'consistent_decline' | 'volatility_spike' | 'response_pattern' | 'team_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_at: Date;
  description: string;
  metrics: {
    current_value: number;
    expected_value: number;
    deviation_percentage: number;
    confidence_score: number;
  };
  recommendations: string[];
  auto_resolved: boolean;
}

export interface AnomalyDetectionConfig {
  sudden_drop_threshold: number; // -15%
  sudden_drop_days: number; // 7 días
  consistent_decline_slope: number; // -0.5 por día
  consistent_decline_duration: number; // 21 días
  volatility_threshold: number; // 2.5 desviaciones estándar
  team_deviation_zscore: number; // 2.0 z-score
  min_data_points: number; // 5 puntos mínimos
}

export const useAnomalyDetection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);

  const defaultConfig: AnomalyDetectionConfig = {
    sudden_drop_threshold: -15,
    sudden_drop_days: 7,
    consistent_decline_slope: -0.5,
    consistent_decline_duration: 21,
    volatility_threshold: 2.5,
    team_deviation_zscore: 2.0,
    min_data_points: 5
  };

  const detectAnomalies = async (config: AnomalyDetectionConfig = defaultConfig): Promise<AnomalyAlert[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const detectedAnomalies: AnomalyAlert[] = [];

      // Obtener datos para análisis (últimos 60 días para contexto histórico)
      const analysisDate = new Date();
      analysisDate.setDate(analysisDate.getDate() - 60);

      const { data: checkins, error } = await supabase
        .from('checkins')
        .select(`
          *,
          profiles!inner(id, full_name, team_id, tenant_id)
        `)
        .eq('profiles.tenant_id', user.tenant_id)
        .gte('created_at', analysisDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!checkins || checkins.length === 0) return [];

      // Agrupar por usuario
      const userCheckins = groupCheckInsByUser(checkins);

      // Detectar anomalías por usuario
      for (const [userId, userCheckinsList] of userCheckins.entries()) {
        if (userCheckinsList.length < config.min_data_points) continue;

        const userAnomalies = await detectUserAnomalies(userCheckinsList, config);
        detectedAnomalies.push(...userAnomalies);
      }

      // Detectar anomalías a nivel de equipo
      const teamAnomalies = await detectTeamAnomalies(checkins, config);
      detectedAnomalies.push(...teamAnomalies);

      // Filtrar anomalías duplicadas y ordenar por severidad
      const uniqueAnomalies = deduplicateAnomalies(detectedAnomalies);
      const sortedAnomalies = uniqueAnomalies.sort((a, b) => {
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      setAnomalies(sortedAnomalies);
      return sortedAnomalies;

    } catch (error) {
      console.error('Anomaly detection error:', error);
      toast({
        title: "Error en detección de anomalías",
        description: "No se pudieron detectar patrones anómalos",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const detectUserAnomalies = async (userCheckins: any[], config: AnomalyDetectionConfig): Promise<AnomalyAlert[]> => {
    const anomalies: AnomalyAlert[] = [];
    const user_id = userCheckins[0].user_id;
    const user_name = userCheckins[0].profiles.full_name;
    const team_id = userCheckins[0].profiles.team_id;
    const team_name = 'Equipo'; // Simplificado por ahora

    // 1. Detectar caída súbita
    const suddenDropAnomaly = detectSuddenDrop(userCheckins, config);
    if (suddenDropAnomaly) {
      anomalies.push({
        id: `sudden_drop_${user_id}_${Date.now()}`,
        user_id,
        user_name,
        team_id,
        team_name,
        anomaly_type: 'sudden_drop',
        severity: suddenDropAnomaly.severity,
        detected_at: new Date(),
        description: suddenDropAnomaly.description,
        metrics: suddenDropAnomaly.metrics,
        recommendations: generateSuddenDropRecommendations(suddenDropAnomaly),
        auto_resolved: false
      });
    }

    // 2. Detectar declive consistente
    const consistentDeclineAnomaly = detectConsistentDecline(userCheckins, config);
    if (consistentDeclineAnomaly) {
      anomalies.push({
        id: `consistent_decline_${user_id}_${Date.now()}`,
        user_id,
        user_name,
        team_id,
        team_name,
        anomaly_type: 'consistent_decline',
        severity: consistentDeclineAnomaly.severity,
        detected_at: new Date(),
        description: consistentDeclineAnomaly.description,
        metrics: consistentDeclineAnomaly.metrics,
        recommendations: generateDeclineRecommendations(consistentDeclineAnomaly),
        auto_resolved: false
      });
    }

    // 3. Detectar picos de volatilidad
    const volatilityAnomaly = detectVolatilitySpikes(userCheckins, config);
    if (volatilityAnomaly) {
      anomalies.push({
        id: `volatility_spike_${user_id}_${Date.now()}`,
        user_id,
        user_name,
        team_id,
        team_name,
        anomaly_type: 'volatility_spike',
        severity: volatilityAnomaly.severity,
        detected_at: new Date(),
        description: volatilityAnomaly.description,
        metrics: volatilityAnomaly.metrics,
        recommendations: generateVolatilityRecommendations(volatilityAnomaly),
        auto_resolved: false
      });
    }

    return anomalies;
  };

  const detectSuddenDrop = (checkins: any[], config: AnomalyDetectionConfig) => {
    if (checkins.length < config.sudden_drop_days * 2) return null;

    // Comparar últimos N días con el período anterior
    const recentPeriod = checkins.slice(0, config.sudden_drop_days);
    const previousPeriod = checkins.slice(config.sudden_drop_days, config.sudden_drop_days * 2);

    const recentAvg = recentPeriod.reduce((sum, c) => sum + c.mood, 0) / recentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, c) => sum + c.mood, 0) / previousPeriod.length;

    const changePercentage = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (changePercentage <= config.sudden_drop_threshold) {
      const severityValue = changePercentage <= -30 ? 'critical' : 
                           changePercentage <= -25 ? 'high' : 
                           changePercentage <= -20 ? 'medium' : 'low';

      return {
        severity: severityValue as 'low' | 'medium' | 'high' | 'critical',
        description: `Caída súbita del ${Math.abs(changePercentage).toFixed(1)}% en bienestar en los últimos ${config.sudden_drop_days} días`,
        metrics: {
          current_value: recentAvg,
          expected_value: previousAvg,
          deviation_percentage: changePercentage,
          confidence_score: Math.min(100, (recentPeriod.length / config.sudden_drop_days) * 100)
        }
      };
    }

    return null;
  };

  const detectConsistentDecline = (checkins: any[], config: AnomalyDetectionConfig) => {
    if (checkins.length < config.consistent_decline_duration) return null;

    // Análisis de regresión lineal simple para detectar tendencia
    const period = checkins.slice(0, config.consistent_decline_duration);
    const { slope, rSquared } = calculateLinearRegression(period);

    if (slope <= config.consistent_decline_slope && rSquared >= 0.3) { // R² > 0.3 para confianza
      const totalDecline = slope * config.consistent_decline_duration;
      const severityValue = totalDecline <= -1.5 ? 'critical' :
                           totalDecline <= -1.0 ? 'high' :
                           totalDecline <= -0.7 ? 'medium' : 'low';

      return {
        severity: severityValue as 'low' | 'medium' | 'high' | 'critical',
        description: `Declive consistente de ${Math.abs(slope).toFixed(2)} puntos/día durante ${config.consistent_decline_duration} días`,
        metrics: {
          current_value: period[0].mood,
          expected_value: period[period.length - 1].mood - totalDecline,
          deviation_percentage: (totalDecline / period[period.length - 1].mood) * 100,
          confidence_score: Math.round(rSquared * 100)
        }
      };
    }

    return null;
  };

  const detectVolatilitySpikes = (checkins: any[], config: AnomalyDetectionConfig) => {
    if (checkins.length < 14) return null;

    // Calcular volatilidad de los últimos 7 días vs histórica
    const recent = checkins.slice(0, 7);
    const historical = checkins.slice(7);

    const recentVolatility = calculateVolatility(recent);
    const historicalVolatility = calculateVolatility(historical);
    const historicalMean = historicalVolatility.mean;
    const historicalStd = historicalVolatility.standardDeviation;

    if (historicalStd === 0) return null; // Evitar división por cero

    const zScore = (recentVolatility.standardDeviation - historicalMean) / historicalStd;

    if (zScore >= config.volatility_threshold) {
      const severityValue = zScore >= 4.0 ? 'critical' :
                           zScore >= 3.5 ? 'high' :
                           zScore >= 3.0 ? 'medium' : 'low';

      return {
        severity: severityValue as 'low' | 'medium' | 'high' | 'critical',
        description: `Pico de volatilidad emocional (${zScore.toFixed(1)} desviaciones estándar por encima de lo normal)`,
        metrics: {
          current_value: recentVolatility.standardDeviation,
          expected_value: historicalMean,
          deviation_percentage: ((recentVolatility.standardDeviation - historicalMean) / historicalMean) * 100,
          confidence_score: Math.min(100, (recent.length / 7) * 100)
        }
      };
    }

    return null;
  };

  const detectTeamAnomalies = async (allCheckins: any[], config: AnomalyDetectionConfig): Promise<AnomalyAlert[]> => {
    const anomalies: AnomalyAlert[] = [];
    
    // Agrupar por equipo
    const teamCheckins = groupCheckInsByTeam(allCheckins);

    for (const [teamId, teamCheckinsList] of teamCheckins.entries()) {
      const teamName = 'Equipo'; // Simplificado
      
      // Calcular estadísticas del equipo
      const teamStats = calculateTeamStats(teamCheckinsList);
      
      // Obtener estadísticas globales para comparación
      const globalStats = calculateGlobalStats(allCheckins);
      
      if (globalStats.standardDeviation === 0) continue; // Evitar división por cero
      
      // Detectar desviaciones significativas del equipo respecto al global
      const deviationZScore = (teamStats.mean - globalStats.mean) / globalStats.standardDeviation;
      
      if (Math.abs(deviationZScore) >= config.team_deviation_zscore) {
        const severityValue = Math.abs(deviationZScore) >= 3.5 ? 'critical' :
                             Math.abs(deviationZScore) >= 3.0 ? 'high' :
                             Math.abs(deviationZScore) >= 2.5 ? 'medium' : 'low';

        anomalies.push({
          id: `team_deviation_${teamId}_${Date.now()}`,
          user_id: '', // Team-level anomaly
          user_name: '',
          team_id: teamId,
          team_name: teamName,
          anomaly_type: 'team_deviation',
          severity: severityValue as 'low' | 'medium' | 'high' | 'critical',
          detected_at: new Date(),
          description: deviationZScore < 0 ? 
            `Equipo con bienestar significativamente inferior (${Math.abs(deviationZScore).toFixed(1)} desv. estándar)` :
            `Equipo con bienestar excepcionalmente alto (${deviationZScore.toFixed(1)} desv. estándar)`,
          metrics: {
            current_value: teamStats.mean,
            expected_value: globalStats.mean,
            deviation_percentage: ((teamStats.mean - globalStats.mean) / globalStats.mean) * 100,
            confidence_score: Math.min(100, (teamCheckinsList.length / 20) * 100)
          },
          recommendations: generateTeamDeviationRecommendations(deviationZScore, teamName),
          auto_resolved: false
        });
      }
    }

    return anomalies;
  };

  // Funciones auxiliares
  const groupCheckInsByUser = (checkins: any[]): Map<string, any[]> => {
    const grouped = new Map();
    checkins.forEach(checkin => {
      const userId = checkin.user_id;
      if (!grouped.has(userId)) {
        grouped.set(userId, []);
      }
      grouped.get(userId).push(checkin);
    });
    return grouped;
  };

  const groupCheckInsByTeam = (checkins: any[]): Map<string, any[]> => {
    const grouped = new Map();
    checkins.forEach(checkin => {
      const teamId = checkin.profiles.team_id;
      if (teamId) {
        if (!grouped.has(teamId)) {
          grouped.set(teamId, []);
        }
        grouped.get(teamId).push(checkin);
      }
    });
    return grouped;
  };

  const calculateLinearRegression = (checkins: any[]) => {
    const n = checkins.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = checkins.reverse().map(c => c.mood); // Reverse para orden cronológico

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calcular R²
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  };

  const calculateVolatility = (checkins: any[]) => {
    const values = checkins.map(c => c.mood);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return { mean, variance, standardDeviation };
  };

  const calculateTeamStats = (teamCheckins: any[]) => {
    const moods = teamCheckins.map(c => c.mood);
    const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
    const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - mean, 2), 0) / moods.length;
    const standardDeviation = Math.sqrt(variance);

    return { mean, variance, standardDeviation, count: moods.length };
  };

  const calculateGlobalStats = (allCheckins: any[]) => {
    return calculateTeamStats(allCheckins);
  };

  const deduplicateAnomalies = (anomalies: AnomalyAlert[]): AnomalyAlert[] => {
    const seen = new Set();
    return anomalies.filter(anomaly => {
      const key = `${anomaly.user_id}_${anomaly.anomaly_type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Generadores de recomendaciones
  const generateSuddenDropRecommendations = (anomaly: any): string[] => {
    const recommendations = [
      'Programar una conversación individual inmediata',
      'Evaluar cambios recientes en carga de trabajo o responsabilidades',
      'Revisar dinámicas del equipo y relaciones interpersonales'
    ];

    if (anomaly.severity === 'critical') {
      recommendations.unshift('Contacto inmediato con el empleado - posible crisis');
      recommendations.push('Considerar apoyo psicológico profesional');
    }

    return recommendations;
  };

  const generateDeclineRecommendations = (anomaly: any): string[] => {
    return [
      'Analizar tendencias de carga de trabajo en las últimas semanas',
      'Revisar objetivos y expectativas - posible desajuste',
      'Evaluar oportunidades de desarrollo y crecimiento profesional',
      'Considerar rotación temporal o cambio de proyectos',
      'Implementar seguimiento semanal estructurado'
    ];
  };

  const generateVolatilityRecommendations = (anomaly: any): string[] => {
    return [
      'Identificar factores externos que puedan estar afectando',
      'Evaluar estabilidad en el rol y claridad de expectativas',
      'Revisar balance vida-trabajo y factores de estrés',
      'Considerar técnicas de gestión del estrés y resiliencia',
      'Aumentar frecuencia de check-ins para mayor estabilidad'
    ];
  };

  const generateTeamDeviationRecommendations = (zScore: number, teamName: string): string[] => {
    if (zScore < 0) {
      // Equipo con bienestar bajo
      return [
        `Análisis profundo de la dinámica del equipo ${teamName}`,
        'Evaluar liderazgo y estilo de management',
        'Revisar distribución de carga de trabajo entre miembros',
        'Considerar intervenciones de team building',
        'Implementar plan de mejora específico para el equipo'
      ];
    } else {
      // Equipo con bienestar excepcionalmente alto
      return [
        `Documentar mejores prácticas del equipo ${teamName}`,
        'Identificar factores de éxito para replicar',
        'Compartir aprendizajes con otros equipos',
        'Mantener seguimiento para sostenibilidad',
        'Considerar este equipo como mentor de otros'
      ];
    }
  };

  return {
    loading,
    anomalies,
    detectAnomalies,
    defaultConfig
  };
};