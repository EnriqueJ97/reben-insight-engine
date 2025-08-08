import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlackReminderRequest {
  email: string;
  message: string;
  tenantId?: string;
}

async function slackApi(endpoint: string, method: string, body?: any) {
  const token = Deno.env.get("SLACK_BOT_TOKEN");
  if (!token) throw new Error("SLACK_BOT_TOKEN no está configurado");

  const res = await fetch(`https://slack.com/api/${endpoint}`,{
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`${endpoint} failed: ${data.error}`);
  }
  return data;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, message }: SlackReminderRequest = await req.json();
    if (!email || !message) {
      return new Response(JSON.stringify({ error: 'email y message son requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1) Buscar usuario por email
    const lookup = await slackApi('users.lookupByEmail', 'GET');
    // La API de Slack requiere query param, así que hacemos una llamada manual
    const token = Deno.env.get('SLACK_BOT_TOKEN')!;
    const resLookup = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,{
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await resLookup.json();
    if (!userData.ok) throw new Error(`users.lookupByEmail failed: ${userData.error}`);
    const userId = userData.user.id as string;

    // 2) Abrir (o recuperar) canal IM
    const openRes = await slackApi('conversations.open', 'POST', { users: userId });
    const channelId = openRes.channel.id as string;

    // 3) Enviar mensaje
    await slackApi('chat.postMessage', 'POST', {
      channel: channelId,
      text: message,
      unfurl_links: false,
      mrkdwn: true,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('send-slack-reminder error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
