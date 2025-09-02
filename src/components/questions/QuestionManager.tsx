import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WELLNESS_QUESTIONS } from '@/data/questions';
import { Question } from '@/types/wellness';
import { Search, CheckCircle2, ShoppingCart, RotateCcw, Settings } from 'lucide-react';

interface QuestionState extends Question {
  is_active: boolean;
}

const THEME_GROUPS = {
  'Burnout': {
    categories: ['burnout'],
    description: 'Agotamiento emocional, despersonalización y baja realización personal',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: '🔥'
  },
  'Rotación de Personal': {
    categories: ['turnover'],
    description: 'Intención de abandono y factores de retención',
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    icon: '🚪'
  },
  'Satisfacción Laboral': {
    categories: ['satisfaction'],
    description: 'Satisfacción general con el trabajo y condiciones',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    icon: '😊'
  },
  'Bienestar y Energía': {
    categories: ['wellbeing'],
    description: 'Carga de trabajo manejable y nivel de energía personal',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: '⚡'
  },
  'Flexibilidad y Conciliación': {
    categories: ['flexibility'],
    description: 'Equilibrio vida-trabajo y flexibilidad horaria',
    color: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    icon: '⚖️'
  },
  'Diversidad e Inclusión': {
    categories: ['diversity'],
    description: 'Ambiente inclusivo y oportunidades equitativas',
    color: 'bg-pink-50 border-pink-200',
    badge: 'bg-pink-100 text-pink-800',
    icon: '🤝'
  },
  'Liderazgo y Cultura': {
    categories: ['leadership'],
    description: 'Apoyo gerencial y cultura organizacional',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    icon: '👥'
  },
  'Engagement y Motivación': {
    categories: ['engagement'],
    description: 'Compromiso y motivación con el trabajo',
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    icon: '🎯'
  },
  'Sostenibilidad (CSRD)': {
    categories: ['sustainability'],
    description: 'Responsabilidad social y ambiental corporativa',
    color: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: '🌱'
  },
  'Métricas Adicionales': {
    categories: ['extra'],
    description: 'Indicadores complementarios de bienestar',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    icon: '📊'
  }
};

