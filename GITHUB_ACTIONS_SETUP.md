# 🔄 Configuración de GitHub Actions con Supabase

## 🚀 **Automatización Completa**

Este setup permite que cualquier cambio en GitHub se sincronice automáticamente con Supabase y se despliegue.

---

## 📋 **Paso 1: Configurar Secrets en GitHub**

### **Ve a tu repositorio en GitHub:**
1. Navega a: https://github.com/EnriqueJ97/reben-insight-engine
2. Ve a **Settings > Secrets and variables > Actions**
3. Agrega los siguientes secrets:

### **Secrets Requeridos:**

#### **SUPABASE_ACCESS_TOKEN**
```bash
# Obtener desde Supabase Dashboard
1. Ve a: https://supabase.com/dashboard/account/tokens
2. Copia el "Access Token"
3. Pega en el secret SUPABASE_ACCESS_TOKEN
```

#### **SUPABASE_URL**
```bash
VITE_SUPABASE_URL=https://scjwymsygllanubzfbok.supabase.co
```

#### **SUPABASE_ANON_KEY**
```bash
# Obtener desde Supabase Dashboard
1. Ve a: https://supabase.com/dashboard/project/scjwymsygllanubzfbok/settings/api
2. Copia el "anon public key"
3. Pega en el secret SUPABASE_ANON_KEY
```

#### **VERCEL_TOKEN** (Opcional para deployment)
```bash
# Obtener desde Vercel Dashboard
1. Ve a: https://vercel.com/account/tokens
2. Crea un nuevo token
3. Pega en el secret VERCEL_TOKEN
```

#### **VERCEL_ORG_ID** (Opcional para deployment)
```bash
# Obtener desde Vercel Dashboard
1. Ve a: https://vercel.com/account
2. Copia el "Team ID"
3. Pega en el secret VERCEL_ORG_ID
```

#### **VERCEL_PROJECT_ID** (Opcional para deployment)
```bash
# Obtener después de conectar el proyecto a Vercel
1. Ve a tu proyecto en Vercel
2. Copia el "Project ID"
3. Pega en el secret VERCEL_PROJECT_ID
```

---

## 🔄 **Workflows Configurados**

### **1. Sincronización Automática (`supabase-sync.yml`)**
- **Trigger:** Push a `main` o `develop`
- **Acciones:**
  - ✅ Ejecuta migraciones automáticamente
  - ✅ Genera tipos TypeScript
  - ✅ Actualiza el repositorio
  - ✅ Build y test de la aplicación
  - ✅ Deployment automático (si está configurado)

### **2. Sincronización Manual (`supabase-manual-sync.yml`)**
- **Trigger:** Manual desde GitHub Actions
- **Opciones:**
  - 🔄 **sync:** Sincronización completa
  - 🔄 **reset:** Reset de la base de datos
  - 📝 **types:** Solo generar tipos TypeScript
  - 📊 **status:** Verificar estado de Supabase

---

## 🛠️ **Cómo Usar**

### **Sincronización Automática:**
```bash
# Simplemente haz push a main o develop
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

### **Sincronización Manual:**
1. Ve a: https://github.com/EnriqueJ97/reben-insight-engine/actions
2. Selecciona "Manual Supabase Sync"
3. Elige la acción deseada
4. Click en "Run workflow"

---

## 📊 **Monitoreo**

### **Verificar Estado:**
- **GitHub Actions:** https://github.com/EnriqueJ97/reben-insight-engine/actions
- **Supabase Dashboard:** https://supabase.com/dashboard/project/scjwymsygllanubzfbok
- **Logs de Build:** Revisar la pestaña "Actions" en GitHub

### **Logs Útiles:**
```bash
# Ver logs de GitHub Actions
# Ve a: https://github.com/EnriqueJ97/reben-insight-engine/actions

# Ver logs de Supabase
supabase logs
```

---

## 🔧 **Configuración Local**

### **Variables de Entorno Locales:**
```bash
# Crear archivo .env.local
VITE_SUPABASE_URL=https://scjwymsygllanubzfbok.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_APP_URL=http://localhost:5173
```

### **Comandos Locales:**
```bash
# Sincronizar manualmente
supabase db push

# Generar tipos
supabase gen types typescript --project-id scjwymsygllanubzfbok > src/types/supabase.ts

# Ver estado
supabase status
```

---

## 🚨 **Solución de Problemas**

### **Error: "Access Token Invalid"**
1. Regenera el token en Supabase Dashboard
2. Actualiza el secret en GitHub
3. Re-ejecuta el workflow

### **Error: "Migration Failed"**
1. Verifica la sintaxis SQL
2. Revisa los logs en GitHub Actions
3. Ejecuta manualmente en Supabase Dashboard

### **Error: "Build Failed"**
1. Verifica que las variables de entorno estén correctas
2. Revisa los logs de build
3. Prueba localmente con `npm run build`

---

## 📈 **Beneficios**

### **✅ Automatización Completa:**
- Migraciones automáticas
- Generación de tipos TypeScript
- Build y test automáticos
- Deployment automático

### **✅ Sincronización Bidireccional:**
- Cambios en GitHub → Supabase
- Cambios en Supabase → GitHub (via manual sync)

### **✅ Monitoreo en Tiempo Real:**
- Logs detallados
- Notificaciones de fallos
- Estado de cada workflow

### **✅ Flexibilidad:**
- Sincronización automática
- Sincronización manual
- Diferentes entornos (dev/prod)

---

## 🎯 **Próximos Pasos**

1. **Configurar Secrets** en GitHub
2. **Probar Sincronización** con un push
3. **Configurar Deployment** (opcional)
4. **Monitorear** los workflows

---

## ✅ **Estado Final**

Una vez configurado, tendrás:
- 🔄 **Sincronización automática** entre GitHub y Supabase
- 🚀 **Deployment automático** en cada push
- 📊 **Monitoreo completo** de todos los procesos
- 🛠️ **Herramientas manuales** para casos especiales

**¡Tu MVP estará completamente automatizado! 🎉** 