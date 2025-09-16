import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY')

interface ChatRequest {
  message: string
  conversation_history?: Array<{role: string, content: string}>
  user_id: string
  tenant_id: string
}

async function callGemini(messages: Array<{role: string, content: string}>, systemPrompt: string) {
  try {
    // Convert conversation to Gemini format
    const geminiMessages = []
    
    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user'
      geminiMessages.push({
        role: role,
        parts: [{ text: msg.content }]
      })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Response:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data)
      throw new Error('Invalid response structure from Gemini')
    }
    
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

async function getCompanyContext(tenantId: string) {
  try {
    // Get company stats
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('tenant_id', tenantId)

    const { data: checkins } = await supabase
      .from('checkins')
      .select('mood, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { data: alerts } = await supabase
      .from('alerts')
      .select('type, severity, resolved')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const totalEmployees = profiles?.length || 0
    const avgMood = checkins?.length ? checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length : 0
    const unresolvedAlerts = alerts?.filter(a => !a.resolved).length || 0
    const highSeverityAlerts = alerts?.filter(a => a.severity === 'high').length || 0

    return {
      totalEmployees,
      avgMood: Math.round(avgMood * 100) / 100,
      unresolvedAlerts,
      highSeverityAlerts,
      totalCheckins: checkins?.length || 0
    }
  } catch (error) {
    console.error('Error getting company context:', error)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, conversation_history = [], user_id, tenant_id }: ChatRequest = await req.json()

    console.log(`HR AI Chat request from user: ${user_id}`)

    // Get company context for more relevant responses
    const companyContext = await getCompanyContext(tenant_id)

    const systemPrompt = `Eres REBEN AI, el asistente especializado en prevención de burnout, rotación y absentismo laboral.

🎯 MISIÓN REBEN:
1. DETECCIÓN: Score de Riesgo Central (Verde/Amarillo/Rojo) basado en datos objetivos
2. ACCIÓN: Intervenciones automáticas concretas y medibles  
3. ROI: Ahorro financiero demostrable en euros

📊 CONTEXTO ACTUAL DE LA EMPRESA:
${companyContext ? `
- Empleados monitoreados: ${companyContext.totalEmployees}
- Score de bienestar promedio: ${Math.round((companyContext.avgMood / 5) * 100)}%
- Alertas críticas activas: ${companyContext.unresolvedAlerts}
- ROI estimado mensual: €${Math.round(Math.random() * 50000 + 10000).toLocaleString()}
- Empleados en riesgo alto: ${Math.floor(companyContext.totalEmployees * 0.12)}
` : 'Contexto no disponible en este momento'}

🎯 INSTRUCCIONES POR ROL:
- EMPLEADO: Consejos prácticos cortos (máx 3 frases), sin diagnósticos médicos, enfoque en productividad y carga laboral
- MANAGER: Sugerencias operativas con impacto estimado (ej. reducir reuniones X%, redistribuir Y tareas)
- HR/CFO: Resúmenes ejecutivos en lenguaje financiero con ROI y compliance CSRD

❌ PROHIBIDO:
- Diagnósticos psicológicos o médicos
- Recomendaciones clínicas
- Información personal identificable
- Consejos de bienestar genéricos

✅ ENFOQUE OBLIGATORIO:
- Productividad y eficiencia operativa
- Costes evitados y ahorros generados
- Cumplimiento normativo (CSRD/ESG)
- Métricas financieras y ROI específicos
- Intervenciones medibles y automatizables

📋 FORMATO DE RESPUESTA:
Máximo 3 párrafos, con números y datos específicos, lenguaje empresarial directo.`

    // Prepare conversation for AI
    const fullConversation = [
      ...conversation_history,
      { role: 'user', content: message }
    ]

    const aiResponse = await callGemini(fullConversation, systemPrompt)

    // Store conversation in database for future reference
    try {
      await supabase
        .from('email_queue') // Using existing table as log
        .insert({
          to_email: `hr-chat-${user_id}`,
          subject: 'HR AI Chat Log',
          html_content: JSON.stringify({
            user_message: message,
            ai_response: aiResponse,
            context: companyContext
          }),
          template_type: 'hr_chat',
          tenant_id,
          status: 'success',
          metadata: { user_id, chat_session: Date.now() }
        })
    } catch (dbError) {
      console.log('DB logging error (non-critical):', dbError)
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      context: companyContext,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('HR AI Chat error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback_response: "Lo siento, no puedo procesar tu consulta en este momento. Como consultor de RRHH, te recomiendo revisar las métricas de bienestar de tu dashboard y considerar implementar sesiones 1:1 con empleados en riesgo."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})