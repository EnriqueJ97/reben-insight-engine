import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id, user_ids } = await req.json();

    if (!tenant_id) {
      throw new Error('tenant_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get users to analyze
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('tenant_id', tenant_id);

    if (user_ids && user_ids.length > 0) {
      query = query.in('id', user_ids);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    let alertsCreated = 0;
    const results: any[] = [];

    for (const user of users || []) {
      try {
        // Call AI burnout detection
        const { data: burnoutData } = await supabase.functions.invoke('ai-burnout-detection', {
          body: {
            user_id: user.id,
            tenant_id,
            period_days: 30
          }
        });

        if (burnoutData?.success && burnoutData.analysis) {
          const analysis = burnoutData.analysis;
          
          // Create alert if risk is medium or higher
          if (analysis.risk_level === 'medio' || analysis.risk_level === 'alto' || analysis.risk_level === 'critico') {
            const severity = analysis.risk_level === 'critico' ? 'high' : 
                           analysis.risk_level === 'alto' ? 'high' : 'medium';

            const { error: alertError } = await supabase
              .from('alerts')
              .insert({
                user_id: user.id,
                type: 'burnout_risk',
                severity,
                message: `Riesgo de burnout ${analysis.risk_level.toUpperCase()} detectado: ${analysis.warning_signs?.[0] || 'Revisar indicadores'}`,
                status: 'pending',
                priority: severity === 'high' ? 'high' : 'medium'
              });

            if (!alertError) {
              alertsCreated++;
              results.push({
                user_id: user.id,
                user_name: user.full_name,
                type: 'burnout',
                risk_level: analysis.risk_level,
                risk_score: analysis.risk_score
              });
            }
          }
        }

        // Call AI turnover prediction
        const { data: turnoverData } = await supabase.functions.invoke('ai-turnover-prediction', {
          body: {
            user_id: user.id,
            tenant_id,
            period_days: 90
          }
        });

        if (turnoverData?.success && turnoverData.prediction) {
          const prediction = turnoverData.prediction;
          
          // Create alert if turnover risk is medium or higher
          if (prediction.turnover_probability >= 50) {
            const severity = prediction.turnover_probability >= 75 ? 'high' : 'medium';

            const { error: alertError } = await supabase
              .from('alerts')
              .insert({
                user_id: user.id,
                type: 'turnover_risk',
                severity,
                message: `Riesgo de rotación ${prediction.risk_level.toUpperCase()}: ${prediction.turnover_probability}% probabilidad`,
                status: 'pending',
                priority: severity === 'high' ? 'high' : 'medium'
              });

            if (!alertError) {
              alertsCreated++;
              results.push({
                user_id: user.id,
                user_name: user.full_name,
                type: 'turnover',
                risk_level: prediction.risk_level,
                probability: prediction.turnover_probability
              });
            }
          }
        }

      } catch (userError) {
        console.error(`Error analyzing user ${user.id}:`, userError);
        results.push({
          user_id: user.id,
          user_name: user.full_name,
          error: userError instanceof Error ? userError.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alertsCreated,
        users_analyzed: users?.length || 0,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Generate alerts error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
