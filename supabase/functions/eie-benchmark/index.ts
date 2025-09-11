import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default industry benchmarks (ECDF data)
const DEFAULT_BENCHMARKS = {
  'wellbeing_score': {
    'tech': { p25: 65, p50: 72, p75: 82, p90: 88, sample_n: 1250 },
    'healthcare': { p25: 58, p50: 68, p75: 78, p90: 85, sample_n: 890 },
    'finance': { p25: 62, p50: 70, p75: 80, p90: 87, sample_n: 1100 },
    'retail': { p25: 55, p50: 65, p75: 75, p90: 83, sample_n: 750 },
    'manufacturing': { p25: 60, p50: 69, p75: 77, p90: 84, sample_n: 950 },
    'default': { p25: 60, p50: 70, p75: 78, p90: 85, sample_n: 1000 }
  }
};

// Company size adjustments
const SIZE_ADJUSTMENTS = {
  'startup': -2,    // 1-50 employees
  'small': -1,      // 51-250 employees  
  'medium': 0,      // 251-1000 employees
  'large': +1,      // 1001+ employees
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { metric, context } = await req.json();
    const { industry = 'default', company_size = 'medium', region = 'global', metric_type } = context;

    console.log(`Computing benchmark for metric: ${metric}, industry: ${industry}, size: ${company_size}`);

    // Get user's tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    // Try to get custom benchmarks from database first
    const { data: customBenchmark } = await supabase
      .from('benchmarks_ref')
      .select('ecdf_data, sample_n')
      .eq('industry', industry)
      .eq('size_bucket', company_size)
      .eq('region', region)
      .eq('metric_key', metric_type)
      .maybeSingle();

    let benchmarkData;
    let sample_n;

    if (customBenchmark && customBenchmark.ecdf_data) {
      // Use custom benchmark data
      benchmarkData = customBenchmark.ecdf_data as any;
      sample_n = customBenchmark.sample_n;
    } else {
      // Use default benchmarks
      const industryBenchmarks = DEFAULT_BENCHMARKS[metric_type as keyof typeof DEFAULT_BENCHMARKS];
      if (!industryBenchmarks) {
        throw new Error(`Unknown metric type: ${metric_type}`);
      }

      benchmarkData = industryBenchmarks[industry as keyof typeof industryBenchmarks] || 
                     industryBenchmarks['default'];
      sample_n = benchmarkData.sample_n;

      // Apply company size adjustment
      const sizeAdj = SIZE_ADJUSTMENTS[company_size as keyof typeof SIZE_ADJUSTMENTS] || 0;
      benchmarkData = {
        p25: benchmarkData.p25 + sizeAdj,
        p50: benchmarkData.p50 + sizeAdj,
        p75: benchmarkData.p75 + sizeAdj,
        p90: benchmarkData.p90 + sizeAdj,
        sample_n: benchmarkData.sample_n
      };
    }

    // Calculate percentile using linear interpolation
    let percentile;
    if (metric <= benchmarkData.p25) {
      percentile = 25 * (metric / benchmarkData.p25);
    } else if (metric <= benchmarkData.p50) {
      percentile = 25 + 25 * ((metric - benchmarkData.p25) / (benchmarkData.p50 - benchmarkData.p25));
    } else if (metric <= benchmarkData.p75) {
      percentile = 50 + 25 * ((metric - benchmarkData.p50) / (benchmarkData.p75 - benchmarkData.p50));
    } else if (metric <= benchmarkData.p90) {
      percentile = 75 + 15 * ((metric - benchmarkData.p75) / (benchmarkData.p90 - benchmarkData.p75));
    } else {
      percentile = 90 + 10 * Math.min(1, (metric - benchmarkData.p90) / (benchmarkData.p90 * 0.1));
    }

    percentile = Math.max(0, Math.min(100, Math.round(percentile)));

    // Determine confidence flag based on sample size
    let confidence_flag: 'high' | 'medium' | 'low';
    if (sample_n >= 500) {
      confidence_flag = 'high';
    } else if (sample_n >= 100) {
      confidence_flag = 'medium';
    } else {
      confidence_flag = 'low';
    }

    const industry_context = `${industry === 'default' ? 'Promedio general' : industry} (${company_size})`;

    console.log(`Benchmark result: P${percentile}, industry: ${industry_context}, confidence: ${confidence_flag}`);

    return new Response(JSON.stringify({
      percentile,
      sample_n,
      confidence_flag,
      industry_context
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-benchmark:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      percentile: 50,
      sample_n: 0,
      confidence_flag: 'low',
      industry_context: 'Error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});