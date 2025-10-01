import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BurnoutPrediction {
  userId: string;
  userName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedDaysUntilBurnout: number | null;
  confidence: number; // 0-1
  keyFactors: Array<{
    factor: string;
    impact: number; // -100 to +100
    trend: 'improving' | 'stable' | 'deteriorating';
    description: string;
  }>;
  recommendations: string[];
  nextCheckDate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, tenantId, analysisType = 'individual' } = await req.json();

    if (!tenantId) {
      throw new Error('Missing tenant_id');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting AI burnout prediction...', { userId, tenantId, analysisType });

    // 1. Gather historical data (last 90 days)
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role
      `)
      .eq('tenant_id', tenantId);

    if (userId && analysisType === 'individual') {
      query = query.eq('id', userId);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      throw new Error('No profiles found');
    }

    const predictions: BurnoutPrediction[] = [];

    for (const profile of profiles) {
      // Fetch check-ins
      const { data: checkins } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', profile.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Fetch alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', profile.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Prepare data summary for AI analysis
      const dataSummary = {
        profile: {
          name: profile.full_name,
          role: profile.role,
        },
        checkIns: {
          total: checkins?.length || 0,
          recent30Days: checkins?.filter(c => 
            new Date(c.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          ).length || 0,
          avgMood: calculateAvgMood(checkins),
          moodTrend: calculateMoodTrend(checkins),
          responsePatterns: analyzeResponsePatterns(checkins),
        },
        alerts: {
          total: alerts?.length || 0,
          critical: alerts?.filter(a => a.severity === 'critical').length || 0,
          unresolved: alerts?.filter(a => a.status !== 'resolved').length || 0,
          recentIncrease: analyzeAlertTrend(alerts),
        },
        temporal: {
          responseTimeVariance: calculateResponseTimeVariance(checkins),
          weekendActivity: detectWeekendActivity(checkins),
          lateNightActivity: detectLateNightActivity(checkins),
        }
      };

      console.log('Data summary for', profile.full_name, dataSummary);

      // Call Lovable AI for burnout prediction
      const aiPrompt = `Eres un experto en salud mental organizacional y predicción de burnout. Analiza los siguientes datos de un empleado y predice su riesgo de burnout.

DATOS DEL EMPLEADO:
${JSON.stringify(dataSummary, null, 2)}

MODELO DE PREDICCIÓN:
El burnout se manifiesta típicamente con estos patrones:
1. Descenso gradual del estado de ánimo (>20% en 30 días)
2. Aumento de alertas críticas no resueltas
3. Disminución en frecuencia de check-ins (señal de desconexión)
4. Actividad fuera de horario laboral (emails/check-ins nocturnos o fin de semana)
5. Varianza alta en tiempos de respuesta (inconsistencia)
6. Respuestas cada vez más breves o negativas

ANÁLISIS REQUERIDO:
1. Calcula un "Risk Score" de 0-100 (0=sin riesgo, 100=burnout inminente)
2. Determina "Risk Level": low (<30), medium (30-60), high (60-85), critical (>85)
3. Estima días hasta burnout probable (null si riesgo bajo)
4. Identifica 3-5 factores clave con su impacto (-100 a +100)
5. Da 3-5 recomendaciones accionables específicas
6. Calcula confianza del modelo (0.0-1.0)

IMPORTANTE: 
- Considera tendencias temporales (últimos 7, 30, 90 días)
- Prioriza cambios recientes sobre datos antiguos
- Correlaciona múltiples señales (mood + alerts + timing)
- Sé conservador: mejor falso positivo que falso negativo

Responde SOLO con un objeto JSON válido siguiendo esta estructura EXACTA:
{
  "riskScore": número entre 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "predictedDaysUntilBurnout": número o null,
  "confidence": número entre 0.0-1.0,
  "keyFactors": [
    {
      "factor": "nombre descriptivo del factor",
      "impact": número entre -100 y 100,
      "trend": "improving" | "stable" | "deteriorating",
      "description": "explicación breve del factor"
    }
  ],
  "recommendations": [
    "Recomendación específica y accionable"
  ]
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
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', errorText);
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      const aiContent = aiResult.choices?.[0]?.message?.content;

      if (!aiContent) {
        throw new Error('No response from AI');
      }

      console.log('AI response for', profile.full_name, ':', aiContent);

      // Parse AI response
      let prediction;
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          prediction = JSON.parse(jsonMatch[0]);
        } else {
          prediction = JSON.parse(aiContent);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiContent);
        throw new Error('Invalid JSON from AI');
      }

      // Validate and store prediction
      const burnoutPrediction: BurnoutPrediction = {
        userId: profile.id,
        userName: profile.full_name,
        riskScore: Math.max(0, Math.min(100, prediction.riskScore)),
        riskLevel: prediction.riskLevel,
        predictedDaysUntilBurnout: prediction.predictedDaysUntilBurnout,
        confidence: Math.max(0, Math.min(1, prediction.confidence)),
        keyFactors: prediction.keyFactors || [],
        recommendations: prediction.recommendations || [],
        nextCheckDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      predictions.push(burnoutPrediction);

      // Store prediction in analytics_cache
      await supabase
        .from('analytics_cache')
        .upsert({
          tenant_id: tenantId,
          entity_type: 'user',
          entity_id: profile.id,
          metric_key: 'burnout_risk_score',
          value: burnoutPrediction.riskScore,
          context: {
            riskLevel: burnoutPrediction.riskLevel,
            confidence: burnoutPrediction.confidence,
            predictedDays: burnoutPrediction.predictedDaysUntilBurnout,
            keyFactors: burnoutPrediction.keyFactors,
            recommendations: burnoutPrediction.recommendations,
            analyzedAt: now.toISOString(),
          },
          updated_at: now.toISOString(),
        });

      // Create alert if high/critical risk
      if (burnoutPrediction.riskLevel === 'high' || burnoutPrediction.riskLevel === 'critical') {
        await supabase
          .from('alerts')
          .insert({
            tenant_id: tenantId,
            user_id: profile.id,
            alert_type: 'burnout_risk_prediction',
            severity: burnoutPrediction.riskLevel === 'critical' ? 'critical' : 'high',
            title: `Riesgo de Burnout Detectado: ${profile.full_name}`,
            description: `Análisis predictivo indica riesgo ${burnoutPrediction.riskLevel} de burnout${
              burnoutPrediction.predictedDaysUntilBurnout 
                ? ` en aproximadamente ${burnoutPrediction.predictedDaysUntilBurnout} días` 
                : ''
            }. Score: ${burnoutPrediction.riskScore}/100.`,
            metadata: {
              prediction: burnoutPrediction,
              source: 'ai_burnout_predictor',
            },
            status: 'pending',
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        analyzedAt: now.toISOString(),
        totalAnalyzed: predictions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI burnout predictor error:', error);
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

// Helper functions
function calculateAvgMood(checkins: any[]): number {
  if (!checkins || checkins.length === 0) return 0;
  
  const moodScores = checkins
    .map(c => {
      const responses = c.responses || {};
      const moodValues = Object.values(responses).filter((v): v is number => typeof v === 'number');
      return moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0;
    })
    .filter(s => s > 0);

  return moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
}

function calculateMoodTrend(checkins: any[]): string {
  if (!checkins || checkins.length < 2) return 'stable';

  const recent = checkins.slice(0, Math.min(7, checkins.length));
  const older = checkins.slice(7, Math.min(14, checkins.length));

  const recentAvg = calculateAvgMood(recent);
  const olderAvg = calculateAvgMood(older);

  if (recentAvg < olderAvg - 0.5) return 'deteriorating';
  if (recentAvg > olderAvg + 0.5) return 'improving';
  return 'stable';
}

function analyzeResponsePatterns(checkins: any[]): any {
  if (!checkins || checkins.length === 0) return {};

  return {
    completionRate: checkins.filter(c => c.responses && Object.keys(c.responses).length > 0).length / checkins.length,
    avgResponseLength: checkins.reduce((acc, c) => {
      const responses = c.responses || {};
      return acc + Object.keys(responses).length;
    }, 0) / checkins.length,
  };
}

function analyzeAlertTrend(alerts: any[]): boolean {
  if (!alerts || alerts.length < 2) return false;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recent = alerts.filter(a => new Date(a.created_at) > thirtyDaysAgo).length;
  const older = alerts.filter(a => 
    new Date(a.created_at) > sixtyDaysAgo && new Date(a.created_at) <= thirtyDaysAgo
  ).length;

  return recent > older * 1.5; // 50% increase
}

function calculateResponseTimeVariance(checkins: any[]): number {
  if (!checkins || checkins.length < 2) return 0;

  const times = checkins.map(c => new Date(c.created_at).getHours());
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((acc, t) => acc + Math.pow(t - avg, 2), 0) / times.length;
  
  return Math.sqrt(variance);
}

function detectWeekendActivity(checkins: any[]): boolean {
  if (!checkins || checkins.length === 0) return false;

  const weekendCheckins = checkins.filter(c => {
    const day = new Date(c.created_at).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });

  return weekendCheckins.length / checkins.length > 0.15; // More than 15% on weekends
}

function detectLateNightActivity(checkins: any[]): boolean {
  if (!checkins || checkins.length === 0) return false;

  const lateNightCheckins = checkins.filter(c => {
    const hour = new Date(c.created_at).getHours();
    return hour >= 22 || hour <= 6; // 10 PM - 6 AM
  });

  return lateNightCheckins.length / checkins.length > 0.1; // More than 10% late night
}
