import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BenchmarkMetric {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
  confidenceLevel: number;
}

export interface BenchmarkContext {
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  region: string;
  timeframe: string;
}

export interface BenchmarkData {
  context: BenchmarkContext;
  metrics: BenchmarkMetric[];
  competitiveIndex: number;
  recommendations: string[];
  lastUpdated: Date;
}

const INDUSTRY_BENCHMARKS = {
  technology: {
    wellness_score: { avg: 7.2, q1: 6.1, q3: 8.3 },
    burnout_index: { avg: 0.34, q1: 0.25, q3: 0.45 },
    participation_rate: { avg: 0.78, q1: 0.65, q3: 0.89 },
    turnover_rate: { avg: 0.18, q1: 0.12, q3: 0.25 }
  },
  healthcare: {
    wellness_score: { avg: 6.8, q1: 5.9, q3: 7.8 },
    burnout_index: { avg: 0.42, q1: 0.32, q3: 0.54 },
    participation_rate: { avg: 0.72, q1: 0.61, q3: 0.84 },
    turnover_rate: { avg: 0.22, q1: 0.16, q3: 0.31 }
  },
  finance: {
    wellness_score: { avg: 6.9, q1: 6.0, q3: 7.9 },
    burnout_index: { avg: 0.38, q1: 0.28, q3: 0.49 },
    participation_rate: { avg: 0.75, q1: 0.63, q3: 0.86 },
    turnover_rate: { avg: 0.15, q1: 0.10, q3: 0.22 }
  },
  manufacturing: {
    wellness_score: { avg: 6.5, q1: 5.7, q3: 7.4 },
    burnout_index: { avg: 0.36, q1: 0.27, q3: 0.46 },
    participation_rate: { avg: 0.69, q1: 0.58, q3: 0.81 },
    turnover_rate: { avg: 0.19, q1: 0.13, q3: 0.27 }
  },
  retail: {
    wellness_score: { avg: 6.2, q1: 5.4, q3: 7.1 },
    burnout_index: { avg: 0.41, q1: 0.31, q3: 0.52 },
    participation_rate: { avg: 0.64, q1: 0.52, q3: 0.77 },
    turnover_rate: { avg: 0.35, q1: 0.28, q3: 0.44 }
  }
} as const;

const SIZE_ADJUSTMENTS = {
  startup: { wellness: -0.2, burnout: 0.05, participation: -0.05, turnover: 0.08 },
  small: { wellness: -0.1, burnout: 0.02, participation: -0.02, turnover: 0.04 },
  medium: { wellness: 0, burnout: 0, participation: 0, turnover: 0 },
  large: { wellness: 0.1, burnout: -0.02, participation: 0.03, turnover: -0.03 },
  enterprise: { wellness: 0.15, burnout: -0.04, participation: 0.05, turnover: -0.05 }
} as const;

