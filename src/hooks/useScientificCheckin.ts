import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ScientificQuestion {
  question_id: string;
  scale_code: string;
  scale_name: string;
  dimension: string;
  question_text: string;
  response_scale: string;
  reverse_scored: boolean;
}

export interface ScaleScore {
  scale_code: string;
  scale_name: string;
  dimension: string | null;
  score: number;
  percentile: number | null;
  interpretation: string;
  completion_percentage: number;
  questions_answered: number;
  questions_total: number;
}

export const useScientificCheckin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<ScientificQuestion | null>(null);
  const [scaleScores, setScaleScores] = useState<ScaleScore[]>([]);

  // Obtener siguiente pregunta inteligente
  const getNextQuestion = async (timing: 'morning' | 'evening'): Promise<ScientificQuestion | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_next_scientific_question', {
        p_user_id: user.id,
        p_timing: timing
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const question: ScientificQuestion = {
          question_id: data[0].question_id,
          scale_code: data[0].scale_code,
          scale_name: data[0].scale_name,
          dimension: data[0].dimension,
          question_text: data[0].question_text,
          response_scale: data[0].response_scale,
          reverse_scored: data[0].reverse_scored
        };
        setCurrentQuestion(question);
        return question;
      }

      return null;
    } catch (error) {
      console.error('Error fetching next question:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la pregunta",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Guardar respuesta de pregunta científica
  const submitQuestionResponse = async (
    questionId: string,
    responseValue: number,
    timing: 'morning' | 'evening'
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_question_history')
        .insert({
          user_id: user.id,
          tenant_id: user.tenant_id,
          question_id: questionId,
          response_value: responseValue,
          timing
        });

      if (error) throw error;

      toast({
        title: "Respuesta guardada",
        description: "Gracias por completar el check-in",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error submitting question response:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la respuesta",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener scores de escalas del usuario
  const fetchScaleScores = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scale_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_percentage', { ascending: false });

      if (error) throw error;

      if (data) {
        setScaleScores(data as ScaleScore[]);
      }
    } catch (error) {
      console.error('Error fetching scale scores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de respuestas
  const getResponseHistory = async (days: number = 30) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_question_history')
        .select(`
          *,
          scientific_questions (
            scale_code,
            scale_name,
            dimension,
            question_text
          )
        `)
        .eq('user_id', user.id)
        .gte('answered_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('answered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching response history:', error);
      return [];
    }
  };

  // Verificar si ya hizo check-in hoy
  const hasCheckedInToday = async (timing: 'morning' | 'evening'): Promise<boolean> => {
    if (!user) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_question_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('timing', timing)
        .gte('answered_at', today.toISOString())
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking today status:', error);
      return false;
    }
  };

  // Calcular progreso global
  const getGlobalProgress = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('scale_scores')
        .select('completion_percentage')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) return { average: 0, scales: 0 };

      const average = data.reduce((sum, s) => sum + (s.completion_percentage || 0), 0) / data.length;
      
      return {
        average: Math.round(average),
        scales: data.length,
        completed: data.filter(s => (s.completion_percentage || 0) >= 90).length
      };
    } catch (error) {
      console.error('Error calculating global progress:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchScaleScores();
    }
  }, [user]);

  return {
    loading,
    currentQuestion,
    scaleScores,
    getNextQuestion,
    submitQuestionResponse,
    fetchScaleScores,
    getResponseHistory,
    hasCheckedInToday,
    getGlobalProgress
  };
};
