import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EvaluationConstructor } from './EvaluationConstructor';
import { EvaluationAnalytics } from './EvaluationAnalytics';
import { EvaluationInsights } from '../analytics/EvaluationInsights';
import { useToast } from '@/hooks/use-toast';
import { useEvaluations } from '@/hooks/useEvaluations';
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
  const { 
    campaigns, 
    loading, 
    activeCampaigns, 
    completedCampaigns,
    fetchCampaigns 
  } = useEvaluations();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCampaignAction = async (campaignId: string, action: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      // Here you would call the appropriate Supabase functions to update campaign status
      // For now, we'll just show the toast and refetch data
      toast({ 
        title: "Acción realizada", 
        description: `Campaña "${campaign.name}" ${action === 'pause' ? 'pausada' : action === 'resume' ? 'reanudada' : 'lanzada'}` 
      });
      
      // Refetch campaigns to get updated data
      await fetchCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar la acción",
        variant: "destructive"
      });
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
                  <p className="text-2xl font-bold">{activeCampaigns.length}</p>
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
                  <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.total_participants, 0)}</p>
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
                    {campaigns.length > 0 ? 
                      (campaigns.reduce((sum, c) => sum + c.response_rate, 0) / campaigns.length).toFixed(1)
                      : 0}%
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
                  <p className="text-sm text-muted-foreground">Respuestas Completadas</p>
                  <p className="text-2xl font-bold">
                    {campaigns.reduce((sum, c) => sum + c.completed_responses, 0)}
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
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No hay campañas de evaluación</h3>
                  <p>Crea tu primera evaluación científica usando el Constructor</p>
                </div>
              ) : (
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
                              <p className="text-muted-foreground">Descripción</p>
                              <p className="font-medium">{campaign.description || 'Sin descripción'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Participantes</p>
                              <p className="font-medium">{campaign.total_participants} usuarios</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Respuestas</p>
                              <p className="font-medium">{campaign.completed_responses} ({campaign.response_rate.toFixed(1)}%)</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Estado</p>
                              <p className="font-medium capitalize">{campaign.anonymous ? 'Anónima' : 'Identificada'}</p>
                            </div>
                          </div>

                          {campaign.status === 'active' && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso</span>
                                <span>{campaign.response_rate.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${campaign.response_rate}%` }}
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
                            onClick={() => setSelectedCampaign(campaign.id)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="constructor">
          <EvaluationConstructor />
        </TabsContent>

        <TabsContent value="analytics">
          <EvaluationInsights />
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

      {/* Results Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[200]">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">
                    Resultados: {campaigns.find(c => c.id === selectedCampaign)?.name}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Análisis científico de la evaluación
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCampaign(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
              <EvaluationInsights />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};