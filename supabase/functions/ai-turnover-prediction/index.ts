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
    const { user_id, tenant_id, period_days = 90 } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    // Fetch comprehensive employee data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, team_id, email, created_at')
      .eq('id', user_id)
      .single();

    if (profileError) throw profileError;

    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString());

    if (checkinsError) throw checkinsError;

    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', startDate.toISOString());

    if (alertsError) throw alertsError;

    const { data: flexRequests, error: flexError } = await supabase
      .from('flex_requests')
      .select('*')
      .eq('employee_id', user_id)
      .gte('created_at', startDate.toISOString());

    if (flexError) throw flexError;

    // Calculate attrition indicators
    const tenure = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const moodScores = checkins.map(c => c.mood).filter(m => m !== null);
    const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
    
    const recentMoods = moodScores.slice(0, 30);
    const olderMoods = moodScores.slice(30, 60);
    const moodDecline = recentMoods.length > 0 && olderMoods.length > 0
      ? (olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length) - 
        (recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length)
      : 0;

    const engagementScores = checkins
      .map(c => c.response_value)
      .filter(v => v !== null && typeof v === 'number');
    const avgEngagement = engagementScores.length > 0 
      ? engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length 
      : 0;

    const criticalAlerts = alerts.filter(a => a.severity === 'high').length;
    const rejectedFlexRequests = flexRequests.filter(r => r.status === 'REJECTED').length;

    const prompt = `Eres un experto en gestión del talento y predicción de rotación laboral. Analiza los siguientes datos:

PERFIL DEL EMPLEADO:
- Rol: ${profile.role}
- Antigüedad: ${tenure} meses
- Período analizado: ${period_days} días

INDICADORES DE RIESGO:
- Estado de ánimo promedio: ${avgMood.toFixed(2)}/5
- Declive del ánimo: ${moodDecline > 0 ? '+' : ''}${moodDecline.toFixed(2)} puntos
- Engagement promedio: ${avgEngagement.toFixed(2)}/5
- Alertas críticas: ${criticalAlerts}
- Solicitudes de flexibilidad rechazadas: ${rejectedFlexRequests}
- Frecuencia de check-ins: ${checkins.length} en ${period_days} días

ANÁLISIS SOLICITADO:
1. Probabilidad de rotación voluntaria (0-100%)
2. Nivel de riesgo (bajo/medio/alto/crítico)
3. Factores de riesgo principales
4. Señales de alerta específicas
5. Tiempo estimado hasta posible salida (días)
6. Probabilidad de retención si se actúa ahora
7. Acciones recomendadas (priorizadas)

Responde en formato JSON:
{
  "turnover_probability": 0-100,
  "risk_level": "bajo|medio|alto|critico",
  "risk_factors": [{"factor": "nombre", "weight": 0-100, "description": "detalles"}],
  "warning_signs": ["señal1", "señal2", ...],
  "estimated_days_to_exit": number,
  "retention_probability_if_action": 0-100,
  "recommended_actions": [{"action": "acción", "priority": "alta|media|baja", "impact": 0-100}],
  "survival_probability_90d": 0-100,
  "survival_probability_180d": 0-100,
  "confidence_score": 0-100
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
          { role: 'system', content: 'Eres un experto en analítica de RRHH y retención de talento. Proporciona predicciones basadas en datos.' },
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
    const prediction = JSON.parse(aiData.choices[0].message.content);

    // Store prediction
    const { error: insertError } = await supabase
      .from('analytics_cache')
      .insert({
        tenant_id,
        entity_id: user_id,
        entity_type: 'user',
        metric_key: 'turnover_prediction',
        value: prediction.turnover_probability,
        context: {
          prediction,
          calculated_at: new Date().toISOString(),
          data_points: checkins.length,
          period_days
        }
      });

    if (insertError) console.error('Error storing prediction:', insertError);

    return new Response(
      JSON.stringify({
        success: true,
        prediction,
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
    console.error('Turnover prediction error:', error);
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
