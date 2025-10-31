-- ============================================================================
-- BANCO DE PREGUNTAS CIENTÍFICAS - Sistema de Rotación Inteligente
-- ============================================================================

-- Tabla principal de preguntas científicas validadas
CREATE TABLE IF NOT EXISTS public.scientific_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code TEXT NOT NULL, -- MBI, UWES, JSS, WLB, PSS, ITL, WHO5, OCS
  scale_name TEXT NOT NULL,
  dimension TEXT NOT NULL, -- Subdimensión dentro de la escala
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL, -- Orden original en la escala
  response_scale TEXT NOT NULL, -- Tipo de escala (0-6_frequency, 1-5_agreement, etc)
  reverse_scored BOOLEAN DEFAULT false, -- Si la pregunta se puntúa inversamente
  weight NUMERIC(3,2) DEFAULT 1.0, -- Peso de la pregunta en el cálculo
  timing TEXT NOT NULL CHECK (timing IN ('morning', 'evening', 'both')), -- Cuándo hacer la pregunta
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scale_code, question_order)
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_scientific_questions_scale ON public.scientific_questions(scale_code);
CREATE INDEX IF NOT EXISTS idx_scientific_questions_timing ON public.scientific_questions(timing);
CREATE INDEX IF NOT EXISTS idx_scientific_questions_active ON public.scientific_questions(is_active);

-- Historial de preguntas respondidas por usuario
CREATE TABLE IF NOT EXISTS public.user_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.scientific_questions(id) ON DELETE CASCADE,
  response_value NUMERIC NOT NULL,
  timing TEXT NOT NULL CHECK (timing IN ('morning', 'evening')),
  answered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para el historial
CREATE INDEX IF NOT EXISTS idx_user_question_history_user ON public.user_question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_tenant ON public.user_question_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_question ON public.user_question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_history_timing ON public.user_question_history(timing);
CREATE INDEX IF NOT EXISTS idx_user_question_history_answered ON public.user_question_history(answered_at);

-- Tabla de scores calculados por escala
CREATE TABLE IF NOT EXISTS public.scale_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  scale_code TEXT NOT NULL,
  scale_name TEXT NOT NULL,
  dimension TEXT, -- NULL si es score total de la escala
  score NUMERIC NOT NULL,
  percentile NUMERIC, -- Percentil comparado con población
  interpretation TEXT, -- 'bajo', 'medio', 'alto', 'crítico'
  questions_answered INTEGER NOT NULL,
  questions_total INTEGER NOT NULL,
  completion_percentage NUMERIC GENERATED ALWAYS AS (questions_answered::numeric / questions_total::numeric * 100) STORED,
  last_updated TIMESTAMPTZ DEFAULT now(),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scale_code, dimension)
);

-- Índices para scores
CREATE INDEX IF NOT EXISTS idx_scale_scores_user ON public.scale_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scale_scores_tenant ON public.scale_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scale_scores_scale ON public.scale_scores(scale_code);
CREATE INDEX IF NOT EXISTS idx_scale_scores_updated ON public.scale_scores(last_updated);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- scientific_questions: Todos pueden leer preguntas activas
ALTER TABLE public.scientific_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active scientific questions"
ON public.scientific_questions FOR SELECT
USING (is_active = true);

CREATE POLICY "HR_ADMIN can manage scientific questions"
ON public.scientific_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'HR_ADMIN'
  )
);

-- user_question_history: Usuarios pueden ver su historial
ALTER TABLE public.user_question_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own question history"
ON public.user_question_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own question history"
ON public.user_question_history FOR INSERT
WITH CHECK (user_id = auth.uid() AND tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR_ADMIN can view all question history in tenant"
ON public.user_question_history FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('HR_ADMIN', 'COMPLIANCE_OFFICER')
  )
);

-- scale_scores: Usuarios pueden ver sus scores
ALTER TABLE public.scale_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scale scores"
ON public.scale_scores FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage scale scores"
ON public.scale_scores FOR ALL
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR_ADMIN can view all scale scores in tenant"
ON public.scale_scores FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('HR_ADMIN', 'MANAGER', 'COMPLIANCE_OFFICER')
  )
);

