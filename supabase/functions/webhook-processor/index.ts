import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface WebhookPayload {
  event_type: string
  data: any
  timestamp: string
  tenant_id: string
}

async function processWebhook(webhook: any, payload: WebhookPayload) {
  try {
    console.log(`Processing webhook: ${webhook.name} for event: ${payload.event_type}`)
    
    // Create signature for security
    const signature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(webhook.secret + JSON.stringify(payload))
    )
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Send webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-REBEN-Signature': `sha256=${signatureHex}`,
        'X-REBEN-Event': payload.event_type,
        'User-Agent': 'REBEN-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    })

    const responseBody = await response.text()
    
    // Update webhook stats and log
    await supabase
      .from('webhook_endpoints')
      .update({
        success_count: response.ok ? webhook.success_count + 1 : webhook.success_count,
        error_count: response.ok ? webhook.error_count : webhook.error_count + 1,
        last_triggered_at: new Date().toISOString()
      })
      .eq('id', webhook.id)

    // Log the attempt
    await supabase
      .from('webhook_logs')
      .update({
        response_status: response.status,
        response_body: responseBody,
        error_message: response.ok ? null : `HTTP ${response.status}: ${responseBody}`
      })
      .eq('webhook_id', webhook.id)
      .eq('event_type', payload.event_type)
      .order('created_at', { ascending: false })
      .limit(1)

    return { success: response.ok, status: response.status }
  } catch (error) {
    console.error(`Webhook error for ${webhook.name}:`, error)
    
    // Update error count
    await supabase
      .from('webhook_endpoints')
      .update({
        error_count: webhook.error_count + 1
      })
      .eq('id', webhook.id)

    // Log the error
    await supabase
      .from('webhook_logs')
      .update({
        error_message: error.message
      })
      .eq('webhook_id', webhook.id)
      .eq('event_type', payload.event_type)
      .order('created_at', { ascending: false })
      .limit(1)

    return { success: false, error: error.message }
  }
}

async function sendSlackNotification(config: any, message: string, data?: any) {
  if (!config.webhook_url) return

  const payload = {
    text: message,
    channel: config.channel || '#bienestar',
    username: 'REBEN',
    icon_emoji: ':heart:',
    attachments: data ? [{
      color: data.severity === 'high' ? 'danger' : data.severity === 'medium' ? 'warning' : 'good',
      fields: [
        {
          title: 'Empleado',
          value: data.employee_name || 'N/A',
          short: true
        },
        {
          title: 'Fecha',
          value: new Date().toLocaleDateString('es-ES'),
          short: true
        }
      ]
    }] : []
  }

  const response = await fetch(config.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return { success: response.ok, status: response.status }
}

async function sendEmailNotification(config: any, subject: string, content: string, toEmail: string) {
  const emailPayload = {
    to_email: toEmail,
    subject,
    html_content: content,
    template_type: 'alert_notification',
    priority: 'high'
  }

  // Add to email queue
  await supabase
    .from('email_queue')
    .insert(emailPayload)

  return { success: true }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { event_type, data, tenant_id } = await req.json()

    console.log(`Processing event: ${event_type} for tenant: ${tenant_id}`)

    // Get active webhooks for this event type
    const { data: webhooks } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .contains('events', [event_type])

    // Get active integrations
    const { data: integrations } = await supabase
      .from('integrations_config')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)

    const payload: WebhookPayload = {
      event_type,
      data,
      timestamp: new Date().toISOString(),
      tenant_id
    }

    // Process webhooks
    const webhookResults = []
    if (webhooks) {
      for (const webhook of webhooks) {
        const result = await processWebhook(webhook, payload)
        webhookResults.push({ webhook_name: webhook.name, ...result })
      }
    }

    // Process integrations
    const integrationResults = []
    if (integrations) {
      for (const integration of integrations) {
        try {
          let result = { success: false }
          
          switch (integration.integration_type) {
            case 'slack':
              if (event_type === 'alert_created' || event_type === 'burnout_risk_detected') {
                const message = `🚨 *Alerta de Bienestar*\n${data.message || 'Nueva alerta detectada'}`
                result = await sendSlackNotification(integration.config, message, data)
              }
              break
              
            case 'email_notifications':
              if (event_type === 'alert_created' && data.severity === 'high') {
                const subject = `🚨 Alerta Crítica de Bienestar - ${data.employee_name || 'Empleado'}`
                const content = `
                  <h2>Alerta Crítica Detectada</h2>
                  <p><strong>Empleado:</strong> ${data.employee_name || 'N/A'}</p>
                  <p><strong>Tipo:</strong> ${data.type || 'N/A'}</p>
                  <p><strong>Mensaje:</strong> ${data.message || 'N/A'}</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                  <p>Se recomienda contactar con el empleado lo antes posible.</p>
                `
                result = await sendEmailNotification(
                  integration.config, 
                  subject, 
                  content, 
                  data.manager_email || integration.config.from_email
                )
              }
              break
          }

          // Log integration activity
          await supabase
            .from('integration_logs')
            .insert({
              integration_id: integration.id,
              action: event_type,
              status: result.success ? 'success' : 'error',
              details: { payload, result }
            })

          integrationResults.push({ 
            integration_name: integration.name, 
            integration_type: integration.integration_type,
            ...result 
          })
        } catch (error) {
          console.error(`Integration error for ${integration.name}:`, error)
          
          await supabase
            .from('integration_logs')
            .insert({
              integration_id: integration.id,
              action: event_type,
              status: 'error',
              error_message: error.message,
              details: { payload }
            })

          integrationResults.push({ 
            integration_name: integration.name, 
            success: false, 
            error: error.message 
          })
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: {
        webhooks: webhookResults,
        integrations: integrationResults
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook processor error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})