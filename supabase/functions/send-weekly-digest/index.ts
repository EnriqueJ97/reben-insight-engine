import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DigestRequest {
  tenantId: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DigestRequest = await req.json();
    const { tenantId, from, to } = body;
    if (!tenantId) throw new Error('tenantId requerido');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY no configurado');
    const resend = new Resend(resendKey);

    // rango de fechas
    const fromISO = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toISO = to ? new Date(to) : new Date();

    // 1) Obtener feedback anónimo del periodo
    const { data: feedback, error: fbError } = await supabase
      .from('anonymous_feedback')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', fromISO.toISOString())
      .lt('created_at', new Date(toISO.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (fbError) throw fbError;

    const total = feedback?.length || 0;
    const byCategory: Record<string, number> = {};
    (feedback || []).forEach((f: any) => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    });

    // 2) Obtener correos de HR_ADMIN del tenant
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('tenant_id', tenantId)
      .eq('role', 'HR_ADMIN');
    if (adminError) throw adminError;

    const recipients = (admins || []).map((a: any) => a.email).filter(Boolean);
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No HR admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3) Componer HTML
    const periodLabel = `${fromISO.toLocaleDateString('es-ES')} - ${toISO.toLocaleDateString('es-ES')}`;
    const topExamples = (feedback || []).slice(0, 5).map((f: any) => `
      <li style="margin-bottom:8px;">
        <strong>[${f.category}]</strong> ${escapeHtml(f.message).slice(0, 280)}
      </li>`).join('');

    const catRows = Object.entries(byCategory).map(([cat, count]) => `
      <tr><td style="padding:6px 8px; border:1px solid #eee;">${cat}</td><td style="padding:6px 8px; border:1px solid #eee;">${count}</td></tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; color:#111;">
        <h2>Resumen semanal de feedback anónimo</h2>
        <p>Periodo: <strong>${periodLabel}</strong></p>
        <p>Total de entradas: <strong>${total}</strong></p>

        <h3>Categorías</h3>
        <table style="border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding:6px 8px; border:1px solid #eee; text-align:left;">Categoría</th>
              <th style="padding:6px 8px; border:1px solid #eee; text-align:left;">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            ${catRows || '<tr><td colspan="2" style="padding:6px 8px;">Sin datos</td></tr>'}
          </tbody>
        </table>

        <h3>Ejemplos recientes</h3>
        <ul>
          ${topExamples || '<li>Sin ejemplos en el periodo</li>'}
        </ul>

        <p>
          Ver más en el panel: <a href="${getAppUrl()}/dashboard/feedback" target="_blank">Feedback Anónimo</a>
        </p>
      </div>
    `;

    // 4) Enviar con Resend (uno por destinatario para evitar spam-detection)
    for (const email of recipients) {
      await resend.emails.send({
        from: 'REBEN <noreply@resend.dev>',
        to: [email],
        subject: 'Resumen semanal - Feedback anónimo',
        html,
      });
      await delay(150); // pequeño delay
    }

    return new Response(JSON.stringify({ success: true, sent: recipients.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('send-weekly-digest error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function escapeHtml(s: string) {
  return s.replace(/[&<>"]+/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function getAppUrl() {
  // Best effort: derive from SUPABASE_URL domain (not ideal). In practice the app URL should be set in a secret/setting.
  const url = Deno.env.get('APP_PUBLIC_URL');
  return url || 'https://app.lovable.dev';
}
