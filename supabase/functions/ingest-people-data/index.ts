import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(hash);
}

function getEnvOrThrow(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const supabaseUrl = getEnvOrThrow("SUPABASE_URL");
const serviceKey = getEnvOrThrow("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function getTenantByToken(token: string) {
  const tokenHash = await sha256(token);
  const { data, error } = await supabase
    .from("tenant_api_tokens")
    .select("tenant_id, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.revoked_at) return null;
  return data.tenant_id as string;
}

async function findUserId(tenantId: string, email?: string): Promise<string | null> {
  if (!email) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenantId)
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function findTeamId(tenantId: string, teamName?: string): Promise<string | null> {
  if (!teamName) return null;
  const { data, error } = await supabase
    .from("teams")
    .select("id")
    .eq("tenant_id", tenantId)
    .ilike("name", teamName)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function processPayload(payload: any) {
  const source = payload.source ?? "custom";
  const events = Array.isArray(payload.events) ? payload.events : [];
  const attendance = Array.isArray(payload.attendance) ? payload.attendance : [];
  const metrics = Array.isArray(payload.metrics) ? payload.metrics : [];
  const tenantId = payload.tenant_id as string;

  let inserted = { events: 0, attendance: 0, metrics: 0 };
  let skipped = { events: 0, attendance: 0, metrics: 0 };
  const errors: Array<{ section: string; index: number; message: string }> = [];

  // HR EVENTS
  const hrRows = [] as any[];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    try {
      const email: string | undefined = e.email ?? e.user_email;
      const userId = e.user_id ?? (await findUserId(tenantId, email));
      if (!userId) { skipped.events++; continue; }
      const teamId = e.team_id ?? (await findTeamId(tenantId, e.team));
      const eventType = String(e.type || e.event_type || "").toLowerCase();
      const eventDate = String(e.event_date || e.date || "");
      if (!eventType || !eventDate) { skipped.events++; continue; }
      const reason = e.reason ?? null;
      const fte = e.fte ?? null;
      const hashStr = `${tenantId}|${userId}|${teamId ?? ""}|${eventType}|${eventDate}|${fte ?? ""}|${reason ?? ""}|${source}`;
      const rowHash = await sha256(hashStr);
      hrRows.push({ tenant_id: tenantId, user_id: userId, team_id: teamId, event_type: eventType, event_date: eventDate, reason, fte, source, row_hash: rowHash });
    } catch (err: any) {
      errors.push({ section: "events", index: i, message: err.message || String(err) });
    }
  }
  if (hrRows.length) {
    const { data, error } = await supabase
      .from("hr_events")
      .upsert(hrRows, { onConflict: "row_hash" })
      .select("id");
    if (error) throw error;
    inserted.events += data?.length ?? 0;
  }

  // ATTENDANCE
  const attRows = [] as any[];
  for (let i = 0; i < attendance.length; i++) {
    const a = attendance[i];
    try {
      const email: string | undefined = a.email ?? a.user_email;
      const userId = a.user_id ?? (await findUserId(tenantId, email));
      if (!userId) { skipped.attendance++; continue; }
      const date = String(a.date || "");
      const status = String(a.status || "").toLowerCase();
      if (!date || !status) { skipped.attendance++; continue; }
      const hours_worked = a.hours_worked ?? null;
      const overtime_hours = a.overtime_hours ?? null;
      const justification = a.justification ?? null;
      const hashStr = `${tenantId}|${userId}|${date}|${status}|${hours_worked ?? ""}|${overtime_hours ?? ""}|${justification ?? ""}|${source}`;
      const rowHash = await sha256(hashStr);
      attRows.push({ tenant_id: tenantId, user_id: userId, date, status, hours_worked, overtime_hours, justification, source, row_hash: rowHash });
    } catch (err: any) {
      errors.push({ section: "attendance", index: i, message: err.message || String(err) });
    }
  }
  if (attRows.length) {
    const { data, error } = await supabase
      .from("attendance")
      .upsert(attRows, { onConflict: "row_hash" })
      .select("id");
    if (error) throw error;
    inserted.attendance += data?.length ?? 0;
  }

  // PRODUCTIVITY METRICS
  const metRows = [] as any[];
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    try {
      const date = String(m.date || "");
      const metric_type = String(m.metric_type || "").toLowerCase();
      if (!date || !metric_type) { skipped.metrics++; continue; }
      const email: string | undefined = m.email ?? m.user_email;
      const userId = m.user_id ?? (await findUserId(tenantId, email));
      const teamId = m.team_id ?? (await findTeamId(tenantId, m.team));
      const value = Number(m.value);
      if (Number.isNaN(value)) { skipped.metrics++; continue; }
      const unit = m.unit ?? null;
      const hashStr = `${tenantId}|${date}|${metric_type}|${userId ?? ""}|${teamId ?? ""}|${value}|${unit ?? ""}|${source}`;
      const rowHash = await sha256(hashStr);
      metRows.push({ tenant_id: tenantId, date, metric_type, user_id: userId, team_id: teamId, value, unit, source, row_hash: rowHash });
    } catch (err: any) {
      errors.push({ section: "metrics", index: i, message: err.message || String(err) });
    }
  }
  if (metRows.length) {
    const { data, error } = await supabase
      .from("productivity_metrics")
      .upsert(metRows, { onConflict: "row_hash" })
      .select("id");
    if (error) throw error;
    inserted.metrics += data?.length ?? 0;
  }

  return { inserted, skipped, errors };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload = await req.json();
    const tenantIdFromPayload: string | undefined = payload?.tenant_id;
    if (!tenantIdFromPayload) {
      return new Response(JSON.stringify({ error: "Missing tenant_id in payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tenantIdFromToken = await getTenantByToken(token);
    if (!tenantIdFromToken) {
      return new Response(JSON.stringify({ error: "Invalid or revoked token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (tenantIdFromToken !== tenantIdFromPayload) {
      return new Response(JSON.stringify({ error: "Token does not match tenant_id" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await processPayload(payload);
    return new Response(JSON.stringify({ ok: true, tenant_id: tenantIdFromToken, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("ingest-people-data error", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
