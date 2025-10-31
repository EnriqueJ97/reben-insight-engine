import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// FÓRMULAS EXACTAS - Sistema de Predicción de Rotación
// ============================================================================

// Pesos de factores para Probabilidad de Rotación
const TURNOVER_WEIGHTS = {
  burnout: 0.40,      // 40% - Factor más importante
  tenure: 0.25,       // 25% - Antigüedad (inverso)
  satisfaction: 0.20, // 20% - eNPS (inverso)
  productivity: 0.15  // 15% - Evaluación (inverso)
};

// Umbrales MBI para clasificación de riesgo burnout
const MBI_THRESHOLDS = {
  critical: {
    emotional_exhaustion: 30,
    depersonalization: 15,
    personal_accomplishment_max: 34
  },
  high: {
    emotional_exhaustion: 25,
    depersonalization: 10,
    personal_accomplishment_max: 38,
    total_score: 80
  },
  moderate: {
    emotional_exhaustion: 20,
    depersonalization: 8,
    personal_accomplishment_min: 30
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

    const { entity_id, horizon_days = 90 } = await req.json();

    console.log(`Predicting turnover risk for user ${entity_id}, horizon: ${horizon_days} days`);

    // Get user's profile and tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    // Get employee profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, created_at, tenant_id')
      .eq('id', entity_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // Get recent check-ins (last 60 days)
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('responses, created_at')
      .eq('user_id', entity_id)
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (checkinsError) {
      console.error('Error fetching checkins:', checkinsError);
      throw checkinsError;
    }

    // Get recent alerts (last 30 days)
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('type, severity, created_at')
      .eq('user_id', entity_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
    }

    // ========================================================================
    // PASO 1: Extraer datos base de MBI y otras métricas
    // ========================================================================
    
    // Calcular antigüedad en meses
    const tenureMonths = Math.round((Date.now() - new Date(profile.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000));
    
    // Variables MBI (escala 0-54 para agotamiento, 0-30 para despersonalización, 0-48 para realización)
    let agotamientoEmocional = 0;
    let despersonalizacion = 0;
    let realizacionPersonal = 48; // Default alto (menor riesgo)
    let eNPS = 0;
    let ultimaEvaluacion = 3; // Default neutro (1-5)
    
    if (checkins && checkins.length > 0) {
      const responses = checkins.map(c => c.responses as any);
      
      // AGOTAMIENTO EMOCIONAL (0-54): Mapear desde mood score
      // Mood va de 0-100, agotamiento es inverso
      const moodScores = responses.map(r => Number(r?.Q1 || r?.mood || 50));
      const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
      agotamientoEmocional = Math.round((100 - avgMood) * 0.54); // Escalar a 0-54
      
      // DESPERSONALIZACIÓN (0-30): Mapear desde relaciones interpersonales
      const relationScores = responses.map(r => Number(r?.Q4 || r?.relations || 50));
      const avgRelations = relationScores.reduce((sum, score) => sum + score, 0) / relationScores.length;
      despersonalizacion = Math.round((100 - avgRelations) * 0.30); // Escalar a 0-30
      
      // REALIZACIÓN PERSONAL (0-48): Mapear desde autonomía/logro
      const autonomyScores = responses.map(r => Number(r?.Q5 || r?.autonomy || 50));
      const avgAutonomy = autonomyScores.reduce((sum, score) => sum + score, 0) / autonomyScores.length;
      realizacionPersonal = Math.round(avgAutonomy * 0.48); // Escalar a 0-48
      
      // eNPS (-100 a +100): Calcular desde engagement
      const engagementScores = responses.map(r => Number(r?.Q2 || r?.engagement || 50));
      const avgEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
      eNPS = Math.round((avgEngagement - 50) * 2); // Convertir 0-100 a -100 a +100
      
      // ÚLTIMA EVALUACIÓN (1-5): Simular desde workload y engagement
      const workloadScores = responses.map(r => Number(r?.Q3 || r?.workload || 50));
      const avgWorkload = workloadScores.reduce((sum, score) => sum + score, 0) / workloadScores.length;
      const performanceScore = (avgEngagement * 0.6 + (100 - avgWorkload) * 0.4);
      ultimaEvaluacion = Math.max(1, Math.min(5, Math.round(performanceScore / 20)));
    }
    
    // ========================================================================
    // PASO 2: SCORE MBI TOTAL (Fórmula oficial)
    // ========================================================================
    const scoreMBITotal = agotamientoEmocional + despersonalizacion + (48 - realizacionPersonal);
    // Rango: 0-132
    
    console.log(`MBI Scores - Agotamiento: ${agotamientoEmocional}, Despersonalización: ${despersonalizacion}, Realización: ${realizacionPersonal}, Total: ${scoreMBITotal}`);
    
    // ========================================================================
    // PASO 3: CLASIFICACIÓN DE RIESGO BURNOUT
    // ========================================================================
    let riesgoBurnout: 'CRÍTICO' | 'ALTO' | 'MODERADO' | 'BAJO';
    
    if (
      agotamientoEmocional > MBI_THRESHOLDS.critical.emotional_exhaustion &&
      despersonalizacion > MBI_THRESHOLDS.critical.depersonalization &&
      realizacionPersonal < MBI_THRESHOLDS.critical.personal_accomplishment_max
    ) {
      riesgoBurnout = 'CRÍTICO';
    } else if (
      (agotamientoEmocional > MBI_THRESHOLDS.high.emotional_exhaustion &&
       despersonalizacion > MBI_THRESHOLDS.high.depersonalization &&
       realizacionPersonal < MBI_THRESHOLDS.high.personal_accomplishment_max) ||
      scoreMBITotal > MBI_THRESHOLDS.high.total_score
    ) {
      riesgoBurnout = 'ALTO';
    } else if (
      (agotamientoEmocional > MBI_THRESHOLDS.moderate.emotional_exhaustion ||
       despersonalizacion > MBI_THRESHOLDS.moderate.depersonalization) &&
      realizacionPersonal > MBI_THRESHOLDS.moderate.personal_accomplishment_min
    ) {
      riesgoBurnout = 'MODERADO';
    } else {
      riesgoBurnout = 'BAJO';
    }
    
    // ========================================================================
    // PASO 4: FACTORES DE ROTACIÓN (cada uno escalado 0-100)
    // ========================================================================
    
    // Factor Burnout (40%)
    const factorBurnout = (scoreMBITotal / 132) * 100;
    
    // Factor Antigüedad (25%) - INVERSO
    let factorAntiguedad: number;
    if (tenureMonths < 3) {
      factorAntiguedad = 90;
    } else if (tenureMonths < 12) {
      factorAntiguedad = 70 - ((tenureMonths - 3) / 9) * 10;
    } else if (tenureMonths < 24) {
      factorAntiguedad = 50 - ((tenureMonths - 12) / 12) * 20;
    } else {
      factorAntiguedad = Math.max(10, 30 - ((tenureMonths - 24) / 12));
    }
    
    // Factor Satisfacción (20%) - INVERSO basado en eNPS
    const factorSatisfaccion = 50 - (eNPS / 2);
    
    // Factor Productividad (15%) - INVERSO basado en evaluación
    const factorProductividad = ((5 - ultimaEvaluacion) / 4) * 100;
    
    console.log(`Factores - Burnout: ${factorBurnout.toFixed(2)}, Antigüedad: ${factorAntiguedad.toFixed(2)}, Satisfacción: ${factorSatisfaccion.toFixed(2)}, Productividad: ${factorProductividad.toFixed(2)}`);
    
    // ========================================================================
    // PASO 5: PROBABILIDAD DE ROTACIÓN (Fórmula principal)
    // ========================================================================
    const probabilidadRotacion = 
      (factorBurnout * TURNOVER_WEIGHTS.burnout) +
      (factorAntiguedad * TURNOVER_WEIGHTS.tenure) +
      (factorSatisfaccion * TURNOVER_WEIGHTS.satisfaction) +
      (factorProductividad * TURNOVER_WEIGHTS.productivity);
    
    // Redondear a entero
    const probabilidadRotacionFinal = Math.round(Math.max(0, Math.min(100, probabilidadRotacion)));
    
    // ========================================================================
    // PASO 6: CLASIFICACIÓN DE RIESGO DE ROTACIÓN
    // ========================================================================
    let riesgoRotacion: 'bajo' | 'medio' | 'alto' | 'critico';
    if (probabilidadRotacionFinal >= 70) {
      riesgoRotacion = 'critico';
    } else if (probabilidadRotacionFinal >= 50) {
      riesgoRotacion = 'alto';
    } else if (probabilidadRotacionFinal >= 30) {
      riesgoRotacion = 'medio';
    } else {
      riesgoRotacion = 'bajo';
    }
    
    // ========================================================================
    // PASO 7: IDENTIFICAR TOP DRIVERS
    // ========================================================================
    const drivers = [
      { 
        factor: 'Factor Burnout', 
        value: factorBurnout,
        weight: TURNOVER_WEIGHTS.burnout,
        contribution: factorBurnout * TURNOVER_WEIGHTS.burnout 
      },
      { 
        factor: 'Factor Antigüedad', 
        value: factorAntiguedad,
        weight: TURNOVER_WEIGHTS.tenure,
        contribution: factorAntiguedad * TURNOVER_WEIGHTS.tenure 
      },
      { 
        factor: 'Factor Satisfacción (eNPS)', 
        value: factorSatisfaccion,
        weight: TURNOVER_WEIGHTS.satisfaction,
        contribution: factorSatisfaccion * TURNOVER_WEIGHTS.satisfaction 
      },
      { 
        factor: 'Factor Productividad', 
        value: factorProductividad,
        weight: TURNOVER_WEIGHTS.productivity,
        contribution: factorProductividad * TURNOVER_WEIGHTS.productivity 
      }
    ]
    .sort((a, b) => b.contribution - a.contribution);
    
    // Generar recomendaciones basadas en drivers principales
    const recommendations: string[] = [];
    
    if (drivers[0].factor.includes('Burnout')) {
      if (riesgoBurnout === 'CRÍTICO') {
        recommendations.push('🚨 URGENTE: Intervención inmediata en 48h - Alta carga emocional');
      } else if (riesgoBurnout === 'ALTO') {
        recommendations.push('⚠️ Programar intervención en 1 semana - Burnout detectado');
      }
      recommendations.push('🧘 Implementar programa de bienestar y manejo del estrés');
    }
    
    if (drivers[0].factor.includes('Antigüedad') || tenureMonths < 6) {
      recommendations.push('🎯 Reforzar programa de onboarding y mentoría');
      recommendations.push('🤝 Asignar buddy/mentor para acompañamiento');
    }
    
    if (drivers[0].factor.includes('Satisfacción')) {
      recommendations.push('💬 Realizar 1:1 para entender expectativas y concerns');
      recommendations.push('📊 Revisar condiciones laborales y clima organizacional');
    }
    
    if (drivers[0].factor.includes('Productividad')) {
      recommendations.push('📈 Plan de desarrollo profesional y capacitación');
      recommendations.push('🎓 Evaluar necesidades de training o cambio de rol');
    }
    
    // Calcular horizonte temporal
    const estimatedDaysToExit = probabilidadRotacionFinal >= 70 ? 30 :
                                 probabilidadRotacionFinal >= 50 ? 90 :
                                 probabilidadRotacionFinal >= 30 ? 180 : 365;
    
    // Intervalos de confianza
    const dataQuality = checkins && checkins.length >= 10 ? 'high' : 'medium';
    const uncertainty = dataQuality === 'high' ? 5 : 12;
    const ci_low = Math.max(0, probabilidadRotacionFinal - uncertainty);
    const ci_high = Math.min(100, probabilidadRotacionFinal + uncertainty);
    
    console.log(`RESULTADO FINAL - Probabilidad: ${probabilidadRotacionFinal}%, Riesgo: ${riesgoRotacion}, Burnout: ${riesgoBurnout}`);
    
    // ========================================================================
    // RESPUESTA FINAL
    // ========================================================================
    return new Response(JSON.stringify({
      // Probabilidad principal
      turnover_probability: probabilidadRotacionFinal,
      risk_level: riesgoRotacion,
      
      // Métricas MBI
      mbi_total_score: scoreMBITotal,
      burnout_risk: riesgoBurnout,
      mbi_components: {
        emotional_exhaustion: agotamientoEmocional,
        depersonalization: despersonalizacion,
        personal_accomplishment: realizacionPersonal
      },
      
      // Factores de rotación
      turnover_factors: {
        burnout: Math.round(factorBurnout * 10) / 10,
        tenure: Math.round(factorAntiguedad * 10) / 10,
        satisfaction: Math.round(factorSatisfaccion * 10) / 10,
        productivity: Math.round(factorProductividad * 10) / 10
      },
      
      // Datos adicionales
      tenure_months: tenureMonths,
      enps: eNPS,
      last_evaluation: ultimaEvaluacion,
      
      // Drivers principales
      top_drivers: drivers.map(d => ({
        factor: d.factor,
        contribution: Math.round(d.contribution * 10) / 10,
        weight: d.weight * 100
      })),
      
      // Recomendaciones
      recommendations,
      
      // Horizonte temporal
      estimated_days_to_exit: estimatedDaysToExit,
      
      // Intervalos de confianza
      ci_low,
      ci_high,
      data_quality: dataQuality,
      
      // Metadata
      calculated_at: new Date().toISOString(),
      data_points: checkins?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-turnover-risk:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      risk_90d: 25,
      risk_180d: 35,
      ci_low: 20,
      ci_high: 30,
      top_drivers: [],
      risk_level: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});