
import { Question } from '@/types/wellness';

export const WELLNESS_QUESTIONS: Question[] = [
  // Burnout - Agotamiento emocional (B1-B6)
  { id: 'B1', text: 'Me siento emocionalmente agotado/a por mi trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B2', text: 'Siento que trabajar todo el día es realmente una tensión para mí.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B3', text: 'Me siento cansado/a al final de la jornada laboral.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B4', text: 'Me resulta difícil relajarme después del trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B5', text: 'Me siento exhausto/a cuando me levanto por la mañana y pienso en el trabajo.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B6', text: 'Me preocupa que este trabajo me "queme" totalmente.', category: 'burnout', subcategory: 'agotamiento_emocional', scale_description: '0=Nunca, 4=Siempre' },
  
  // Burnout - Despersonalización (B7-B9, B14)
  { id: 'B7', text: 'Me he vuelto más insensible hacia la gente desde que hago este trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B8', text: 'Trato a algunos compañeros/usuarios como si fueran objetos impersonales.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B9', text: 'Me siento frustrado/a con mi trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B14', text: 'A veces dudo de la importancia de mi trabajo.', category: 'burnout', subcategory: 'despersonalizacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Burnout - Baja realización personal (B10-B13)
  { id: 'B10', text: 'Siento que no logro mucho en mi trabajo.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B11', text: 'He perdido entusiasmo por mi trabajo.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B12', text: 'En mi trabajo siento que soy menos eficaz de lo que debería.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'B13', text: 'Mi trabajo me hace sentir vacío/a.', category: 'burnout', subcategory: 'baja_realizacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Intención de rotación (T1-T12)
  { id: 'T1', text: 'Pienso con frecuencia en dejar esta organización.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T2', text: 'Actualmente estoy buscando trabajo activamente.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T3', text: 'Me gustaría estar trabajando en otra empresa dentro de un año.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T4', text: 'En cuanto encuentre algo mejor, me voy.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T5', text: 'Hablo con amigos o contactos sobre posibilidades de empleo fuera.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T6', text: 'Me imagino a mí mismo/a renunciando pronto.', category: 'turnover', subcategory: 'intencion_rotacion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T7', text: 'Creo que hay pocas oportunidades de crecimiento aquí.', category: 'turnover', subcategory: 'estancamiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T8', text: 'Mi organización no cuida mi desarrollo.', category: 'turnover', subcategory: 'desarrollo', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T9', text: 'Me siento desvinculado/a de los objetivos de la empresa.', category: 'turnover', subcategory: 'compromiso', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T10', text: 'Creo que mi jefe no valora mis esfuerzos.', category: 'turnover', subcategory: 'reconocimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T11', text: 'No veo futuro profesional aquí.', category: 'turnover', subcategory: 'futuro', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'T12', text: 'Siento que esta organización no me retiene.', category: 'turnover', subcategory: 'retencion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Satisfacción laboral (S1-S15)
  { id: 'S1', text: 'Estoy satisfecho/a con mi trabajo en general.', category: 'satisfaction', subcategory: 'satisfaccion_general', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S2', text: 'Me gusta el tipo de trabajo que realizo.', category: 'satisfaction', subcategory: 'naturaleza_trabajo', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S3', text: 'Mi sueldo es justo comparado con otros puestos similares.', category: 'satisfaction', subcategory: 'remuneracion', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S4', text: 'Recibo reconocimiento cuando lo hago bien.', category: 'satisfaction', subcategory: 'reconocimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S5', text: 'Tengo buenas relaciones con mis compañeros.', category: 'satisfaction', subcategory: 'companeros', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S6', text: 'Las políticas de la organización me parecen adecuadas.', category: 'satisfaction', subcategory: 'politicas', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S7', text: 'Dispongo de autonomía para hacer mi trabajo.', category: 'satisfaction', subcategory: 'autonomia', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S8', text: 'Estoy satisfecho/a con mi equilibrio vida trabajo.', category: 'satisfaction', subcategory: 'balance', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S9', text: 'Mis habilidades se utilizan bien.', category: 'satisfaction', subcategory: 'desarrollo', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S10', text: 'Me ofrecen oportunidades de aprendizaje.', category: 'satisfaction', subcategory: 'crecimiento', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S11', text: 'Comprendo claramente los objetivos de mi puesto.', category: 'satisfaction', subcategory: 'claridad', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S12', text: 'Confío en la dirección de la empresa.', category: 'satisfaction', subcategory: 'confianza', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S13', text: 'Me siento seguro/a en mi puesto.', category: 'satisfaction', subcategory: 'seguridad', scale_description: '0=Nada, 4=Mucho' },
  { id: 'S14', text: 'Tengo los recursos necesarios para hacer mi trabajo.', category: 'satisfaction', subcategory: 'recursos', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'S15', text: 'Me comunican bien los cambios que afectan a mi trabajo.', category: 'satisfaction', subcategory: 'comunicacion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Bienestar y Energía (BE1-BE3)
  { id: 'BE1', text: '¿Has sentido que tu carga de trabajo ha sido manejable esta semana?', category: 'wellbeing', subcategory: 'energia', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'BE2', text: '¿Cuántos días te has sentido con energía suficiente para afrontar tu jornada?', category: 'wellbeing', subcategory: 'energia', scale_description: '0=Ningún día, 4=Todos los días' },
  { id: 'BE3', text: '¿Has podido desconectar adecuadamente fuera del horario laboral?', category: 'wellbeing', subcategory: 'desconexion', scale_description: '0=Nunca, 4=Siempre' },
  
  // Flexibilidad y Conciliación (FC1-FC3)
  { id: 'FC1', text: '¿Tu horario actual te permite conciliar tu vida personal y profesional?', category: 'flexibility', subcategory: 'conciliacion', scale_description: '0=Nada, 4=Completamente' },
  { id: 'FC2', text: '¿Te sientes cómodo con el grado de flexibilidad horaria de tu puesto?', category: 'flexibility', subcategory: 'horarios', scale_description: '0=Nada cómodo, 4=Muy cómodo' },
  { id: 'FC3', text: '¿Qué tan satisfecho estás con la posibilidad de teletrabajo/híbrido?', category: 'flexibility', subcategory: 'remoto', scale_description: '0=Nada satisfecho, 4=Muy satisfecho' },
  
  // Diversidad e Inclusión (DI1-DI3)
  { id: 'DI1', text: '¿Sientes que tu opinión es valorada sin importar tu género, edad o procedencia?', category: 'diversity', subcategory: 'valoracion', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'DI2', text: '¿Percibes que la empresa fomenta un entorno inclusivo y respetuoso?', category: 'diversity', subcategory: 'inclusion', scale_description: '0=Nada, 4=Completamente' },
  { id: 'DI3', text: '¿Consideras que las oportunidades de crecimiento son iguales para todos?', category: 'diversity', subcategory: 'oportunidades', scale_description: '0=Nada, 4=Completamente' },
  
  // Liderazgo y Cultura Organizacional (LC1-LC3)
  { id: 'LC1', text: '¿Tu manager inmediato te apoya cuando tienes dificultades?', category: 'leadership', subcategory: 'apoyo', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'LC2', text: '¿Sientes que la cultura de la empresa promueve la colaboración?', category: 'leadership', subcategory: 'cultura', scale_description: '0=Nada, 4=Completamente' },
  { id: 'LC3', text: '¿Recibes feedback constructivo de manera regular?', category: 'leadership', subcategory: 'feedback', scale_description: '0=Nunca, 4=Siempre' },
  
  // Engagement y Motivación (EM1-EM3)
  { id: 'EM1', text: '¿Te sientes motivado por los proyectos en los que trabajas actualmente?', category: 'engagement', subcategory: 'motivacion', scale_description: '0=Nada motivado, 4=Muy motivado' },
  { id: 'EM2', text: '¿Qué tan orgulloso te sientes de trabajar en esta empresa?', category: 'engagement', subcategory: 'orgullo', scale_description: '0=Nada orgulloso, 4=Muy orgulloso' },
  { id: 'EM3', text: '¿Percibes que tu trabajo aporta valor al propósito de la organización?', category: 'engagement', subcategory: 'proposito', scale_description: '0=Nada, 4=Completamente' },
  
  // Sostenibilidad y Responsabilidad Social (SR1-SR3)
  { id: 'SR1', text: '¿Crees que la empresa se preocupa por el impacto medioambiental de su actividad?', category: 'sustainability', subcategory: 'medioambiente', scale_description: '0=Nada, 4=Completamente' },
  { id: 'SR2', text: '¿Sientes que la compañía fomenta prácticas responsables y éticas?', category: 'sustainability', subcategory: 'etica', scale_description: '0=Nada, 4=Completamente' },
  { id: 'SR3', text: '¿La empresa comunica de forma transparente sus acciones de sostenibilidad?', category: 'sustainability', subcategory: 'transparencia', scale_description: '0=Nunca, 4=Siempre' },

  // Extra (demanda laboral y recuperación)
  { id: 'Extra1', text: 'Mi carga de trabajo diaria es excesiva.', category: 'extra', subcategory: 'demanda_laboral', scale_description: '0=Nunca, 4=Siempre' },
  { id: 'Extra2', text: 'Puedo desconectar mentalmente después del trabajo.', category: 'extra', subcategory: 'recuperacion', scale_description: '0=Nunca, 4=Siempre' }
];

export const getRandomDailyQuestion = (excludeIds: string[] = []): Question => {
  const availableQuestions = WELLNESS_QUESTIONS.filter(q => !excludeIds.includes(q.id));
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};

export const getQuestionsByCategory = (category: Question['category']): Question[] => {
  return WELLNESS_QUESTIONS.filter(q => q.category === category);
};
