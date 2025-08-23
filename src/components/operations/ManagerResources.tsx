import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  GraduationCap, 
  Heart, 
  Users, 
  FileText, 
  Video, 
  Headphones,
  Star,
  Clock,
  Search,
  Filter,
  Download,
  ExternalLink,
  Play,
  Award,
  Target,
  MessageCircle,
  Brain,
  Zap,
  Eye,
  TrendingDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ManagerResources = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [resources, setResources] = useState([
    // Liderazgo
    {
      id: '1',
      title: 'Guía de Liderazgo Empático',
      description: 'Técnicas para liderar con empatía y crear conexiones auténticas con tu equipo',
      category: 'leadership',
      type: 'guide',
      duration: '15 min',
      rating: 4.8,
      views: 1250,
      difficulty: 'beginner',
      tags: ['empatía', 'comunicación', 'liderazgo'],
      content: {
        format: 'pdf',
        url: '/resources/leadership/empathetic-leadership.pdf',
        preview: 'Aprende a detectar las necesidades emocionales de tu equipo y responder apropiadamente...'
      },
      related_alerts: ['low_satisfaction', 'high_stress']
    },
    {
      id: '2',
      title: 'Masterclass: Feedback Efectivo',
      description: 'Cómo dar feedback constructivo que motive y desarrolle a tus colaboradores',
      category: 'leadership',
      type: 'video',
      duration: '45 min',
      rating: 4.9,
      views: 890,
      difficulty: 'intermediate',
      tags: ['feedback', '1on1', 'desarrollo'],
      content: {
        format: 'video',
        url: '/resources/leadership/feedback-masterclass.mp4',
        preview: 'Técnicas probadas para conversaciones difíciles y feedback positivo...'
      },
      related_alerts: ['performance_decline', 'low_satisfaction']
    },
    
    // Salud Mental
    {
      id: '3',
      title: 'Protocolo: Detección Temprana de Burnout',
      description: 'Señales de alerta y primeros pasos para prevenir el burnout en tu equipo',
      category: 'mental_health',
      type: 'protocol',
      duration: '10 min',
      rating: 4.7,
      views: 2100,
      difficulty: 'beginner',
      tags: ['burnout', 'prevención', 'bienestar'],
      content: {
        format: 'checklist',
        url: '/resources/mental-health/burnout-detection.pdf',
        preview: 'Lista de verificación con 15 indicadores clave de riesgo de burnout...'
      },
      related_alerts: ['burnout_risk', 'high_stress', 'turnover_risk']
    },
    {
      id: '4',
      title: 'Workshop: Primeros Auxilios Emocionales',
      description: 'Qué hacer cuando un empleado está en crisis emocional',
      category: 'mental_health',
      type: 'workshop',
      duration: '30 min',
      rating: 4.6,
      views: 567,
      difficulty: 'intermediate',
      tags: ['crisis', 'soporte', 'primeros auxilios'],
      content: {
        format: 'interactive',
        url: '/resources/mental-health/emotional-first-aid.html',
        preview: 'Protocolo paso a paso para situaciones de crisis emocional...'
      },
      related_alerts: ['high_stress', 'burnout_risk']
    },
    
    // Resolución de Conflictos
    {
      id: '5',
      title: 'Mediación de Conflictos en el Equipo',
      description: 'Estrategias para resolver disputas y tensiones entre colaboradores',
      category: 'conflict_resolution',
      type: 'guide',
      duration: '20 min',
      rating: 4.5,
      views: 890,
      difficulty: 'advanced',
      tags: ['mediación', 'conflictos', 'comunicación'],
      content: {
        format: 'pdf',
        url: '/resources/conflict/team-mediation.pdf',
        preview: 'Marco estructurado para abordar conflictos interpersonales...'
      },
      related_alerts: ['team_conflict', 'low_satisfaction']
    },
    
    // Desarrollo de Talento
    {
      id: '6',
      title: 'Plan de Desarrollo Individual (PDI)',
      description: 'Plantilla y metodología para crear planes de desarrollo personalizados',
      category: 'development',
      type: 'template',
      duration: '25 min',
      rating: 4.4,
      views: 1450,
      difficulty: 'intermediate',
      tags: ['desarrollo', 'carrera', 'talento'],
      content: {
        format: 'template',
        url: '/resources/development/individual-development-plan.xlsx',
        preview: 'Plantilla completa con objetivos SMART y seguimiento...'
      },
      related_alerts: ['performance_decline', 'turnover_risk']
    }
  ]);

  const [learningPaths, setLearningPaths] = useState([
    {
      id: '1',
      title: 'Manager Novato a Experto',
      description: 'Ruta completa de desarrollo para managers principiantes',
      duration: '8 semanas',
      modules: 12,
      progress: 0,
      difficulty: 'beginner',
      resources: ['1', '2', '3', '4'],
      badge: 'Certified People Manager'
    },
    {
      id: '2',
      title: 'Especialista en Bienestar',
      description: 'Conviértete en el referente de bienestar para tu equipo',
      duration: '6 semanas',
      modules: 8,
      progress: 25,
      difficulty: 'intermediate',
      resources: ['3', '4', '5'],
      badge: 'Wellness Champion'
    }
  ]);

  const categories = [
    { value: 'leadership', label: 'Liderazgo', icon: Users },
    { value: 'mental_health', label: 'Salud Mental', icon: Heart },
    { value: 'conflict_resolution', label: 'Resolución Conflictos', icon: MessageCircle },
    { value: 'development', label: 'Desarrollo Talento', icon: Target }
  ];

  const resourceTypes = [
    { value: 'guide', label: 'Guías', icon: BookOpen },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'workshop', label: 'Workshops', icon: GraduationCap },
    { value: 'protocol', label: 'Protocolos', icon: FileText },
    { value: 'template', label: 'Plantillas', icon: FileText }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getRecommendedResources = (alertType: string) => {
    return resources.filter(resource => 
      resource.related_alerts?.includes(alertType)
    ).slice(0, 3);
  };

  const handleStartResource = (resourceId: string) => {
    toast({
      title: "Recurso iniciado",
      description: "Contenido abierto en nueva pestaña"
    });
    // En producción, abrir el recurso real
  };

  const handleDownloadResource = (resourceId: string) => {
    toast({
      title: "Descarga iniciada",
      description: "El archivo se descargará en breve"
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : BookOpen;
  };

  const getTypeIcon = (type: string) => {
    const t = resourceTypes.find(rt => rt.value === type);
    return t ? t.icon : FileText;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-success text-success-foreground';
      case 'intermediate': return 'bg-warning text-warning-foreground';
      case 'advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Básico';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h3 className="text-lg font-semibold">Biblioteca de Recursos para Managers</h3>
          <p className="text-sm text-muted-foreground">
            Guías, herramientas y formación especializada en liderazgo y bienestar
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {resourceTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="learning-paths">Rutas de Aprendizaje</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{resources.length}</p>
                    <p className="text-xs text-muted-foreground">Recursos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">4.7</p>
                    <p className="text-xs text-muted-foreground">Rating Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-info" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(resources.reduce((sum, r) => sum + parseInt(r.duration), 0) / resources.length)}m
                    </p>
                    <p className="text-xs text-muted-foreground">Duración Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs text-muted-foreground">Certificaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid de recursos */}
          <div className="grid gap-6">
            {filteredResources.map((resource) => {
              const CategoryIcon = getCategoryIcon(resource.category);
              const TypeIcon = getTypeIcon(resource.type);
              
              return (
                <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CategoryIcon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{resource.title}</h4>
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {getDifficultyLabel(resource.difficulty)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <TypeIcon className="h-4 w-4" />
                            <span className="capitalize">{resource.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span>{resource.rating}</span>
                          </div>
                          <span>👁 {resource.views} vistas</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button 
                        size="sm"
                        onClick={() => handleStartResource(resource.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadResource(resource.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                  
                  {/* Preview del contenido */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm italic text-muted-foreground">
                      {resource.content.preview}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No se encontraron recursos con los filtros aplicados
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="learning-paths" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Rutas de Aprendizaje Estructuradas</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Programas completos de desarrollo diseñados para diferentes niveles de experiencia
            </p>
          </div>

          <div className="grid gap-6">
            {learningPaths.map((path) => (
              <Card key={path.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{path.title}</h4>
                      <Badge className="bg-primary/10 text-primary">
                        <Award className="h-3 w-3 mr-1" />
                        {path.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {path.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{path.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{path.modules} módulos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span className="capitalize">{path.difficulty}</span>
                      </div>
                    </div>
                    
                    {/* Progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso</span>
                        <span>{path.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button>
                      {path.progress > 0 ? 'Continuar' : 'Comenzar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Programa
                    </Button>
                  </div>
                </div>
                
                {/* Recursos incluidos */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Recursos incluidos:</p>
                  <div className="flex flex-wrap gap-2">
                    {path.resources.map((resourceId) => {
                      const resource = resources.find(r => r.id === resourceId);
                      return resource ? (
                        <Badge key={resourceId} variant="secondary" className="text-xs">
                          {resource.title}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Recomendaciones Personalizadas</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Recursos sugeridos basados en las alertas activas de tu equipo
            </p>
          </div>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>IA Recomendaciones:</strong> Estos recursos han sido seleccionados 
              automáticamente según los patrones de riesgo detectados en tu equipo.
            </AlertDescription>
          </Alert>

          {/* Recomendaciones por tipo de alerta */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <Heart className="h-5 w-5 text-destructive mr-2" />
                Para Riesgo de Burnout
              </h4>
              <div className="grid gap-4">
                {getRecommendedResources('burnout_risk').map((resource) => (
                  <Card key={resource.id} className="p-4 border-l-4 border-l-destructive">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium">{resource.title}</h5>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">{resource.duration}</Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span>{resource.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleStartResource(resource.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Usar Ahora
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <TrendingDown className="h-5 w-5 text-warning mr-2" />
                Para Baja Satisfacción
              </h4>
              <div className="grid gap-4">
                {getRecommendedResources('low_satisfaction').map((resource) => (
                  <Card key={resource.id} className="p-4 border-l-4 border-l-warning">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium">{resource.title}</h5>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">{resource.duration}</Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span>{resource.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleStartResource(resource.id)}>
                        <Zap className="h-4 w-4 mr-2" />
                        Usar Ahora
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerResources;