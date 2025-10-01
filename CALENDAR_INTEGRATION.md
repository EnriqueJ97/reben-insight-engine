# 📅 Integración de Google Calendar - Detección de Burnout

## Visión General

La integración de **Google Calendar** permite a REBEN analizar patrones de reuniones para detectar señales tempranas de burnout relacionadas con sobrecarga de agenda, falta de tiempo de concentración y trabajo fuera de horario.

## Arquitectura

```
┌─────────────────────┐
│  Google Calendar    │
│      OAuth 2.0      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ calendar-integration│
│   Edge Function     │
├─────────────────────┤
│ • Fetch events      │
│ • Analyze patterns  │
│ • Detect risks      │
│ • Store metrics     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Analytics Cache    │
│   + Alerts System   │
└─────────────────────┘
```

## Señales de Burnout Detectadas

### 1. **Sobrecarga de Reuniones**
- **Métrica**: Promedio de horas de reuniones por día
- **Umbrales**:
  - `>6h/día` = **CRÍTICO** (sin tiempo para trabajo profundo)
  - `>4h/día` = **ALTO** (muy alta densidad)
  - `>3h/día` = **MEDIO** (límite saludable)

### 2. **Días con Sobrecarga Extrema**
- **Métrica**: Días con más de 6 horas de reuniones
- **Umbrales**:
  - `≥5 días` = **CRÍTICO**
  - `≥3 días` = **ALTO**
  - `≥1 día` = **MEDIO**

### 3. **Reuniones Fuera de Horario**
- **Métrica**: Reuniones antes de 8am o después de 8pm
- **Umbrales**:
  - `≥10 reuniones` = **CRÍTICO**
  - `≥5 reuniones` = **ALTO**
  - `≥2 reuniones` = **MEDIO**

### 4. **Reuniones en Fin de Semana**
- **Métrica**: Reuniones sábado/domingo
- **Umbrales**:
  - `≥5 reuniones` = **CRÍTICO** (no hay descanso)
  - `≥3 reuniones` = **ALTO**
  - `≥1 reunión` = **MEDIO**

### 5. **Tiempo de Concentración Insuficiente**
- **Métrica**: Horas sin reuniones por día
- **Umbrales**:
  - `<2h/día` = **CRÍTICO** (sin tiempo para deep work)
  - `<4h/día` = **ALTO**
  - `<5h/día` = **MEDIO**

### 6. **Declinación de Reuniones**
- **Métrica**: % de reuniones declinadas
- **Indicador**: `>20%` puede indicar sobrecarga o priorización extrema

## Métricas Calculadas

```typescript
interface CalendarMetrics {
  totalMeetingHours: number;        // Total de horas en reuniones (período)
  avgMeetingHoursPerDay: number;    // Promedio diario
  maxMeetingHoursInDay: number;     // Día más pesado
  daysWithOverload: number;         // Días con >6h
  focusTimeHours: number;           // Total de horas libres
  afterHoursMeetings: number;       // Reuniones fuera de 8am-8pm
  weekendMeetings: number;          // Reuniones sábado/domingo
  declinedMeetings: number;         // Reuniones declinadas por el usuario
  cancelledRecurringMeetings: number; // Reuniones recurrentes canceladas
}
```

## Recomendaciones Automáticas

El sistema genera recomendaciones específicas basadas en los patrones detectados:

### Si `avgMeetingHoursPerDay > 5h`:
→ "Establecer días sin reuniones (No-Meeting Days) al menos 1-2 veces por semana"

### Si `daysWithOverload ≥ 3`:
→ "Revisar aceptación de reuniones: delegar, rechazar o acortar cuando sea posible"

### Si `afterHoursMeetings ≥ 5`:
→ "Limitar reuniones fuera de horario laboral (8am-8pm)"

### Si `weekendMeetings > 0`:
→ "Evitar programar reuniones en fin de semana para preservar tiempo de descanso"

### Si `focusTimePerDay < 3h`:
→ "Bloquear al menos 2-3h diarias de 'focus time' en calendario"
→ "Usar reuniones de 25 o 45 minutos para crear buffers naturales"

### Si `declinedMeetings > 20%`:
→ "Alta tasa de declinación puede indicar sobrecarga - revisar priorización"

## Configuración

### ✅ Configuración Centralizada (SaaS)

**REBEN** gestiona las credenciales de Google OAuth de forma centralizada - **los usuarios NO necesitan configurar nada en Google Cloud Console**.

### Para Administradores de REBEN

Las credenciales OAuth ya están configuradas en Supabase Secrets:

```bash
GOOGLE_CLIENT_ID=<configurado centralmente>
GOOGLE_CLIENT_SECRET=<configurado centralmente>
```

**Redirect URI configurado en Google Cloud Console:**
```
https://scjwymsygllanubzfbok.supabase.co/functions/v1/calendar-integration/callback
```

### Para Usuarios Finales

