import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Explanation templates
const EXPLANATIONS = {
  mood: {
    high: "El estado de ánimo es consistentemente positivo, indicando satisfacción general.",
    medium: "El estado de ánimo muestra variabilidad, con períodos de altibajos.",
    low: "El estado de ánimo está por debajo del promedio, sugiriendo posibles preocupaciones."
  },
  engagement: {
    high: "Alto nivel de compromiso y conexión con el trabajo y objetivos.",
    medium: "Compromiso moderado con oportunidades de mejora en motivación.",
    low: "Bajo compromiso que requiere atención para reconectar con el propósito."
  },
  workload: {
    high: "Carga de trabajo equilibrada que permite productividad sin estrés excesivo.",
    medium: "Carga de trabajo manejable con algunos picos de intensidad.",
    low: "Carga de trabajo excesiva que puede llevar al agotamiento."
  },
  relations: {
    high: "Relaciones interpersonales sólidas y ambiente colaborativo positivo.",
    medium: "Relaciones adecuadas con espacio para mejorar la comunicación.",
    low: "Dificultades en relaciones que afectan el bienestar y productividad."
  },
  autonomy: {
    high: "Alto grado de autonomía y control sobre decisiones laborales.",
    medium: "Autonomía moderada con algunas restricciones estructurales.",
    low: "Limitada autonomía que puede generar frustración y dependencia."
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entity_id, metric_type = 'wellbeing' } = await req.json();

    console.log(`Generating explainability for ${entity_id}, metric: ${metric_type}`);

    // Get user's tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    // Get cached analytics for this entity
    const { data: cachedMetrics, error: cacheError } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('entity_id', entity_id)
      .eq('metric_key', 'wellbeing_score')
      .maybeSingle();

    if (cacheError) {
      console.error('Error fetching cached metrics:', cacheError);
      throw cacheError;
    }

    // Get recent check-ins for analysis
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('responses, created_at')
      .eq('user_id', entity_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (checkinsError) {
      console.error('Error fetching checkins:', checkinsError);
      throw checkinsError;
    }

    let drivers = [];
    let notes = "";
    let confidence = 0.5;

    if (checkins && checkins.length > 0) {
      // Calculate component averages
      const responses = checkins.map(c => c.responses as any);
      
      const avgMood = responses.reduce((sum, r) => sum + Number(r?.Q1 || r?.mood || 50), 0) / responses.length;
      const avgEngagement = responses.reduce((sum, r) => sum + Number(r?.Q2 || r?.engagement || 50), 0) / responses.length;
      const avgWorkload = responses.reduce((sum, r) => sum + Number(r?.Q3 || r?.workload || 50), 0) / responses.length;
      const avgRelations = responses.reduce((sum, r) => sum + Number(r?.Q4 || r?.relations || 50), 0) / responses.length;
      const avgAutonomy = responses.reduce((sum, r) => sum + Number(r?.Q5 || r?.autonomy || 50), 0) / responses.length;

      // Calculate normalized contributions (matching EIE Core weights)
      const totalContribution = 0.35 * avgMood + 0.25 * avgEngagement + 0.20 * (100 - avgWorkload) + 0.15 * avgRelations + 0.05 * avgAutonomy;

      drivers = [
        {
          factor: 'Estado de ánimo',
          contribution: Math.round((0.35 * avgMood / totalContribution) * 100),
          description: avgMood >= 70 ? EXPLANATIONS.mood.high : avgMood >= 50 ? EXPLANATIONS.mood.medium : EXPLANATIONS.mood.low
        },
        {
          factor: 'Compromiso',
          contribution: Math.round((0.25 * avgEngagement / totalContribution) * 100),
          description: avgEngagement >= 70 ? EXPLANATIONS.engagement.high : avgEngagement >= 50 ? EXPLANATIONS.engagement.medium : EXPLANATIONS.engagement.low
        },
        {
          factor: 'Carga de trabajo',
          contribution: Math.round((0.20 * (100 - avgWorkload) / totalContribution) * 100),
          description: avgWorkload <= 30 ? EXPLANATIONS.workload.high : avgWorkload <= 60 ? EXPLANATIONS.workload.medium : EXPLANATIONS.workload.low
        },
        {
          factor: 'Relaciones',
          contribution: Math.round((0.15 * avgRelations / totalContribution) * 100),
          description: avgRelations >= 70 ? EXPLANATIONS.relations.high : avgRelations >= 50 ? EXPLANATIONS.relations.medium : EXPLANATIONS.relations.low
        },
        {
          factor: 'Autonomía',
          contribution: Math.round((0.05 * avgAutonomy / totalContribution) * 100),
          description: avgAutonomy >= 70 ? EXPLANATIONS.autonomy.high : avgAutonomy >= 50 ? EXPLANATIONS.autonomy.medium : EXPLANATIONS.autonomy.low
        }
      ].sort((a, b) => b.contribution - a.contribution);

      // Generate contextual notes
      const mainDriver = drivers[0];
      const secondaryDriver = drivers[1];
      
      if (checkins.length >= 10) {
        confidence = 0.85;
        notes = `Análisis basado en ${checkins.length} respuestas recientes. ${mainDriver.factor} es el factor más influyente (${mainDriver.contribution}%), seguido de ${secondaryDriver.factor} (${secondaryDriver.contribution}%). Los patrones son consistentes y confiables.`;
      } else if (checkins.length >= 5) {
        confidence = 0.70;
        notes = `Análisis basado en ${checkins.length} respuestas. ${mainDriver.factor} muestra mayor impacto, aunque se recomienda más información para mayor precisión.`;
      } else {
        confidence = 0.50;
        notes = `Datos limitados (${checkins.length} respuestas). Los resultados son preliminares y requieren más información para conclusiones definitivas.`;
      }
    } else {
      // No data available
      drivers = [
        { factor: 'Datos insuficientes', contribution: 0, description: 'No hay datos suficientes para el análisis.' }
      ];
      notes = "No hay datos de check-ins disponibles para generar un análisis detallado. Se recomienda completar evaluaciones regulares.";
      confidence = 0.0;
    }

    console.log(`Generated explainability: main driver = ${drivers[0]?.factor}, confidence = ${confidence}`);

    return new Response(JSON.stringify({
      drivers: drivers.slice(0, 3), // Top 3 drivers
      notes,
      confidence: Math.round(confidence * 100) / 100
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-explainability:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      drivers: [
        { factor: 'Error en análisis', contribution: 0, description: 'No se pudo completar el análisis.' }
      ],
      notes: 'Error al generar explicación. Intente nuevamente.',
      confidence: 0.0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});