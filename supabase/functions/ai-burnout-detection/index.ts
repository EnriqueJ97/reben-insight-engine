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
    const { user_id, tenant_id, period_days = 30 } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch comprehensive data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (checkinsError) throw checkinsError;

    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString());

    if (alertsError) throw alertsError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, team_id, email')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    // Calculate metrics
    const moodScores = checkins.map(c => c.mood).filter(m => m !== null);
    const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
    
    const recentMoods = moodScores.slice(0, 7);
    const olderMoods = moodScores.slice(7, 14);
    const moodTrend = recentMoods.length > 0 && olderMoods.length > 0
      ? (recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length) - 
        (olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length)
      : 0;

    const engagementScores = checkins
      .map(c => c.response_value)
      .filter(v => v !== null && typeof v === 'number');
    const avgEngagement = engagementScores.length > 0 
      ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length 
      : 0;

    const burnoutAlerts = alerts.filter(a => 
      a.alert_type === 'ALERTA_BURNOUT_ALTO' || 
      a.alert_type === 'ALERTA_CINISMO'
    ).length;

    // AI Analysis with Gemini
    const prompt = `Eres un experto en salud mental laboral y prevención del burnout. Analiza los siguientes datos de un empleado:

DATOS DEL EMPLEADO:
- Rol: ${profile.role}
- Período analizado: ${period_days} días
- Check-ins realizados: ${checkins.length}

MÉTRICAS CALCULADAS:
- Estado de ánimo promedio: ${avgMood.toFixed(2)}/5
- Tendencia del ánimo: ${moodTrend > 0 ? 'mejorando' : moodTrend < 0 ? 'empeorando' : 'estable'} (${moodTrend.toFixed(2)})
- Engagement promedio: ${avgEngagement.toFixed(2)}/5
- Alertas de burnout generadas: ${burnoutAlerts}
- Frecuencia de check-ins: ${(checkins.length / period_days).toFixed(2)} por día

ANÁLISIS DETALLADO:
Por favor proporciona:
1. Nivel de riesgo de burnout (bajo/medio/alto/crítico)
2. Factores de riesgo identificados (mínimo 3)
3. Señales de alerta específicas encontradas
4. Recomendaciones inmediatas (3-5 acciones concretas)
5. Score de confianza del análisis (0-100%)
6. Predicción a 30 días

Responde en formato JSON:
{
  "risk_level": "bajo|medio|alto|critico",
  "risk_score": 0-100,
  "risk_factors": ["factor1", "factor2", ...],
  "warning_signs": ["señal1", "señal2", ...],
  "immediate_actions": ["accion1", "accion2", ...],
  "confidence_score": 0-100,
  "predictions_30_days": "descripción de la predicción",
  "follow_up_timeline": "cronograma sugerido"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Eres un experto en salud mental laboral certificado. Proporciona análisis precisos y profesionales.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = JSON.parse(aiData.choices[0].message.content);

    // Store analysis result
    const { error: insertError } = await supabase
      .from('analytics_cache')
      .insert({
        tenant_id,
        entity_id: user_id,
        entity_type: 'user',
        metric_key: 'burnout_analysis',
        value: aiAnalysis.risk_score,
        context: {
          analysis: aiAnalysis,
          calculated_at: new Date().toISOString(),
          data_points: checkins.length,
          period_days
        }
      });

    if (insertError) console.error('Error storing analysis:', insertError);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: aiAnalysis,
        metadata: {
          user_id,
          tenant_id,
          period_days,
          data_points: checkins.length,
          calculated_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Burnout detection error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
