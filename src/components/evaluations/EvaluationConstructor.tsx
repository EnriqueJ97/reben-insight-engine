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
import { ProfessionalInstrumentSelector } from './ProfessionalInstrumentSelector';

import { EvaluationTemplate, EvaluationComponent, EvaluationConfiguration, ScientificInstrument } from '@/types/evaluations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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

  const saveTemplate = async () => {
    if (!template.name || !template.components?.length) {
      toast({
        title: "Error",
        description: "La evaluación necesita un nombre y al menos un instrumento",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('evaluation_campaigns')
        .insert({
          name: template.name,
          description: template.description,
          template_data: {
            components: template.components,
            configuration: template.configuration
          } as any,
          status: 'draft',
          target_audience: template.configuration?.targeting || { allEmployees: true },
          anonymous: template.configuration?.anonymous || true,
          frequency: template.configuration?.frequency || 'one_time',
          created_by: user?.id!,
          tenant_id: user?.tenant_id!
        });

      if (error) throw error;

      toast({
        title: "Plantilla guardada",
        description: `"${template.name}" se guardó correctamente`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive"
      });
    }
  };

  const launchEvaluation = async () => {
    if (!template.name || !template.components?.length) {
      toast({
        title: "Error",
        description: "Completa la evaluación antes de lanzarla",
        variant: "destructive"
      });
      return;
    }

    try {
      // First save as draft
      const { data: campaignData, error: campaignError } = await supabase
        .from('evaluation_campaigns')
        .insert({
          name: template.name,
          description: template.description,
          template_data: {
            components: template.components,
            configuration: template.configuration
          } as any,
          status: 'active',
          launch_date: new Date().toISOString(),
          target_audience: template.configuration?.targeting || { allEmployees: true },
          anonymous: template.configuration?.anonymous || true,
          frequency: template.configuration?.frequency || 'one_time',
          created_by: user?.id!,
          tenant_id: user?.tenant_id!
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Launch the campaign (send notifications to employees)
      const { error: launchError } = await supabase.functions.invoke('launch-evaluation', {
        body: { campaignId: campaignData.id }
      });

      if (launchError) throw launchError;

      toast({
        title: "Evaluación lanzada",
        description: `"${template.name}" se lanzó exitosamente`,
      });

      // Reset form
      setTemplate({
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

    } catch (error) {
      console.error('Error launching evaluation:', error);
      toast({
        title: "Error",
        description: "No se pudo lanzar la evaluación",
        variant: "destructive"
      });
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 4;
    
    // Basic info (25%)
    if (template.name && template.description) completed += 1;
    
    // Has instruments (25%)
    if (template.components && template.components.length > 0) completed += 1;
    
    // Targeting configured (25%)
    if (template.configuration?.targeting?.allEmployees || 
        (template.configuration?.targeting?.specificTeams?.length > 0) ||
        (template.configuration?.targeting?.specificRoles?.length > 0)) completed += 1;
    
    // Notifications configured (25%)
    if (template.configuration?.notifications?.email) completed += 1;
    
    return (completed / total) * 100;
  };

  return (
    <div className="space-y-6">
      <ProfessionalInstrumentSelector
        onInstrumentSelect={addInstrumentToEvaluation}
        selectedInstruments={selectedInstruments}
      />

      {/* Constructor Panel */}
      <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="w-7 h-7 text-primary" />
                Constructor de Evaluaciones Científicas
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Cree evaluaciones profesionales usando instrumentos científicos validados
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={saveTemplate} disabled={!template.name || !template.components?.length}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button 
                onClick={launchEvaluation} 
                disabled={!template.name || !template.components?.length}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Play className="w-4 h-4 mr-2" />
                Lanzar Evaluación
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso de Configuración</span>
              <span className="text-sm text-muted-foreground">{Math.round(getCompletionPercentage())}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Básico</span>
              <span>Instrumentos</span>
              <span>Configuración</span>
              <span>¡Listo!</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">Nombre de la Evaluación</Label>
                <Input
                  id="name"
                  value={template.name || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej. Evaluación Burnout Q1 2024"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-base font-medium">Descripción</Label>
                <Textarea
                  id="description"
                  value={template.description || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa el objetivo y contexto de esta evaluación..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4 bg-blue-50 border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{getTotalItems()}</div>
                <div className="text-sm text-blue-700 font-medium">Ítems Totales</div>
                <div className="text-xs text-muted-foreground">preguntas científicas</div>
              </Card>
              <Card className="text-center p-4 bg-green-50 border-green-200">
                <div className="text-2xl font-bold text-green-600">{Math.round(getEstimatedTime())}</div>
                <div className="text-sm text-green-700 font-medium">Minutos</div>
                <div className="text-xs text-muted-foreground">tiempo estimado</div>
              </Card>
              <Card className="text-center p-4 bg-purple-50 border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{template.components?.length || 0}</div>
                <div className="text-sm text-purple-700 font-medium">Instrumentos</div>
                <div className="text-xs text-muted-foreground">científicos validados</div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruments Panel */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-green-600" />
            Instrumentos Seleccionados
            <Badge variant="secondary" className="ml-2">
              {template.components?.length || 0} añadidos
            </Badge>
          </CardTitle>
          {template.components?.length > 0 && (
            <p className="text-sm text-muted-foreground">
              ✨ Excelente selección. Tiempo estimado: <strong>{Math.round(getEstimatedTime())} minutos</strong>
            </p>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {(!template.components || template.components.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Comience seleccionando instrumentos</h3>
              <p>Explore el catálogo científico arriba y seleccione los instrumentos que mejor se adapten a sus objetivos de evaluación</p>
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
                        className={`${config.color} hover:shadow-lg transition-all duration-200 border-2`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="cursor-grab hover:cursor-grabbing">
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{config.icon}</span>
                                <Badge className={`${config.badge} font-medium`}>
                                  {instrument.abbreviation}
                                </Badge>
                                {dimension && (
                                  <Badge variant="outline" className="text-xs font-medium">
                                    📊 {dimension.name}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-lg mb-1">{instrument.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {dimension ? dimension.description : instrument.description}
                              </p>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                                  <Target className="w-4 h-4 text-primary" />
                                  <span className="font-medium">{dimension ? dimension.items : instrument.totalItems}</span>
                                  <span className="text-muted-foreground">ítems</span>
                                </span>
                                <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span className="font-medium">
                                    {dimension ? 
                                      Math.round(instrument.estimatedMinutes * (dimension.items / instrument.totalItems)) :
                                      instrument.estimatedMinutes}
                                  </span>
                                  <span className="text-muted-foreground">min</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
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
                                <Label className="text-sm font-medium">Obligatorio</Label>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeComponent(component.id)}
                                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Frecuencia de Evaluación</Label>
                    <p className="text-sm text-muted-foreground mb-3">¿Con qué frecuencia se ejecutará esta evaluación?</p>
                    <Select 
                      value={template.configuration?.frequency || 'one_time'} 
                      onValueChange={(value) => setTemplate(prev => ({
                        ...prev,
                        configuration: { ...prev.configuration!, frequency: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">Una vez</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium">Lanzamiento</Label>
                    <p className="text-sm text-muted-foreground mb-3">¿Cuándo quiere lanzar esta evaluación?</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="launch-type">Tipo de Lanzamiento</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Inmediato</SelectItem>
                            <SelectItem value="scheduled">Programado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duración Disponible</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 días</SelectItem>
                            <SelectItem value="14">14 días</SelectItem>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="60">60 días</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Vista Previa del Timeline</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      📅 <strong>Lanzamiento:</strong> Inmediato (al hacer clic en "Lanzar")<br/>
                      ⏱️ <strong>Disponible hasta:</strong> 30 días después del lanzamiento<br/>
                      🔄 <strong>Recordatorios:</strong> A los 7, 14 y 21 días
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Audiencia Objetivo</Label>
                    <p className="text-sm text-muted-foreground mb-3">Seleccione quién participará en esta evaluación</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all-employees"
                        checked={template.configuration?.targeting?.allEmployees || false}
                        onCheckedChange={(checked) => setTemplate(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration!,
                            targeting: { ...prev.configuration!.targeting, allEmployees: checked === true }
                          }
                        }))}
                      />
                      <Label htmlFor="all-employees" className="font-medium">Todos los empleados</Label>
                    </div>

                    {!template.configuration?.targeting?.allEmployees && (
                      <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                        <div>
                          <Label>Equipos Específicos</Label>
                          <p className="text-xs text-muted-foreground mb-2">Seleccione los equipos que participarán</p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Desarrollo', 'Marketing', 'Ventas', 'RRHH', 'Finanzas', 'Operaciones'].map(team => (
                              <div key={team} className="flex items-center space-x-2">
                                <Checkbox id={team} />
                                <Label htmlFor={team} className="text-sm">{team}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Roles Específicos</Label>
                          <p className="text-xs text-muted-foreground mb-2">Filtre por roles organizacionales</p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Managers', 'Empleados', 'Seniors', 'Juniors'].map(role => (
                              <div key={role} className="flex items-center space-x-2">
                                <Checkbox id={role} />
                                <Label htmlFor={role} className="text-sm">{role}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Participantes Estimados</span>
                    </div>
                    <p className="text-sm text-green-700">
                      👥 <strong>Total:</strong> {template.configuration?.targeting?.allEmployees ? 'Todos los empleados (~250)' : 'Equipos seleccionados (~85)'}<br/>
                      📧 <strong>Invitaciones:</strong> Se enviarán automáticamente por email<br/>
                      🔒 <strong>Privacidad:</strong> {template.configuration?.anonymous ? 'Anónima' : 'Identificada'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Canales de Notificación</Label>
                    <p className="text-sm text-muted-foreground mb-3">Configure cómo se notificará a los participantes</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-lg">📧</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Email</h4>
                            <p className="text-sm text-muted-foreground">Invitaciones y recordatorios por correo</p>
                          </div>
                        </div>
                        <Switch 
                          checked={template.configuration?.notifications?.email || true}
                          onCheckedChange={(checked) => setTemplate(prev => ({
                            ...prev,
                            configuration: {
                              ...prev.configuration!,
                              notifications: { ...prev.configuration!.notifications, email: checked }
                            }
                          }))}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-lg">💬</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Slack</h4>
                            <p className="text-sm text-muted-foreground">Mensajes directos en Slack</p>
                          </div>
                        </div>
                        <Switch 
                          checked={template.configuration?.notifications?.slack || false}
                          onCheckedChange={(checked) => setTemplate(prev => ({
                            ...prev,
                            configuration: {
                              ...prev.configuration!,
                              notifications: { ...prev.configuration!.notifications, slack: checked }
                            }
                          }))}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <span className="text-lg">🔔</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Notificaciones In-App</h4>
                            <p className="text-sm text-muted-foreground">Notificaciones en la plataforma</p>
                          </div>
                        </div>
                        <Switch 
                          checked={template.configuration?.notifications?.inApp !== false}
                          onCheckedChange={(checked) => setTemplate(prev => ({
                            ...prev,
                            configuration: {
                              ...prev.configuration!,
                              notifications: { ...prev.configuration!.notifications, inApp: checked }
                            }
                          }))}
                        />
                      </div>
                    </Card>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Programación de Recordatorios</Label>
                    <p className="text-sm text-muted-foreground mb-3">¿Cuándo enviar recordatorios automáticos?</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { days: 7, label: 'A los 7 días' },
                        { days: 14, label: 'A los 14 días' },
                        { days: 21, label: 'A los 21 días' }
                      ].map(reminder => (
                        <div key={reminder.days} className="flex items-center space-x-2">
                          <Checkbox id={`reminder-${reminder.days}`} defaultChecked />
                          <Label htmlFor={`reminder-${reminder.days}`} className="text-sm">{reminder.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">Plan de Comunicación</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      📬 <strong>Invitación inicial:</strong> Email + notificación in-app<br/>
                      🔔 <strong>Recordatorios:</strong> Cada 7 días por los canales activos<br/>
                      ⚡ <strong>Notificación final:</strong> 24h antes del cierre
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};