import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY')

interface AnalysisRequest {
  type: 'wellness_analysis' | 'burnout_prediction' | 'team_insights' | 'recommendations'
  data: any
  tenant_id: string
  user_id?: string
  team_id?: string
}

async function callGemini(prompt: string, systemPrompt: string = "Eres un experto en análisis de RRHH especializado en bienestar laboral y prevención de burnout.", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })
      })

      if (response.status === 429) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
        console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${i + 1}/${retries})`)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      if (i === retries - 1) {
        console.error('Gemini API final error:', error)
        throw error
      }
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000
      console.log(`Request failed, retrying in ${delay}ms (attempt ${i + 1}/${retries}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

async function analyzeWellnessData(data: any) {
  const prompt = `
Como consultor senior de RRHH especializado en bienestar laboral, analiza estos datos y proporciona insights accionables:

CONTEXTO ORGANIZACIONAL:
- Puntuación de bienestar promedio: ${data.wellness_score}%
- Empleados con alertas de riesgo: ${data.risk_employees || 0}
- Participación en check-ins: ${data.total_checkins || 0}
- Tendencia último mes: ${data.trend || 'neutral'}
- Alertas críticas activas: ${data.critical_alerts || 0}

Proporciona un análisis estratégico enfocado en valor empresarial y bienestar del equipo.

RESPONDE EXACTAMENTE EN ESTE FORMATO JSON (sin texto adicional):
{
  "wellness_assessment": "Evaluación estratégica del clima laboral actual",
  "risk_level": "bajo|medio|alto",
  "key_insights": ["Insight específico y accionable", "Patrón detectado importante", "Oportunidad de mejora identificada"],
  "immediate_actions": ["Acción concreta para implementar", "Intervención recomendada"],
  "predictions_30_days": "Proyección basada en tendencias actuales",
  "confidence_score": 85
}`

  const systemPrompt = `Eres un consultor senior de RRHH con 15 años de experiencia en bienestar organizacional. 
Especializas en análisis predictivo de burnout y optimización del rendimiento de equipos.
Tu análisis debe ser específico, accionable y enfocado en ROI empresarial.
Responde ÚNICAMENTE con JSON válido, sin explicaciones adicionales.`

  const response = await callGemini(prompt, systemPrompt)
  
  try {
    // Limpiar la respuesta para extraer solo el JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No JSON found in response')
  } catch (error) {
    console.error('JSON parsing error:', error)
    console.log('Raw response:', response)
    
    // Análisis de fallback más inteligente
    const riskLevel = data.wellness_score > 75 ? 'bajo' : data.wellness_score > 55 ? 'medio' : 'alto'
    return {
      wellness_assessment: `Puntuación actual del ${data.wellness_score}% indica un clima laboral ${riskLevel === 'alto' ? 'que requiere atención inmediata' : riskLevel === 'medio' ? 'con margen de mejora' : 'satisfactorio'}.`,
      risk_level: riskLevel,
      key_insights: [
        `Participación del equipo: ${data.total_checkins > 20 ? 'Alta participación detectada' : 'Participación baja, requiere incentivos'}`,
        `Tendencia: ${data.trend === 'improving' ? 'Mejora sostenida en métricas' : 'Estabilización en niveles actuales'}`,
        data.critical_alerts > 0 ? `${data.critical_alerts} alertas críticas requieren seguimiento` : 'Sin alertas críticas activas'
      ],
      immediate_actions: [
        riskLevel === 'alto' ? 'Implementar sesiones 1:1 con empleados en riesgo' : 'Mantener estrategias actuales de bienestar',
        data.total_checkins < 15 ? 'Aumentar frecuencia de comunicación del equipo' : 'Analizar feedback cualitativo recibido'
      ],
      predictions_30_days: `Proyección ${riskLevel === 'alto' ? 'de mejora gradual con intervención' : 'de estabilidad con monitoreo continuo'}`,
      confidence_score: 85
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

  const response = await callGemini(prompt)
  
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

  const response = await callGemini(prompt)
  
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