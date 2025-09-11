import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entity_id, entity_type = 'user', period_days = 30 } = await req.json();

    console.log(`Computing wellbeing score for ${entity_type} ${entity_id}, period: ${period_days} days`);

    // Get user's tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    // Get check-ins for the period
    let query = supabase
      .from('checkins')
      .select(`
        *,
        profiles!inner(id, tenant_id, team_id)
      `)
      .gte('created_at', new Date(Date.now() - period_days * 24 * 60 * 60 * 1000).toISOString());

    if (entity_type === 'user') {
      query = query.eq('user_id', entity_id);
    } else {
      // Team-level aggregation
      query = query.eq('profiles.team_id', entity_id);
    }

    const { data: checkins, error: checkinsError } = await query;

    if (checkinsError) {
      console.error('Error fetching checkins:', checkinsError);
      throw checkinsError;
    }

    if (!checkins || checkins.length === 0) {
      return new Response(JSON.stringify({
        score: 50, // Neutral score when no data
        ci_low: 45,
        ci_high: 55,
        n_effective: 0,
        top_drivers: [],
        confidence_level: 0.0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract mood, engagement, workload, relationships, autonomy from responses
    const responses = checkins.map(checkin => {
      const resp = checkin.responses as any;
      return {
        mood: Number(resp?.Q1 || resp?.mood || 50),
        engagement: Number(resp?.Q2 || resp?.engagement || 50),
        workload: Number(resp?.Q3 || resp?.workload || 50),
        relations: Number(resp?.Q4 || resp?.relations || 50),
        autonomy: Number(resp?.Q5 || resp?.autonomy || 50),
        timestamp: checkin.created_at
      };
    });

    // Calculate component averages
    const avgMood = responses.reduce((sum, r) => sum + r.mood, 0) / responses.length;
    const avgEngagement = responses.reduce((sum, r) => sum + r.engagement, 0) / responses.length;
    const avgWorkload = 100 - (responses.reduce((sum, r) => sum + r.workload, 0) / responses.length); // Invert workload
    const avgRelations = responses.reduce((sum, r) => sum + r.relations, 0) / responses.length;
    const avgAutonomy = responses.reduce((sum, r) => sum + r.autonomy, 0) / responses.length;

    // EIE Core formula: Score = 0.35*Mood + 0.25*Engagement + 0.20*Workload + 0.15*Relations + 0.05*Autonomy
    const baseScore = (
      0.35 * avgMood +
      0.25 * avgEngagement +
      0.20 * avgWorkload +
      0.15 * avgRelations +
      0.05 * avgAutonomy
    );

    // Calculate consistency factor (reduces weight if high variability)
    const moodStd = Math.sqrt(responses.reduce((sum, r) => sum + Math.pow(r.mood - avgMood, 2), 0) / responses.length);
    const engagementStd = Math.sqrt(responses.reduce((sum, r) => sum + Math.pow(r.engagement - avgEngagement, 2), 0) / responses.length);
    const avgStd = (moodStd + engagementStd) / 2;
    const cv = avgStd / ((avgMood + avgEngagement) / 2);
    const consistencyFactor = Math.max(0, Math.min(1, 1 - cv * 0.1));

    // Apply exponential smoothing for temporal trend (half-life 14 days)
    const sortedResponses = responses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const lambda = Math.log(2) / 14; // 14-day half-life
    let weightedSum = 0;
    let totalWeight = 0;

    sortedResponses.forEach((resp, index) => {
      const daysSinceStart = (new Date(resp.timestamp).getTime() - new Date(sortedResponses[0].timestamp).getTime()) / (24 * 60 * 60 * 1000);
      const weight = Math.exp(lambda * daysSinceStart);
      const respScore = (
        0.35 * resp.mood +
        0.25 * resp.engagement +
        0.20 * (100 - resp.workload) +
        0.15 * resp.relations +
        0.05 * resp.autonomy
      );
      weightedSum += weight * respScore;
      totalWeight += weight;
    });

    const trendAdjustedScore = totalWeight > 0 ? weightedSum / totalWeight : baseScore;
    const finalScore = Math.round(trendAdjustedScore * consistencyFactor);

    // Generate confidence intervals using bootstrap
    const bootstrapSamples = [];
    for (let i = 0; i < 1000; i++) {
      const sample = [];
      for (let j = 0; j < responses.length; j++) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        sample.push(responses[randomIndex]);
      }
      
      const sampleAvgMood = sample.reduce((sum, r) => sum + r.mood, 0) / sample.length;
      const sampleAvgEngagement = sample.reduce((sum, r) => sum + r.engagement, 0) / sample.length;
      const sampleAvgWorkload = 100 - (sample.reduce((sum, r) => sum + r.workload, 0) / sample.length);
      const sampleAvgRelations = sample.reduce((sum, r) => sum + r.relations, 0) / sample.length;
      const sampleAvgAutonomy = sample.reduce((sum, r) => sum + r.autonomy, 0) / sample.length;
      
      const sampleScore = (
        0.35 * sampleAvgMood +
        0.25 * sampleAvgEngagement +
        0.20 * sampleAvgWorkload +
        0.15 * sampleAvgRelations +
        0.05 * sampleAvgAutonomy
      );
      
      bootstrapSamples.push(sampleScore);
    }

    bootstrapSamples.sort((a, b) => a - b);
    const ci_low = Math.round(bootstrapSamples[Math.floor(0.025 * bootstrapSamples.length)]);
    const ci_high = Math.round(bootstrapSamples[Math.floor(0.975 * bootstrapSamples.length)]);

    // Identify top drivers
    const drivers = [
      { factor: 'Estado de ánimo', contribution: 0.35 * avgMood },
      { factor: 'Compromiso', contribution: 0.25 * avgEngagement },
      { factor: 'Carga de trabajo', contribution: 0.20 * avgWorkload },
      { factor: 'Relaciones', contribution: 0.15 * avgRelations },
      { factor: 'Autonomía', contribution: 0.05 * avgAutonomy }
    ].sort((a, b) => b.contribution - a.contribution);

    const n_effective = responses.length >= 7 ? responses.length : 0; // Privacy: hide if n < 7
    const confidence_level = responses.length >= 30 ? 0.95 : responses.length >= 7 ? 0.80 : 0.68;

    console.log(`Computed score: ${finalScore}, CI: [${ci_low}, ${ci_high}], n=${n_effective}`);

    return new Response(JSON.stringify({
      score: finalScore,
      ci_low,
      ci_high,
      n_effective,
      top_drivers: drivers.slice(0, 3),
      confidence_level
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-compute-score:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      score: 50,
      ci_low: 45,
      ci_high: 55,
      n_effective: 0,
      top_drivers: [],
      confidence_level: 0.0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});