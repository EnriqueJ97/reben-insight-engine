import { ScientificInstrument, InstrumentItem } from '@/types/evaluations';

export const SCIENTIFIC_INSTRUMENTS: ScientificInstrument[] = [
  // BURNOUT INSTRUMENTS
  {
    id: 'mbi',
    name: 'Maslach Burnout Inventory',
    abbreviation: 'MBI',
    category: 'burnout',
    authors: 'Maslach & Jackson',
    yearDeveloped: 1981,
    totalItems: 22,
    estimatedMinutes: 8,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'frequency',
    scaleDescription: '0=Nunca, 6=Todos los días',
    description: 'El gold standard para medir burnout. Evalúa agotamiento emocional, despersonalización y realización personal.',
    dimensions: [
      { id: 'mbi_ee', name: 'Agotamiento Emocional', items: 9, description: 'Fatiga y agotamiento emocional', itemIds: ['mbi_1', 'mbi_2', 'mbi_3', 'mbi_6', 'mbi_8', 'mbi_13', 'mbi_14', 'mbi_16', 'mbi_20'] },
      { id: 'mbi_dp', name: 'Despersonalización', items: 5, description: 'Actitudes cínicas hacia el trabajo', itemIds: ['mbi_5', 'mbi_10', 'mbi_11', 'mbi_15', 'mbi_22'] },
      { id: 'mbi_pa', name: 'Realización Personal', items: 8, description: 'Sentimientos de competencia y logro', itemIds: ['mbi_4', 'mbi_7', 'mbi_9', 'mbi_12', 'mbi_17', 'mbi_18', 'mbi_19', 'mbi_21'] }
    ],
    references: ['Maslach, C., Jackson, S. E., & Leiter, M. P. (1996). Maslach Burnout Inventory Manual (3rd ed.). Consulting Psychologists Press.']
  },
  {
    id: 'cbi',
    name: 'Copenhagen Burnout Inventory',
    abbreviation: 'CBI',
    category: 'burnout',
    authors: 'Kristensen et al.',
    yearDeveloped: 2005,
    totalItems: 19,
    estimatedMinutes: 7,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'frequency',
    scaleDescription: '0=Nunca, 4=Siempre',
    description: 'Instrumento europeo que mide burnout personal, laboral y hacia clientes con preguntas más comprensibles.',
    dimensions: [
      { id: 'cbi_personal', name: 'Burnout Personal', items: 6, description: 'Fatiga y agotamiento físico/psicológico', itemIds: ['cbi_1', 'cbi_2', 'cbi_3', 'cbi_4', 'cbi_5', 'cbi_6'] },
      { id: 'cbi_work', name: 'Burnout Laboral', items: 7, description: 'Fatiga relacionada con el trabajo', itemIds: ['cbi_7', 'cbi_8', 'cbi_9', 'cbi_10', 'cbi_11', 'cbi_12', 'cbi_13'] },
      { id: 'cbi_client', name: 'Burnout hacia Clientes', items: 6, description: 'Fatiga en relación con clientes/usuarios', itemIds: ['cbi_14', 'cbi_15', 'cbi_16', 'cbi_17', 'cbi_18', 'cbi_19'] }
    ],
    references: ['Kristensen, T. S., Borritz, M., Villadsen, E., & Christensen, K. B. (2005). The Copenhagen Burnout Inventory.']
  },
  {
    id: 'olbi',
    name: 'Oldenburg Burnout Inventory',
    abbreviation: 'OLBI',
    category: 'burnout',
    authors: 'Demerouti et al.',
    yearDeveloped: 1999,
    totalItems: 16,
    estimatedMinutes: 6,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'agreement',
    scaleDescription: '1=Totalmente en desacuerdo, 4=Totalmente de acuerdo',
    description: 'Evalúa burnout desde agotamiento y distanciamiento del trabajo, incluyendo ítems positivos y negativos.',
    dimensions: [
      { id: 'olbi_exhaustion', name: 'Agotamiento', items: 8, description: 'Fatiga física, cognitiva y emocional', itemIds: ['olbi_1', 'olbi_3', 'olbi_5', 'olbi_7', 'olbi_9', 'olbi_11', 'olbi_13', 'olbi_15'] },
      { id: 'olbi_disengagement', name: 'Distanciamiento', items: 8, description: 'Desvinculación del trabajo', itemIds: ['olbi_2', 'olbi_4', 'olbi_6', 'olbi_8', 'olbi_10', 'olbi_12', 'olbi_14', 'olbi_16'] }
    ],
    references: ['Demerouti, E., Bakker, A. B., Vardakou, I., & Kantas, A. (2003). The convergent validity of two burnout instruments.']
  },

  // ENGAGEMENT & MOTIVATION
  {
    id: 'uwes',
    name: 'Utrecht Work Engagement Scale',
    abbreviation: 'UWES-17',
    category: 'engagement',
    authors: 'Schaufeli & Bakker',
    yearDeveloped: 2003,
    totalItems: 17,
    estimatedMinutes: 6,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'frequency',
    scaleDescription: '0=Nunca, 6=Siempre',
    description: 'Mide engagement como estado mental positivo caracterizado por vigor, dedicación y absorción.',
    dimensions: [
      { id: 'uwes_vigor', name: 'Vigor', items: 6, description: 'Altos niveles de energía y resistencia mental', itemIds: ['uwes_1', 'uwes_4', 'uwes_8', 'uwes_12', 'uwes_15', 'uwes_17'] },
      { id: 'uwes_dedication', name: 'Dedicación', items: 5, description: 'Involucramiento y sentido de significado', itemIds: ['uwes_2', 'uwes_5', 'uwes_7', 'uwes_10', 'uwes_13'] },
      { id: 'uwes_absorption', name: 'Absorción', items: 6, description: 'Concentración total e inmersión feliz', itemIds: ['uwes_3', 'uwes_6', 'uwes_9', 'uwes_11', 'uwes_14', 'uwes_16'] }
    ],
    references: ['Schaufeli, W. B., Bakker, A. B., & Salanova, M. (2006). The measurement of work engagement.']
  },
  {
    id: 'weims',
    name: 'Work Extrinsic and Intrinsic Motivation Scale',
    abbreviation: 'WEIMS',
    category: 'engagement',
    authors: 'Tremblay et al.',
    yearDeveloped: 2009,
    totalItems: 18,
    estimatedMinutes: 7,
    validated: true,
    benchmarksAvailable: false,
    scaleType: 'agreement',
    scaleDescription: '1=No corresponde en absoluto, 7=Corresponde exactamente',
    description: 'Evalúa diferentes tipos de motivación laboral según la teoría de autodeterminación.',
    dimensions: [
      { id: 'weims_intrinsic', name: 'Motivación Intrínseca', items: 3, description: 'Placer y satisfacción inherente del trabajo', itemIds: ['weims_1', 'weims_7', 'weims_13'] },
      { id: 'weims_integrated', name: 'Regulación Integrada', items: 3, description: 'Coherencia con valores personales', itemIds: ['weims_2', 'weims_8', 'weims_14'] },
      { id: 'weims_identified', name: 'Regulación Identificada', items: 3, description: 'Importancia personal del trabajo', itemIds: ['weims_3', 'weims_9', 'weims_15'] },
      { id: 'weims_introjected', name: 'Regulación Introyectada', items: 3, description: 'Presión interna y culpa', itemIds: ['weims_4', 'weims_10', 'weims_16'] },
      { id: 'weims_external', name: 'Regulación Externa', items: 3, description: 'Recompensas y castigos externos', itemIds: ['weims_5', 'weims_11', 'weims_17'] },
      { id: 'weims_amotivation', name: 'Amotivación', items: 3, description: 'Falta de motivación y propósito', itemIds: ['weims_6', 'weims_12', 'weims_18'] }
    ],
    references: ['Tremblay, M. A., Blanchard, C. M., Taylor, S., Pelletier, L. G., & Villeneuve, M. (2009).']
  },

  // JOB SATISFACTION
  {
    id: 'jss',
    name: 'Job Satisfaction Survey',
    abbreviation: 'JSS',
    category: 'satisfaction',
    authors: 'Spector',
    yearDeveloped: 1985,
    totalItems: 36,
    estimatedMinutes: 12,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'agreement',
    scaleDescription: '1=Muy en desacuerdo, 6=Muy de acuerdo',
    description: 'Evalúa satisfacción laboral en 9 facetas específicas del trabajo con alta confiabilidad.',
    dimensions: [
      { id: 'jss_pay', name: 'Salario', items: 4, description: 'Satisfacción con el salario y beneficios', itemIds: ['jss_1', 'jss_10', 'jss_19', 'jss_28'] },
      { id: 'jss_promotion', name: 'Promociones', items: 4, description: 'Oportunidades de ascenso', itemIds: ['jss_2', 'jss_11', 'jss_20', 'jss_33'] },
      { id: 'jss_supervision', name: 'Supervisión', items: 4, description: 'Relación con el supervisor', itemIds: ['jss_3', 'jss_12', 'jss_21', 'jss_30'] },
      { id: 'jss_benefits', name: 'Beneficios', items: 4, description: 'Beneficios complementarios', itemIds: ['jss_4', 'jss_13', 'jss_22', 'jss_29'] },
      { id: 'jss_rewards', name: 'Recompensas', items: 4, description: 'Reconocimiento y recompensas', itemIds: ['jss_5', 'jss_14', 'jss_23', 'jss_32'] },
      { id: 'jss_procedures', name: 'Procedimientos', items: 4, description: 'Políticas y procedimientos', itemIds: ['jss_6', 'jss_15', 'jss_24', 'jss_31'] },
      { id: 'jss_coworkers', name: 'Compañeros', items: 4, description: 'Relaciones con colegas', itemIds: ['jss_7', 'jss_16', 'jss_25', 'jss_34'] },
      { id: 'jss_nature', name: 'Naturaleza del Trabajo', items: 4, description: 'El trabajo en sí mismo', itemIds: ['jss_8', 'jss_17', 'jss_26', 'jss_35'] },
      { id: 'jss_communication', name: 'Comunicación', items: 4, description: 'Comunicación organizacional', itemIds: ['jss_9', 'jss_18', 'jss_27', 'jss_36'] }
    ],
    references: ['Spector, P. E. (1985). Measurement of human service staff satisfaction: Development of the Job Satisfaction Survey.']
  },

  // ORGANIZATIONAL CLIMATE
  {
    id: 'litwin_stringer',
    name: 'Organizational Climate Questionnaire',
    abbreviation: 'OCQ',
    category: 'climate',
    authors: 'Litwin & Stringer',
    yearDeveloped: 1968,
    totalItems: 50,
    estimatedMinutes: 15,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'agreement',
    scaleDescription: '1=Totalmente en desacuerdo, 4=Totalmente de acuerdo',
    description: 'Evalúa el clima organizacional en 9 dimensiones clave que afectan la motivación y el rendimiento.',
    dimensions: [
      { id: 'ocq_structure', name: 'Estructura', items: 6, description: 'Claridad de roles y procedimientos', itemIds: ['ocq_1', 'ocq_10', 'ocq_19', 'ocq_28', 'ocq_37', 'ocq_46'] },
      { id: 'ocq_responsibility', name: 'Responsabilidad', items: 6, description: 'Autonomía y toma de decisiones', itemIds: ['ocq_2', 'ocq_11', 'ocq_20', 'ocq_29', 'ocq_38', 'ocq_47'] },
      { id: 'ocq_reward', name: 'Recompensa', items: 6, description: 'Reconocimiento por buen desempeño', itemIds: ['ocq_3', 'ocq_12', 'ocq_21', 'ocq_30', 'ocq_39', 'ocq_48'] },
      { id: 'ocq_risk', name: 'Riesgo', items: 5, description: 'Tolerancia al riesgo e innovación', itemIds: ['ocq_4', 'ocq_13', 'ocq_22', 'ocq_31', 'ocq_40'] },
      { id: 'ocq_warmth', name: 'Calidez', items: 5, description: 'Ambiente amigable y de apoyo', itemIds: ['ocq_5', 'ocq_14', 'ocq_23', 'ocq_32', 'ocq_41'] },
      { id: 'ocq_support', name: 'Apoyo', items: 5, description: 'Ayuda mutua entre colegas', itemIds: ['ocq_6', 'ocq_15', 'ocq_24', 'ocq_33', 'ocq_42'] },
      { id: 'ocq_standards', name: 'Estándares', items: 5, description: 'Énfasis en el desempeño excelente', itemIds: ['ocq_7', 'ocq_16', 'ocq_25', 'ocq_34', 'ocq_43'] },
      { id: 'ocq_conflict', name: 'Conflicto', items: 6, description: 'Tolerancia a diferentes opiniones', itemIds: ['ocq_8', 'ocq_17', 'ocq_26', 'ocq_35', 'ocq_44', 'ocq_49'] },
      { id: 'ocq_identity', name: 'Identidad', items: 6, description: 'Orgullo y pertenencia organizacional', itemIds: ['ocq_9', 'ocq_18', 'ocq_27', 'ocq_36', 'ocq_45', 'ocq_50'] }
    ],
    references: ['Litwin, G. H., & Stringer, R. A. (1968). Motivation and organizational climate.']
  },

  // LEADERSHIP
  {
    id: 'mlq',
    name: 'Multifactor Leadership Questionnaire',
    abbreviation: 'MLQ-5X',
    category: 'leadership',
    authors: 'Bass & Avolio',
    yearDeveloped: 1995,
    totalItems: 45,
    estimatedMinutes: 12,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'frequency',
    scaleDescription: '0=Nunca, 4=Frecuentemente',
    description: 'El instrumento más utilizado para evaluar liderazgo transformacional, transaccional y laissez-faire.',
    dimensions: [
      { id: 'mlq_iia', name: 'Influencia Idealizada (Atributos)', items: 4, description: 'Respeto, confianza y carisma', itemIds: ['mlq_10', 'mlq_18', 'mlq_21', 'mlq_25'] },
      { id: 'mlq_iib', name: 'Influencia Idealizada (Comportamiento)', items: 4, description: 'Actuar con integridad y valores', itemIds: ['mlq_6', 'mlq_14', 'mlq_23', 'mlq_34'] },
      { id: 'mlq_im', name: 'Motivación Inspiracional', items: 4, description: 'Visión y optimismo sobre el futuro', itemIds: ['mlq_9', 'mlq_13', 'mlq_26', 'mlq_36'] },
      { id: 'mlq_is', name: 'Estimulación Intelectual', items: 4, description: 'Desafiar supuestos y estimular creatividad', itemIds: ['mlq_2', 'mlq_8', 'mlq_30', 'mlq_32'] },
      { id: 'mlq_ic', name: 'Consideración Individualizada', items: 4, description: 'Atención personal y coaching', itemIds: ['mlq_15', 'mlq_19', 'mlq_29', 'mlq_31'] },
      { id: 'mlq_cr', name: 'Recompensa Contingente', items: 4, description: 'Recompensas por logros', itemIds: ['mlq_1', 'mlq_11', 'mlq_16', 'mlq_35'] },
      { id: 'mlq_mbea', name: 'Gestión por Excepción Activa', items: 4, description: 'Supervisión activa de errores', itemIds: ['mlq_4', 'mlq_22', 'mlq_24', 'mlq_27'] },
      { id: 'mlq_mbep', name: 'Gestión por Excepción Pasiva', items: 4, description: 'Intervención solo si es necesario', itemIds: ['mlq_3', 'mlq_12', 'mlq_17', 'mlq_20'] },
      { id: 'mlq_lf', name: 'Laissez-faire', items: 4, description: 'Evitar tomar decisiones', itemIds: ['mlq_5', 'mlq_7', 'mlq_28', 'mlq_33'] }
    ],
    references: ['Bass, B. M., & Avolio, B. J. (1995). MLQ Multifactor Leadership Questionnaire.']
  },

  // PSYCHOLOGICAL WELLBEING
  {
    id: 'ghq12',
    name: 'General Health Questionnaire',
    abbreviation: 'GHQ-12',
    category: 'wellbeing',
    authors: 'Goldberg',
    yearDeveloped: 1972,
    totalItems: 12,
    estimatedMinutes: 3,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'custom',
    scaleDescription: '0=Para nada, 3=Mucho más que lo habitual',
    description: 'Screening de salud mental general y bienestar psicológico en poblaciones no clínicas.',
    dimensions: [
      { id: 'ghq_general', name: 'Salud Mental General', items: 12, description: 'Bienestar psicológico y síntomas de malestar', itemIds: ['ghq_1', 'ghq_2', 'ghq_3', 'ghq_4', 'ghq_5', 'ghq_6', 'ghq_7', 'ghq_8', 'ghq_9', 'ghq_10', 'ghq_11', 'ghq_12'] }
    ],
    references: ['Goldberg, D. P. (1972). The detection of psychiatric illness by questionnaire.']
  },
  {
    id: 'who5',
    name: 'WHO-5 Wellbeing Index',
    abbreviation: 'WHO-5',
    category: 'wellbeing',
    authors: 'WHO',
    yearDeveloped: 1998,
    totalItems: 5,
    estimatedMinutes: 2,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'frequency',
    scaleDescription: '0=En ningún momento, 5=Todo el tiempo',
    description: 'Índice breve de bienestar subjetivo recomendado por la OMS para uso internacional.',
    dimensions: [
      { id: 'who5_wellbeing', name: 'Bienestar Subjetivo', items: 5, description: 'Estado de ánimo positivo y vitalidad', itemIds: ['who5_1', 'who5_2', 'who5_3', 'who5_4', 'who5_5'] }
    ],
    references: ['Bech, P., Olsen, L. R., Kjoller, M., & Rasmussen, N. K. (2003). Measuring well-being rather than the absence of distress symptoms.']
  },

  // DIVERSITY & INCLUSION
  {
    id: 'psychological_safety',
    name: 'Psychological Safety Scale',
    abbreviation: 'PSS',
    category: 'inclusion',
    authors: 'Edmondson',
    yearDeveloped: 1999,
    totalItems: 7,
    estimatedMinutes: 3,
    validated: true,
    benchmarksAvailable: false,
    scaleType: 'agreement',
    scaleDescription: '1=Muy en desacuerdo, 7=Muy de acuerdo',
    description: 'Evalúa la percepción de seguridad psicológica en el equipo de trabajo.',
    dimensions: [
      { id: 'pss_safety', name: 'Seguridad Psicológica', items: 7, description: 'Confianza para expresar ideas y cometer errores', itemIds: ['pss_1', 'pss_2', 'pss_3', 'pss_4', 'pss_5', 'pss_6', 'pss_7'] }
    ],
    references: ['Edmondson, A. (1999). Psychological safety and learning behavior in work teams.']
  },

  // WORK-LIFE BALANCE
  {
    id: 'wlb',
    name: 'Work-Life Balance Scale',
    abbreviation: 'WLBS',
    category: 'flexibility',
    authors: 'Fisher et al.',
    yearDeveloped: 2009,
    totalItems: 17,
    estimatedMinutes: 6,
    validated: true,
    benchmarksAvailable: false,
    scaleType: 'agreement',
    scaleDescription: '1=Totalmente en desacuerdo, 5=Totalmente de acuerdo',
    description: 'Evalúa el equilibrio entre demandas laborales y personales en cuatro dimensiones.',
    dimensions: [
      { id: 'wlb_wipl', name: 'Interferencia Trabajo-Vida Personal', items: 5, description: 'El trabajo interfiere con la vida personal', itemIds: ['wlb_1', 'wlb_2', 'wlb_3', 'wlb_4', 'wlb_5'] },
      { id: 'wlb_pliw', name: 'Interferencia Vida Personal-Trabajo', items: 4, description: 'La vida personal interfiere con el trabajo', itemIds: ['wlb_6', 'wlb_7', 'wlb_8', 'wlb_9'] },
      { id: 'wlb_weg', name: 'Enriquecimiento Trabajo-Vida Personal', items: 4, description: 'El trabajo enriquece la vida personal', itemIds: ['wlb_10', 'wlb_11', 'wlb_12', 'wlb_13'] },
      { id: 'wlb_plew', name: 'Enriquecimiento Vida Personal-Trabajo', items: 4, description: 'La vida personal enriquece el trabajo', itemIds: ['wlb_14', 'wlb_15', 'wlb_16', 'wlb_17'] }
    ],
    references: ['Fisher, G. G., Bulger, C. A., & Smith, C. S. (2009). Beyond work and family: A measure of work/nonwork interference and enhancement.']
  },

  // ORGANIZATIONAL COMMITMENT
  {
    id: 'ocq_meyer',
    name: 'Organizational Commitment Questionnaire',
    abbreviation: 'OCQ',
    category: 'commitment',
    authors: 'Meyer & Allen',
    yearDeveloped: 1991,
    totalItems: 18,
    estimatedMinutes: 7,
    validated: true,
    benchmarksAvailable: true,
    scaleType: 'agreement',
    scaleDescription: '1=Totalmente en desacuerdo, 7=Totalmente de acuerdo',
    description: 'Evalúa el compromiso organizacional en sus tres componentes: afectivo, normativo y de continuidad.',
    dimensions: [
      { id: 'ocq_affective', name: 'Compromiso Afectivo', items: 6, description: 'Apego emocional a la organización', itemIds: ['ocq_1', 'ocq_4', 'ocq_7', 'ocq_10', 'ocq_13', 'ocq_16'] },
      { id: 'ocq_continuance', name: 'Compromiso de Continuidad', items: 6, description: 'Costos percibidos de dejar la organización', itemIds: ['ocq_2', 'ocq_5', 'ocq_8', 'ocq_11', 'ocq_14', 'ocq_17'] },
      { id: 'ocq_normative', name: 'Compromiso Normativo', items: 6, description: 'Obligación moral de permanecer', itemIds: ['ocq_3', 'ocq_6', 'ocq_9', 'ocq_12', 'ocq_15', 'ocq_18'] }
    ],
    references: ['Meyer, J. P., & Allen, N. J. (1991). A three-component conceptualization of organizational commitment.']
  }
];

