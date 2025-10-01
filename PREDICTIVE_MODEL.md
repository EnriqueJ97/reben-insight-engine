# 🧠 REBEN AI - Modelo Predictivo de Burnout

## Visión General

El **Modelo Predictivo de Burnout REBEN AI** es un sistema de detección temprana que utiliza Inteligencia Artificial (Gemini 2.5 Flash) para predecir riesgo de burnout con 30-60 días de anticipación.

## Arquitectura del Sistema

```
┌─────────────────────┐
│  Fuentes de Datos   │
├─────────────────────┤
│ • Check-ins diarios │
│ • Alertas históricas│
│ • Métricas wellness │
│ • Patrones temporales│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Feature Engineering │
├─────────────────────┤
│ • Agregaciones      │
│ • Tendencias        │
│ • Correlaciones     │
│ • Anomalías         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Lovable AI        │
│   Gemini 2.5 Flash  │
├─────────────────────┤
│ • Análisis ML       │
│ • Pattern matching  │
│ • Risk scoring      │
│ • Confidence calc   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Predicción       │
├─────────────────────┤
│ • Score 0-100       │
│ • Risk Level        │
│ • Days until burnout│
│ • Key factors       │
│ • Recommendations   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Intervención      │
├─────────────────────┤
│ • Alertas auto      │
│ • Acciones HR       │
│ • Seguimiento       │
└─────────────────────┘
```

## Señales de Burnout Detectadas

### 1. **Patrones de Estado de Ánimo**
- **Descenso gradual**: >20% en 30 días
- **Volatilidad**: Alta varianza día a día
- **Respuestas negativas**: Aumento en respuestas bajas (<2/5)

### 2. **Alertas y Críticas**
- **Aumento de alertas**: >50% más que período anterior
- **Alertas no resueltas**: Acumulación de issues
- **Severidad crítica**: Alertas de máxima prioridad

### 3. **Engagement y Participación**
- **Disminución de check-ins**: <60% de tasa de respuesta
- **Respuestas breves**: Menos engagement en preguntas abiertas
- **Desconexión**: Días sin actividad

### 4. **Patrones Temporales (Red Flags)**
- **Actividad fuera de horario**: >15% check-ins en weekend
- **Actividad nocturna**: >10% check-ins 22:00-06:00
- **Varianza de horarios**: Inconsistencia en timing de respuestas

### 5. **Combinación de Factores**
- Correlación entre múltiples señales débiles
- Cambios súbitos vs. tendencias graduales
- Contexto de rol y equipo

## Modelo de Scoring

### Risk Score (0-100)

| Rango | Nivel | Descripción | Acción |
|-------|-------|-------------|--------|
| 0-29 | **Low** | Riesgo mínimo, empleado saludable | Monitoreo rutinario |
| 30-59 | **Medium** | Señales tempranas, requiere atención | Check-in con manager |
| 60-84 | **High** | Riesgo elevado, intervención necesaria | Reunión HR + plan acción |
| 85-100 | **Critical** | Burnout inminente | Intervención inmediata |

### Factores de Impacto

Cada factor tiene un **impacto** de -100 a +100:

- **Positivo (+)**: Factores protectores (ej: mood improving +40)
- **Negativo (-)**: Factores de riesgo (ej: late night activity -60)

### Confianza del Modelo

Confianza (0.0-1.0) basada en:
- **Cantidad de datos**: Más check-ins = mayor confianza
- **Consistencia de patrones**: Tendencias claras vs. ruido
- **Correlación de señales**: Múltiples indicadores alineados

Umbrales:
- **<0.5**: Datos insuficientes, necesita más observaciones
- **0.5-0.7**: Confianza media, usar con precaución
- **0.7-0.9**: Alta confianza, predicción fiable
- **>0.9**: Muy alta confianza, patrón claro

## Predicción de Tiempo

**Days Until Burnout** estima cuándo ocurrirá el burnout si la tendencia continúa:

```python
if riskLevel == 'low':
    predictedDays = null  # Sin riesgo inminente

if riskLevel == 'medium':
    predictedDays = 60-90  # Warning temprano

if riskLevel == 'high':
    predictedDays = 14-30  # Ventana de intervención

if riskLevel == 'critical':
    predictedDays = 0-7    # Acción urgente
```

