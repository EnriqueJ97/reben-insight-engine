-- Arreglar search_path en función de selección de preguntas
DROP FUNCTION IF EXISTS public.get_next_scientific_question(UUID, TEXT);

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
SET search_path = ''
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