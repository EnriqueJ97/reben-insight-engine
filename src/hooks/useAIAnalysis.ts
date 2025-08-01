import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysis {
  wellness_assessment: string;
  risk_level: 'bajo' | 'medio' | 'alto';
  key_insights: string[];
  immediate_actions: string[];
  predictions_30_days: string;
  confidence_score: number;
}

export interface BurnoutPrediction {
  risk_score: number;
  risk_level: 'bajo' | 'medio' | 'alto';
  warning_signs: string[];
  recommended_actions: string[];
  follow_up_timeline: string;
}

export interface TeamRecommendations {
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'alta' | 'media' | 'baja';
    timeframe: string;
    category: string;
  }>;
}

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const analyzeWellnessData = async (data: any): Promise<AIAnalysis | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'wellness_analysis',
          data,
          tenant_id: user.tenant_id
        }
      });

      if (error) throw error;

      if (result.success) {
        return result.analysis;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Error en análisis IA",
        description: "No se pudo completar el análisis. Usando datos básicos.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const predictBurnoutRisk = async (employeeData: any): Promise<BurnoutPrediction | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'burnout_prediction',
          data: employeeData,
          tenant_id: user.tenant_id,
          user_id: employeeData.user_id
        }
      });

      if (error) throw error;

      if (result.success) {
        return result.analysis;
      }
      
      return null;
    } catch (error) {
      console.error('Burnout prediction error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateTeamInsights = async (teamData: any): Promise<TeamRecommendations | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'team_insights',
          data: teamData,
          tenant_id: user.tenant_id,
          team_id: teamData.team_id
        }
      });

      if (error) throw error;

      if (result.success) {
        return result.analysis;
      }
      
      return null;
    } catch (error) {
      console.error('Team insights error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveReport = async (data: any) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'recommendations',
          data,
          tenant_id: user.tenant_id
        }
      });

      if (error) throw error;

      if (result.success) {
        toast({
          title: "Análisis IA completado",
          description: "Se han generado insights y recomendaciones inteligentes"
        });
        return result.analysis;
      }
      
      return null;
    } catch (error) {
      console.error('Comprehensive report error:', error);
      toast({
        title: "Error en reporte IA",
        description: "No se pudo generar el análisis completo",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeCheckInPatterns = async (userId: string, period: number = 30) => {
    if (!user) return null;

    try {
      // Get user checkin data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const { data: checkins } = await supabase
        .from('checkins')
        .select(`
          mood,
          response_value,
          created_at,
          profiles!inner(id, full_name, role)
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (!checkins || checkins.length === 0) return null;

      const avgMood = checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length;
      const trend = checkins.length > 1 ? 
        (checkins[0].mood > checkins[checkins.length - 1].mood ? 'mejorando' : 'empeorando') : 'estable';

      const employeeData = {
        user_id: userId,
        checkins_count: checkins.length,
        avg_mood: avgMood,
        trend,
        previous_alerts: 0, // Would get from alerts table
        role: checkins[0].profiles.role
      };

      return await predictBurnoutRisk(employeeData);
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return null;
    }
  };

  return {
    loading,
    analyzeWellnessData,
    predictBurnoutRisk,
    generateTeamInsights,
    generateComprehensiveReport,
    analyzeCheckInPatterns
  };
};