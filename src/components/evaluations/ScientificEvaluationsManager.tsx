import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EvaluationConstructor } from './EvaluationConstructor';
import { EvaluationAnalytics } from './EvaluationAnalytics';
import { useToast } from '@/hooks/use-toast';
import { 
  Microscope, 
  Construction, 
  BarChart3, 
  FileText, 
  Play, 
  Pause, 
  Eye,
  Download,
  Brain,
  Target,
  Clock,
  Users
} from 'lucide-react';

interface EvaluationCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  template: string;
  participants: number;
  responses: number;
  responseRate: number;
  createdAt: string;
  launchedAt?: string;
  estimatedMinutes: number;
  totalItems: number;
}

const mockCampaigns: EvaluationCampaign[] = [
  {
    id: '1',
    name: 'Evaluación Burnout Q1 2024',
    status: 'active',
    template: 'MBI + CBI + WHO-5',
    participants: 245,
    responses: 203,
    responseRate: 82.9,
    createdAt: '2024-01-15',
    launchedAt: '2024-01-20',
    estimatedMinutes: 15,
    totalItems: 46
  },
  {
    id: '2', 
    name: 'Engagement y Motivación - Equipos IT',
    status: 'active',
    template: 'UWES + WEIMS',
    participants: 78,
    responses: 71,
    responseRate: 91.0,
    createdAt: '2024-02-01',
    launchedAt: '2024-02-05',
    estimatedMinutes: 12,
    totalItems: 35
  },
  {
    id: '3',
    name: 'Satisfacción Laboral Anual',
    status: 'completed',
    template: 'JSS + Psychological Safety',
    participants: 312,
    responses: 287,
    responseRate: 92.0,
    createdAt: '2023-12-01',
    launchedAt: '2023-12-10',
    estimatedMinutes: 18,
    totalItems: 43
  },
  {
    id: '4',
    name: 'Liderazgo Transformacional - Managers',
    status: 'draft',
    template: 'MLQ-5X + LMX',
    participants: 45,
    responses: 0,
    responseRate: 0,
    createdAt: '2024-02-15',
    estimatedMinutes: 20,
    totalItems: 52
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <Play className="w-4 h-4" />;
    case 'paused': return <Pause className="w-4 h-4" />;
    case 'completed': return <Target className="w-4 h-4" />;
    case 'draft': return <FileText className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export const ScientificEvaluationsManager = () => {
  const [campaigns, setCampaigns] = useState<EvaluationCampaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<EvaluationCampaign | null>(null);
  const { toast } = useToast();

  const handleCampaignAction = (campaignId: string, action: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    switch (action) {
      case 'pause':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'paused' as const } : c
        ));
        toast({ title: "Campaña pausada", description: `"${campaign.name}" ha sido pausada` });
        break;
      case 'resume':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'active' as const } : c
        ));
        toast({ title: "Campaña reanudada", description: `"${campaign.name}" ha sido reanudada` });
        break;
      case 'launch':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: 'active' as const, launchedAt: new Date().toISOString().split('T')[0] } : c
        ));
        toast({ title: "Campaña lanzada", description: `"${campaign.name}" ha sido lanzada exitosamente` });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Microscope className="w-8 h-8 text-primary" />
            Evaluaciones Científicas
          </h2>
          <p className="text-muted-foreground mt-1">
            Instrumentos validados para medir burnout, engagement, satisfacción y bienestar organizacional
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
          <Button variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Análisis IA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campañas Activas</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participantes Totales</p>
                <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.participants, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
                <p className="text-2xl font-bold">
                  {(campaigns.reduce((sum, c) => sum + (c.responses / c.participants * 100), 0) / campaigns.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {Math.round(campaigns.reduce((sum, c) => sum + c.estimatedMinutes, 0) / campaigns.length)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">
            <FileText className="w-4 h-4 mr-2" />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="constructor">
            <Construction className="w-4 h-4 mr-2" />
            Constructor
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Microscope className="w-4 h-4 mr-2" />
            Plantillas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campañas de Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1 capitalize">{campaign.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Plantilla</p>
                              <p className="font-medium">{campaign.template}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Participantes</p>
                              <p className="font-medium">{campaign.participants} usuarios</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Respuestas</p>
                              <p className="font-medium">{campaign.responses} ({campaign.responseRate.toFixed(1)}%)</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duración</p>
                              <p className="font-medium">{campaign.estimatedMinutes} min ({campaign.totalItems} ítems)</p>
                            </div>
                          </div>

                          {campaign.status === 'active' && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso</span>
                                <span>{campaign.responseRate.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${campaign.responseRate}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => handleCampaignAction(campaign.id, 'launch')}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Lanzar
                            </Button>
                          )}
                          
                          {campaign.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCampaignAction(campaign.id, 'pause')}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pausar
                            </Button>
                          )}
                          
                          {campaign.status === 'paused' && (
                            <Button
                              size="sm"
                              onClick={() => handleCampaignAction(campaign.id, 'resume')}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Reanudar
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Resultados
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constructor">
          <EvaluationConstructor />
        </TabsContent>

        <TabsContent value="analytics">
          <EvaluationAnalytics />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Predefinidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔥</span>
                      <h3 className="font-semibold">Screening Burnout</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      MBI + CBI + GHQ-12 para detección temprana de burnout
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>38 ítems</span>
                      <span>12 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">⚡</span>
                      <h3 className="font-semibold">Engagement Completo</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      UWES + WEIMS + OCQ para medir engagement y motivación
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>53 ítems</span>
                      <span>18 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">😊</span>
                      <h3 className="font-semibold">Satisfacción 360°</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      JSS + Psychological Safety + Work-Life Balance
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>60 ítems</span>
                      <span>20 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">👑</span>
                      <h3 className="font-semibold">Liderazgo Transformacional</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      MLQ-5X + LMX para evaluar estilos de liderazgo
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>52 ítems</span>
                      <span>16 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>

                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🧘</span>
                      <h3 className="font-semibold">Bienestar Express</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      WHO-5 + GHQ-12 para screening rápido de bienestar
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>17 ítems</span>
                      <span>5 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>

                <Card className="bg-pink-50 border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🤝</span>
                      <h3 className="font-semibold">Inclusión & Diversidad</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Psychological Safety + Diversity Climate Survey
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <span>25 ítems</span>
                      <span>8 min</span>
                    </div>
                    <Button size="sm" className="w-full">Usar Plantilla</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};