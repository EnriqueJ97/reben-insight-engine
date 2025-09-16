import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scientific instrument scoring functions
const calculateBurnoutScore = (responses: Record<string, number>, dimensionId: string) => {
  const values = Object.values(responses).filter(v => v !== undefined);
  if (values.length === 0) return 0;
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Convert to 0-100 scale where higher is worse for burnout
  switch (dimensionId) {
    case 'emotional_exhaustion':
    case 'depersonalization':
      return (average / 4) * 100; // Higher scores = more burnout
    case 'personal_accomplishment':
      return ((4 - average) / 4) * 100; // Reverse scored
    default:
      return (average / 4) * 100;
  }
};

const calculateEngagementScore = (responses: Record<string, number>, dimensionId: string) => {
  const values = Object.values(responses).filter(v => v !== undefined);
  if (values.length === 0) return 0;
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  // Convert to 0-100 scale where higher is better for engagement
  return (average / 4) * 100;
};

const calculateSatisfactionScore = (responses: Record<string, number>) => {
  const values = Object.values(responses).filter(v => v !== undefined);
  if (values.length === 0) return 0;
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return (average / 4) * 100;
};

const getRiskLevel = (score: number, instrumentCategory: string) => {
  if (instrumentCategory === 'burnout') {
    // For burnout, higher scores = higher risk
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  } else {
    // For engagement/satisfaction, lower scores = higher risk
    if (score <= 25) return 'critical';
    if (score <= 50) return 'high';
    if (score <= 75) return 'medium';
    return 'low';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId } = await req.json();

    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('evaluation_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get all completed responses for this campaign
    const { data: responses, error: responsesError } = await supabase
      .from('evaluation_responses')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('completion_status', 'completed');

    if (responsesError) throw responsesError;

    if (responses.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No completed responses found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateData = campaign.template_data as any;
    const analytics: any[] = [];

    // Process each instrument component
    for (const component of templateData.components) {
      const instrumentId = component.instrumentId;
      const dimensionId = component.dimensionId;

      // Group responses by team if available
      const responsesByTeam = new Map<string, any[]>();
      const allResponses: any[] = [];

      for (const response of responses) {
        allResponses.push(response);
        
        if (response.user_id) {
          // Get user's team
          const { data: profile } = await supabase
            .from('profiles')
            .select('team_id')
            .eq('id', response.user_id)
            .single();

          if (profile?.team_id) {
            if (!responsesByTeam.has(profile.team_id)) {
              responsesByTeam.set(profile.team_id, []);
            }
            responsesByTeam.get(profile.team_id)!.push(response);
          }
        }
      }

      // Calculate organization-level analytics
      const orgResponses = allResponses.map(r => r.responses as Record<string, number>);
      const orgScore = calculateScoreForInstrument(orgResponses, instrumentId, dimensionId);
      
      analytics.push({
        tenant_id: campaign.tenant_id,
        campaign_id: campaignId,
        instrument_id: instrumentId,
        dimension_id: dimensionId,
        team_id: null, // Organization level
        metric_key: `${instrumentId}${dimensionId ? '_' + dimensionId : ''}_score`,
        score: orgScore,
        risk_level: getRiskLevel(orgScore, getInstrumentCategory(instrumentId)),
        sample_size: allResponses.length,
        confidence_interval: calculateConfidenceInterval(orgScore, allResponses.length),
        benchmark_data: await getBenchmarkData(instrumentId, dimensionId, orgScore)
      });

      // Calculate team-level analytics
      for (const [teamId, teamResponses] of responsesByTeam) {
        if (teamResponses.length >= 3) { // Minimum sample size for team analytics
          const teamResponseData = teamResponses.map(r => r.responses as Record<string, number>);
          const teamScore = calculateScoreForInstrument(teamResponseData, instrumentId, dimensionId);
          
          analytics.push({
            tenant_id: campaign.tenant_id,
            campaign_id: campaignId,
            instrument_id: instrumentId,
            dimension_id: dimensionId,
            team_id: teamId,
            metric_key: `${instrumentId}${dimensionId ? '_' + dimensionId : ''}_score`,
            score: teamScore,
            risk_level: getRiskLevel(teamScore, getInstrumentCategory(instrumentId)),
            sample_size: teamResponses.length,
            confidence_interval: calculateConfidenceInterval(teamScore, teamResponses.length),
            benchmark_data: await getBenchmarkData(instrumentId, dimensionId, teamScore)
          });
        }
      }
    }

    // Insert analytics into database
    if (analytics.length > 0) {
      const { error: analyticsError } = await supabase
        .from('evaluation_analytics')
        .upsert(analytics, {
          onConflict: 'campaign_id,instrument_id,dimension_id,team_id,metric_key'
        });

      if (analyticsError) throw analyticsError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analyticsGenerated: analytics.length,
        campaignId: campaignId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating evaluation analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function calculateScoreForInstrument(
  responses: Record<string, number>[], 
  instrumentId: string, 
  dimensionId?: string
): number {
  if (responses.length === 0) return 0;

  // Filter relevant responses for this instrument/dimension
  const relevantResponses = responses.map(responseSet => {
    const filtered: Record<string, number> = {};
    for (const [key, value] of Object.entries(responseSet)) {
      if (key.includes(instrumentId) && (!dimensionId || key.includes(dimensionId))) {
        filtered[key] = value;
      }
    }
    return filtered;
  }).filter(r => Object.keys(r).length > 0);

  if (relevantResponses.length === 0) return 0;

  const category = getInstrumentCategory(instrumentId);
  
  switch (category) {
    case 'burnout':
      return calculateBurnoutScore(
        relevantResponses.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        dimensionId || 'general'
      );
    case 'engagement':
      return calculateEngagementScore(
        relevantResponses.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        dimensionId || 'general'
      );
    case 'satisfaction':
    case 'climate':
    case 'leadership':
    case 'wellbeing':
    case 'inclusion':
    case 'flexibility':
    case 'commitment':
      return calculateSatisfactionScore(
        relevantResponses.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      );
    default:
      return calculateSatisfactionScore(
        relevantResponses.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      );
  }
}

function getInstrumentCategory(instrumentId: string): string {
  const categoryMap: Record<string, string> = {
    'mbi': 'burnout',
    'cbi': 'burnout',
    'olbi': 'burnout',
    'uwes': 'engagement',
    'weims': 'engagement',
    'jds': 'engagement',
    'jss': 'satisfaction',
    'warr_scale': 'satisfaction',
    'jdi': 'satisfaction',
    'litwin_stringer': 'climate',
    'denison': 'climate',
    'ocai': 'climate'
  };
  
  return categoryMap[instrumentId] || 'satisfaction';
}

function calculateConfidenceInterval(score: number, sampleSize: number): any {
  // Simple confidence interval calculation
  const standardError = Math.sqrt((score * (100 - score)) / sampleSize);
  const marginOfError = 1.96 * standardError; // 95% confidence
  
  return {
    low: Math.max(0, score - marginOfError),
    high: Math.min(100, score + marginOfError)
  };
}

async function getBenchmarkData(instrumentId: string, dimensionId: string | undefined, score: number): Promise<any> {
  // This would typically fetch from benchmarks_ref table
  // For now, return mock benchmark data
  return {
    industry_percentile: Math.floor(Math.random() * 100),
    size_percentile: Math.floor(Math.random() * 100),
    comparison: score > 50 ? 'above_average' : 'below_average'
  };
}