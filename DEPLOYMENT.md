# 🚀 Guía de Deployment - MVP Empresarial

## 📋 **Requisitos Previos**

### **Infraestructura**
- ✅ Supabase Project configurado
- ✅ Variables de entorno configuradas
- ✅ Base de datos migrada
- ✅ Storage configurado

### **Dominio y SSL**
- ✅ Dominio configurado (ej: `wellness.empresa.com`)
- ✅ Certificado SSL instalado
- ✅ DNS configurado

## 🔧 **Configuración de Supabase**

### **1. Variables de Entorno**
```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-domain.com
```

### **2. Configuración de RLS (Row Level Security)**
```sql
-- Ejecutar en Supabase SQL Editor
-- Verificar que todas las políticas estén activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **3. Configuración de Storage**
```sql
-- Crear bucket para archivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-assets', 'company-assets', true);

-- Políticas de storage
CREATE POLICY "Users can upload company assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-assets' AND auth.uid() IN (
    SELECT id FROM profiles WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));
```

## 🏗️ **Build y Deployment**

### **1. Build de Producción**
```bash
# Instalar dependencias
npm install

# Build para producción
npm run build

# Verificar build
npm run preview
```

### **2. Deployment en Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy
vercel --prod
```

### **3. Variables de Entorno en Vercel**
```bash
# Configurar variables en Vercel Dashboard
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-domain.com
```

## 🔐 **Configuración de Seguridad**

### **1. CORS Configuration**
```javascript
// En Supabase Dashboard > Settings > API
// Agregar dominios permitidos
https://your-domain.com
https://www.your-domain.com
```

### **2. Rate Limiting**
```sql
-- Configurar rate limiting para APIs críticas
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitorear queries lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### **3. Backup Configuration**
```sql
-- Configurar backups automáticos
-- En Supabase Dashboard > Settings > Database
-- Habilitar Point-in-Time Recovery
```

## 📊 **Monitoreo y Analytics**

### **1. Error Tracking**
```javascript
// Configurar Sentry o similar
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### **2. Performance Monitoring**
```javascript
// Configurar Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Enviar métricas a tu sistema de analytics
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🧪 **Testing Checklist**

### **Funcionalidades Críticas**
- ✅ Login/Logout
- ✅ Onboarding de empresa
- ✅ Invitaciones por email
- ✅ Check-ins diarios
- ✅ Dashboard de métricas
- ✅ Alertas de burnout
- ✅ Reportes semanales
- ✅ Notificaciones
- ✅ Gestión de equipos

### **Roles y Permisos**
- ✅ EMPLOYEE: Check-ins y dashboard personal
- ✅ MANAGER: Vista de equipo y reportes
- ✅ HR_ADMIN: Gestión completa y configuración
- ✅ SUPER_ADMIN: Acceso total

### **Performance**
- ✅ Tiempo de carga < 3 segundos
- ✅ Responsive en móviles
- ✅ Funciona offline (PWA)
- ✅ Optimización de imágenes

## 📈 **Métricas de Éxito**

### **KPIs Técnicos**
- Uptime: > 99.9%
- Tiempo de respuesta: < 200ms
- Error rate: < 0.1%
- Usuarios concurrentes: 100+

### **KPIs de Negocio**
- Tasa de adopción: > 80%
- Check-ins completados: > 70%
- Alertas resueltas: > 90%
- Satisfacción del usuario: > 4.5/5

## 🔄 **Proceso de Deployment**

### **1. Pre-deployment**
```bash
# Ejecutar tests
npm run test

# Linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

### **2. Deployment Staging**
```bash
# Deploy a staging
vercel --env staging

# Probar funcionalidades críticas
# Verificar integraciones
# Validar performance
```

### **3. Deployment Production**
```bash
# Deploy a producción
vercel --prod

# Verificar health checks
# Monitorear métricas
# Notificar al equipo
```

## 🚨 **Plan de Contingencia**

### **Rollback Strategy**
```bash
# Revertir a versión anterior
vercel rollback

# Restaurar base de datos
# Notificar usuarios
```

### **Monitoring Alerts**
- Error rate > 1%
- Response time > 500ms
- Uptime < 99%
- Database connections > 80%

## 📞 **Soporte y Mantenimiento**

### **Contactos de Emergencia**
- DevOps: [email]
- Database Admin: [email]
- Product Manager: [email]

### **Documentación**
- API Documentation: `/api/docs`
- User Guide: `/help`
- Admin Guide: `/admin/docs`

## 🎯 **Próximos Pasos Post-Deployment**

1. **Monitoreo 24/7** - Configurar alertas automáticas
2. **Backup Automático** - Configurar backups diarios
3. **Scaling Plan** - Preparar para crecimiento
4. **Security Audit** - Revisión mensual de seguridad
5. **Performance Optimization** - Optimización continua

---

## ✅ **Checklist Final**

- [ ] Supabase configurado y migrado
- [ ] Variables de entorno configuradas
- [ ] Build exitoso sin errores
- [ ] Deployment en producción
- [ ] SSL configurado
- [ ] CORS configurado
- [ ] Monitoreo activo
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Equipo notificado

**¡El MVP está listo para pruebas empresariales! 🚀** 