import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WELLNESS_QUESTIONS } from '@/data/questions';
import { Question } from '@/types/wellness';
import { Search, CheckCircle, XCircle, Settings } from 'lucide-react';

interface QuestionState extends Question {
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'burnout', label: 'Burnout', color: 'bg-red-100 text-red-800', description: 'Agotamiento emocional y despersonalización' },
  { value: 'turnover', label: 'Rotación', color: 'bg-orange-100 text-orange-800', description: 'Intención de abandonar la empresa' },
  { value: 'satisfaction', label: 'Satisfacción', color: 'bg-green-100 text-green-800', description: 'Satisfacción laboral general' },
  { value: 'wellbeing', label: 'Bienestar y Energía', color: 'bg-blue-100 text-blue-800', description: 'Carga de trabajo y energía personal' },
  { value: 'flexibility', label: 'Flexibilidad', color: 'bg-purple-100 text-purple-800', description: 'Conciliación y horarios flexibles' },
  { value: 'diversity', label: 'Diversidad e Inclusión', color: 'bg-pink-100 text-pink-800', description: 'Entorno inclusivo y equitativo' },
  { value: 'leadership', label: 'Liderazgo', color: 'bg-indigo-100 text-indigo-800', description: 'Apoyo y cultura organizacional' },
  { value: 'engagement', label: 'Engagement', color: 'bg-teal-100 text-teal-800', description: 'Motivación y compromiso' },
  { value: 'sustainability', label: 'Sostenibilidad', color: 'bg-emerald-100 text-emerald-800', description: 'Responsabilidad social y ambiental (CSRD)' },
  { value: 'extra', label: 'Extra', color: 'bg-gray-100 text-gray-800', description: 'Métricas adicionales' }
];

const DIMENSION_GROUPS = {
  'Clásicas': ['burnout', 'turnover', 'satisfaction'],
  'Nuevas Dimensiones': ['wellbeing', 'flexibility', 'diversity', 'leadership', 'engagement', 'sustainability'],
  'Adicionales': ['extra']
};

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, categoryFilter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Load question states from a potential configuration table
      // For now, all questions are active by default
      const questionStates: QuestionState[] = WELLNESS_QUESTIONS.map(q => ({
        ...q,
        is_active: true
      }));

      // Create activeStates map for easier toggle handling
      const statesMap = questionStates.reduce((acc, q) => {
        acc[q.id] = q.is_active;
        return acc;
      }, {} as Record<string, boolean>);

      setQuestions(questionStates);
      setActiveStates(statesMap);
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

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }

    setFilteredQuestions(filtered);
  };

  const toggleQuestionState = async (questionId: string, newState: boolean) => {
    try {
      // Here you would save to a question_config table or similar
      // For now, we'll just update local state
      setActiveStates(prev => ({
        ...prev,
        [questionId]: newState
      }));

      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, is_active: newState } : q
      ));

      toast({
        title: "Éxito",
        description: `Pregunta ${newState ? 'activada' : 'desactivada'} correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al actualizar pregunta: " + error.message,
        variant: "destructive"
      });
    }
  };

  const toggleCategoryQuestions = (category: string, newState: boolean) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    categoryQuestions.forEach(q => {
      toggleQuestionState(q.id, newState);
    });
  };

  const getCategoryStats = (category: string) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const activeCount = categoryQuestions.filter(q => activeStates[q.id]).length;
    return { total: categoryQuestions.length, active: activeCount };
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category)?.label || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Preguntas</h2>
          <p className="text-muted-foreground">
            Activa o desactiva las dimensiones y preguntas que deseas medir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {Object.values(activeStates).filter(Boolean).length} de {questions.length} preguntas activas
          </span>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar preguntas por texto, ID o subcategoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dimensiones</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen por Dimensiones */}
      <div className="grid gap-4">
        {Object.entries(DIMENSION_GROUPS).map(([groupName, categories]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg">{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => {
                  const stats = getCategoryStats(category);
                  const categoryInfo = CATEGORIES.find(cat => cat.value === category);
                  return (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={categoryInfo?.color}>
                            {categoryInfo?.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {stats.active}/{stats.total}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{categoryInfo?.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCategoryQuestions(category, true)}
                          className="h-8 px-2"
                        >
                          Todas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCategoryQuestions(category, false)}
                          className="h-8 px-2"
                        >
                          Ninguna
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Preguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Estado</TableHead>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead className="w-32">Dimensión</TableHead>
                  <TableHead className="w-40">Subcategoría</TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead className="w-32">Escala</TableHead>
                  <TableHead className="w-20">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      {activeStates[question.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{question.id}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(question.category)}>
                        {getCategoryLabel(question.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {question.subcategory.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-sm">{question.text}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {question.scale_description}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={activeStates[question.id] || false}
                        onCheckedChange={(checked) => toggleQuestionState(question.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron preguntas que coincidan con los filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Impacto en Análisis</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Bienestar y Energía:</strong> Alimenta métricas de carga de trabajo y recuperación</p>
            <p><strong>Flexibilidad:</strong> Genera índices de conciliación vida-trabajo</p>
            <p><strong>Diversidad e Inclusión:</strong> Crea scores de ambiente inclusivo</p>
            <p><strong>Liderazgo:</strong> Mide efectividad del liderazgo y cultura organizacional</p>
            <p><strong>Engagement:</strong> Calcula niveles de compromiso y motivación</p>
            <p><strong>Sostenibilidad:</strong> Genera indicadores CSRD Social para reporting</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};