Solo necesitan:
1. Hacer clic en **"Conectar Google Calendar"**
2. Autorizar acceso en el popup de Google (como "Sign in with Google")
3. ✅ Listo - su calendario está conectado

### Scopes OAuth (Configurados Centralmente)

```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events.readonly
```

Los usuarios ven estos permisos cuando autorizan la aplicación.

## Flujo de Autenticación

### 1. Iniciar OAuth Flow

```typescript
const { data } = await supabase.functions.invoke('calendar-integration', {
  body: {
    action: 'get_oauth_url',
    userId: user.id,
    tenantId: user.tenant_id,
  }
});

// Abrir authUrl en ventana emergente
window.open(data.authUrl, '_blank');
```

### 2. Exchange OAuth Code

Después de la autorización, Google redirige con `code`:

```typescript
const { data } = await supabase.functions.invoke('calendar-integration', {
  body: {
    action: 'exchange_code',
    code: 'authorization_code',
    userId: user.id,
    tenantId: user.tenant_id,
  }
});
```

Los tokens se almacenan en `integrations_config`:

```sql
{
  "access_token": "ya29.a0...",
  "refresh_token": "1//0g...",
  "expires_at": 1759326000000,
  "user_id": "uuid"
}
```

### 3. Analizar Calendario

```typescript
const { data } = await supabase.functions.invoke('calendar-integration', {
  body: {
    action: 'analyze',
    userId: user.id,
    tenantId: user.tenant_id,
    timeRange: 30, // últimos 30 días
  }
});

console.log(data.analysis);
```

## Almacenamiento de Datos

### analytics_cache

```sql
{
  "tenant_id": "uuid",
  "entity_type": "user",
  "entity_id": "user_uuid",
  "metric_key": "calendar_burnout_indicators",
  "value": 6.5, -- avgMeetingHoursPerDay
  "context": {
    "metrics": { ... },
    "riskIndicators": [ ... ],
    "recommendations": [ ... ],
    "analyzedAt": "2025-10-01T12:00:00Z"
  }
}
```

### alerts

Si se detectan indicadores críticos:

```sql
{
  "tenant_id": "uuid",
  "user_id": "uuid",
  "alert_type": "calendar_overload",
  "severity": "high",
  "title": "Sobrecarga de Reuniones Detectada",
  "description": "Análisis indica: Sobrecarga de reuniones, Reuniones fuera de horario",
  "metadata": {
    "analysis": { ... },
    "source": "calendar_integration"
  }
}
```

## Integración con Modelo Predictivo

Los datos de calendario se pueden correlacionar con el **modelo predictivo de burnout**:

```typescript
// En ai-burnout-predictor
const calendarData = await fetchCalendarMetrics(userId);

const combinedAnalysis = {
  checkIns: { mood: 3.2, trend: 'deteriorating' },
  calendar: { 
    avgMeetingHours: 7.5, 
    focusTime: 1.5,
    afterHours: 12 
  },
  alerts: { critical: 3, unresolved: 5 }
};

// IA correlaciona:
// - Mood bajo + Alta densidad de reuniones = burnout probable
// - Reuniones nocturnas + Alertas críticas = riesgo inmediato
```

## Roadmap

### Próximas Funcionalidades

1. ✅ **Análisis básico de patrones** (COMPLETADO)
2. 🔄 **Detección de bloques sin descanso** (>3h consecutivas)
3. 🔄 **Análisis de calidad de reuniones** (duración, # asistentes)
4. 🔄 **Integración con Microsoft Outlook Calendar**
5. 📊 **Dashboard de comparativa de equipo** (quién tiene más sobrecarga)
6. 🔔 **Alertas preventivas** antes de días pesados
7. 🤖 **Sugerencias automáticas de reorganización** (mover/rechazar)

## Privacidad y Seguridad

- ✅ Tokens encriptados en base de datos
- ✅ Solo lectura de calendario (no modificación)
- ✅ Análisis agregado (no se leen títulos/contenido de reuniones)
- ✅ Consentimiento explícito del usuario vía OAuth
- ✅ Refresh tokens para renovación automática

## Uso en Producción

### Para HR Admin

```typescript
// Ver análisis de todo el equipo
<CalendarIntegration />
```

### Para Manager

```typescript
// Ver solo su equipo
<CalendarIntegration teamId={managerTeamId} />
```

### Para Employee

```typescript
// Solo su calendario personal
<CalendarIntegration userId={employeeId} />
```

## Troubleshooting

### Error: "Calendar integration not configured"
→ Verificar que OAuth fue completado y tokens están en `integrations_config`

### Error: "Failed to fetch calendar events"
→ Token expirado, se intentará refresh automático

### Error: "Invalid access token"
→ Usuario debe reconectar calendario (revocar + reconectar)

---

**REBEN AI** - Detección de Burnout con Google Calendar  
© 2025 - Versión 1.0
