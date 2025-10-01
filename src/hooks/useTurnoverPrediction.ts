import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TurnoverPrediction {
  turnover_probability: number;
  risk_level: 'bajo' | 'medio' | 'alto' | 'critico';
  risk_factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  warning_signs: string[];
  estimated_days_to_exit: number;
  retention_probability_if_action: number;
  recommended_actions: Array<{
    action: string;
    priority: 'alta' | 'media' | 'baja';
    impact: number;
  }>;
  survival_probability_90d: number;
  survival_probability_180d: number;
  confidence_score: number;
}

export const useTurnoverPrediction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Map<string, TurnoverPrediction>>(new Map());

  const predictTurnover = async (
    userId: string,
    periodDays: number = 90
  ): Promise<TurnoverPrediction | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-turnover-prediction', {
        body: {
          user_id: userId,
          tenant_id: user.tenant_id,
          period_days: periodDays
        }
      });

      if (error) {
        throw error;
      }

      if (result.success && result.prediction) {
        const prediction = result.prediction;
        
        setPredictions(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, prediction);
          return newMap;
        });

        const riskLevel = prediction.risk_level;
        toast({
          title: "Predicción de rotación completada",
          description: `Riesgo: ${riskLevel.toUpperCase()} (${prediction.turnover_probability}%)`,
          variant: riskLevel === 'critico' || riskLevel === 'alto' ? 'destructive' : 'default'
        });

        return prediction;
      }

      throw new Error(result.error || 'Unknown error predicting turnover');

    } catch (error) {
      console.error('Turnover prediction error:', error);
      toast({
        title: "Error en predicción de rotación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const predictTeamTurnover = async (
    teamId: string,
    periodDays: number = 90
  ): Promise<Map<string, TurnoverPrediction>> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return new Map();
    }

    setLoading(true);
    try {
      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', teamId)
        .eq('tenant_id', user.tenant_id);

      if (teamError) throw teamError;

      const teamPredictions = new Map<string, TurnoverPrediction>();

      // Predict for each team member
      for (const member of teamMembers || []) {
        const prediction = await predictTurnover(member.id, periodDays);
        if (prediction) {
          teamPredictions.set(member.id, prediction);
        }
      }

      return teamPredictions;

    } catch (error) {
      console.error('Team turnover prediction error:', error);
      toast({
        title: "Error en predicción de equipo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      return new Map();
    } finally {
      setLoading(false);
    }
  };

  const getHighRiskEmployees = (threshold: number = 60): Array<{
    userId: string;
    prediction: TurnoverPrediction;
  }> => {
    const highRisk: Array<{ userId: string; prediction: TurnoverPrediction }> = [];
    
    predictions.forEach((prediction, userId) => {
      if (prediction.turnover_probability >= threshold) {
        highRisk.push({ userId, prediction });
      }
    });

    return highRisk.sort((a, b) => 
      b.prediction.turnover_probability - a.prediction.turnover_probability
    );
  };

  const clearPredictions = () => {
    setPredictions(new Map());
  };

  return {
    loading,
    predictions,
    predictTurnover,
    predictTeamTurnover,
    getHighRiskEmployees,
    clearPredictions
  };
};
