import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SCIENTIFIC_INSTRUMENTS, getInstrumentsByCategory } from '@/data/scientific-instruments';
import { EvaluationTemplate, EvaluationComponent, EvaluationConfiguration, ScientificInstrument } from '@/types/evaluations';
// Drag and drop functionality will be implemented later
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  Users, 
  Settings, 
  Save,
  Play,
  Eye,
  BookOpen,
  Target,
  Calendar,
  Bell
} from 'lucide-react';

const CATEGORY_CONFIG = {
  'burnout': { label: 'Burnout', icon: '🔥', color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800' },
  'engagement': { label: 'Engagement & Motivación', icon: '⚡', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  'satisfaction': { label: 'Satisfacción Laboral', icon: '😊', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
  'climate': { label: 'Clima Organizacional', icon: '🌤️', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  'leadership': { label: 'Liderazgo', icon: '👑', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-800' },
  'wellbeing': { label: 'Bienestar Psicológico', icon: '🧘', color: 'bg-teal-50 border-teal-200', badge: 'bg-teal-100 text-teal-800' },
  'inclusion': { label: 'Diversidad e Inclusión', icon: '🤝', color: 'bg-pink-50 border-pink-200', badge: 'bg-pink-100 text-pink-800' },
  'flexibility': { label: 'Flexibilidad y Conciliación', icon: '⚖️', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
  'commitment': { label: 'Compromiso Organizacional', icon: '💪', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800' }
};

export const EvaluationConstructor = () => {
  const [template, setTemplate] = useState<Partial<EvaluationTemplate>>({
    name: '',
    description: '',
    components: [],
    configuration: {
      anonymous: true,
      frequency: 'one_time',
      scheduling: {},
      targeting: { allEmployees: true },
      gamification: { enabled: true, progressBar: true, motivationalMessages: true, rewards: false },
      notifications: { email: true, slack: false, teams: false, inApp: true }
    }
  });
  
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Drag and drop will be implemented later

  const addInstrumentToEvaluation = (instrument: ScientificInstrument, type: 'full' | 'dimension' = 'full', dimensionId?: string) => {
    const componentId = `${instrument.id}_${type}_${dimensionId || 'full'}_${Date.now()}`;
    
    const newComponent: EvaluationComponent = {
      id: componentId,
      type: 'instrument',
      instrumentId: instrument.id,
      dimensionId: type === 'dimension' ? dimensionId : undefined,
      order: (template.components?.length || 0) + 1,
      required: true
    };

    setTemplate(prev => ({
      ...prev,
      components: [...(prev.components || []), newComponent]
    }));

    toast({
      title: "Instrumento agregado",
      description: `${instrument.name} se agregó a la evaluación`,
    });
  };

  const removeComponent = (componentId: string) => {
    setTemplate(prev => ({
      ...prev,
      components: (prev.components || []).filter(c => c.id !== componentId)
    }));
  };

  const getTotalItems = () => {
    return (template.components || []).reduce((total, component) => {
      if (component.type === 'instrument') {
        const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === component.instrumentId);
        if (instrument) {
          if (component.dimensionId) {
            const dimension = instrument.dimensions.find(d => d.id === component.dimensionId);
            return total + (dimension?.items || 0);
          }
          return total + instrument.totalItems;
        }
      }
      return total;
    }, 0);
  };

  const getEstimatedTime = () => {
    return (template.components || []).reduce((total, component) => {
      if (component.type === 'instrument') {
        const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === component.instrumentId);
        if (instrument) {
          if (component.dimensionId) {
            const dimension = instrument.dimensions.find(d => d.id === component.dimensionId);
            const ratio = (dimension?.items || 0) / instrument.totalItems;
            return total + (instrument.estimatedMinutes * ratio);
          }
          return total + instrument.estimatedMinutes;
        }
      }
      return total;
    }, 0);
  };

  const saveTemplate = () => {
    if (!template.name || !template.components?.length) {
      toast({
        title: "Error",
        description: "La evaluación necesita un nombre y al menos un instrumento",
        variant: "destructive"
      });
      return;
    }

    // Here you would save to Supabase
    toast({
      title: "Plantilla guardada",
      description: `"${template.name}" se guardó correctamente`,
    });
  };

  const launchEvaluation = () => {
    if (!template.name || !template.components?.length) {
      toast({
        title: "Error",
        description: "Completa la evaluación antes de lanzarla",
        variant: "destructive"
      });
      return;
    }

    // Here you would create and launch the campaign
    toast({
      title: "Evaluación lanzada",
      description: `"${template.name}" se lanzó exitosamente`,
    });
  };

  const filteredInstruments = SCIENTIFIC_INSTRUMENTS.filter(instrument =>
    instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instrument.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instrument.authors.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full">
      {/* Catalog Panel */}
      <div className="w-96 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Catálogo Científico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar instrumentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="validated">Validados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-3 max-h-96 overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
                    const categoryInstruments = getInstrumentsByCategory(categoryKey as any).filter(inst =>
                      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inst.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    if (categoryInstruments.length === 0) return null;

                    return (
                      <AccordionItem key={categoryKey} value={categoryKey}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                            <Badge variant="secondary">{categoryInstruments.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                          {categoryInstruments.map((instrument) => (
                            <Card key={instrument.id} className={`${config.color} cursor-pointer hover:shadow-md transition-shadow`}>
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium text-sm">{instrument.abbreviation}</h4>
                                      <p className="text-xs text-muted-foreground">{instrument.name}</p>
                                      <p className="text-xs text-muted-foreground">{instrument.authors} ({instrument.yearDeveloped})</p>
                                    </div>
                                    <div className="text-right text-xs">
                                      <Badge className={config.badge}>{instrument.totalItems} ítems</Badge>
                                      <p className="text-muted-foreground mt-1">{instrument.estimatedMinutes} min</p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs leading-relaxed">{instrument.description}</p>
                                  
                                  <div className="space-y-1">
                                    <div className="flex gap-1 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-6 px-2"
                                        onClick={() => addInstrumentToEvaluation(instrument, 'full')}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Completo
                                      </Button>
                                      {instrument.dimensions.map((dimension) => (
                                        <Button
                                          key={dimension.id}
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs h-6 px-2"
                                          onClick={() => addInstrumentToEvaluation(instrument, 'dimension', dimension.id)}
                                        >
                                          {dimension.name} ({dimension.items})
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="validated" className="space-y-3 max-h-96 overflow-y-auto">
                {filteredInstruments.filter(i => i.validated).map((instrument) => {
                  const config = CATEGORY_CONFIG[instrument.category];
                  return (
                    <Card key={instrument.id} className={`${config.color} cursor-pointer hover:shadow-md transition-shadow`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{instrument.abbreviation}</h4>
                            <p className="text-xs text-muted-foreground">{instrument.authors}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addInstrumentToEvaluation(instrument, 'full')}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Constructor Panel */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Constructor de Evaluaciones
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Arrastra instrumentos científicos para crear evaluaciones personalizadas
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Plantilla
                </Button>
                <Button onClick={launchEvaluation}>
                  <Play className="w-4 h-4 mr-2" />
                  Lanzar Evaluación
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Evaluación</Label>
                <Input
                  id="name"
                  value={template.name || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej. Evaluación Burnout Q1 2024"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{getTotalItems()}</p>
                  <p className="text-xs text-muted-foreground">ítems totales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{Math.round(getEstimatedTime())}</p>
                  <p className="text-xs text-muted-foreground">minutos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{template.components?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">instrumentos</p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={template.description || ''}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el objetivo y contexto de esta evaluación..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Instrumentos Seleccionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!template.components || template.components.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No hay instrumentos seleccionados</h3>
                <p>Arrastra instrumentos desde el catálogo para comenzar a construir tu evaluación</p>
              </div>
            ) : (
              <div className="space-y-3">
                      {template.components?.map((component, index) => {
                        const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === component.instrumentId);
                        const dimension = component.dimensionId ? 
                          instrument?.dimensions.find(d => d.id === component.dimensionId) : null;
                        const config = instrument ? CATEGORY_CONFIG[instrument.category] : null;
                        
                        if (!instrument || !config) return null;

                        return (
                          <Card
                            key={component.id}
                            className={config.color}
                          >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="cursor-grab">
                                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{config.icon}</span>
                                        <Badge className={config.badge}>
                                          {instrument.abbreviation}
                                        </Badge>
                                        {dimension && (
                                          <Badge variant="outline" className="text-xs">
                                            {dimension.name}
                                          </Badge>
                                        )}
                                      </div>
                                      <h4 className="font-medium">{instrument.name}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {dimension ? dimension.description : instrument.description}
                                      </p>
                                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Target className="w-3 h-3" />
                                          {dimension ? dimension.items : instrument.totalItems} ítems
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {dimension ? 
                                            Math.round(instrument.estimatedMinutes * (dimension.items / instrument.totalItems)) :
                                            instrument.estimatedMinutes} min
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={component.required}
                                        onCheckedChange={(checked) => {
                                          setTemplate(prev => ({
                                            ...prev,
                                            components: prev.components?.map(c =>
                                              c.id === component.id ? { ...c, required: checked } : c
                                            ) || []
                                          }));
                                        }}
                                      />
                                      <Label className="text-xs">Requerido</Label>
                                      
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeComponent(component.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                        );
                      })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="scheduling">
                  <Calendar className="w-4 h-4 mr-2" />
                  Programación
                </TabsTrigger>
                <TabsTrigger value="targeting">
                  <Users className="w-4 h-4 mr-2" />
                  Audiencia
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={template.configuration?.anonymous}
                      onCheckedChange={(checked) => 
                        setTemplate(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration!, anonymous: checked }
                        }))
                      }
                    />
                    <Label>Evaluación anónima</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frecuencia</Label>
                    <Select
                      value={template.configuration?.frequency}
                      onValueChange={(value: any) => 
                        setTemplate(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration!, frequency: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">Una vez</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Gamificación</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.configuration?.gamification.progressBar}
                        onCheckedChange={(checked) => 
                          setTemplate(prev => ({
                            ...prev,
                            configuration: {
                              ...prev.configuration!,
                              gamification: { ...prev.configuration!.gamification, progressBar: checked }
                            }
                          }))
                        }
                      />
                      <Label>Barra de progreso</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.configuration?.gamification.motivationalMessages}
                        onCheckedChange={(checked) => 
                          setTemplate(prev => ({
                            ...prev,
                            configuration: {
                              ...prev.configuration!,
                              gamification: { ...prev.configuration!.gamification, motivationalMessages: checked }
                            }
                          }))
                        }
                      />
                      <Label>Mensajes motivacionales</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure cuándo y cómo se enviará la evaluación</p>
                {/* Add scheduling configuration here */}
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <p className="text-sm text-muted-foreground">Seleccione quién recibirá la evaluación</p>
                {/* Add targeting configuration here */}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure cómo se notificará a los participantes</p>
                {/* Add notification configuration here */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};