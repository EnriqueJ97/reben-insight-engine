import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Core EIE interfaces
export interface WellbeingScore {
  score: number;
  ci_low: number;
  ci_high: number;
  n_effective: number;
  top_drivers: Array<{ factor: string; contribution: number }>;
  confidence_level: number;
}

export interface BenchmarkResult {
  percentile: number;
  sample_n: number;
  confidence_flag: 'high' | 'medium' | 'low';
  industry_context: string;
}

export interface TurnoverRisk {
  risk_90d: number;
  risk_180d: number;
  ci_low: number;
  ci_high: number;
  top_drivers: Array<{ factor: string; contribution: number }>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface CSRDMapping {
  kpi_code: string;
  value: number;
  coverage: number;
  ready_for_audit: boolean;
  data_quality: 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface ExplainabilityResult {
  drivers: Array<{ factor: string; contribution: number; description: string }>;
  notes: string;
  confidence: number;
}

export interface EIECache {
  metric_key: string;
  value: number;
  ci_low?: number;
  ci_high?: number;
  n_effective?: number;
  drivers?: any[];
  updated_at: string;
}

const useEIECore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, EIECache>>({});

  // Check if EIE v2 is enabled for tenant
  const isEIEEnabled = useCallback(async (): Promise<boolean> => {
    if (!user?.tenant_id) return false;
    
    const { data, error } = await supabase
      .from('tenants')
      .select('eie_v2_enabled')
      .eq('id', user.tenant_id)
      .single();
    
    return data?.eie_v2_enabled || false;
  }, [user?.tenant_id]);

  // Get cached metric or compute new one
  const getCachedMetric = useCallback(async (
    entityId: string,
    entityType: 'user' | 'team',
    metricKey: string
  ): Promise<EIECache | null> => {
    if (!user?.tenant_id) return null;

    const cacheKey = `${entityId}_${entityType}_${metricKey}`;
    
    // Check memory cache first
    if (cache[cacheKey]) {
      const cached = cache[cacheKey];
      const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
      if (cacheAge < 15 * 60 * 1000) { // 15 min cache
        return cached;
      }
    }

    // Check database cache
    const { data, error } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .eq('metric_key', metricKey)
      .maybeSingle();

    if (data && !error) {
      const result: EIECache = {
        metric_key: data.metric_key,
        value: Number(data.value),
        ci_low: data.ci_low ? Number(data.ci_low) : undefined,
        ci_high: data.ci_high ? Number(data.ci_high) : undefined,
        n_effective: data.n_effective || undefined,
        drivers: Array.isArray(data.drivers) ? data.drivers : [],
        updated_at: data.updated_at
      };
      
      setCache(prev => ({ ...prev, [cacheKey]: result }));
      return result;
    }

    return null;
  }, [user?.tenant_id, cache]);

  // Store metric in cache
  const setCachedMetric = useCallback(async (
    entityId: string,
    entityType: 'user' | 'team',
    metricKey: string,
    value: number,
    ciLow?: number,
    ciHigh?: number,
    nEffective?: number,
    drivers?: any[]
  ): Promise<void> => {
    if (!user?.tenant_id) return;

    const { error } = await supabase
      .from('analytics_cache')
      .upsert({
        tenant_id: user.tenant_id,
        entity_id: entityId,
        entity_type: entityType,
        metric_key: metricKey,
        value,
        ci_low: ciLow,
        ci_high: ciHigh,
        n_effective: nEffective,
        drivers: drivers || []
      });

    if (!error) {
      const cacheKey = `${entityId}_${entityType}_${metricKey}`;
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          metric_key: metricKey,
          value,
          ci_low: ciLow,
          ci_high: ciHigh,
          n_effective: nEffective,
          drivers: drivers || [],
          updated_at: new Date().toISOString()
        }
      }));
    }
  }, [user?.tenant_id]);

  // Compute wellbeing score with confidence intervals
  const computeWellbeingScore = useCallback(async (
    entityId: string,
    entityType: 'user' | 'team' = 'user',
    period: number = 30
  ): Promise<WellbeingScore | null> => {
    if (!user?.tenant_id || !(await isEIEEnabled())) return null;

    // Check cache first
    const cached = await getCachedMetric(entityId, entityType, 'wellbeing_score');
    if (cached) {
      return {
        score: cached.value,
        ci_low: cached.ci_low || cached.value - 5,
        ci_high: cached.ci_high || cached.value + 5,
        n_effective: cached.n_effective || 1,
        top_drivers: cached.drivers || [],
        confidence_level: cached.n_effective && cached.n_effective >= 7 ? 0.95 : 0.68
      };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('eie-compute-score', {
        body: {
          entity_id: entityId,
          entity_type: entityType,
          period_days: period
        }
      });

      if (error) throw error;
      
      if (data) {
        // Cache the result
        await setCachedMetric(
          entityId,
          entityType,
          'wellbeing_score',
          data.score,
          data.ci_low,
          data.ci_high,
          data.n_effective,
          data.top_drivers
        );

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error computing wellbeing score:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, isEIEEnabled, getCachedMetric, setCachedMetric]);

  // Get benchmark percentile
  const getBenchmarkPercentile = useCallback(async (
    metric: number,
    context: {
      industry?: string;
      company_size?: string;
      region?: string;
      metric_type: string;
    }
  ): Promise<BenchmarkResult | null> => {
    if (!user?.tenant_id || !(await isEIEEnabled())) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('eie-benchmark', {
        body: {
          metric,
          context
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting benchmark:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, isEIEEnabled]);

  // Predict turnover risk
  const predictTurnoverRisk = useCallback(async (
    entityId: string,
    horizonDays: number = 90
  ): Promise<TurnoverRisk | null> => {
    if (!user?.tenant_id || !(await isEIEEnabled())) return null;

    // Check cache first
    const cached = await getCachedMetric(entityId, 'user', `turnover_risk_${horizonDays}d`);
    if (cached) {
      return {
        risk_90d: horizonDays === 90 ? cached.value : cached.value * 0.7,
        risk_180d: horizonDays === 180 ? cached.value : cached.value * 1.4,
        ci_low: cached.ci_low || cached.value - 10,
        ci_high: cached.ci_high || cached.value + 10,
        top_drivers: cached.drivers || [],
        risk_level: cached.value > 70 ? 'critical' : cached.value > 50 ? 'high' : cached.value > 30 ? 'medium' : 'low'
      };
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('eie-turnover-risk', {
        body: {
          entity_id: entityId,
          horizon_days: horizonDays
        }
      });

      if (error) throw error;
      
      if (data) {
        // Cache the result
        await setCachedMetric(
          entityId,
          'user',
          `turnover_risk_${horizonDays}d`,
          data.risk_90d,
          data.ci_low,
          data.ci_high,
          10, // Assumed sample size for turnover models
          data.top_drivers
        );

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error predicting turnover risk:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, isEIEEnabled, getCachedMetric, setCachedMetric]);

  // Map CSRD KPIs
  const mapCSRDKPIs = useCallback(async (
    inputs: Record<string, any>
  ): Promise<CSRDMapping[]> => {
    if (!user?.tenant_id || !(await isEIEEnabled())) return [];

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('eie-csrd-map', {
        body: { inputs }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error mapping CSRD KPIs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, isEIEEnabled]);

  // Get explainability for metrics
  const getExplainability = useCallback(async (
    entityId: string,
    metricType: string = 'wellbeing'
  ): Promise<ExplainabilityResult | null> => {
    if (!user?.tenant_id || !(await isEIEEnabled())) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('eie-explainability', {
        body: {
          entity_id: entityId,
          metric_type: metricType
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting explainability:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, isEIEEnabled]);

  // Generate confidence intervals using bootstrap
  const generateConfidenceInterval = useCallback((
    values: number[],
    confidenceLevel: number = 0.95
  ): { ci_low: number; ci_high: number } => {
    if (values.length < 2) {
      const mean = values[0] || 0;
      return { ci_low: mean - 5, ci_high: mean + 5 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(alpha / 2 * sorted.length);
    const upperIndex = Math.ceil((1 - alpha / 2) * sorted.length) - 1;

    return {
      ci_low: sorted[lowerIndex] || sorted[0],
      ci_high: sorted[upperIndex] || sorted[sorted.length - 1]
    };
  }, []);

  // Get privacy compliant sample size
  const getPrivacyCompliantN = useCallback((actualN: number): number => {
    return actualN >= 7 ? actualN : 0; // Hide if n < 7 for privacy
  }, []);

  return {
    loading,
    isEIEEnabled,
    computeWellbeingScore,
    getBenchmarkPercentile,
    predictTurnoverRisk,
    mapCSRDKPIs,
    getExplainability,
    generateConfidenceInterval,
    getPrivacyCompliantN,
    getCachedMetric,
    setCachedMetric
  };
};

export default useEIECore;