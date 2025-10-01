import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history, user_id, tenant_id } = await req.json();

    if (!message || !user_id || !tenant_id) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener contexto del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user_id)
      .single();

    // Obtener datos del tenant para contexto
    const companyContext = await fetchCompanyContext(supabase, tenant_id, profile?.role);

    // Preparar el prompt del sistema con contexto
    const systemPrompt = buildSystemPrompt(profile?.role, companyContext);

    // Llamar a Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const messages: Message[] = [
      { role: 'assistant', content: systemPrompt },
      ...(conversation_history || []),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'rate_limit',
            fallback_response: 'El asistente está experimentando alta demanda. Por favor intenta de nuevo en unos momentos.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context: companyContext,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('HR AI Chat error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback_response: 'Lo siento, ha ocurrido un error. Por favor intenta de nuevo en unos momentos.',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function fetchCompanyContext(supabase: any, tenantId: string, userRole: string) {
  const context: any = {};

  try {
    // Total de empleados
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);
    context.totalEmployees = employeeCount || 0;

    // Bienestar promedio (últimos 7 días)
    const { data: recentCheckins } = await supabase
      .from('daily_checkins')
      .select('mood_score')
      .eq('tenant_id', tenantId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (recentCheckins && recentCheckins.length > 0) {
      const avgMood = recentCheckins.reduce((sum: number, c: any) => sum + (c.mood_score || 0), 0) / recentCheckins.length;
      context.avgMood = avgMood.toFixed(1);
      context.totalCheckins = recentCheckins.length;
    } else {
      context.avgMood = 0;
      context.totalCheckins = 0;
    }

    // Alertas sin resolver
    const { count: unresolvedAlertsCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending');
    context.unresolvedAlerts = unresolvedAlertsCount || 0;

    // Alertas de severidad alta
    const { count: highSeverityCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('severity', ['high', 'critical'])
      .eq('status', 'pending');
    context.highSeverityAlerts = highSeverityCount || 0;

  } catch (error) {
    console.error('Error fetching company context:', error);
  }

  return context;
}

function buildSystemPrompt(userRole: string, context: any): string {
  const roleContext = {
    'HR_ADMIN': 'Eres un asistente especializado para administradores de RRHH. Ayudas con análisis estratégicos, gestión de equipos, interpretación de métricas de bienestar y recomendaciones para mejorar el clima laboral.',
    'MANAGER': 'Eres un asistente para managers. Ayudas a gestionar equipos, interpretar métricas de bienestar, detectar empleados en riesgo y sugerir acciones para mejorar el rendimiento del equipo.',
    'EMPLOYEE': 'Eres un asistente personal de bienestar. Ayudas a los empleados a entender sus métricas, gestionar su tiempo y mejorar su bienestar laboral.',
  };

  const contextSummary = context.totalEmployees > 0 
    ? `\n\nCONTEXTO ACTUAL DE LA EMPRESA:
- Empleados totales: ${context.totalEmployees}
- Bienestar promedio (últimos 7 días): ${context.avgMood}/5
- Check-ins registrados: ${context.totalCheckins}
- Alertas sin resolver: ${context.unresolvedAlerts}
- Alertas críticas/altas: ${context.highSeverityAlerts}`
    : '';

  return `${roleContext[userRole as keyof typeof roleContext] || roleContext['EMPLOYEE']}

Estás integrado en REBEN, una plataforma de bienestar organizacional con IA.

CAPACIDADES:
✓ Responder preguntas sobre métricas de bienestar
✓ Explicar gráficos y datos del dashboard
✓ Sugerir acciones concretas basadas en alertas
✓ Recomendar mejores prácticas de RRHH
✓ Ayudar a navegar por la plataforma
✓ Interpretar indicadores de burnout y turnover

INSTRUCCIONES:
- Sé conciso y directo (máximo 3-4 párrafos)
- Usa viñetas para listas
- Proporciona recomendaciones accionables
- Si preguntan por datos específicos que no tienes, sugiere dónde encontrarlos en la plataforma
- Usa un tono profesional pero amigable
- Si detectas señales de crisis (ej: burnout extremo), sugiere acciones inmediatas${contextSummary}

Responde siempre en español.`;
}
