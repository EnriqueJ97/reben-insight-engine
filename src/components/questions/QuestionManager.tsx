
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WELLNESS_QUESTIONS } from '@/data/questions';
import { Question } from '@/types/wellness';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface CustomQuestion extends Question {
  id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CustomQuestionDB {
  id: string;
  tenant_id: string;
  text: string;
  category: string;
  subcategory: string;
  scale_description: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface QuestionFormData {
  id: string;
  text: string;
  category: 'burnout' | 'turnover' | 'satisfaction' | 'extra';
  subcategory: string;
  scale_description: string;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'burnout', label: 'Burnout', color: 'bg-red-100 text-red-800' },
  { value: 'turnover', label: 'Rotación', color: 'bg-orange-100 text-orange-800' },
  { value: 'satisfaction', label: 'Satisfacción', color: 'bg-green-100 text-green-800' },
  { value: 'extra', label: 'Extra', color: 'bg-blue-100 text-blue-800' }
];

const SUBCATEGORIES = {
  burnout: ['agotamiento_emocional', 'despersonalizacion', 'baja_realizacion'],
  turnover: ['intencion_rotacion', 'estancamiento', 'desarrollo', 'compromiso', 'reconocimiento', 'futuro', 'retencion'],
  satisfaction: ['satisfaccion_general', 'naturaleza_trabajo', 'remuneracion', 'reconocimiento', 'companeros', 'politicas', 'autonomia', 'balance', 'desarrollo', 'crecimiento', 'claridad', 'confianza', 'seguridad', 'recursos', 'comunicacion'],
  extra: ['demanda_laboral', 'recuperacion']
};

export const QuestionManager = () => {
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  const form = useForm<QuestionFormData>({
    defaultValues: {
      id: '',
      text: '',
      category: 'satisfaction',
      subcategory: '',
      scale_description: '0=Nunca, 4=Siempre',
      is_active: true
    }
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, categoryFilter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Usar query raw para la tabla custom_questions
      const { data: customQuestions, error } = await supabase
        .rpc('get_custom_questions', { p_tenant_id: profile?.tenant_id })
        .then(async () => {
          // Fallback: usar query directa
          const { data, error } = await supabase
            .from('custom_questions' as any)
            .select('*')
            .eq('tenant_id', profile?.tenant_id)
            .order('created_at', { ascending: false });
          return { data, error };
        })
        .catch(async () => {
          // Si falla, intentar query directa
          const { data, error } = await supabase
            .from('custom_questions' as any)
            .select('*')
            .eq('tenant_id', profile?.tenant_id)
            .order('created_at', { ascending: false });
          return { data, error };
        });

      const customQuestionsTyped = (customQuestions as CustomQuestionDB[]) || [];

      // Combinar preguntas predefinidas con personalizadas
      const predefinedQuestions: CustomQuestion[] = WELLNESS_QUESTIONS.map(q => ({
        ...q,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const allQuestions = [
        ...predefinedQuestions,
        ...customQuestionsTyped.map(q => ({
          id: q.id,
          text: q.text,
          category: q.category as 'burnout' | 'turnover' | 'satisfaction' | 'extra',
          subcategory: q.subcategory,
          scale_description: q.scale_description,
          is_active: q.is_active,
          created_at: q.created_at,
          updated_at: q.updated_at
        }))
      ];

      setQuestions(allQuestions);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Error al cargar preguntas: " + error.message,
        variant: "destructive"
      });
      // Fallback a preguntas predefinidas
      setQuestions(WELLNESS_QUESTIONS.map(q => ({ ...q, is_active: true })));
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }

    setFilteredQuestions(filtered);
  };

  const generateQuestionId = (category: string) => {
    const prefix = category.charAt(0).toUpperCase();
    const existing = questions.filter(q => q.id.startsWith(prefix));
    const nextNumber = existing.length + 1;
    return `${prefix}${nextNumber}`;
  };

  const onSubmit = async (data: QuestionFormData) => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (editingQuestion && !WELLNESS_QUESTIONS.find(q => q.id === editingQuestion.id)) {
        // Actualizar pregunta personalizada existente
        const { error } = await supabase
          .from('custom_questions' as any)
          .update({
            text: data.text,
            category: data.category,
            subcategory: data.subcategory,
            scale_description: data.scale_description,
            is_active: data.is_active
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Pregunta actualizada correctamente"
        });
      } else {
        // Crear nueva pregunta personalizada
        const questionId = data.id || generateQuestionId(data.category);
        
        const { error } = await supabase
          .from('custom_questions' as any)
          .insert({
            id: questionId,
            tenant_id: profile?.tenant_id,
            text: data.text,
            category: data.category,
            subcategory: data.subcategory,
            scale_description: data.scale_description,
            is_active: data.is_active,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Pregunta creada correctamente"
        });
      }

      setShowCreateDialog(false);
      setEditingQuestion(null);
      form.reset();
      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al guardar pregunta: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: CustomQuestion) => {
    const canEdit = !WELLNESS_QUESTIONS.find(q => q.id === question.id);
    
    if (!canEdit) {
      toast({
        title: "Información",
        description: "Las preguntas predefinidas no se pueden editar. Puedes crear una nueva pregunta personalizada.",
        variant: "default"
      });
      return;
    }

    setEditingQuestion(question);
    form.reset({
      id: question.id,
      text: question.text,
      category: question.category,
      subcategory: question.subcategory,
      scale_description: question.scale_description,
      is_active: question.is_active
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (questionId: string) => {
    const canDelete = !WELLNESS_QUESTIONS.find(q => q.id === questionId);
    
    if (!canDelete) {
      toast({
        title: "Error",
        description: "Las preguntas predefinidas no se pueden eliminar",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_questions' as any)
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Pregunta eliminada correctamente"
      });

      loadQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al eliminar pregunta: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    form.reset({
      id: '',
      text: '',
      category: 'satisfaction',
      subcategory: '',
      scale_description: '0=Nunca, 4=Siempre',
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Preguntas</h2>
          <p className="text-muted-foreground">Administra el catálogo de preguntas de bienestar</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Pregunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID de la Pregunta</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ej: S16, B15, T13"
                          disabled={!!editingQuestion}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBCATEGORIES[form.watch('category')]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>
                              {subcat.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de la Pregunta</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Escribe el texto completo de la pregunta..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scale_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Escala</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ej: 0=Nunca, 4=Siempre"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {editingQuestion ? 'Actualizar' : 'Crear'} Pregunta
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar preguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
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

      {/* Tabla de preguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Preguntas ({filteredQuestions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>Escala</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => {
                const category = CATEGORIES.find(c => c.value === question.category);
                const isCustom = !WELLNESS_QUESTIONS.find(q => q.id === question.id);
                
                return (
                  <TableRow key={question.id}>
                    <TableCell className="font-mono text-sm">
                      {question.id}
                      {!isCustom && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Predefinida
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={category?.color}>
                        {category?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm truncate" title={question.text}>
                        {question.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Subcategoría: {question.subcategory.replace(/_/g, ' ')}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {question.scale_description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={question.is_active ? "default" : "secondary"}>
                        {question.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(question)}
                          disabled={!isCustom}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(question.id)}
                          disabled={!isCustom}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
