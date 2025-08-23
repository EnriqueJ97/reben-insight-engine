import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Star, 
  Heart, 
  Trophy, 
  Gift, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Target,
  Clock,
  Send,
  Plus,
  Eye,
  Filter,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const RecognitionSystem = () => {
  const { toast } = useToast();
  
  const [recognitions, setRecognitions] = useState([
    {
      id: '1',
      type: 'achievement',
      title: 'Superó objetivo mensual',
      message: '¡Excelente trabajo liderando el proyecto CRM! Superaste todas las expectativas.',
      from: 'Manager',
      to: 'María García',
      toId: 'user_1',
      category: 'performance',
      reward: 'Día libre adicional',
      date: '2024-01-15T10:30:00Z',
      visibility: 'team',
      reactions: { likes: 12, hearts: 8, stars: 5 },
      wellnessImpact: 0.85
    },
    {
      id: '2',
      type: 'appreciation',
      title: 'Excelente colaboración',
      message: 'Gracias por tu apoyo constante al equipo y tu actitud positiva.',
      from: 'Manager',
      to: 'Carlos López',
      toId: 'user_2',
      category: 'teamwork',
      reward: 'Vale cena para dos',
      date: '2024-01-14T15:45:00Z',
      visibility: 'public',
      reactions: { likes: 8, hearts: 15, stars: 3 },
      wellnessImpact: 0.72
    },
    {
      id: '3',
      type: 'milestone',
      title: '1 año en el equipo',
      message: 'Celebramos tu primer año con nosotros. ¡Ha sido increíble tenerte!',
      from: 'HR',
      to: 'Ana Martínez',
      toId: 'user_3',
      category: 'milestone',
      reward: 'Bonus especial + Placa conmemorativa',
      date: '2024-01-13T09:00:00Z',
      visibility: 'company',
      reactions: { likes: 25, hearts: 18, stars: 12 },
      wellnessImpact: 0.90
    }
  ]);

  const [teamMembers] = useState([
    { id: 'user_1', name: 'María García', email: 'maria@empresa.com', role: 'Senior Developer' },
    { id: 'user_2', name: 'Carlos López', email: 'carlos@empresa.com', role: 'Product Manager' },
    { id: 'user_3', name: 'Ana Martínez', email: 'ana@empresa.com', role: 'Designer' },
    { id: 'user_4', name: 'Luis Rodríguez', email: 'luis@empresa.com', role: 'DevOps' }
  ]);

  const [recognitionTemplates] = useState([
    {
      id: '1',
      title: 'Superación de Objetivos',
      category: 'performance',
      message: '¡Felicitaciones por superar tus objetivos! Tu dedicación y esfuerzo son ejemplares.',
      suggestedRewards: ['Día libre', 'Bonus', 'Capacitación premium']
    },
    {
      id: '2',
      title: 'Excelente Colaboración',
      category: 'teamwork',
      message: 'Gracias por ser un pilar fundamental en el equipo. Tu actitud positiva marca la diferencia.',
      suggestedRewards: ['Vale cena', 'Horario flexible', 'Reconocimiento público']
    },
    {
      id: '3',
      title: 'Innovación Destacada',
      category: 'innovation',
      message: 'Tu creatividad e innovación han llevado al equipo al siguiente nivel. ¡Increíble trabajo!',
      suggestedRewards: ['Capacitación especializada', 'Proyecto especial', 'Menciones en redes']
    }
  ]);

  const [newRecognition, setNewRecognition] = useState({
    title: '',
    message: '',
    to: '',
    category: '',
    reward: '',
    visibility: 'team',
    templateId: ''
  });

  const [metrics, setMetrics] = useState({
    totalRecognitions: recognitions.length,
    thisMonth: recognitions.filter(r => new Date(r.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    avgWellnessImpact: recognitions.reduce((sum, r) => sum + r.wellnessImpact, 0) / recognitions.length,
    topPerformer: 'María García'
  });

  const recognitionCategories = [
    { value: 'performance', label: 'Rendimiento', icon: Target, color: 'bg-success' },
    { value: 'teamwork', label: 'Trabajo en Equipo', icon: Users, color: 'bg-primary' },
    { value: 'innovation', label: 'Innovación', icon: Zap, color: 'bg-info' },
    { value: 'leadership', label: 'Liderazgo', icon: Award, color: 'bg-warning' },
    { value: 'milestone', label: 'Hitos', icon: Trophy, color: 'bg-secondary' }
  ];

  const rewardOptions = [
    'Día libre adicional',
    'Horario flexible por 1 semana',
    'Vale cena para dos',
    'Bonus monetario',
    'Capacitación premium',
    'Proyecto especial',
    'Reconocimiento público',
    'Placa conmemorativa',
    'Experiencia personalizada'
  ];

  const handleCreateRecognition = async () => {
    if (!newRecognition.title || !newRecognition.to || !newRecognition.message) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    const selectedMember = teamMembers.find(m => m.id === newRecognition.to);
    if (!selectedMember) return;

    const recognition = {
      id: Date.now().toString(),
      type: 'appreciation' as const,
      ...newRecognition,
      from: 'Manager',
      to: selectedMember.name,
      toId: selectedMember.id,
      date: new Date().toISOString(),
      reactions: { likes: 0, hearts: 0, stars: 0 },
      wellnessImpact: Math.random() * 0.3 + 0.6 // Random entre 0.6-0.9
    };

    setRecognitions(prev => [recognition, ...prev]);
    setNewRecognition({
      title: '',
      message: '',
      to: '',
      category: '',
      reward: '',
      visibility: 'team',
      templateId: ''
    });

    toast({
      title: "Reconocimiento enviado",
      description: `${selectedMember.name} ha sido notificado de tu reconocimiento`
    });
  };

  const handleUseTemplate = (templateId: string) => {
    const template = recognitionTemplates.find(t => t.id === templateId);
    if (template) {
      setNewRecognition(prev => ({
        ...prev,
        title: template.title,
        message: template.message,
        category: template.category,
        templateId: templateId
      }));
    }
  };

  const handleReaction = (recognitionId: string, reactionType: 'likes' | 'hearts' | 'stars') => {
    setRecognitions(prev => prev.map(recognition => 
      recognition.id === recognitionId 
        ? {
            ...recognition,
            reactions: {
              ...recognition.reactions,
              [reactionType]: recognition.reactions[reactionType] + 1
            }
          }
        : recognition
    ));
  };

  const getCategoryIcon = (category: string) => {
    const cat = recognitionCategories.find(c => c.value === category);
    return cat ? cat.icon : Award;
  };

  const getCategoryColor = (category: string) => {
    const cat = recognitionCategories.find(c => c.value === category);
    return cat ? cat.color : 'bg-muted';
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return '🔒';
      case 'team': return '👥';
      case 'company': return '🏢';
      default: return '🌍';
    }
  };

  const getWellnessImpactColor = (impact: number) => {
    if (impact >= 0.8) return 'text-success';
    if (impact >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Métricas del sistema de reconocimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalRecognitions}</p>
                <p className="text-xs text-muted-foreground">Total Reconocimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{metrics.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{Math.round(metrics.avgWellnessImpact * 100)}%</p>
                <p className="text-xs text-muted-foreground">Impacto Bienestar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-warning" />
              <div>
                <p className="text-lg font-bold">{metrics.topPerformer}</p>
                <p className="text-xs text-muted-foreground">Top Performer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Enviar Reconocimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de reconocimiento */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span>Nuevo Reconocimiento</span>
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Empleado</Label>
                  <Select value={newRecognition.to} onValueChange={(value) => setNewRecognition(prev => ({ ...prev, to: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={newRecognition.category} onValueChange={(value) => setNewRecognition(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de reconocimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {recognitionCategories.map(category => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newRecognition.title}
                    onChange={(e) => setNewRecognition(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Excelente trabajo en el proyecto"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensaje Personalizado</Label>
                  <Textarea
                    id="message"
                    value={newRecognition.message}
                    onChange={(e) => setNewRecognition(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Escribe un mensaje de reconocimiento personalizado..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="reward">Recompensa</Label>
                  <Select value={newRecognition.reward} onValueChange={(value) => setNewRecognition(prev => ({ ...prev, reward: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una recompensa" />
                    </SelectTrigger>
                    <SelectContent>
                      {rewardOptions.map(reward => (
                        <SelectItem key={reward} value={reward}>
                          {reward}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibilidad</Label>
                  <Select value={newRecognition.visibility} onValueChange={(value) => setNewRecognition(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">🔒 Privado</SelectItem>
                      <SelectItem value="team">👥 Equipo</SelectItem>
                      <SelectItem value="company">🏢 Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleCreateRecognition}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Reconocimiento
                </Button>
              </div>
            </Card>

            {/* Plantillas rápidas */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-warning" />
                  <span>Plantillas Rápidas</span>
                </CardTitle>
              </CardHeader>
              
              <div className="space-y-3">
                {recognitionTemplates.map((template) => {
                  const IconComponent = getCategoryIcon(template.category);
                  return (
                    <Card key={template.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => handleUseTemplate(template.id)}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}/10`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.message}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.suggestedRewards.slice(0, 2).map((reward, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reward}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Historial de Reconocimientos</h3>
              <p className="text-sm text-muted-foreground">
                Todos los reconocimientos enviados al equipo
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {recognitions.map((recognition) => {
              const IconComponent = getCategoryIcon(recognition.category);
              return (
                <Card key={recognition.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(recognition.category)}/10`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{recognition.title}</h4>
                          <Badge variant="secondary" className="capitalize">
                            {recognition.category}
                          </Badge>
                          <span className="text-sm">
                            {getVisibilityIcon(recognition.visibility)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span>Para: <strong>{recognition.to}</strong></span>
                          <span>De: {recognition.from}</span>
                          <span>{new Date(recognition.date).toLocaleDateString('es-ES')}</span>
                          <span className={getWellnessImpactColor(recognition.wellnessImpact)}>
                            💚 {Math.round(recognition.wellnessImpact * 100)}% impacto
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3">{recognition.message}</p>
                        
                        {recognition.reward && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Gift className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Recompensa: {recognition.reward}</span>
                          </div>
                        )}
                        
                        {/* Reacciones */}
                        <div className="flex items-center space-x-4">
                          <button 
                            className="flex items-center space-x-1 text-sm hover:text-primary transition-colors"
                            onClick={() => handleReaction(recognition.id, 'likes')}
                          >
                            <span>👍</span>
                            <span>{recognition.reactions.likes}</span>
                          </button>
                          <button 
                            className="flex items-center space-x-1 text-sm hover:text-destructive transition-colors"
                            onClick={() => handleReaction(recognition.id, 'hearts')}
                          >
                            <span>❤️</span>
                            <span>{recognition.reactions.hearts}</span>
                          </button>
                          <button 
                            className="flex items-center space-x-1 text-sm hover:text-warning transition-colors"
                            onClick={() => handleReaction(recognition.id, 'stars')}
                          >
                            <span>⭐</span>
                            <span>{recognition.reactions.stars}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Analytics del Sistema de Reconocimiento</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Métricas e insights sobre el impacto de los reconocimientos en el equipo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Reconocimientos por Categoría</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {recognitionCategories.map((category) => {
                    const count = recognitions.filter(r => r.category === category.value).length;
                    const percentage = recognitions.length > 0 ? (count / recognitions.length) * 100 : 0;
                    const IconComponent = category.icon;
                    
                    return (
                      <div key={category.value} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}/10`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Impacto en Bienestar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Impacto Positivo</span>
                    </div>
                    <p className="text-sm">
                      Los reconocimientos han mejorado el bienestar del equipo en un promedio del {Math.round(metrics.avgWellnessImpact * 100)}%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-info" />
                      <span className="text-sm font-medium text-info">Engagement</span>
                    </div>
                    <p className="text-sm">
                      Las reacciones promedio por reconocimiento: {Math.round((recognitions.reduce((sum, r) => sum + r.reactions.likes + r.reactions.hearts + r.reactions.stars, 0) / recognitions.length) || 0)} interacciones
                    </p>
                  </div>
                  
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-warning">Frecuencia</span>
                    </div>
                    <p className="text-sm">
                      Promedio de {Math.round(recognitions.length / 4)} reconocimientos por semana en el último mes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecognitionSystem;