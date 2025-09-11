import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Risk factor weights for turnover prediction
const RISK_WEIGHTS = {
  emotional_exhaustion: 0.35,
  depersonalization: 0.20,
  personal_accomplishment: -0.25, // Negative because higher = lower risk
  workload_stress: 0.15,
  engagement_decline: 0.30,
  relationship_issues: 0.10,
  recovery_time: 0.15
};

// Baseline survival probabilities by role and tenure
const SURVIVAL_BASELINES = {
  'EMPLOYEE': { '0-6m': 0.75, '6m-2y': 0.85, '2y+': 0.90 },
  'MANAGER': { '0-6m': 0.80, '6m-2y': 0.88, '2y+': 0.92 },
  'HR_ADMIN': { '0-6m': 0.82, '6m-2y': 0.90, '2y+': 0.94 }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entity_id, horizon_days = 90 } = await req.json();

    console.log(`Predicting turnover risk for user ${entity_id}, horizon: ${horizon_days} days`);

    // Get user's profile and tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    // Get employee profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, created_at, tenant_id')
      .eq('id', entity_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // Get recent check-ins (last 60 days)
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('responses, created_at')
      .eq('user_id', entity_id)
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (checkinsError) {
      console.error('Error fetching checkins:', checkinsError);
      throw checkinsError;
    }

    // Get recent alerts (last 30 days)
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('type, severity, created_at')
      .eq('user_id', entity_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
    }

    // Calculate tenure category
    const tenureMonths = (Date.now() - new Date(profile.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000);
    let tenureCategory: string;
    if (tenureMonths < 6) {
      tenureCategory = '0-6m';
    } else if (tenureMonths < 24) {
      tenureCategory = '6m-2y';
    } else {
      tenureCategory = '2y+';
    }

    // Get baseline survival probability
    const roleBaselines = SURVIVAL_BASELINES[profile.role as keyof typeof SURVIVAL_BASELINES] || SURVIVAL_BASELINES['EMPLOYEE'];
    const baselineSurvival = roleBaselines[tenureCategory as keyof typeof roleBaselines] || 0.85;

    // Calculate risk factors from check-ins
    let emotionalExhaustion = 0;
    let depersonalization = 0;
    let personalAccomplishment = 50;
    let workloadStress = 0;
    let engagementDecline = 0;
    let relationshipIssues = 0;

    if (checkins && checkins.length > 0) {
      const responses = checkins.map(c => c.responses as any);
      
      // Emotional exhaustion (inverse of mood)
      const moodScores = responses.map(r => Number(r?.Q1 || r?.mood || 50));
      emotionalExhaustion = 100 - (moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length);

      // Engagement decline (check for downward trend)
      const engagementScores = responses.map(r => Number(r?.Q2 || r?.engagement || 50));
      if (engagementScores.length >= 4) {
        const recent = engagementScores.slice(0, 2).reduce((sum, score) => sum + score, 0) / 2;
        const older = engagementScores.slice(-2).reduce((sum, score) => sum + score, 0) / 2;
        engagementDecline = Math.max(0, older - recent);
      }

      // Workload stress
      const workloadScores = responses.map(r => Number(r?.Q3 || r?.workload || 50));
      workloadStress = workloadScores.reduce((sum, score) => sum + score, 0) / workloadScores.length;

      // Relationship issues (inverse of relations score)
      const relationScores = responses.map(r => Number(r?.Q4 || r?.relations || 50));
      relationshipIssues = 100 - (relationScores.reduce((sum, score) => sum + score, 0) / relationScores.length);

      // Personal accomplishment (higher is better)
      const autonomyScores = responses.map(r => Number(r?.Q5 || r?.autonomy || 50));
      personalAccomplishment = autonomyScores.reduce((sum, score) => sum + score, 0) / autonomyScores.length;
    }

    // Recovery time from alerts
    let recoveryTime = 0;
    if (alerts && alerts.length > 0) {
      const burnoutAlerts = alerts.filter(a => a.type === 'burnout' || a.severity === 'high').length;
      recoveryTime = Math.min(100, burnoutAlerts * 20); // 20 points per high-severity alert
    }

    // Calculate composite risk score
    const riskScore = Math.max(0, Math.min(100,
      RISK_WEIGHTS.emotional_exhaustion * emotionalExhaustion +
      RISK_WEIGHTS.depersonalization * depersonalization +
      RISK_WEIGHTS.personal_accomplishment * (100 - personalAccomplishment) +
      RISK_WEIGHTS.workload_stress * workloadStress +
      RISK_WEIGHTS.engagement_decline * engagementDecline +
      RISK_WEIGHTS.relationship_issues * relationshipIssues +
      RISK_WEIGHTS.recovery_time * recoveryTime
    ));

    // Convert to survival probability
    const survivalProbability = baselineSurvival * (1 - riskScore / 100);

    // Calculate risk for different horizons
    const risk_90d = Math.round((1 - Math.pow(survivalProbability, horizon_days / 90)) * 100);
    const risk_180d = Math.round((1 - Math.pow(survivalProbability, horizon_days / 180)) * 100);

    // Generate confidence intervals (simple approach)
    const uncertainty = checkins && checkins.length >= 10 ? 5 : 15; // Lower uncertainty with more data
    const ci_low = Math.max(0, risk_90d - uncertainty);
    const ci_high = Math.min(100, risk_90d + uncertainty);

    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high' | 'critical';
    if (risk_90d >= 70) {
      risk_level = 'critical';
    } else if (risk_90d >= 50) {
      risk_level = 'high';
    } else if (risk_90d >= 30) {
      risk_level = 'medium';
    } else {
      risk_level = 'low';
    }

    // Identify top drivers
    const drivers = [
      { factor: 'Agotamiento emocional', contribution: emotionalExhaustion },
      { factor: 'Declive del compromiso', contribution: engagementDecline },
      { factor: 'Estrés por carga', contribution: workloadStress },
      { factor: 'Problemas relacionales', contribution: relationshipIssues },
      { factor: 'Tiempo de recuperación', contribution: recoveryTime }
    ]
    .filter(d => d.contribution > 10)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

    console.log(`Risk prediction: ${risk_90d}% (${risk_level}), drivers: ${drivers.map(d => d.factor).join(', ')}`);

    return new Response(JSON.stringify({
      risk_90d,
      risk_180d,
      ci_low,
      ci_high,
      top_drivers: drivers,
      risk_level
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-turnover-risk:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      risk_90d: 25,
      risk_180d: 35,
      ci_low: 20,
      ci_high: 30,
      top_drivers: [],
      risk_level: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});