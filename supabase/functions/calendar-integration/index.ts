import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  status: string; // confirmed, tentative, cancelled
  attendees?: Array<{
    email: string;
    responseStatus: string; // accepted, declined, tentative, needsAction
    self?: boolean;
  }>;
  recurringEventId?: string;
}

interface CalendarAnalysis {
  userId: string;
  userName: string;
  period: { start: string; end: string };
  metrics: {
    totalMeetingHours: number;
    avgMeetingHoursPerDay: number;
    maxMeetingHoursInDay: number;
    daysWithOverload: number; // >6h meetings
    focusTimeHours: number;
    afterHoursMeetings: number;
    weekendMeetings: number;
    declinedMeetings: number;
    cancelledRecurringMeetings: number;
  };
  riskIndicators: Array<{
    indicator: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    value: number;
    threshold: number;
    description: string;
  }>;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, tenantId, accessToken, timeRange = 30 } = await req.json();

    if (!tenantId) {
      throw new Error('Missing tenant_id');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Calendar integration action:', action);

    switch (action) {
      case 'analyze':
        return await analyzeCalendar(userId, tenantId, accessToken, timeRange, supabase);
      
      case 'get_oauth_url':
        return await getOAuthUrl(userId, supabase);
      
      case 'exchange_code':
        const { code } = await req.json();
        return await exchangeOAuthCode(code, userId, tenantId, supabase);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Calendar integration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getOAuthUrl(userId: string, supabase: any): Promise<Response> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const redirectUri = 'https://scjwymsygllanubzfbok.supabase.co/functions/v1/calendar-integration/callback';
  
  if (!clientId) {
    throw new Error('Google OAuth not configured');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ];

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes.join(' '))}&` +
    `access_type=offline&` +
    `state=${userId}&` +
    `prompt=consent`;

  return new Response(
    JSON.stringify({ success: true, authUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function exchangeOAuthCode(
  code: string, 
  userId: string, 
  tenantId: string, 
  supabase: any
): Promise<Response> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = 'https://scjwymsygllanubzfbok.supabase.co/functions/v1/calendar-integration/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth not configured');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange OAuth code');
  }

  const tokens = await tokenResponse.json();

  // Store tokens securely in integrations_config
  await supabase
    .from('integrations_config')
    .upsert({
      tenant_id: tenantId,
      integration_type: 'google_calendar',
      name: 'Google Calendar Integration',
      config: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
        user_id: userId,
      },
      is_active: true,
      created_by: userId,
    });

  return new Response(
    JSON.stringify({ success: true, message: 'Calendar connected successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeCalendar(
  userId: string,
  tenantId: string,
  accessToken: string,
  timeRange: number,
  supabase: any
): Promise<Response> {
  console.log('Analyzing calendar for user:', userId);

  // Fetch calendar config
  const { data: config } = await supabase
    .from('integrations_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('integration_type', 'google_calendar')
    .eq('is_active', true)
    .single();

  if (!config) {
    throw new Error('Calendar integration not configured');
  }

  let token = accessToken || config.config.access_token;

  // Refresh token if expired
  if (config.config.expires_at < Date.now()) {
    token = await refreshAccessToken(config.config.refresh_token, tenantId, supabase);
  }

  // Fetch calendar events
  const now = new Date();
  const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);
  
  const eventsResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${startDate.toISOString()}&` +
    `timeMax=${now.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!eventsResponse.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  const eventsData = await eventsResponse.json();
  const events: CalendarEvent[] = eventsData.items || [];

  console.log(`Fetched ${events.length} calendar events`);

  // Analyze events
  const analysis = analyzeEvents(events, userId, startDate, now);

  // Store analysis in analytics_cache
  await supabase
    .from('analytics_cache')
    .upsert({
      tenant_id: tenantId,
      entity_type: 'user',
      entity_id: userId,
      metric_key: 'calendar_burnout_indicators',
      value: analysis.metrics.avgMeetingHoursPerDay,
      context: {
        metrics: analysis.metrics,
        riskIndicators: analysis.riskIndicators,
        recommendations: analysis.recommendations,
        analyzedAt: now.toISOString(),
      },
      updated_at: now.toISOString(),
    });

  // Create alert if critical risk detected
  const criticalIndicators = analysis.riskIndicators.filter(r => r.severity === 'critical');
  if (criticalIndicators.length > 0) {
    await supabase
      .from('alerts')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        alert_type: 'calendar_overload',
        severity: 'high',
        title: `Sobrecarga de Reuniones Detectada`,
        description: `Análisis de calendario indica patrones de riesgo: ${criticalIndicators.map(i => i.indicator).join(', ')}`,
        metadata: {
          analysis,
          source: 'calendar_integration',
        },
        status: 'pending',
      });
  }

  return new Response(
    JSON.stringify({ success: true, analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeEvents(
  events: CalendarEvent[],
  userId: string,
  startDate: Date,
  endDate: Date
): CalendarAnalysis {
  const userName = 'User'; // Will be fetched from profile
  
  // Group events by day
  const eventsByDay = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    if (event.status === 'cancelled') return;
    
    const startTime = new Date(event.start.dateTime);
    const dayKey = startTime.toISOString().split('T')[0];
    
    if (!eventsByDay.has(dayKey)) {
      eventsByDay.set(dayKey, []);
    }
    eventsByDay.get(dayKey)!.push(event);
  });

  // Calculate metrics
  let totalMeetingMinutes = 0;
  let maxMeetingHoursInDay = 0;
  let daysWithOverload = 0;
  let afterHoursMeetings = 0;
  let weekendMeetings = 0;
  let declinedMeetings = 0;
  let cancelledRecurringMeetings = 0;
  let totalWorkingHours = 0;

  eventsByDay.forEach((dayEvents, dayKey) => {
    const date = new Date(dayKey);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    let dayMeetingMinutes = 0;

    dayEvents.forEach(event => {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      
      dayMeetingMinutes += durationMinutes;
      totalMeetingMinutes += durationMinutes;

      const hour = start.getHours();
      
      // After hours: before 8am or after 8pm
      if (hour < 8 || hour >= 20) {
        afterHoursMeetings++;
      }

      // Weekend meetings
      if (isWeekend) {
        weekendMeetings++;
      }

      // Declined meetings
      const userAttendee = event.attendees?.find(a => a.self);
      if (userAttendee?.responseStatus === 'declined') {
        declinedMeetings++;
      }

      // Cancelled recurring meetings
      if (event.recurringEventId && event.status === 'cancelled') {
        cancelledRecurringMeetings++;
      }
    });

    const dayMeetingHours = dayMeetingMinutes / 60;
    maxMeetingHoursInDay = Math.max(maxMeetingHoursInDay, dayMeetingHours);

    if (dayMeetingHours > 6) {
      daysWithOverload++;
    }

    if (!isWeekend) {
      totalWorkingHours += 8; // Assume 8h workday
    }
  });

  const totalMeetingHours = totalMeetingMinutes / 60;
  const workingDays = Array.from(eventsByDay.keys()).filter(k => {
    const d = new Date(k);
    return d.getDay() !== 0 && d.getDay() !== 6;
  }).length;

  const avgMeetingHoursPerDay = workingDays > 0 ? totalMeetingHours / workingDays : 0;
  const focusTimeHours = Math.max(0, totalWorkingHours - totalMeetingHours);

  // Risk indicators
  const riskIndicators: CalendarAnalysis['riskIndicators'] = [];

  // 1. Meeting overload
  if (avgMeetingHoursPerDay > 6) {
    riskIndicators.push({
      indicator: 'Sobrecarga de reuniones',
      severity: 'critical',
      value: avgMeetingHoursPerDay,
      threshold: 6,
      description: `Promedio de ${avgMeetingHoursPerDay.toFixed(1)}h de reuniones diarias (>6h = crítico)`
    });
  } else if (avgMeetingHoursPerDay > 4) {
    riskIndicators.push({
      indicator: 'Alta densidad de reuniones',
      severity: 'high',
      value: avgMeetingHoursPerDay,
      threshold: 4,
      description: `Promedio de ${avgMeetingHoursPerDay.toFixed(1)}h de reuniones diarias`
    });
  }

  // 2. Days with extreme overload
  if (daysWithOverload > 0) {
    const severity = daysWithOverload >= 5 ? 'critical' : daysWithOverload >= 3 ? 'high' : 'medium';
    riskIndicators.push({
      indicator: 'Días con sobrecarga extrema',
      severity,
      value: daysWithOverload,
      threshold: 2,
      description: `${daysWithOverload} días con >6h de reuniones`
    });
  }

  // 3. After hours meetings
  if (afterHoursMeetings > 0) {
    const severity = afterHoursMeetings >= 10 ? 'critical' : afterHoursMeetings >= 5 ? 'high' : 'medium';
    riskIndicators.push({
      indicator: 'Reuniones fuera de horario',
      severity,
      value: afterHoursMeetings,
      threshold: 3,
      description: `${afterHoursMeetings} reuniones antes de 8am o después de 8pm`
    });
  }

  // 4. Weekend meetings
  if (weekendMeetings > 0) {
    const severity = weekendMeetings >= 5 ? 'critical' : weekendMeetings >= 3 ? 'high' : 'medium';
    riskIndicators.push({
      indicator: 'Reuniones en fin de semana',
      severity,
      value: weekendMeetings,
      threshold: 2,
      description: `${weekendMeetings} reuniones programadas en fin de semana`
    });
  }

  // 5. Low focus time
  const focusTimePerDay = workingDays > 0 ? focusTimeHours / workingDays : 0;
  if (focusTimePerDay < 2) {
    riskIndicators.push({
      indicator: 'Tiempo de concentración insuficiente',
      severity: 'critical',
      value: focusTimePerDay,
      threshold: 2,
      description: `Solo ${focusTimePerDay.toFixed(1)}h/día de tiempo sin reuniones (<2h = crítico)`
    });
  } else if (focusTimePerDay < 4) {
    riskIndicators.push({
      indicator: 'Bajo tiempo de concentración',
      severity: 'high',
      value: focusTimePerDay,
      threshold: 4,
      description: `${focusTimePerDay.toFixed(1)}h/día de tiempo sin reuniones`
    });
  }

  // Recommendations
  const recommendations: string[] = [];

  if (avgMeetingHoursPerDay > 5) {
    recommendations.push('Establecer días sin reuniones (No-Meeting Days) al menos 1-2 veces por semana');
  }

  if (daysWithOverload >= 3) {
    recommendations.push('Revisar aceptación de reuniones: delegar, rechazar o acortar cuando sea posible');
  }

  if (afterHoursMeetings >= 5) {
    recommendations.push('Limitar reuniones fuera de horario laboral (8am-8pm)');
  }

  if (weekendMeetings > 0) {
    recommendations.push('Evitar programar reuniones en fin de semana para preservar tiempo de descanso');
  }

  if (focusTimePerDay < 3) {
    recommendations.push('Bloquear al menos 2-3h diarias de "focus time" en calendario');
    recommendations.push('Usar reuniones de 25 o 45 minutos para crear buffers naturales');
  }

  if (declinedMeetings > events.length * 0.2) {
    recommendations.push('Alta tasa de declinación puede indicar sobrecarga - revisar priorización');
  }

  return {
    userId,
    userName,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    metrics: {
      totalMeetingHours,
      avgMeetingHoursPerDay,
      maxMeetingHoursInDay,
      daysWithOverload,
      focusTimeHours,
      afterHoursMeetings,
      weekendMeetings,
      declinedMeetings,
      cancelledRecurringMeetings,
    },
    riskIndicators,
    recommendations,
  };
}

async function refreshAccessToken(refreshToken: string, tenantId: string, supabase: any): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = await response.json();

  // Update stored tokens
  await supabase
    .from('integrations_config')
    .update({
      config: {
        access_token: tokens.access_token,
        refresh_token: refreshToken,
        expires_at: Date.now() + tokens.expires_in * 1000,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
    .eq('integration_type', 'google_calendar');

  return tokens.access_token;
}