// INSTRUMENT ITEMS - Sample items for each instrument
export const INSTRUMENT_ITEMS: InstrumentItem[] = [
  // MBI Items (sample)
  { id: 'mbi_1', instrumentId: 'mbi', dimensionId: 'mbi_ee', text: 'Me siento emocionalmente agotado/a por mi trabajo', reverseScored: false, order: 1 },
  { id: 'mbi_2', instrumentId: 'mbi', dimensionId: 'mbi_ee', text: 'Me siento cansado/a al final de la jornada laboral', reverseScored: false, order: 2 },
  { id: 'mbi_3', instrumentId: 'mbi', dimensionId: 'mbi_ee', text: 'Me siento exhausto/a cuando me levanto y pienso en el trabajo', reverseScored: false, order: 3 },
  { id: 'mbi_4', instrumentId: 'mbi', dimensionId: 'mbi_pa', text: 'Puedo resolver de manera eficaz los problemas que surgen en mi trabajo', reverseScored: true, order: 4 },
  { id: 'mbi_5', instrumentId: 'mbi', dimensionId: 'mbi_dp', text: 'Siento que trato a algunos compañeros como si fueran objetos impersonales', reverseScored: false, order: 5 },
  
  // CBI Items (sample)
  { id: 'cbi_1', instrumentId: 'cbi', dimensionId: 'cbi_personal', text: '¿Con qué frecuencia te sientes cansado/a?', reverseScored: false, order: 1 },
  { id: 'cbi_2', instrumentId: 'cbi', dimensionId: 'cbi_personal', text: '¿Con qué frecuencia estás físicamente agotado/a?', reverseScored: false, order: 2 },
  { id: 'cbi_7', instrumentId: 'cbi', dimensionId: 'cbi_work', text: '¿Te sientes agotado/a por tu trabajo?', reverseScored: false, order: 7 },
  
  // UWES Items (sample)
  { id: 'uwes_1', instrumentId: 'uwes', dimensionId: 'uwes_vigor', text: 'En mi trabajo me siento lleno/a de energía', reverseScored: false, order: 1 },
  { id: 'uwes_2', instrumentId: 'uwes', dimensionId: 'uwes_dedication', text: 'Mi trabajo está lleno de significado y propósito', reverseScored: false, order: 2 },
  { id: 'uwes_3', instrumentId: 'uwes', dimensionId: 'uwes_absorption', text: 'El tiempo vuela cuando estoy trabajando', reverseScored: false, order: 3 },
  
  // GHQ-12 Items (sample)
  { id: 'ghq_1', instrumentId: 'ghq12', dimensionId: 'ghq_general', text: '¿Ha podido concentrarse bien en lo que hace?', reverseScored: true, order: 1 },
  { id: 'ghq_2', instrumentId: 'ghq12', dimensionId: 'ghq_general', text: '¿Sus preocupaciones le han hecho perder mucho sueño?', reverseScored: false, order: 2 },
  { id: 'ghq_3', instrumentId: 'ghq12', dimensionId: 'ghq_general', text: '¿Ha sentido que está jugando un papel útil en la vida?', reverseScored: true, order: 3 },
  
  // WHO-5 Items
  { id: 'who5_1', instrumentId: 'who5', dimensionId: 'who5_wellbeing', text: 'Me he sentido alegre y de buen humor', reverseScored: false, order: 1 },
  { id: 'who5_2', instrumentId: 'who5', dimensionId: 'who5_wellbeing', text: 'Me he sentido calmado/a y relajado/a', reverseScored: false, order: 2 },
  { id: 'who5_3', instrumentId: 'who5', dimensionId: 'who5_wellbeing', text: 'Me he sentido activo/a y vigoroso/a', reverseScored: false, order: 3 },
  { id: 'who5_4', instrumentId: 'who5', dimensionId: 'who5_wellbeing', text: 'Me desperté sintiéndome fresco/a y descansado/a', reverseScored: false, order: 4 },
  { id: 'who5_5', instrumentId: 'who5', dimensionId: 'who5_wellbeing', text: 'Mi vida diaria ha estado llena de cosas que me interesan', reverseScored: false, order: 5 }
];

export const getInstrumentById = (id: string): ScientificInstrument | undefined => {
  return SCIENTIFIC_INSTRUMENTS.find(instrument => instrument.id === id);
};

export const getInstrumentsByCategory = (category: ScientificInstrument['category']): ScientificInstrument[] => {
  return SCIENTIFIC_INSTRUMENTS.filter(instrument => instrument.category === category);
};

export const getInstrumentItems = (instrumentId: string): InstrumentItem[] => {
  return INSTRUMENT_ITEMS.filter(item => item.instrumentId === instrumentId);
};

export const getDimensionItems = (instrumentId: string, dimensionId: string): InstrumentItem[] => {
  return INSTRUMENT_ITEMS.filter(item => item.instrumentId === instrumentId && item.dimensionId === dimensionId);
};