# 🔧 Guía Completa de Configuración de Supabase

## 🚀 **Paso 1: Instalar Supabase CLI**

### **Opción A: Usando npm (Recomendado)**
```bash
npm install -g supabase
```

### **Opción B: Usando Chocolatey**
```bash
choco install supabase
```

### **Opción C: Descarga Manual**
1. Ve a: https://github.com/supabase/cli/releases
2. Descarga la versión para Windows
3. Extrae y agrega al PATH

## 🔐 **Paso 2: Configurar Variables de Entorno**

### **Crear archivo .env.local**
```bash
# Crear archivo .env.local en la raíz del proyecto
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

### **Obtener credenciales de Supabase:**
1. Ve a https://supabase.com
2. Crea un nuevo proyecto o usa uno existente
3. Ve a Settings > API
4. Copia:
   - **Project URL**
   - **anon public key**

## 🏗️ **Paso 3: Inicializar Supabase Local (Opcional)**

### **Para desarrollo local:**
```bash
# Inicializar Supabase local
supabase init

# Iniciar Supabase local
supabase start

# Esto te dará credenciales locales para desarrollo
```

## 📊 **Paso 4: Configurar Proyecto Remoto**

### **Login a Supabase:**
```bash
supabase login
```

### **Link al proyecto remoto:**
```bash
supabase link --project-ref your-project-ref
```

**Para encontrar tu project-ref:**
1. Ve a tu proyecto en Supabase Dashboard
2. En la URL verás: `https://supabase.com/dashboard/project/abcdefgh-ijkl-mnop-qrst-uvwxyz123456`
3. El `project-ref` es: `abcdefgh-ijkl-mnop-qrst-uvwxyz123456`

## 🗄️ **Paso 5: Ejecutar Migraciones**

### **Opción A: Desde Supabase Dashboard (Más Fácil)**

1. **Ve a tu proyecto en Supabase Dashboard**
2. **Navega a SQL Editor**
3. **Copia y pega el contenido de:**
   ```
   supabase/migrations/20250101000000_add_mvp_features.sql
   ```
4. **Ejecuta el script**

### **Opción B: Usando CLI**

```bash
# Ejecutar migración específica
supabase db push

# O ejecutar todas las migraciones
supabase migration up
```

## 🔧 **Paso 6: Configurar RLS (Row Level Security)**

### **Verificar que RLS esté habilitado:**
```sql
-- En SQL Editor de Supabase
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### **Habilitar RLS en tablas principales:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
```

## 🔐 **Paso 7: Configurar Políticas de Seguridad**

### **Políticas básicas (ya incluidas en la migración):**
```sql
-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para checkins
CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own checkins" ON checkins
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

## 🧪 **Paso 8: Verificar Configuración**

### **Test de conexión:**
```javascript
// En tu aplicación
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your-project-url',
  'your-anon-key'
)

// Test de conexión
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Conexión exitosa:', data)
```

## 📋 **Paso 9: Checklist de Verificación**

### **✅ Configuración Básica:**
- [ ] Supabase CLI instalado
- [ ] Variables de entorno configuradas
- [ ] Proyecto linkeado correctamente
- [ ] Migraciones ejecutadas

### **✅ Base de Datos:**
- [ ] Tabla `invitations` creada
- [ ] Tabla `notifications` creada
- [ ] Tabla `notification_settings` creada
- [ ] Columnas agregadas a `tenants`
- [ ] RLS habilitado en todas las tablas

### **✅ Seguridad:**
- [ ] Políticas RLS configuradas
- [ ] Triggers funcionando
- [ ] Funciones automáticas creadas

### **✅ Aplicación:**
- [ ] Conexión a Supabase exitosa
- [ ] Login/Logout funcionando
- [ ] Onboarding se muestra
- [ ] Invitaciones se crean

## 🚨 **Solución de Problemas Comunes**

### **Error: "No se puede cargar npm.ps1"**
```powershell
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Error: "Supabase CLI no encontrado"**
```bash
# Reinstalar globalmente
npm uninstall -g supabase
npm install -g supabase
```

### **Error: "Connection failed"**
1. Verificar variables de entorno
2. Verificar que el proyecto esté activo
3. Verificar credenciales correctas

### **Error: "Migration failed"**
1. Verificar sintaxis SQL
2. Verificar permisos de usuario
3. Ejecutar migraciones una por una

## 📞 **Soporte**

### **Recursos Útiles:**
- 📚 [Documentación Supabase](https://supabase.com/docs)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)
- 💬 [Discord Community](https://discord.supabase.com)

### **Comandos Útiles:**
```bash
# Ver estado de Supabase
supabase status

# Ver logs
supabase logs

# Resetear base de datos
supabase db reset

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

## 🎯 **Próximos Pasos**

1. **Ejecutar migraciones** usando el método que prefieras
2. **Verificar conexión** con un test simple
3. **Probar funcionalidades** del MVP
4. **Configurar variables de entorno** en producción
5. **Deployment** siguiendo `DEPLOYMENT.md`

---

## ✅ **¡Configuración Completa!**

Una vez completados estos pasos, tu MVP estará completamente funcional con Supabase.

**Estado:** 🚀 **Listo para desarrollo y producción** 