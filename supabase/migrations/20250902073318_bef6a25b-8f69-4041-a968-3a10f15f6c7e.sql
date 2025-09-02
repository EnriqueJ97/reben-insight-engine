-- Crear tabla para preferencias de turnos de empleados
CREATE TABLE public.shift_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Habilitar RLS
ALTER TABLE public.shift_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que solo los usuarios puedan ver y modificar sus propias preferencias
CREATE POLICY "Users can view their own shift preferences" 
ON public.shift_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shift preferences" 
ON public.shift_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shift preferences" 
ON public.shift_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shift preferences" 
ON public.shift_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_shift_preferences_updated_at
BEFORE UPDATE ON public.shift_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_shift_preferences_user_id ON public.shift_preferences(user_id);
CREATE INDEX idx_shift_preferences_tenant_id ON public.shift_preferences(tenant_id);