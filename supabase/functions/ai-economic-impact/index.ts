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
    const { tenant_id, period_days = 365 } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    // Fetch organizational data
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenant_id)
      .single();

    if (tenantError) throw tenantError;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', tenant_id);

    if (profilesError) throw profilesError;

    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .gte('created_at', startDate.toISOString());

    if (alertsError) throw alertsError;

    const { data: productivity, error: productivityError } = await supabase
      .from('productivity_metrics')
      .select('*')
      .eq('tenant_id', tenant_id)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (productivityError) console.error('Productivity error:', productivityError);

    // Fetch headcount snapshots for turnover calculation
    const { data: headcountData, error: headcountError } = await supabase
      .from('headcount_snapshots')
      .select('*')
      .eq('tenant_id', tenant_id)
      .gte('date_month', startDate.toISOString().split('T')[0])
      .order('date_month', { ascending: true });

    if (headcountError) console.error('Headcount error:', headcountError);

    // Calculate economic metrics
    const totalEmployees = profiles.length;
    const burnoutAlerts = alerts.filter(a => a.alert_type === 'ALERTA_BURNOUT_ALTO').length;
    const turnoverEvents = headcountData?.reduce((sum, snap) => 
      sum + (snap.voluntary_terminations || 0) + (snap.involuntary_terminations || 0), 0) || 0;

    const avgProductivity = productivity && productivity.length > 0
      ? productivity.reduce((sum, p) => sum + Number(p.value), 0) / productivity.length
      : 0;

    // Industry benchmarks (Spain/Mexico)
    const avgSalary = tenant.industry === 'technology' ? 45000 : 
                     tenant.industry === 'finance' ? 50000 : 35000;
    const turnoverCostMultiplier = 1.5; // 150% of annual salary
    const burnoutProductivityLoss = 0.35; // 35% productivity loss
    const absenteeismDaysPerBurnout = 15;
    const replacementTime = 90; // days to replace

    const prompt = `Eres un experto en análisis financiero y ROI de bienestar laboral. Calcula el impacto económico basado en estos datos:

DATOS ORGANIZACIONALES:
- Empresa: ${tenant.name}
- Industria: ${tenant.industry || 'No especificada'}
- Empleados totales: ${totalEmployees}
- Salario promedio estimado: €${avgSalary.toLocaleString()}
- Período analizado: ${period_days} días

EVENTOS REGISTRADOS:
- Casos de burnout detectados: ${burnoutAlerts}
- Rotación de personal: ${turnoverEvents} salidas
- Productividad promedio: ${avgProductivity.toFixed(2)}

PARÁMETROS DE CÁLCULO:
- Costo de reemplazo: ${turnoverCostMultiplier}x salario anual
- Pérdida de productividad por burnout: ${burnoutProductivityLoss * 100}%
- Días de absentismo por burnout: ${absenteeismDaysPerBurnout}
- Tiempo promedio de reemplazo: ${replacementTime} días

ANÁLISIS SOLICITADO:
Calcula el impacto económico total incluyendo:

1. COSTOS DIRECTOS:
   - Costo de rotación (reemplazo, reclutamiento, onboarding)
   - Absentismo y bajas médicas
   - Pérdida de productividad durante burnout
   - Costos de formación de reemplazos

2. COSTOS INDIRECTOS:
   - Impacto en moral del equipo
   - Conocimiento perdido
   - Errores y retrabajos
   - Pérdida de relaciones con clientes

3. PROYECCIÓN:
   - Costo anual proyectado si no se actúa
   - ROI potencial de invertir en prevención
   - Savings estimados con intervención

4. BENCHMARKING:
   - Comparación con estándares de la industria
   - Posición relativa en el mercado

Responde en formato JSON:
{
  "total_cost_impact": number,
  "breakdown": {
    "turnover_costs": number,
    "burnout_productivity_loss": number,
    "absenteeism_costs": number,
    "replacement_costs": number,
    "indirect_costs": number
  },
  "annual_projection": number,
  "prevention_investment_recommended": number,
  "expected_roi": number,
  "estimated_savings": number,
  "payback_period_months": number,
  "industry_benchmark": {
    "avg_turnover_rate": number,
    "avg_burnout_rate": number,
    "company_vs_benchmark": "mejor|similar|peor"
  },
  "recommendations": [
    {
      "area": "área",
      "investment": number,
      "expected_return": number,
      "roi_percentage": number
    }
  ],
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
          { role: 'system', content: 'Eres un CFO experto en análisis financiero de capital humano. Proporciona cálculos precisos y conservadores.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
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
    const impact = JSON.parse(aiData.choices[0].message.content);

    // Store economic impact analysis
    const { error: insertError } = await supabase
      .from('analytics_cache')
      .insert({
        tenant_id,
        entity_id: tenant_id,
        entity_type: 'tenant',
        metric_key: 'economic_impact',
        value: impact.total_cost_impact,
        context: {
          impact,
          calculated_at: new Date().toISOString(),
          period_days,
          data_sources: {
            employees: totalEmployees,
            alerts: alerts.length,
            productivity_records: productivity?.length || 0
          }
        }
      });

    if (insertError) console.error('Error storing impact:', insertError);

    return new Response(
      JSON.stringify({
        success: true,
        impact,
        metadata: {
          tenant_id,
          period_days,
          calculated_at: new Date().toISOString(),
          base_salary: avgSalary,
          total_employees: totalEmployees
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Economic impact error:', error);
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
