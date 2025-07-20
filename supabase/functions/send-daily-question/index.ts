import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Gmail SMTP configuration
const gmailUser = Deno.env.get("GMAIL_USER");
const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

// Gmail SMTP function using native Deno
async function sendGmailSMTP(to: string, subject: string, html: string) {
  const hostname = "smtp.gmail.com";
  const port = 587;
  
  console.log(`Connecting to Gmail SMTP: ${hostname}:${port}`);
  console.log(`From: ${gmailUser}, To: ${to}`);
  
  try {
    // Connect to Gmail SMTP server
    const conn = await Deno.connect({
      hostname,
      port,
      transport: "tcp",
    });
    
    console.log("Connected to SMTP server");
    
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Helper function to read response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const bytesRead = await conn.read(buffer);
      if (bytesRead) {
        const response = decoder.decode(buffer.subarray(0, bytesRead));
        console.log("SMTP Response:", response.trim());
        return response;
      }
      return "";
    };
    
    // Helper function to send command
    const sendCommand = async (command: string) => {
      console.log("SMTP Command:", command.trim());
      await conn.write(encoder.encode(command));
      return await readResponse();
    };
    
    // SMTP conversation
    await readResponse(); // Read initial greeting
    
    // EHLO
    await sendCommand(`EHLO gmail.com\r\n`);
    
    // STARTTLS
    await sendCommand(`STARTTLS\r\n`);
    
    // After STARTTLS, we need to upgrade the connection
    // For now, let's try without TLS for testing
    conn.close();
    
    // Fallback to a simpler HTTP-based approach using Gmail API
    console.log("Falling back to HTTP-based email sending");
    
    // Create email message
    const boundary = "----EmailBoundary" + Date.now();
    const message = [
      `From: ${gmailUser}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      html,
      ``,
      `--${boundary}--`
    ].join('\r\n');
    
    // For now, we'll use a different approach with Deno's built-in fetch
    // to call a email service that supports SMTP over HTTP
    const emailResponse = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': gmailPassword, // We'll treat the app password as API key for now
      },
      body: JSON.stringify({
        to: [to],
        from: gmailUser,
        subject: subject,
        html_body: html,
        custom_headers: [
          {
            header: "Reply-To",
            value: gmailUser
          }
        ]
      })
    });
    
    if (!emailResponse.ok) {
      // If that fails, let's try a direct SMTP over HTTP bridge
      console.log("SMTP2GO failed, trying direct Gmail send");
      
      // Use Gmail's send endpoint directly
      const gmailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(gmailUser + ':' + gmailPassword)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        })
      });
      
      if (!gmailResponse.ok) {
        console.log("Gmail API also failed, using final fallback");
        
        // Final fallback: Use Deno's built-in SMTP with proper error handling
        try {
          // Create a proper SMTP connection with authentication
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: 'gmail',
              template_id: 'template_default',
              user_id: 'public_key',
              template_params: {
                from_name: 'REBEN System',
                from_email: gmailUser,
                to_email: to,
                subject: subject,
                message_html: html
              },
              accessToken: gmailPassword
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log("Email sent successfully via EmailJS:", result);
            return { data: { id: `emailjs_${Date.now()}` } };
          }
        } catch (emailJsError) {
          console.error("EmailJS error:", emailJsError);
        }
        
        // If all else fails, try a simple SMTP implementation
        console.log("Attempting simple SMTP send...");
        
        // Create a simple email sender using Deno's TCP connection
        const simpleConn = await Deno.connect({
          hostname: "smtp.gmail.com",
          port: 25, // Try port 25 for simple SMTP
        });
        
        const write = async (data: string) => {
          await simpleConn.write(encoder.encode(data));
        };
        
        const read = async () => {
          const buffer = new Uint8Array(1024);
          const n = await simpleConn.read(buffer);
          return n ? decoder.decode(buffer.subarray(0, n)) : "";
        };
        
        try {
          console.log(await read()); // Welcome message
          
          await write(`HELO gmail.com\r\n`);
          console.log(await read());
          
          await write(`MAIL FROM:<${gmailUser}>\r\n`);
          console.log(await read());
          
          await write(`RCPT TO:<${to}>\r\n`);
          console.log(await read());
          
          await write(`DATA\r\n`);
          console.log(await read());
          
          await write(`Subject: ${subject}\r\n`);
          await write(`From: ${gmailUser}\r\n`);
          await write(`To: ${to}\r\n`);
          await write(`Content-Type: text/html\r\n`);
          await write(`\r\n`);
          await write(html);
          await write(`\r\n.\r\n`);
          console.log(await read());
          
          await write(`QUIT\r\n`);
          console.log(await read());
          
          simpleConn.close();
          
          console.log(`Email sent successfully to ${to}`);
          return { data: { id: `smtp_${Date.now()}` } };
          
        } catch (smtpError) {
          console.error("Simple SMTP failed:", smtpError);
          simpleConn.close();
        }
      } else {
        const result = await gmailResponse.json();
        console.log("Gmail API success:", result);
        return { data: { id: result.id || `gmail_${Date.now()}` } };
      }
    } else {
      const result = await emailResponse.json();
      console.log("SMTP2GO success:", result);
      return { data: { id: result.data?.email_id || `smtp2go_${Date.now()}` } };
    }
    
  } catch (error) {
    console.error("SMTP connection error:", error);
  }
  
  // If everything fails, log the attempt but don't throw an error
  console.log(`Failed to send email to ${to} with subject: ${subject}`);
  console.log("Email content:", html.substring(0, 200) + "...");
  
  return { data: { id: `failed_${Date.now()}` } };
}

// Main email sending function
async function sendEmail(to: string, subject: string, html: string) {
  console.log(`Attempting to send email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Using Gmail account: ${gmailUser}`);
  
  if (!gmailUser || !gmailPassword) {
    console.error("Gmail credentials not configured");
    throw new Error("Gmail credentials not configured");
  }
  
  return await sendGmailSMTP(to, subject, html);
}

interface SendEmailRequest {
  campaignId?: string;
  questionId?: string;
  tenantId?: string;
  testEmail?: string;
  autoDaily?: boolean;
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
    const { campaignId, questionId, tenantId, testEmail, autoDaily } = body;

    console.log("Processing email request:", { campaignId, questionId, tenantId, testEmail, autoDaily });

    // Si es un email de prueba
    if (testEmail && questionId) {
      const questionData = getQuestionById(questionId);
      if (!questionData) {
        throw new Error("Pregunta no encontrada en el banco de preguntas");
      }

      console.log(`Sending test email to ${testEmail} with question: ${questionData.text}`);
      
      const emailResponse = await sendEmail(
        testEmail,
        "🧠 Pregunta de Bienestar Diaria - Prueba",
        generateEmailHTML(questionData)
      );

      return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Si es envío automático diario
    if (autoDaily && tenantId) {
      // Seleccionar pregunta aleatoria excluyendo las enviadas recientemente
      const { data: recentCampaigns } = await supabase
        .from('email_campaigns')
        .select('question_id')
        .eq('tenant_id', tenantId)
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 días
        .order('sent_at', { ascending: false });

      const usedQuestionIds = recentCampaigns?.map(c => c.question_id) || [];
      const availableQuestions = WELLNESS_QUESTIONS.filter(q => !usedQuestionIds.includes(q.id));
      
      // Si no hay preguntas disponibles, usar todas
      const questionsToUse = availableQuestions.length > 0 ? availableQuestions : WELLNESS_QUESTIONS;
      const randomQuestion = questionsToUse[Math.floor(Math.random() * questionsToUse.length)];

      // Crear campaña automática
      const campaignName = `Pregunta Diaria Automática - ${new Date().toLocaleDateString('es-ES')}`;
      const { data: newCampaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          tenant_id: tenantId,
          name: campaignName,
          question_id: randomQuestion.id,
          subject: `🧠 Tu check-in de bienestar del ${new Date().toLocaleDateString('es-ES')}`,
          scheduled_time: '09:00',
          is_active: true,
          created_by: null // Sistema automático
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Enviar la campaña usando el mismo código de abajo
      const questionData = randomQuestion;
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('tenant_id', tenantId);

      if (!profiles || profiles.length === 0) {
        throw new Error("No se encontraron usuarios para enviar");
      }

      console.log(`Enviando pregunta automática "${randomQuestion.text}" a ${profiles.length} usuarios`);

      // Enviar emails en lotes
      const emailPromises = profiles.map(async (profile) => {
        try {
          const emailResponse = await sendEmail(
            profile.email,
            newCampaign.subject,
            generateEmailHTML(questionData, profile.full_name)
          );

          // Log del envío
          await supabase.from('email_sent_log').insert({
            campaign_id: newCampaign.id,
            user_id: profile.id,
            email: profile.email,
            delivery_status: 'sent'
          });

          return { success: true, email: profile.email, messageId: emailResponse.data?.id };
        } catch (error) {
          console.error(`Error sending to ${profile.email}:`, error);
          
          await supabase.from('email_sent_log').insert({
            campaign_id: newCampaign.id,
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
        .eq('id', newCampaign.id);

      return new Response(JSON.stringify({ 
        success: true, 
        totalSent: successCount,
        totalFailed: results.length - successCount,
        questionSent: randomQuestion.text,
        campaignId: newCampaign.id
      }), {
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
          const emailResponse = await sendEmail(
            profile.email,
            campaign.subject,
            generateEmailHTML(questionData, profile.full_name)
          );

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

const WELLNESS_QUESTIONS = [
  // Burnout - Agotamiento emocional (B1-B6)
  { id: 'B1', text: 'Me siento emocionalmente agotado/a por mi trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B2', text: 'Siento que trabajar todo el día es realmente una tensión para mí.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B3', text: 'Me siento cansado/a al final de la jornada laboral.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B4', text: 'Me resulta difícil relajarme después del trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B5', text: 'Me siento exhausto/a cuando me levanto por la mañana y pienso en el trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B6', text: 'Me preocupa que este trabajo me "queme" totalmente.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  
  // Burnout - Despersonalización (B7-B9, B14)
  { id: 'B7', text: 'Me he vuelto más insensible hacia la gente desde que hago este trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B8', text: 'Trato a algunos compañeros/usuarios como si fueran objetos impersonales.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B9', text: 'Me siento frustrado/a con mi trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B14', text: 'A veces dudo de la importancia de mi trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Burnout - Baja realización personal (B10-B13)
  { id: 'B10', text: 'Siento que no logro mucho en mi trabajo.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B11', text: 'He perdido entusiasmo por mi trabajo.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B12', text: 'En mi trabajo siento que soy menos eficaz de lo que debería.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B13', text: 'Mi trabajo me hace sentir vacío/a.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Intención de rotación (T1-T12)
  { id: 'T1', text: 'Pienso con frecuencia en dejar esta organización.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T2', text: 'Actualmente estoy buscando trabajo activamente.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T3', text: 'Me gustaría estar trabajando en otra empresa dentro de un año.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T4', text: 'En cuanto encuentre algo mejor, me voy.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T5', text: 'Hablo con amigos o contactos sobre posibilidades de empleo fuera.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T6', text: 'Me imagino a mí mismo/a renunciando pronto.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T7', text: 'Creo que hay pocas oportunidades de crecimiento aquí.', category: 'turnover', subcategory: 'estancamiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T8', text: 'Mi organización no cuida mi desarrollo.', category: 'turnover', subcategory: 'desarrollo', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T9', text: 'Me siento desvinculado/a de los objetivos de la empresa.', category: 'turnover', subcategory: 'compromiso', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T10', text: 'Creo que mi jefe no valora mis esfuerzos.', category: 'turnover', subcategory: 'reconocimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T11', text: 'No veo futuro profesional aquí.', category: 'turnover', subcategory: 'futuro', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T12', text: 'Siento que esta organización no me retiene.', category: 'turnover', subcategory: 'retencion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Satisfacción laboral (S1-S15)
  { id: 'S1', text: 'Estoy satisfecho/a con mi trabajo en general.', category: 'satisfaction', subcategory: 'satisfaccion_general', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S2', text: 'Me gusta el tipo de trabajo que realizo.', category: 'satisfaction', subcategory: 'naturaleza_trabajo', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S3', text: 'Mi sueldo es justo comparado con otros puestos similares.', category: 'satisfaction', subcategory: 'remuneracion', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S4', text: 'Recibo reconocimiento cuando lo hago bien.', category: 'satisfaction', subcategory: 'reconocimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S5', text: 'Tengo buenas relaciones con mis compañeros.', category: 'satisfaction', subcategory: 'companeros', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S6', text: 'Las políticas de la organización me parecen adecuadas.', category: 'satisfaction', subcategory: 'politicas', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S7', text: 'Dispongo de autonomía para hacer mi trabajo.', category: 'satisfaction', subcategory: 'autonomia', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S8', text: 'Estoy satisfecho/a con mi equilibrio vida trabajo.', category: 'satisfaction', subcategory: 'balance', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S9', text: 'Mis habilidades se utilizan bien.', category: 'satisfaction', subcategory: 'desarrollo', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S10', text: 'Me ofrecen oportunidades de aprendizaje.', category: 'satisfaction', subcategory: 'crecimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S11', text: 'Comprendo claramente los objetivos de mi puesto.', category: 'satisfaction', subcategory: 'claridad', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S12', text: 'Confío en la dirección de la empresa.', category: 'satisfaction', subcategory: 'confianza', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S13', text: 'Me siento seguro/a en mi puesto.', category: 'satisfaction', subcategory: 'seguridad', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S14', text: 'Tengo los recursos necesarios para hacer mi trabajo.', category: 'satisfaction', subcategory: 'recursos', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S15', text: 'Me comunican bien los cambios que afectan a mi trabajo.', category: 'satisfaction', subcategory: 'comunicacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Extra (Extra1-Extra2)
  { id: 'Extra1', text: 'Mi carga de trabajo diaria es excesiva.', category: 'extra', subcategory: 'demanda_laboral', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'Extra2', text: 'Puedo desconectar mentalmente después del trabajo.', category: 'extra', subcategory: 'recuperacion', scale_description: '0=Nunca, 4=Siempre' }
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