export const useDynamicBenchmarking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);

  const calculatePercentile = (value: number, avg: number, q1: number, q3: number): number => {
    if (value <= q1) return Math.max(5, (value / q1) * 25);
    if (value <= avg) return 25 + ((value - q1) / (avg - q1)) * 25;
    if (value <= q3) return 50 + ((value - avg) / (q3 - avg)) * 25;
    return Math.min(95, 75 + ((value - q3) / (q3 * 0.5)) * 20);
  };

  const determineCompanySize = (employeeCount: number): BenchmarkContext['companySize'] => {
    if (employeeCount < 10) return 'startup';
    if (employeeCount < 50) return 'small';
    if (employeeCount < 250) return 'medium';
    if (employeeCount < 1000) return 'large';
    return 'enterprise';
  };

  const generateRecommendations = (metrics: BenchmarkMetric[]): string[] => {
    const recommendations: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.percentile < 25) {
        switch (metric.metric) {
          case 'wellness_score':
            recommendations.push('Implementar programas de bienestar integral y espacios de descanso');
            break;
          case 'burnout_index':
            recommendations.push('Reducir carga de trabajo y mejorar balance vida-trabajo');
            break;
          case 'participation_rate':
            recommendations.push('Aumentar comunicación y hacer encuestas más atractivas');
            break;
          case 'turnover_rate':
            recommendations.push('Mejorar retención con planes de carrera y reconocimiento');
            break;
        }
      }
    });

    return recommendations;
  };

  const fetchBenchmarkData = async (
    industry: string = 'technology',
    region: string = 'global'
  ): Promise<BenchmarkData | null> => {
    try {
      setLoading(true);

      if (!user?.tenant_id) return null;

      // Get basic tenant info
      const tenant = await supabase.from('tenants').select('industry, name').eq('id', user.tenant_id).single();
      const tenantData = tenant.data;

      // Get employee count
      const profiles = await supabase.from('profiles').select('id').eq('tenant_id', user.tenant_id);
      const employeeCount = profiles.data?.length || 0;
      const companySize = determineCompanySize(employeeCount);

      // Calculate date filter
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString();

      // Get wellness data with explicit error handling
      let checkinsData: any[] = [];
      try {
        const result = await (supabase as any).from('checkins').select('mood').eq('tenant_id', user.tenant_id).gte('created_at', dateFilter);
        checkinsData = result.data || [];
      } catch (e) {
        console.error('Error fetching checkins:', e);
      }

      // Get alerts data with explicit error handling
      let alertsData: any[] = [];
      try {
        const result = await (supabase as any).from('alerts').select('type').eq('tenant_id', user.tenant_id).gte('created_at', dateFilter);
        alertsData = result.data || [];
      } catch (e) {
        console.error('Error fetching alerts:', e);
      }

      // Calculate current metrics
      const totalCheckins = checkinsData.length;
      const totalUsers = employeeCount || 1;
      const participationRate = Math.min(1, totalCheckins / (totalUsers * 30));
      
      const avgWellness = checkinsData.length > 0 
        ? checkinsData.reduce((sum, c: any) => sum + (c.mood || 0), 0) / checkinsData.length 
        : 0;

      const burnoutAlerts = alertsData.filter((a: any) => a.type === 'burnout_risk').length;
      const burnoutIndex = burnoutAlerts / totalUsers;

      // Get industry benchmarks
      const currentIndustry = tenantData?.industry?.toLowerCase() || industry;
      const benchmarks = INDUSTRY_BENCHMARKS[currentIndustry as keyof typeof INDUSTRY_BENCHMARKS] 
        || INDUSTRY_BENCHMARKS.technology;

      // Apply size adjustments
      const sizeAdj = SIZE_ADJUSTMENTS[companySize];
      const adjustedBenchmarks = {
        wellness_score: {
          avg: benchmarks.wellness_score.avg + sizeAdj.wellness,
          q1: benchmarks.wellness_score.q1 + sizeAdj.wellness,
          q3: benchmarks.wellness_score.q3 + sizeAdj.wellness
        },
        burnout_index: {
          avg: benchmarks.burnout_index.avg + sizeAdj.burnout,
          q1: benchmarks.burnout_index.q1 + sizeAdj.burnout,
          q3: benchmarks.burnout_index.q3 + sizeAdj.burnout
        },
        participation_rate: {
          avg: benchmarks.participation_rate.avg + sizeAdj.participation,
          q1: benchmarks.participation_rate.q1 + sizeAdj.participation,
          q3: benchmarks.participation_rate.q3 + sizeAdj.participation
        }
      };

      // Calculate metrics with benchmarks
      const metrics: BenchmarkMetric[] = [
        {
          metric: 'wellness_score',
          ourValue: avgWellness,
          industryAverage: adjustedBenchmarks.wellness_score.avg,
          topQuartile: adjustedBenchmarks.wellness_score.q3,
          bottomQuartile: adjustedBenchmarks.wellness_score.q1,
          percentile: calculatePercentile(
            avgWellness,
            adjustedBenchmarks.wellness_score.avg,
            adjustedBenchmarks.wellness_score.q1,
            adjustedBenchmarks.wellness_score.q3
          ),
          trend: 'stable',
          confidenceLevel: totalCheckins > 50 ? 0.95 : 0.75
        },
        {
          metric: 'burnout_index',
          ourValue: burnoutIndex,
          industryAverage: adjustedBenchmarks.burnout_index.avg,
          topQuartile: adjustedBenchmarks.burnout_index.q1,
          bottomQuartile: adjustedBenchmarks.burnout_index.q3,
          percentile: 100 - calculatePercentile(
            burnoutIndex,
            adjustedBenchmarks.burnout_index.avg,
            adjustedBenchmarks.burnout_index.q1,
            adjustedBenchmarks.burnout_index.q3
          ),
          trend: 'stable',
          confidenceLevel: totalUsers > 20 ? 0.9 : 0.7
        },
        {
          metric: 'participation_rate',
          ourValue: participationRate,
          industryAverage: adjustedBenchmarks.participation_rate.avg,
          topQuartile: adjustedBenchmarks.participation_rate.q3,
          bottomQuartile: adjustedBenchmarks.participation_rate.q1,
          percentile: calculatePercentile(
            participationRate,
            adjustedBenchmarks.participation_rate.avg,
            adjustedBenchmarks.participation_rate.q1,
            adjustedBenchmarks.participation_rate.q3
          ),
          trend: 'stable',
          confidenceLevel: 0.85
        }
      ];

      // Calculate competitive index
      const competitiveIndex = metrics.reduce((sum, m) => sum + m.percentile, 0) / metrics.length;

      const context: BenchmarkContext = {
        industry: currentIndustry,
        companySize,
        region,
        timeframe: '30d'
      };

      return {
        context,
        metrics,
        competitiveIndex,
        recommendations: generateRecommendations(metrics),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshBenchmarks = useCallback(async () => {
    const data = await fetchBenchmarkData();
    setBenchmarkData(data);
  }, []);

  useEffect(() => {
    if (user?.tenant_id) {
      refreshBenchmarks();
    }
  }, [user?.tenant_id]);

  return {
    loading,
    benchmarkData,
    refreshBenchmarks,
    fetchBenchmarkData
  };
};