## Recomendaciones Generadas

El modelo genera **3-5 recomendaciones accionables** basadas en factores clave:

### Ejemplos:

**Si: "Descenso de mood" es factor principal**
→ "Programar reunión 1-on-1 con manager para discutir carga de trabajo"

**Si: "Actividad nocturna" detectada**
→ "Revisar distribución de tareas y establecer límites de horario laboral"

**Si: "Aumento de alertas críticas"**
→ "Redistribuir prioridades del proyecto y ofrecer soporte adicional"

**Si: "Baja tasa de check-ins"**
→ "Contactar al empleado para verificar bienestar y reevaluar engagement"

## Integración Futura

### Próximas Fuentes de Datos (Roadmap)

1. **Google Calendar / Outlook**
   - Densidad de reuniones
   - Bloques sin descansos
   - Reuniones fuera de horario

2. **JIRA / Asana**
   - Carga de tareas
   - Velocity trends
   - Tiempo en bloqueos
   - Sprint burndown

3. **Slack / Teams**
   - Patrones de mensajería
   - Respuestas fuera de horario
   - Sentimiento en mensajes

4. **GitHub / GitLab**
   - Commits (frecuencia, horarios)
   - Pull requests
   - Code review workload

### Modelo de Integración

```typescript
// Ejemplo: Integrar datos de calendario
interface CalendarData {
  meetings: {
    duration: number;
    startTime: Date;
    attendees: number;
  }[];
  focusTime: number; // minutos sin reuniones
  afterHoursMeetings: number;
}

// El modelo correlacionará:
// - Alta densidad de reuniones + bajo mood = riesgo ↑
// - Reuniones nocturnas + alertas ↑ = burnout inmediato
```

## Ventajas Competitivas

✅ **Multi-fuente**: Correlaciona check-ins + alertas + timing  
✅ **Predictivo**: 30-60 días de anticipación  
✅ **Explicable**: Factores clave + recomendaciones específicas  
✅ **Privado**: Análisis agregado, sin exponer identidades  
✅ **Accionable**: No solo detección, sino plan de acción  
✅ **Adaptativo**: Modelo IA que mejora con más datos  

## Próximos Pasos

1. ✅ **Modelo predictivo base** con datos actuales
2. 🔄 **Integración Calendar** (Google + Outlook)
3. 🔄 **Integración JIRA** (project management)
4. 📊 **Dashboard de predicciones** para HR/Managers
5. 🔔 **Alertas automáticas** en riesgo high/critical
6. 📈 **Tracking de efectividad** de intervenciones

## Uso

### Análisis Individual
```typescript
const { data } = await supabase.functions.invoke('ai-burnout-predictor', {
  body: {
    userId: 'uuid-del-empleado',
    tenantId: 'uuid-del-tenant',
    analysisType: 'individual'
  }
});
```

### Análisis de Equipo
```typescript
const { data } = await supabase.functions.invoke('ai-burnout-predictor', {
  body: {
    tenantId: 'uuid-del-tenant',
    analysisType: 'team'
  }
});
```

### Resultado
```json
{
  "success": true,
  "predictions": [{
    "userId": "...",
    "userName": "Juan Pérez",
    "riskScore": 72,
    "riskLevel": "high",
    "predictedDaysUntilBurnout": 21,
    "confidence": 0.85,
    "keyFactors": [
      {
        "factor": "Descenso gradual del estado de ánimo",
        "impact": -45,
        "trend": "deteriorating",
        "description": "Mood ha bajado 35% en últimos 30 días"
      }
    ],
    "recommendations": [
      "Programar reunión urgente 1-on-1 con manager",
      "Revisar carga de trabajo y redistribuir prioridades",
      "Considerar días de descanso o reducción temporal de responsabilidades"
    ],
    "nextCheckDate": "2025-10-08T00:00:00Z"
  }],
  "analyzedAt": "2025-10-01T12:30:00Z",
  "totalAnalyzed": 1
}
```

## Soporte

Para preguntas sobre el modelo predictivo, contactar al equipo de IA de REBEN.

---

**REBEN AI** - Predicción de Burnout con Inteligencia Artificial  
© 2025 - Versión 1.0
