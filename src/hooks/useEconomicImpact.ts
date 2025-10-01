import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EconomicImpact {
  total_cost_impact: number;
  breakdown: {
    turnover_costs: number;
    burnout_productivity_loss: number;
    absenteeism_costs: number;
    replacement_costs: number;
    indirect_costs: number;
  };
  annual_projection: number;
  prevention_investment_recommended: number;
  expected_roi: number;
  estimated_savings: number;
  payback_period_months: number;
  industry_benchmark: {
    avg_turnover_rate: number;
    avg_burnout_rate: number;
    company_vs_benchmark: 'mejor' | 'similar' | 'peor';
  };
  recommendations: Array<{
    area: string;
    investment: number;
    expected_return: number;
    roi_percentage: number;
  }>;
  confidence_score: number;
}

export const useEconomicImpact = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState<EconomicImpact | null>(null);

  const calculateEconomicImpact = async (periodDays: number = 365): Promise<EconomicImpact | null> => {
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
      const { data: result, error } = await supabase.functions.invoke('ai-economic-impact', {
        body: {
          tenant_id: user.tenant_id,
          period_days: periodDays
        }
      });

      if (error) {
        throw error;
      }

      if (result.success && result.impact) {
        const impactData = result.impact;
        setImpact(impactData);
        
        toast({
          title: "Análisis económico completado",
          description: `Impacto total: €${impactData.total_cost_impact.toLocaleString()}`,
          variant: "default"
        });

        return impactData;
      }

      throw new Error(result.error || 'Unknown error calculating economic impact');

    } catch (error) {
      console.error('Economic impact calculation error:', error);
      toast({
        title: "Error en análisis económico",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getROIProjection = (investmentAmount: number): { 
    roi: number; 
    savings: number; 
    payback: number 
  } | null => {
    if (!impact) return null;

    const savings = impact.estimated_savings;
    const roi = ((savings - investmentAmount) / investmentAmount) * 100;
    const payback = investmentAmount / (savings / 12);

    return {
      roi,
      savings,
      payback
    };
  };

  const compareWithBenchmark = (): {
    status: 'mejor' | 'similar' | 'peor';
    message: string;
  } | null => {
    if (!impact) return null;

    const benchmark = impact.industry_benchmark;
    return {
      status: benchmark.company_vs_benchmark,
      message: benchmark.company_vs_benchmark === 'mejor'
        ? 'Su organización está por encima del promedio de la industria'
        : benchmark.company_vs_benchmark === 'similar'
        ? 'Su organización está en línea con el promedio de la industria'
        : 'Hay oportunidades significativas de mejora'
    };
  };

  return {
    loading,
    impact,
    calculateEconomicImpact,
    getROIProjection,
    compareWithBenchmark
  };
};
