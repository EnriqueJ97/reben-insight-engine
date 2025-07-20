
-- Crear tabla para preguntas personalizadas
CREATE TABLE public.custom_questions (
  id TEXT NOT NULL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('burnout', 'turnover', 'satisfaction', 'extra')),
  subcategory TEXT NOT NULL,
  scale_description TEXT NOT NULL DEFAULT '0=Nunca, 4=Siempre',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver preguntas de su tenant
CREATE POLICY "Users can view custom questions in their tenant"
  ON public.custom_questions
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- Política para que HR_ADMIN pueda gestionar preguntas personalizadas
CREATE POLICY "HR_ADMIN can manage custom questions in their tenant"
  ON public.custom_questions
  FOR ALL
  USING (
    tenant_id = get_current_user_tenant_id() 
    AND get_current_user_role() = 'HR_ADMIN'
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_custom_questions_updated_at
  BEFORE UPDATE ON public.custom_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_custom_questions_tenant_id ON public.custom_questions(tenant_id);
CREATE INDEX idx_custom_questions_category ON public.custom_questions(category);
CREATE INDEX idx_custom_questions_active ON public.custom_questions(is_active);
