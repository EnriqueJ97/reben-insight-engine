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
    const { tenant_id, scope = 'organizational', target_id = null } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch organizational data
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenant_id)
      .single();

    if (tenantError) throw tenantError;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role, team_id')
      .eq('tenant_id', tenant_id);

    if (profilesError) throw profilesError;

    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (alertsError) throw alertsError;

    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('mood, response_value, created_at')
      .in('user_id', profiles.map(p => p.id))
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (checkinsError) throw checkinsError;

    // Fetch cached analytics
    const { data: cachedAnalytics, error: cacheError } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('tenant_id', tenant_id)
      .in('metric_key', ['burnout_analysis', 'turnover_prediction'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (cacheError) console.error('Cache error:', cacheError);

    // Calculate organizational metrics
    const totalEmployees = profiles.length;
    const avgMood = checkins.length > 0 
      ? checkins.reduce((sum, c) => sum + (c.mood || 0), 0) / checkins.length 
      : 0;
    const highRiskAlerts = alerts.filter(a => a.severity === 'high').length;
    const burnoutAlerts = alerts.filter(a => a.alert_type === 'ALERTA_BURNOUT_ALTO').length;
    
    const highRiskEmployees = cachedAnalytics
      ?.filter(a => a.metric_key === 'burnout_analysis' && a.value > 70)
      .length || 0;

    const attritionRisk = cachedAnalytics
      ?.filter(a => a.metric_key === 'turnover_prediction' && a.value > 60)
      .length || 0;

    const prompt = `Eres un consultor experto en People Analytics y bienestar organizacional. Analiza los siguientes datos y genera recomendaciones estratégicas:

CONTEXTO ORGANIZACIONAL:
- Empresa: ${tenant.name}
- Industria: ${tenant.industry || 'No especificada'}
- Tamaño: ${totalEmployees} empleados
- Plan de suscripción: ${tenant.subscription_plan}

MÉTRICAS CLAVE:
- Estado de ánimo organizacional promedio: ${avgMood.toFixed(2)}/5
- Alertas de alto riesgo (30d): ${highRiskAlerts}
- Alertas de burnout (30d): ${burnoutAlerts}
- Empleados en riesgo alto: ${highRiskEmployees}
- Empleados con riesgo de rotación: ${attritionRisk}
- Check-ins realizados: ${checkins.length}

ANÁLISIS SOLICITADO:
Genera recomendaciones estratégicas en las siguientes categorías:
1. Prevención de burnout (inmediato, corto, medio plazo)
2. Retención del talento
3. Mejora del engagement
4. Cultura organizacional
5. Políticas de flexibilidad
6. Desarrollo del liderazgo
7. Comunicación interna
8. Inversión en bienestar

Para cada recomendación incluye:
- Acción específica
- Prioridad (crítica/alta/media/baja)
- Impacto esperado (0-100)
- Costo estimado (bajo/medio/alto)
- Timeline (inmediato/1-3 meses/3-6 meses/6-12 meses)
- ROI esperado
- Métricas de seguimiento

Responde en formato JSON:
{
  "executive_summary": "resumen ejecutivo de 2-3 líneas",
  "overall_health_score": 0-100,
  "recommendations": [
    {
      "category": "categoría",
      "title": "título",
      "description": "descripción detallada",
      "priority": "critica|alta|media|baja",
      "expected_impact": 0-100,
      "estimated_cost": "bajo|medio|alto",
      "timeline": "inmediato|1-3m|3-6m|6-12m",
      "roi_expected": "descripción del ROI",
      "success_metrics": ["métrica1", "métrica2"],
      "implementation_steps": ["paso1", "paso2"]
    }
  ],
  "quick_wins": ["acción rápida 1", "acción rápida 2"],
  "red_flags": ["alerta 1", "alerta 2"],
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
          { role: 'system', content: 'Eres un consultor senior en People Analytics con 20 años de experiencia. Proporciona recomendaciones estratégicas basadas en datos.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
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
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // Store recommendations
    const { error: insertError } = await supabase
      .from('ai_policy_recommendations')
      .insert({
        tenant_id,
        recommendation_type: 'comprehensive_analysis',
        current_metrics: {
          total_employees: totalEmployees,
          avg_mood: avgMood,
          high_risk_alerts: highRiskAlerts,
          burnout_alerts: burnoutAlerts
        },
        recommended_changes: recommendations.recommendations,
        expected_impact: {
          overall_health_score: recommendations.overall_health_score,
          quick_wins: recommendations.quick_wins,
          red_flags: recommendations.red_flags
        },
        confidence_score: recommendations.confidence_score,
        reasoning: recommendations.executive_summary,
        status: 'pending'
      });

    if (insertError) console.error('Error storing recommendations:', insertError);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        metadata: {
          tenant_id,
          scope,
          calculated_at: new Date().toISOString(),
          data_points: {
            employees: totalEmployees,
            checkins: checkins.length,
            alerts: alerts.length
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recommendations error:', error);
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
