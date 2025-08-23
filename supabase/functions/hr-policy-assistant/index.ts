import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      analysisType, 
      tenantData, 
      currentPolicies, 
      performanceMetrics 
    } = await req.json();

    console.log(`HR Policy Assistant request: ${analysisType}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization')!;
    supabaseClient.auth.setSession({ access_token: authHeader.replace('Bearer ', ''), refresh_token: '' });

    let systemPrompt = '';
    let analysisPrompt = '';

    switch (analysisType) {
      case 'turnover_reduction':
        systemPrompt = `Eres un experto consultor de RR.HH. especializado en reducción de rotación laboral. Analiza los datos proporcionados y genera recomendaciones específicas y accionables.`;
        analysisPrompt = `
Analiza estos datos de la empresa:
- Métricas actuales: ${JSON.stringify(performanceMetrics)}
- Políticas existentes: ${JSON.stringify(currentPolicies)}
- Datos del tenant: ${JSON.stringify(tenantData)}

Proporciona:
1. Identificación de patrones de riesgo
2. Recomendaciones específicas de políticas
3. Parámetros concretos (frecuencias, umbrales, etc.)
4. Impacto estimado de cada recomendación
5. Timeline de implementación
6. ROI esperado

Responde en formato JSON con esta estructura:
{
  "risk_analysis": {
    "high_risk_areas": [],
    "main_factors": [],
    "severity_score": 0.0
  },
  "recommendations": [
    {
      "policy_type": "",
      "description": "",
      "specific_changes": {},
      "expected_impact": {
        "turnover_reduction": 0.0,
        "satisfaction_improvement": 0.0,
        "cost_savings": 0
      },
      "implementation_timeline": "",
      "confidence_score": 0.0
    }
  ],
  "implementation_plan": {
    "priority_order": [],
    "total_timeline": "",
    "resource_requirements": [],
    "success_metrics": []
  }
}`;
        break;

      case 'satisfaction_improvement':
        systemPrompt = `Eres un experto en Employee Experience y satisfacción laboral. Tu objetivo es identificar oportunidades de mejora en las políticas empresariales.`;
        analysisPrompt = `
Analiza la satisfacción laboral actual:
- Métricas de satisfacción: ${JSON.stringify(performanceMetrics)}
- Políticas actuales: ${JSON.stringify(currentPolicies)}

Genera recomendaciones para mejorar la satisfacción con impactos medibles.

Responde en formato JSON con la estructura anterior adaptada para satisfacción.`;
        break;

      case 'policy_optimization':
        systemPrompt = `Eres un consultor especializado en optimización de políticas organizacionales. Analiza la eficiencia actual y propón mejoras.`;
        analysisPrompt = `
Optimiza las políticas existentes:
- Políticas actuales: ${JSON.stringify(currentPolicies)}
- Métricas de rendimiento: ${JSON.stringify(performanceMetrics)}

Identifica políticas redundantes, gaps, y oportunidades de automatización.

Responde en formato JSON con recomendaciones específicas.`;
        break;

      default:
        throw new Error('Tipo de análisis no válido');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // Store recommendations in database
    const { data: recommendation } = await supabaseClient
      .from('ai_policy_recommendations')
      .insert({
        recommendation_type: analysisType,
        current_metrics: performanceMetrics,
        recommended_changes: analysisResult.recommendations,
        expected_impact: analysisResult.recommendations.reduce((acc: any, rec: any) => {
          return {
            ...acc,
            ...rec.expected_impact
          };
        }, {}),
        confidence_score: analysisResult.recommendations.reduce((sum: number, rec: any) => 
          sum + rec.confidence_score, 0) / analysisResult.recommendations.length,
        reasoning: JSON.stringify(analysisResult.implementation_plan)
      })
      .select()
      .single();

    console.log(`HR Assistant analysis completed for ${analysisType}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        recommendation_id: recommendation?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in HR Policy Assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});