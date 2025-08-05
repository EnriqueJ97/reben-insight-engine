import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Plus, Edit3, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MaterialityTopic {
  id: string;
  topic_code: string;
  topic_name: string;
  impact_score: number;
  financial_score: number;
  quadrant: 'high_high' | 'high_low' | 'low_high' | 'low_low';
  is_material: boolean;
  justification?: string;
}

const Materialidad = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<MaterialityTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState<MaterialityTopic | null>(null);
  const [showNewTopic, setShowNewTopic] = useState(false);

  const defaultTopics = [
    { code: 'E1', name: 'Cambio Climático', category: 'Ambiental' },
    { code: 'E2', name: 'Contaminación', category: 'Ambiental' },
    { code: 'E3', name: 'Agua y Recursos Marinos', category: 'Ambiental' },
    { code: 'E4', name: 'Biodiversidad', category: 'Ambiental' },
    { code: 'E5', name: 'Economía Circular', category: 'Ambiental' },
    { code: 'S1', name: 'Fuerza Laboral', category: 'Social' },
    { code: 'S2', name: 'Trabajadores en Cadena de Valor', category: 'Social' },
    { code: 'S3', name: 'Comunidades Afectadas', category: 'Social' },
    { code: 'S4', name: 'Consumidores y Usuarios', category: 'Social' },
    { code: 'G1', name: 'Conducta Empresarial', category: 'Gobernanza' },
    { code: 'G2', name: 'Gestión y Supervisión', category: 'Gobernanza' }
  ];

  useEffect(() => {
    if (user) {
      cargarTopicos();
    }
  }, [user]);

  const cargarTopicos = async () => {
    try {
      const { data, error } = await supabase
        .from('materiality_matrix')
        .select('*')
        .order('topic_code');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Crear tópicos por defecto si no existen
        await crearTopicosDefecto();
      } else {
        setTopics(data);
      }
    } catch (error) {
      console.error('Error cargando tópicos:', error);
      toast.error('Error al cargar los tópicos de materialidad');
    } finally {
      setLoading(false);
    }
  };

  const crearTopicosDefecto = async () => {
    try {
      // Primero verificar si existe un perfil CSRD
      const { data: profile } = await supabase
        .from('csrd_profile')
        .select('id')
        .single();

      if (!profile) {
        toast.error('Necesitas completar el diagnóstico CSRD primero');
        return;
      }

      const topicsToInsert = defaultTopics.map(topic => ({
        tenant_id: user?.tenant_id,
        csrd_profile_id: profile.id,
        topic_code: topic.code,
        topic_name: topic.name,
        impact_score: 2.5,
        financial_score: 2.5,
        quadrant: 'low_low' as const,
        is_material: false
      }));

      const { data, error } = await supabase
        .from('materiality_matrix')
        .insert(topicsToInsert)
        .select();

      if (error) throw error;

      setTopics(data || []);
      toast.success('Matriz de materialidad inicializada');
    } catch (error) {
      console.error('Error creando tópicos:', error);
      toast.error('Error al inicializar la matriz');
    }
  };

  const actualizarTopico = async (topicId: string, updates: Partial<MaterialityTopic>) => {
    try {
      // Calcular cuadrante basado en puntuaciones
      let quadrant: MaterialityTopic['quadrant'] = 'low_low';
      const impact = updates.impact_score || 0;
      const financial = updates.financial_score || 0;

      if (impact >= 3 && financial >= 3) quadrant = 'high_high';
      else if (impact >= 3 && financial < 3) quadrant = 'high_low';
      else if (impact < 3 && financial >= 3) quadrant = 'low_high';

      const finalUpdates = {
        ...updates,
        quadrant,
        is_material: quadrant === 'high_high' || quadrant === 'high_low'
      };

      const { error } = await supabase
        .from('materiality_matrix')
        .update(finalUpdates)
        .eq('id', topicId);

      if (error) throw error;

      setTopics(prev => prev.map(topic => 
        topic.id === topicId ? { ...topic, ...finalUpdates } : topic
      ));

      toast.success('Tópico actualizado');
      setEditingTopic(null);
    } catch (error) {
      console.error('Error actualizando tópico:', error);
      toast.error('Error al actualizar el tópico');
    }
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'high_high': return 'bg-red-100 border-red-300';
      case 'high_low': return 'bg-orange-100 border-orange-300';
      case 'low_high': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getQuadrantLabel = (quadrant: string) => {
    switch (quadrant) {
      case 'high_high': return 'Muy Material';
      case 'high_low': return 'Material';
      case 'low_high': return 'Financieramente Relevante';
      default: return 'No Material';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando análisis de materialidad...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Análisis de Materialidad</h1>
        </div>
        
        <Dialog open={showNewTopic} onOpenChange={setShowNewTopic}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tópico
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Tópico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Funcionalidad disponible próximamente
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Matriz Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Doble Materialidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 h-96">
            {/* Cuadrante Alto Impacto, Alto Financiero */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Muy Material</h3>
              <p className="text-xs text-red-600 mb-2">Alto Impacto + Alto Financiero</p>
              <div className="space-y-1">
                {topics.filter(t => t.quadrant === 'high_high').map(topic => (
                  <Badge key={topic.id} variant="destructive" className="text-xs">
                    {topic.topic_code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cuadrante Alto Impacto, Bajo Financiero */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Material</h3>
              <p className="text-xs text-orange-600 mb-2">Alto Impacto + Bajo Financiero</p>
              <div className="space-y-1">
                {topics.filter(t => t.quadrant === 'high_low').map(topic => (
                  <Badge key={topic.id} variant="secondary" className="text-xs">
                    {topic.topic_code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cuadrante Bajo Impacto, Alto Financiero */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Financieramente Relevante</h3>
              <p className="text-xs text-yellow-600 mb-2">Bajo Impacto + Alto Financiero</p>
              <div className="space-y-1">
                {topics.filter(t => t.quadrant === 'low_high').map(topic => (
                  <Badge key={topic.id} variant="outline" className="text-xs">
                    {topic.topic_code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cuadrante Bajo Impacto, Bajo Financiero */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">No Material</h3>
              <p className="text-xs text-gray-600 mb-2">Bajo Impacto + Bajo Financiero</p>
              <div className="space-y-1">
                {topics.filter(t => t.quadrant === 'low_low').map(topic => (
                  <Badge key={topic.id} variant="outline" className="text-xs">
                    {topic.topic_code}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tópicos */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tópicos ESRS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className={`p-4 rounded-lg border-2 ${getQuadrantColor(topic.quadrant)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{topic.topic_code}</Badge>
                      <h3 className="font-semibold">{topic.topic_name}</h3>
                      <Badge variant={topic.is_material ? "default" : "secondary"}>
                        {getQuadrantLabel(topic.quadrant)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Impacto: </span>
                        <span className="font-medium">{topic.impact_score}/5.0</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Financiero: </span>
                        <span className="font-medium">{topic.financial_score}/5.0</span>
                      </div>
                    </div>
                    
                    {topic.justification && (
                      <p className="text-sm text-muted-foreground">{topic.justification}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTopic(topic)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={!!editingTopic} onOpenChange={(open) => !open && setEditingTopic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Materialidad - {editingTopic?.topic_code}</DialogTitle>
          </DialogHeader>
          {editingTopic && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Puntuación de Impacto (0-5)</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingTopic.impact_score}
                    onChange={(e) => setEditingTopic(prev => 
                      prev ? { ...prev, impact_score: parseFloat(e.target.value) || 0 } : null
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Puntuación Financiera (0-5)</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingTopic.financial_score}
                    onChange={(e) => setEditingTopic(prev => 
                      prev ? { ...prev, financial_score: parseFloat(e.target.value) || 0 } : null
                    )}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Justificación</label>
                <Textarea
                  value={editingTopic.justification || ''}
                  onChange={(e) => setEditingTopic(prev => 
                    prev ? { ...prev, justification: e.target.value } : null
                  )}
                  placeholder="Explica la razón de estas puntuaciones..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => actualizarTopico(editingTopic.id, editingTopic)}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingTopic(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materialidad;