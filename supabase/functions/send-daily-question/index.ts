import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendEmailRequest {
  campaignId?: string;
  questionId?: string;
  tenantId?: string;
  testEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: SendEmailRequest = await req.json();
    const { campaignId, questionId, tenantId, testEmail } = body;

    console.log("Processing email request:", { campaignId, questionId, tenantId, testEmail });

    // Si es un email de prueba
    if (testEmail && questionId) {
      const { data: questionData } = await supabase
        .from('wellness_questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (!questionData) {
        throw new Error("Pregunta no encontrada");
      }

      const emailResponse = await resend.emails.send({
        from: "REBEN <wellness@resend.dev>",
        to: [testEmail],
        subject: "🧠 Pregunta de Bienestar Diaria - Prueba",
        html: generateEmailHTML(questionData),
      });

      return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Si es una campaña completa
    if (campaignId) {
      // Obtener campaña
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('*, question_id')
        .eq('id', campaignId)
        .single();

      if (!campaign) {
        throw new Error("Campaña no encontrada");
      }

      // Obtener pregunta
      const questionData = getQuestionById(campaign.question_id);
      if (!questionData) {
        throw new Error("Pregunta no encontrada");
      }

      // Obtener todos los usuarios del tenant
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('tenant_id', campaign.tenant_id);

      if (!profiles || profiles.length === 0) {
        throw new Error("No se encontraron usuarios para enviar");
      }

      console.log(`Enviando a ${profiles.length} usuarios`);

      // Enviar emails en lotes
      const emailPromises = profiles.map(async (profile) => {
        try {
          const emailResponse = await resend.emails.send({
            from: "REBEN <wellness@resend.dev>",
            to: [profile.email],
            subject: campaign.subject,
            html: generateEmailHTML(questionData, profile.full_name),
          });

          // Log del envío
          await supabase.from('email_sent_log').insert({
            campaign_id: campaignId,
            user_id: profile.id,
            email: profile.email,
            delivery_status: 'sent'
          });

          return { success: true, email: profile.email, messageId: emailResponse.data?.id };
        } catch (error) {
          console.error(`Error sending to ${profile.email}:`, error);
          
          await supabase.from('email_sent_log').insert({
            campaign_id: campaignId,
            user_id: profile.id,
            email: profile.email,
            delivery_status: 'failed'
          });

          return { success: false, email: profile.email, error: error.message };
        }
      });

      const results = await Promise.all(emailPromises);
      const successCount = results.filter(r => r.success).length;

      // Actualizar campaña
      await supabase
        .from('email_campaigns')
        .update({ 
          sent_at: new Date().toISOString(),
          total_recipients: successCount
        })
        .eq('id', campaignId);

      return new Response(JSON.stringify({ 
        success: true, 
        totalSent: successCount,
        totalFailed: results.length - successCount,
        results 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error("Faltan parámetros requeridos");

  } catch (error: any) {
    console.error("Error in send-daily-question function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Banco de preguntas (copiado del frontend)
const WELLNESS_QUESTIONS = [
  { id: 'B1', text: 'Me siento emocionalmente agotado/a por mi trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B2', text: 'Siento que trabajar todo el día es realmente una tensión para mí.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B3', text: 'Me siento cansado/a al final de la jornada laboral.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T1', text: 'Pienso con frecuencia en dejar esta organización.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S1', text: 'Estoy satisfecho/a con mi trabajo en general.', category: 'satisfaction', subcategory: 'satisfaccion_general', scale_description: '0=Nada, 4=Mucho' }
];

const getQuestionById = (id: string) => {
  return WELLNESS_QUESTIONS.find(q => q.id === id);
};

const generateEmailHTML = (question: any, userName?: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pregunta de Bienestar Diaria</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .question-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .scale { background: #e8f2ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Pregunta de Bienestar Diaria</h1>
          <p>Tu bienestar es importante para nosotros</p>
        </div>
        
        <div class="content">
          ${userName ? `<p>Hola <strong>${userName}</strong>,</p>` : '<p>Hola,</p>'}
          
          <p>Es hora de tu check-in diario de bienestar. Responder esta pregunta nos ayuda a crear un mejor ambiente laboral para todos.</p>
          
          <div class="question-box">
            <h3>Pregunta del día:</h3>
            <p><strong>${question.text}</strong></p>
            
            <div class="scale">
              <strong>Escala de respuesta:</strong><br>
              ${question.scale_description}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.lovable.app')}/checkin" class="cta-button">
              Responder Ahora
            </a>
          </div>
          
          <p><small>⏱️ Solo toma 30 segundos responder</small></p>
          <p><small>🔒 Tus respuestas son confidenciales y se usan solo para mejorar el bienestar organizacional</small></p>
        </div>
        
        <div class="footer">
          <p>Este email fue enviado por el sistema REBEN de bienestar organizacional</p>
          <p>¿Preguntas? Contacta a tu equipo de RRHH</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(handler);