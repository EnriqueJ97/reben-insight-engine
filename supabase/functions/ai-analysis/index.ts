import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const ZAI_API_KEY = Deno.env.get('ZAI_API_KEY')

interface AnalysisRequest {
  type: 'wellness_analysis' | 'burnout_prediction' | 'team_insights' | 'recommendations'
  data: any
  tenant_id: string
  user_id?: string
  team_id?: string
}

async function callZAI(prompt: string, systemPrompt: string = "You are an expert HR analytics AI specialized in workplace wellness and burnout prevention.", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ZAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'glm-4.5',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          top_p: 0.8
        })
      })

      if (response.status === 429) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${i + 1}/${retries})`)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }

      if (!response.ok) {
        throw new Error(`Z.AI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      if (i === retries - 1) {
        console.error('Z.AI API final error:', error)
        throw error
      }
      const delay = Math.pow(2, i) * 1000
      console.log(`Request failed, retrying in ${delay}ms (attempt ${i + 1}/${retries}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

async function analyzeWellnessData(data: any) {
  const prompt = `
Analiza estos datos de bienestar laboral y proporciona insights detallados:

DATOS ACTUALES:
- Puntuación de bienestar promedio: ${data.wellness_score}%
- Empleados en riesgo alto: ${data.risk_employees || 0}
- Total check-ins: ${data.total_checkins || 0}
- Tendencia último mes: ${data.trend || 'neutral'}
- Alertas críticas: ${data.critical_alerts || 0}

RESPONDE EN FORMATO JSON:
{
  "wellness_assessment": "evaluación general del estado de bienestar",
  "risk_level": "bajo|medio|alto",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "immediate_actions": ["acción 1", "acción 2"],
  "predictions_30_days": "predicción para próximos 30 días",
  "confidence_score": 85
}
`

  const systemPrompt = `Eres un experto en psicología organizacional y análisis de bienestar laboral. 
Tienes experiencia en prevención de burnout y mejora del clima laboral en empresas españolas.
Responde SOLO en formato JSON válido, sin texto adicional.`

  const response = await callZAI(prompt, systemPrompt)
  
  try {
    return JSON.parse(response)
  } catch {
    // Fallback si no es JSON válido
    return {
      wellness_assessment: response.substring(0, 200),
      risk_level: data.wellness_score > 70 ? 'bajo' : data.wellness_score > 50 ? 'medio' : 'alto',
      key_insights: ["Análisis disponible en el sistema"],
      immediate_actions: ["Revisar datos de bienestar"],
      predictions_30_days: "Tendencia estable esperada",
      confidence_score: 70
    }
  }
}

async function generateTeamRecommendations(teamData: any) {
  const prompt = `
Como consultor de RRHH especializado en bienestar, genera recomendaciones específicas para este equipo:

DATOS DEL EQUIPO:
- Tamaño del equipo: ${teamData.team_size || 0} personas
- Bienestar promedio: ${teamData.avg_wellness || 0}%
- Manager: ${teamData.manager_name || 'No especificado'}
- Principales problemas detectados: ${teamData.issues || 'Ninguno especificado'}

GENERA 5 RECOMENDACIONES ESPECÍFICAS Y ACCIONABLES en formato JSON:
{
  "recommendations": [
    {
      "title": "título de la recomendación",
      "description": "descripción detallada",
      "priority": "alta|media|baja",
      "timeframe": "inmediato|1-2 semanas|1 mes",
      "category": "comunicación|workload|ambiente|desarrollo"
    }
  ]
}
`

  const response = await callZAI(prompt)
  
  try {
    return JSON.parse(response)
  } catch {
    return {
      recommendations: [
        {
          title: "Evaluación del clima laboral",
          description: "Realizar sesiones 1:1 con miembros del equipo",
          priority: "alta",
          timeframe: "1-2 semanas", 
          category: "comunicación"
        }
      ]
    }
  }
}

async function predictBurnoutRisk(employeeData: any) {
  const prompt = `
Analiza el riesgo de burnout de este empleado basándote en los patrones de datos:

HISTORIAL DEL EMPLEADO:
- Check-ins último mes: ${employeeData.checkins_count || 0}
- Puntuación promedio mood: ${employeeData.avg_mood || 0}/5
- Tendencia últimas semanas: ${employeeData.trend || 'estable'}
- Alertas previas: ${employeeData.previous_alerts || 0}
- Rol: ${employeeData.role || 'No especificado'}

Responde en formato JSON:
{
  "risk_score": 85,
  "risk_level": "alto|medio|bajo",
  "warning_signs": ["señal 1", "señal 2"],
  "recommended_actions": ["acción 1", "acción 2"],
  "follow_up_timeline": "inmediato|1 semana|2 semanas"
}
`

  const response = await callZAI(prompt)
  
  try {
    return JSON.parse(response)
  } catch {
    const avgMood = employeeData.avg_mood || 3
    const riskScore = Math.max(0, 100 - (avgMood / 5 * 100))
    
    return {
      risk_score: riskScore,
      risk_level: riskScore > 70 ? 'alto' : riskScore > 40 ? 'medio' : 'bajo',
      warning_signs: avgMood < 2.5 ? ["Mood bajo consistente"] : ["Monitoreo preventivo"],
      recommended_actions: ["Seguimiento regular", "Apoyo del manager"],
      follow_up_timeline: riskScore > 70 ? "inmediato" : "1 semana"
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data, tenant_id, user_id, team_id }: AnalysisRequest = await req.json()

    console.log(`AI Analysis request: ${type} for tenant: ${tenant_id}`)

    let result = {}

    switch (type) {
      case 'wellness_analysis':
        result = await analyzeWellnessData(data)
        break

      case 'team_insights':
        result = await generateTeamRecommendations(data)
        break

      case 'burnout_prediction':
        result = await predictBurnoutRisk(data)
        break

      case 'recommendations':
        const analysis = await analyzeWellnessData(data)
        const recommendations = await generateTeamRecommendations(data)
        result = { ...analysis, ...recommendations }
        break

      default:
        throw new Error(`Unknown analysis type: ${type}`)
    }

    // Store analysis result in database for caching
    try {
      await supabase
        .from('email_queue') // Using existing table for now
        .insert({
          to_email: `ai-analysis-${type}`,
          subject: `AI Analysis - ${type}`,
          html_content: JSON.stringify(result),
          template_type: 'ai_analysis',
          tenant_id,
          status: 'success',
          metadata: { type, user_id, team_id }
        })
    } catch (dbError) {
      console.log('DB storage error (non-critical):', dbError)
    }

    return new Response(JSON.stringify({
      success: true,
      type,
      analysis: result,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('AI Analysis error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: {
        wellness_assessment: "Sistema de análisis temporalmente no disponible",
        risk_level: "medio",
        key_insights: ["Sistema funcionando en modo básico"],
        immediate_actions: ["Contactar con administrador si persiste"],
        predictions_30_days: "Análisis manual requerido",
        confidence_score: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})