-- ============================================================================
-- FUNCIÓN: Seleccionar siguiente pregunta inteligente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_next_scientific_question(
  p_user_id UUID,
  p_timing TEXT -- 'morning' o 'evening'
)
RETURNS TABLE(
  question_id UUID,
  scale_code TEXT,
  scale_name TEXT,
  dimension TEXT,
  question_text TEXT,
  response_scale TEXT,
  reverse_scored BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_least_answered_scale TEXT;
BEGIN
  -- Encontrar la escala con menos preguntas respondidas
  SELECT sq.scale_code INTO v_least_answered_scale
  FROM public.scientific_questions sq
  LEFT JOIN public.user_question_history uqh 
    ON sq.id = uqh.question_id 
    AND uqh.user_id = p_user_id
    AND uqh.answered_at > NOW() - INTERVAL '90 days'
  WHERE sq.is_active = true
    AND (sq.timing = p_timing OR sq.timing = 'both')
  GROUP BY sq.scale_code
  ORDER BY COUNT(uqh.id) ASC, RANDOM()
  LIMIT 1;
  
  -- Seleccionar una pregunta de esa escala que no se haya hecho recientemente
  RETURN QUERY
  SELECT 
    sq.id,
    sq.scale_code,
    sq.scale_name,
    sq.dimension,
    sq.question_text,
    sq.response_scale,
    sq.reverse_scored
  FROM public.scientific_questions sq
  WHERE sq.scale_code = v_least_answered_scale
    AND sq.is_active = true
    AND (sq.timing = p_timing OR sq.timing = 'both')
    AND NOT EXISTS (
      SELECT 1 FROM public.user_question_history uqh2
      WHERE uqh2.question_id = sq.id
        AND uqh2.user_id = p_user_id
        AND uqh2.answered_at > NOW() - INTERVAL '30 days'
    )
  ORDER BY RANDOM()
  LIMIT 1;
  
END;
$$;

-- ============================================================================
-- INSERTAR PREGUNTAS CIENTÍFICAS (Sample - se completará después)
-- ============================================================================

-- MBI - Maslach Burnout Inventory (22 preguntas)
INSERT INTO public.scientific_questions (scale_code, scale_name, dimension, question_text, question_order, response_scale, reverse_scored, timing) VALUES
('MBI', 'Maslach Burnout Inventory', 'Agotamiento Emocional', 'Me siento emocionalmente agotado/a por mi trabajo', 1, '0-6_frequency', false, 'evening'),
('MBI', 'Maslach Burnout Inventory', 'Agotamiento Emocional', 'Me siento cansado/a al final de la jornada de trabajo', 2, '0-6_frequency', false, 'evening'),
('MBI', 'Maslach Burnout Inventory', 'Agotamiento Emocional', 'Me siento fatigado/a cuando me levanto por la mañana y tengo que enfrentarme a otro día de trabajo', 3, '0-6_frequency', false, 'morning'),
('MBI', 'Maslach Burnout Inventory', 'Despersonalización', 'Creo que trato a algunas personas como si fueran objetos impersonales', 4, '0-6_frequency', false, 'evening'),
('MBI', 'Maslach Burnout Inventory', 'Despersonalización', 'Me he vuelto más insensible con la gente desde que ejerzo esta profesión', 5, '0-6_frequency', false, 'both'),
('MBI', 'Maslach Burnout Inventory', 'Realización Personal', 'Puedo entender fácilmente cómo se sienten las personas', 6, '0-6_frequency', true, 'both'),
('MBI', 'Maslach Burnout Inventory', 'Realización Personal', 'Trato muy eficazmente los problemas de las personas', 7, '0-6_frequency', true, 'both'),

-- UWES - Utrecht Work Engagement Scale (17 preguntas)
('UWES', 'Utrecht Work Engagement Scale', 'Vigor', 'En mi trabajo me siento lleno/a de energía', 8, '0-6_frequency', false, 'both'),
('UWES', 'Utrecht Work Engagement Scale', 'Vigor', 'Mi trabajo me inspira', 9, '0-6_frequency', false, 'both'),
('UWES', 'Utrecht Work Engagement Scale', 'Dedicación', 'Estoy entusiasmado/a con mi trabajo', 10, '0-6_frequency', false, 'both'),
('UWES', 'Utrecht Work Engagement Scale', 'Absorción', 'El tiempo vuela cuando estoy trabajando', 11, '0-6_frequency', false, 'evening'),

-- JSS - Job Satisfaction Scale (10 preguntas)
('JSS', 'Job Satisfaction Scale', 'Satisfacción General', 'Estoy satisfecho/a con mi trabajo actual', 12, '1-5_agreement', false, 'both'),
('JSS', 'Job Satisfaction Scale', 'Satisfacción con el Salario', 'Creo que recibo un salario justo por mi trabajo', 13, '1-5_agreement', false, 'both'),
('JSS', 'Job Satisfaction Scale', 'Oportunidades de Crecimiento', 'Tengo oportunidades de crecimiento profesional', 14, '1-5_agreement', false, 'both'),

-- PSS - Perceived Stress Scale (10 preguntas)
('PSS', 'Perceived Stress Scale', 'Estrés Percibido', '¿Con qué frecuencia te has sentido nervioso/a o estresado/a?', 15, '0-4_frequency', false, 'evening'),
('PSS', 'Perceived Stress Scale', 'Control', '¿Con qué frecuencia has sentido que no podías controlar las cosas importantes de tu vida?', 16, '0-4_frequency', false, 'evening'),
('PSS', 'Perceived Stress Scale', 'Afrontamiento', '¿Con qué frecuencia has sentido confianza en tu capacidad de manejar problemas personales?', 17, '0-4_frequency', true, 'both'),

-- ITL - Intention to Leave (5 preguntas)
('ITL', 'Intention to Leave', 'Intención de Rotación', 'He pensado en buscar otro empleo', 18, '1-5_frequency', false, 'both'),
('ITL', 'Intention to Leave', 'Intención de Rotación', 'Planeo buscar activamente otro trabajo en los próximos 12 meses', 19, '1-5_agreement', false, 'both'),

-- WHO-5 - Well-Being Index (5 preguntas)
('WHO5', 'WHO-5 Well-Being Index', 'Bienestar', 'Me he sentido alegre y de buen humor', 20, '0-5_frequency', false, 'evening'),
('WHO5', 'WHO-5 Well-Being Index', 'Bienestar', 'Me he sentido tranquilo/a y relajado/a', 21, '0-5_frequency', false, 'evening'),
('WHO5', 'WHO-5 Well-Being Index', 'Bienestar', 'Me he sentido activo/a y enérgico/a', 22, '0-5_frequency', false, 'morning')

ON CONFLICT (scale_code, question_order) DO NOTHING;