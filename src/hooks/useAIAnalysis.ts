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
      const { data: result, error } = await supabase.functions.invoke('ai-burnout-detection', {
        body: {
          user_id: data.user_id || user.id,
          tenant_id: user.tenant_id,
          period_days: data.period_days || 30
        }
      });

      if (error) throw error;

      if (result.success) {
        const analysis = result.analysis;
        toast({
          title: "Análisis de Burnout completado",
          description: `Nivel de riesgo: ${analysis.risk_level.toUpperCase()}`,
          variant: analysis.risk_level === 'critico' || analysis.risk_level === 'alto' ? 'destructive' : 'default'
        });
        
        return {
          wellness_assessment: `Riesgo ${analysis.risk_level} detectado`,
          risk_level: analysis.risk_level === 'critico' ? 'alto' : 
                     analysis.risk_level === 'alto' ? 'alto' : 
                     analysis.risk_level === 'medio' ? 'medio' : 'bajo',
          key_insights: analysis.warning_signs || [],
          immediate_actions: analysis.immediate_actions || [],
          predictions_30_days: analysis.predictions_30_days || '',
          confidence_score: analysis.confidence_score || 0
        };
      }
      
      throw new Error(result.error || 'Unknown error');
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Error en análisis de burnout",
        description: error instanceof Error ? error.message : "Error desconocido",
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
      const { data: result, error } = await supabase.functions.invoke('ai-burnout-detection', {
        body: {
          user_id: employeeData.user_id,
          tenant_id: user.tenant_id,
          period_days: employeeData.period_days || 30
        }
      });

      if (error) throw error;

      if (result.success) {
        const analysis = result.analysis;
        return {
          risk_score: analysis.risk_score || 0,
          risk_level: analysis.risk_level === 'critico' ? 'alto' : 
                     analysis.risk_level === 'alto' ? 'alto' : 
                     analysis.risk_level === 'medio' ? 'medio' : 'bajo',
          warning_signs: analysis.warning_signs || [],
          recommended_actions: analysis.immediate_actions || [],
          follow_up_timeline: analysis.follow_up_timeline || 'Seguimiento semanal recomendado'
        };
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
      const { data: result, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          tenant_id: user.tenant_id,
          scope: 'team',
          target_id: teamData.team_id
        }
      });

      if (error) throw error;

      if (result.success && result.recommendations) {
        const recs = result.recommendations;
        return {
          recommendations: recs.recommendations?.map((r: any) => ({
            title: r.title,
            description: r.description,
            priority: r.priority === 'critica' ? 'alta' : r.priority,
            timeframe: r.timeline,
            category: r.category
          })) || []
        };
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
      const { data: result, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          tenant_id: user.tenant_id,
          scope: 'organizational',
          target_id: null
        }
      });

      if (error) throw error;

      if (result.success) {
        toast({
          title: "Recomendaciones generadas",
          description: result.recommendations?.executive_summary || "Análisis completado"
        });
        return result.recommendations;
      }
      
      return null;
    } catch (error) {
      console.error('Comprehensive report error:', error);
      toast({
        title: "Error en reporte inteligente",
        description: error instanceof Error ? error.message : "Error desconocido",
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