const DIMENSION_LABELS: Record<string, string> = {
  'agotamiento_emocional': 'Agotamiento Emocional',
  'despersonalizacion': 'Despersonalización',
  'baja_realizacion': 'Baja Realización',
  'intencion_rotacion': 'Intención de Rotación',
  'estancamiento': 'Estancamiento Profesional',
  'desarrollo': 'Desarrollo Personal',
  'compromiso': 'Compromiso Organizacional',
  'reconocimiento': 'Reconocimiento',
  'futuro': 'Perspectiva de Futuro',
  'retencion': 'Retención',
  'satisfaccion_general': 'Satisfacción General',
  'naturaleza_trabajo': 'Naturaleza del Trabajo',
  'remuneracion': 'Remuneración',
  'companeros': 'Relaciones Laborales',
  'politicas': 'Políticas Organizacionales',
  'autonomia': 'Autonomía',
  'balance': 'Balance Vida-Trabajo',
  'crecimiento': 'Crecimiento Profesional',
  'claridad': 'Claridad de Objetivos',
  'confianza': 'Confianza en Dirección',
  'seguridad': 'Seguridad Laboral',
  'recursos': 'Recursos Disponibles',
  'comunicacion': 'Comunicación',
  'energia': 'Nivel de Energía',
  'desconexion': 'Desconexión Digital',
  'conciliacion': 'Conciliación',
  'horarios': 'Flexibilidad Horaria',
  'remoto': 'Trabajo Remoto',
  'valoracion': 'Valoración Equitativa',
  'inclusion': 'Ambiente Inclusivo',
  'oportunidades': 'Igualdad de Oportunidades',
  'apoyo': 'Apoyo Gerencial',
  'cultura': 'Cultura Colaborativa',
  'feedback': 'Retroalimentación',
  'motivacion': 'Motivación Laboral',
  'orgullo': 'Orgullo Organizacional',
  'proposito': 'Sentido de Propósito',
  'medioambiente': 'Responsabilidad Ambiental',
  'etica': 'Prácticas Éticas',
  'transparencia': 'Transparencia',
  'demanda_laboral': 'Demanda Laboral',
  'recuperacion': 'Capacidad de Recuperación'
};

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [selectedForCampaign, setSelectedForCampaign] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const questionStates: QuestionState[] = WELLNESS_QUESTIONS.map(q => ({
        ...q,
        is_active: true
      }));

      const statesMap = questionStates.reduce((acc, q) => {
        acc[q.id] = q.is_active;
        return acc;
      }, {} as Record<string, boolean>);

      setQuestions(questionStates);
      setActiveStates(statesMap);
      setSelectedForCampaign(questionStates.filter(q => q.is_active).map(q => q.id));
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Error al cargar preguntas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionState = (questionId: string, newState: boolean) => {
    setActiveStates(prev => ({
      ...prev,
      [questionId]: newState
    }));

    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, is_active: newState } : q
    ));

    // Update selected for campaign
    if (newState) {
      setSelectedForCampaign(prev => [...prev, questionId]);
    } else {
      setSelectedForCampaign(prev => prev.filter(id => id !== questionId));
    }

    toast({
      title: "Éxito",
      description: `Pregunta ${newState ? 'activada' : 'desactivada'} correctamente`,
    });
  };

  const toggleThemeQuestions = (themeName: string, newState: boolean) => {
    const theme = THEME_GROUPS[themeName as keyof typeof THEME_GROUPS];
    const themeQuestions = questions.filter(q => theme.categories.includes(q.category));
    
    themeQuestions.forEach(q => {
      toggleQuestionState(q.id, newState);
    });
  };

  const getThemeStats = (themeName: string) => {
    const theme = THEME_GROUPS[themeName as keyof typeof THEME_GROUPS];
    const themeQuestions = questions.filter(q => theme.categories.includes(q.category));
    const activeCount = themeQuestions.filter(q => activeStates[q.id]).length;
    return { total: themeQuestions.length, active: activeCount };
  };

  const getFilteredQuestions = (themeName: string) => {
    const theme = THEME_GROUPS[themeName as keyof typeof THEME_GROUPS];
    const themeQuestions = questions.filter(q => theme.categories.includes(q.category));
    
    if (!searchTerm) return themeQuestions;
    
    return themeQuestions.filter(q => 
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      DIMENSION_LABELS[q.subcategory]?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const resetToDefaults = () => {
    const defaultStates = questions.reduce((acc, q) => {
      acc[q.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setActiveStates(defaultStates);
    setSelectedForCampaign(questions.map(q => q.id));
    
    toast({
      title: "Configuración restablecida",
      description: "Todas las preguntas han sido activadas",
    });
  };

  const totalSelectedQuestions = selectedForCampaign.length;
  const selectedByTheme = Object.keys(THEME_GROUPS).reduce((acc, themeName) => {
    const theme = THEME_GROUPS[themeName as keyof typeof THEME_GROUPS];
    const count = selectedForCampaign.filter(id => {
      const question = questions.find(q => q.id === id);
      return question && theme.categories.includes(question.category);
    }).length;
    if (count > 0) acc[themeName] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-6 h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Catálogo de Preguntas por Temas</h2>
            <p className="text-muted-foreground">
              Selecciona los bloques temáticos o preguntas individuales para tus campañas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar preguntas por texto, ID o dimensión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Accordions */}
        <Accordion type="multiple" defaultValue={Object.keys(THEME_GROUPS).slice(0, 3)} className="space-y-4">
          {Object.entries(THEME_GROUPS).map(([themeName, theme]) => {
            const stats = getThemeStats(themeName);
            const filteredQuestions = getFilteredQuestions(themeName);
            const allSelected = filteredQuestions.every(q => activeStates[q.id]);
            const someSelected = filteredQuestions.some(q => activeStates[q.id]);

            if (searchTerm && filteredQuestions.length === 0) return null;

            return (
              <AccordionItem key={themeName} value={themeName} className="border-0">
                <Card className={`${theme.color} transition-all`}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{theme.icon}</span>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">{themeName}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={theme.badge}>
                          {stats.active}/{stats.total} preguntas
                        </Badge>
                        {stats.active === stats.total && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={allSelected ? "default" : "outline"}
                          onClick={() => toggleThemeQuestions(themeName, true)}
                        >
                          Activar todo el bloque
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleThemeQuestions(themeName, false)}
                        >
                          Desactivar todo
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        {filteredQuestions.map((question) => (
                          <div 
                            key={question.id}
                            className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-white/40"
                          >
                            <Checkbox
                              checked={activeStates[question.id] || false}
                              onCheckedChange={(checked) => toggleQuestionState(question.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {question.id}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {DIMENSION_LABELS[question.subcategory] || question.subcategory}
                                </Badge>
                              </div>
                              <p className="text-sm leading-relaxed">{question.text}</p>
                              <p className="text-xs text-muted-foreground">
                                Escala: {question.scale_description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Analytics Impact */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Impacto en Análisis Organizacional
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <p><strong>🔥 Burnout:</strong> Detecta riesgo de agotamiento emocional</p>
                <p><strong>⚡ Bienestar:</strong> Mide energía y carga de trabajo</p>
                <p><strong>⚖️ Flexibilidad:</strong> Evalúa balance vida-trabajo</p>
                <p><strong>🤝 Diversidad:</strong> Analiza inclusión organizacional</p>
                <p><strong>👥 Liderazgo:</strong> Mide efectividad del liderazgo</p>
              </div>
              <div className="space-y-2">
                <p><strong>🎯 Engagement:</strong> Calcula compromiso y motivación</p>
                <p><strong>🌱 Sostenibilidad:</strong> Genera métricas CSRD Social</p>
                <p><strong>🚪 Rotación:</strong> Predice intención de abandono</p>
                <p><strong>😊 Satisfacción:</strong> Mide satisfacción general</p>
                <p><strong>📊 Extra:</strong> Indicadores complementarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selection Panel */}
      <div className="w-80 space-y-4">
        <Card className="sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              Selección Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {totalSelectedQuestions}
              </div>
              <div className="text-sm text-muted-foreground">
                preguntas seleccionadas
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Por tema:</h4>
              {Object.entries(selectedByTheme).map(([themeName, count]) => {
                const theme = THEME_GROUPS[themeName as keyof typeof THEME_GROUPS];
                return (
                  <div key={themeName} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{theme.icon}</span>
                      <span className="truncate">{themeName}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {totalSelectedQuestions === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No hay preguntas seleccionadas
                </p>
              </div>
            )}

            <Button 
              className="w-full" 
              disabled={totalSelectedQuestions === 0}
            >
              Crear Campaña
              {totalSelectedQuestions > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalSelectedQuestions}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium text-sm mb-3">💡 Recomendaciones</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Incluye al menos 2-3 temas para análisis completo</p>
              <p>• Burnout + Satisfacción es una combinación efectiva</p>
              <p>• Añade Sostenibilidad para métricas CSRD</p>
              <p>• Máximo recomendado: 25-30 preguntas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};