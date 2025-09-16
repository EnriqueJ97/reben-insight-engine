import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type RiskLevel = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface RiskScore {
  id?: string;
  user_id: string;
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  calculated_at: string;
  interventions_triggered?: Intervention[];
}

export interface RiskFactor {
  factor: string;
  weight: number;
  current_value: number;
  risk_contribution: number;
  description: string;
}

export interface Intervention {
  id: string;
  type: 'FOCO_BLOQUEO' | 'DESCONEXION_MODO' | 'REDISTRIBUCION_CARGA';
  triggered_at: string;
  executed_at?: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  result?: string;
  estimated_savings?: number;
  actual_savings?: number;
}

export const useRiskScore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentScore, setCurrentScore] = useState<RiskScore | null>(null);
  const [teamScores, setTeamScores] = useState<RiskScore[]>([]);

  // Reglas del Score de Riesgo Central
  const RISK_RULES = {
    HORAS_SEMANALES: { threshold: 45, weight: 25 },
    MOTIVACION_BAJA: { threshold: 3, consecutiveDays: 3, weight: 20 },
    REUNIONES_SEMANALES: { threshold: 12, weight: 15 },
    FOCO_DIARIO: { threshold: 4, weight: 15 },
    TRABAJO_FUERA_HORARIO: { weight: 10 },
    CARGA_DISTRIBUCION: { weight: 15 }
  };

  const calculateRiskScore = async (userId?: string): Promise<RiskScore | null> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    setLoading(true);
    try {
      // Obtener datos de las últimas semanas
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 21); // 3 semanas

      // Check-ins recientes
      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // Logs de trabajo (hours, meetings, etc.)
      const { data: workLogs } = await supabase
        .from('work_mode_logs')
        .select('*')
        .eq('employee_id', targetUserId)
        .gte('date', startDate.toISOString().split('T')[0]);

      // Calcular factores de riesgo
      const factors = await calculateRiskFactors(checkins || [], workLogs || []);
      
      // Calcular score total
      const totalScore = factors.reduce((sum, factor) => sum + factor.risk_contribution, 0);
      
      // Determinar nivel
      const level: RiskLevel = totalScore >= 70 ? 'ROJO' : totalScore >= 40 ? 'AMARILLO' : 'VERDE';

      const riskScore: RiskScore = {
        user_id: targetUserId,
        score: Math.round(totalScore),
        level,
        factors,
        calculated_at: new Date().toISOString()
      };

      // Simular guardar en base de datos
      console.log('Risk score would be saved:', riskScore);
      const error = null;

      if (error) throw error;

      // Verificar si necesita intervenciones automáticas
      if (level === 'ROJO') {
        await triggerAutomaticInterventions({ ...riskScore, id: Date.now().toString() });
      }

      return { ...riskScore, id: Date.now().toString() };
    } catch (error) {
      console.error('Error calculating risk score:', error);
      toast({
        title: "Error",
        description: "No se pudo calcular el score de riesgo",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskFactors = async (checkins: any[], workLogs: any[]): Promise<RiskFactor[]> => {
    const factors: RiskFactor[] = [];

    // 1. Horas semanales
    const avgWeeklyHours = workLogs.reduce((sum, log) => {
      const hours = log.actual_hours?.total || 8;
      return sum + hours;
    }, 0) / Math.max(workLogs.length / 7, 1);

    if (avgWeeklyHours > RISK_RULES.HORAS_SEMANALES.threshold) {
      factors.push({
        factor: 'HORAS_EXCESIVAS',
        weight: RISK_RULES.HORAS_SEMANALES.weight,
        current_value: avgWeeklyHours,
        risk_contribution: Math.min(RISK_RULES.HORAS_SEMANALES.weight, 
          (avgWeeklyHours - RISK_RULES.HORAS_SEMANALES.threshold) * 2),
        description: `${avgWeeklyHours.toFixed(1)}h/semana (límite: ${RISK_RULES.HORAS_SEMANALES.threshold}h)`
      });
    }

    // 2. Motivación baja consecutiva
    const recentCheckins = checkins.slice(0, 3);
    const lowMotivationDays = recentCheckins.filter(c => c.mood <= RISK_RULES.MOTIVACION_BAJA.threshold).length;
    
    if (lowMotivationDays >= RISK_RULES.MOTIVACION_BAJA.consecutiveDays) {
      factors.push({
        factor: 'MOTIVACION_BAJA',
        weight: RISK_RULES.MOTIVACION_BAJA.weight,
        current_value: lowMotivationDays,
        risk_contribution: RISK_RULES.MOTIVACION_BAJA.weight,
        description: `${lowMotivationDays} días seguidos con motivación ≤ ${RISK_RULES.MOTIVACION_BAJA.threshold}`
      });
    }

    // 3. Reuniones excesivas (simulado - en producción vendría de Calendar API)
    const weeklyMeetings = Math.floor(Math.random() * 20); // Simulated
    if (weeklyMeetings > RISK_RULES.REUNIONES_SEMANALES.threshold) {
      factors.push({
        factor: 'REUNIONES_EXCESIVAS',
        weight: RISK_RULES.REUNIONES_SEMANALES.weight,
        current_value: weeklyMeetings,
        risk_contribution: Math.min(RISK_RULES.REUNIONES_SEMANALES.weight,
          (weeklyMeetings - RISK_RULES.REUNIONES_SEMANALES.threshold) * 1.5),
        description: `${weeklyMeetings}h/semana en reuniones (límite: ${RISK_RULES.REUNIONES_SEMANALES.threshold}h)`
      });
    }

    // 4. Foco insuficiente (simulado)
    const dailyFocusHours = 3; // Simulated
    if (dailyFocusHours < RISK_RULES.FOCO_DIARIO.threshold) {
      factors.push({
        factor: 'FOCO_INSUFICIENTE',
        weight: RISK_RULES.FOCO_DIARIO.weight,
        current_value: dailyFocusHours,
        risk_contribution: RISK_RULES.FOCO_DIARIO.weight,
        description: `${dailyFocusHours}h/día de foco (mínimo: ${RISK_RULES.FOCO_DIARIO.threshold}h)`
      });
    }

    return factors;
  };

  const triggerAutomaticInterventions = async (riskScore: any) => {
    const interventions: string[] = [];

    // Determinar qué intervenciones activar
    riskScore.factors.forEach((factor: RiskFactor) => {
      switch (factor.factor) {
        case 'REUNIONES_EXCESIVAS':
        case 'FOCO_INSUFICIENTE':
          interventions.push('FOCO_BLOQUEO');
          break;
        case 'HORAS_EXCESIVAS':
          interventions.push('DESCONEXION_MODO');
          break;
      }
    });

    // Si hay sobrecarga general, redistribuir
    if (riskScore.score >= 80) {
      interventions.push('REDISTRIBUCION_CARGA');
    }

    // Ejecutar intervenciones
    for (const interventionType of [...new Set(interventions)]) {
      try {
        const { data, error } = await supabase.functions.invoke('execute-intervention', {
          body: {
            user_id: riskScore.user_id,
            type: interventionType,
            risk_score_id: riskScore.id,
            tenant_id: user?.tenant_id
          }
        });

        if (error) throw error;

        toast({
          title: "Intervención Activada",
          description: `Se ha aplicado automáticamente: ${getInterventionName(interventionType)}`,
        });
      } catch (error) {
        console.error('Error executing intervention:', error);
      }
    }
  };

  const getInterventionName = (type: string): string => {
    switch (type) {
      case 'FOCO_BLOQUEO': return 'Bloques de tiempo de foco';
      case 'DESCONEXION_MODO': return 'Modo desconexión activado';
      case 'REDISTRIBUCION_CARGA': return 'Redistribución de carga de trabajo';
      default: return type;
    }
  };

  const getTeamRiskScores = async (teamId?: string) => {
    if (!user || user.role !== 'MANAGER') return;

    setLoading(true);
    try {
      // Simular datos del equipo mientras se actualizan los tipos
      const mockTeamScores = [
        {
          id: '1',
          user_id: 'user1',
          score: 25,
          level: 'VERDE' as RiskLevel,
          factors: [],
          calculated_at: new Date().toISOString()
        },
        {
          id: '2', 
          user_id: 'user2',
          score: 65,
          level: 'AMARILLO' as RiskLevel,
          factors: [],
          calculated_at: new Date().toISOString()
        },
        {
          id: '3',
          user_id: 'user3', 
          score: 85,
          level: 'ROJO' as RiskLevel,
          factors: [],
          calculated_at: new Date().toISOString()
        }
      ];

      setTeamScores(mockTeamScores);
    } catch (error) {
      console.error('Error getting team risk scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: RiskLevel): string => {
    switch (level) {
      case 'VERDE': return 'bg-green-100 text-green-800 border-green-300';
      case 'AMARILLO': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ROJO': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getCurrentUserScore = async () => {
    if (!user) return;
    const score = await calculateRiskScore();
    setCurrentScore(score);
  };

  useEffect(() => {
    if (user) {
      getCurrentUserScore();
    }
  }, [user]);

  return {
    loading,
    currentScore,
    teamScores,
    calculateRiskScore,
    getTeamRiskScores,
    getRiskColor,
    getCurrentUserScore,
    RISK_RULES
  };
};