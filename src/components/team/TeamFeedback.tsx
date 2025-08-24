import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, ThumbsUp, ThumbsDown, Star, Heart, Lightbulb, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackItem {
  id: string;
  from: string;
  to: string;
  type: 'Positivo' | 'Constructivo';
  category: 'Liderazgo' | 'Trabajo en Equipo' | 'Innovación' | 'Comunicación' | 'Técnico';
  message: string;
  companyValues: string[];
  date: string;
  isPublic: boolean;
  reactions: {
    likes: number;
    hearts: number;
  };
}

interface FeedbackStats {
  totalReceived: number;
  totalGiven: number;
  positiveRatio: number;
  topCategories: string[];
  recentTrends: string[];
}

const TeamFeedback = () => {
  const { toast } = useToast();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      from: 'Manager',
      to: 'María García',
      type: 'Positivo',
      category: 'Liderazgo',
      message: 'María demostró excelente liderazgo durante la implementación del CRM, manteniendo al equipo motivado y enfocado.',
      companyValues: ['Liderazgo', 'Trabajo en Equipo'],
      date: '2024-03-20',
      isPublic: true,
      reactions: { likes: 5, hearts: 3 }
    },
    {
      id: '2',
      from: 'Ana Rodríguez',
      to: 'Carlos López',
      type: 'Constructivo',
      category: 'Comunicación',
      message: 'Carlos, sería genial si pudieras compartir más updates durante los standups. Tu expertise técnico es muy valioso para el equipo.',
      companyValues: ['Comunicación'],
      date: '2024-03-18',
      isPublic: false,
      reactions: { likes: 2, hearts: 1 }
    },
    {
      id: '3',
      from: 'Carlos López',
      to: 'Manager',
      type: 'Constructivo',
      category: 'Liderazgo',
      message: 'Agradecería más contexto sobre las decisiones estratégicas para poder alinear mejor mi trabajo con los objetivos.',
      companyValues: ['Transparencia'],
      date: '2024-03-15',
      isPublic: false,
      reactions: { likes: 1, hearts: 0 }
    }
  ]);

  const [stats] = useState<FeedbackStats>({
    totalReceived: 8,
    totalGiven: 12,
    positiveRatio: 75,
    topCategories: ['Liderazgo', 'Trabajo en Equipo', 'Comunicación'],
    recentTrends: ['Aumento en feedback positivo', 'Más feedback entre peers', 'Mejora en comunicación']
  });

  const [isGiveFeedbackOpen, setIsGiveFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const companyValues = [
    'Liderazgo', 'Innovación', 'Trabajo en Equipo', 'Transparencia', 
    'Excelencia', 'Compromiso', 'Respeto', 'Colaboración'
  ];

  const handleGiveFeedback = () => {
    toast({
      title: "Feedback enviado",
      description: "Tu feedback ha sido entregado correctamente.",
    });
    setIsGiveFeedbackOpen(false);
  };

  const getTypeIcon = (type: string) => {
    return type === 'Positivo' ? 
      <ThumbsUp className="w-4 h-4 text-green-500" /> : 
      <Lightbulb className="w-4 h-4 text-blue-500" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'Positivo' ? 'bg-green-500' : 'bg-blue-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Liderazgo': return '👑';
      case 'Trabajo en Equipo': return '🤝';
      case 'Innovación': return '💡';
      case 'Comunicación': return '💬';
      case 'Técnico': return '⚙️';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Centro de Feedback</h3>
        <Dialog open={isGiveFeedbackOpen} onOpenChange={setIsGiveFeedbackOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dar Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dar Feedback</DialogTitle>
              <DialogDescription>
                Comparte feedback constructivo o reconocimiento con tu equipo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient">Para</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">María García</SelectItem>
                      <SelectItem value="carlos">Carlos López</SelectItem>
                      <SelectItem value="ana">Ana Rodríguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de feedback" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positivo">🎉 Positivo / Reconocimiento</SelectItem>
                      <SelectItem value="constructivo">💡 Constructivo / Sugerencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Área de feedback" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liderazgo">👑 Liderazgo</SelectItem>
                    <SelectItem value="teamwork">🤝 Trabajo en Equipo</SelectItem>
                    <SelectItem value="comunicacion">💬 Comunicación</SelectItem>
                    <SelectItem value="innovacion">💡 Innovación</SelectItem>
                    <SelectItem value="tecnico">⚙️ Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea 
                  id="message" 
                  placeholder="Comparte tu feedback de manera constructiva y específica..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Valores de la empresa relacionados</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {companyValues.map((value) => (
                    <label key={value} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{value}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="public" className="rounded" />
                <Label htmlFor="public" className="text-sm">
                  Hacer público para inspirar al equipo
                </Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGiveFeedbackOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGiveFeedback}>
                Enviar Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="received">Recibido</TabsTrigger>
          <TabsTrigger value="given">Enviado</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          <div className="grid gap-4">
            {feedbackItems.filter(item => item.to !== 'Manager').map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(feedback.category)}</span>
                      <div>
                        <CardTitle className="text-base">{feedback.category}</CardTitle>
                        <p className="text-sm text-muted-foreground">De: {feedback.from}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(feedback.type)}>
                        <span className="text-white flex items-center gap-1">
                          {getTypeIcon(feedback.type)}
                          {feedback.type}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.message}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {feedback.companyValues.map((value) => (
                      <Badge key={value} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                      {feedback.isPublic && (
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{feedback.reactions.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{feedback.reactions.hearts}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Responder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="given" className="space-y-4">
          <div className="grid gap-4">
            {feedbackItems.filter(item => item.from === 'Manager').map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(feedback.category)}</span>
                      <div>
                        <CardTitle className="text-base">{feedback.category}</CardTitle>
                        <p className="text-sm text-muted-foreground">Para: {feedback.to}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getTypeColor(feedback.type)}>
                      <span className="text-white flex items-center gap-1">
                        {getTypeIcon(feedback.type)}
                        {feedback.type}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.message}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {feedback.companyValues.map((value) => (
                      <Badge key={value} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {feedback.isPublic ? (
                        <Badge variant="outline" className="text-xs">Público</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Privado</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4">
            {feedbackItems.filter(item => item.isPublic).map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(feedback.category)}</span>
                      <div>
                        <CardTitle className="text-base">{feedback.from} → {feedback.to}</CardTitle>
                        <p className="text-sm text-muted-foreground">{feedback.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getTypeColor(feedback.type)}>
                      <span className="text-white flex items-center gap-1">
                        {getTypeIcon(feedback.type)}
                        {feedback.type}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{feedback.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {feedback.companyValues.map((value) => (
                        <Badge key={value} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{feedback.reactions.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{feedback.reactions.hearts}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalReceived}</p>
                    <p className="text-sm text-muted-foreground">Feedback Recibido</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalGiven}</p>
                    <p className="text-sm text-muted-foreground">Feedback Dado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.positiveRatio}%</p>
                    <p className="text-sm text-muted-foreground">Feedback Positivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">4.2</p>
                    <p className="text-sm text-muted-foreground">Calidad Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Feedback del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Categorías Más Activas</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.topCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      <span>{getCategoryIcon(category)}</span>
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Insights Recientes</h4>
                <div className="space-y-2">
                  {stats.recentTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      {trend}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nube de Palabras Positivas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {['excelente', 'comprometido', 'innovador', 'colaborativo', 'proactivo', 'líder', 'creativo', 'confiable'].map((word) => (
                  <span key={word} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {word}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamFeedback;