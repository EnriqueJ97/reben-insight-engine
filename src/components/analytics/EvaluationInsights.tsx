import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useEvaluations } from '@/hooks/useEvaluations';
import { SCIENTIFIC_INSTRUMENTS } from '@/data/scientific-instruments';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Users, 
  BarChart3,
  Activity,
  Brain,
  Heart,
  Shield
} from 'lucide-react';

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

const RISK_ICONS = {
  low: Shield,
  medium: Activity,
  high: AlertTriangle,
  critical: AlertTriangle
};

const CATEGORY_ICONS = {
  burnout: '🔥',
  engagement: '⚡',
  satisfaction: '😊',
  climate: '🌤️',
  leadership: '👑',
  wellbeing: '🧘',
  inclusion: '🤝',
  flexibility: '⚖️',
  commitment: '💪'
};

export const EvaluationInsights = () => {
  const { 
    analytics, 
    campaigns, 
    loading, 
    getOrganizationalAnalytics, 
    getRiskAssessment,
    getCampaignAnalytics 
  } = useEvaluations();

  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const orgAnalytics = getOrganizationalAnalytics();
  const riskAssessment = getRiskAssessment();
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  
  const displayAnalytics = selectedCampaign === 'all' 
    ? orgAnalytics 
    : getCampaignAnalytics(selectedCampaign);

  const groupedByInstrument = displayAnalytics.reduce((acc, item) => {
    const key = item.instrument_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof displayAnalytics>);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Resumen de Evaluaciones Científicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{campaigns.length}</p>
              <p className="text-sm text-muted-foreground">Evaluaciones Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeCampaigns.length}</p>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {campaigns.reduce((sum, c) => sum + c.completed_responses, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Respuestas</p>
            </div>
            <div className="text-center">
              <Badge className={RISK_COLORS[riskAssessment.riskLevel as keyof typeof RISK_COLORS]}>
                {riskAssessment.riskLevel.toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground">Riesgo General</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Distribución de Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(riskAssessment.riskCounts).map(([level, count]) => {
              const Icon = RISK_ICONS[level as keyof typeof RISK_ICONS];
              return (
                <div key={level} className="text-center">
                  <div className={`p-3 rounded-lg ${RISK_COLORS[level as keyof typeof RISK_COLORS]} mb-2`}>
                    <Icon className="w-6 h-6 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{level}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resultados por Instrumento
            </CardTitle>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Todos los resultados</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="detailed">Detallado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(groupedByInstrument).map(([instrumentId, instrumentAnalytics]) => {
                  const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === instrumentId);
                  if (!instrument) return null;

                  const avgScore = instrumentAnalytics.reduce((sum, a) => sum + a.score, 0) / instrumentAnalytics.length;
                  const worstRisk = instrumentAnalytics.reduce((worst, current) => {
                    const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
                    return riskLevels[current.risk_level] > riskLevels[worst] ? current.risk_level : worst;
                  }, 'low' as any);

                  return (
                    <Card key={instrumentId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {CATEGORY_ICONS[instrument.category as keyof typeof CATEGORY_ICONS]}
                            </span>
                            <div>
                              <h4 className="font-medium">{instrument.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {instrument.abbreviation} • {instrumentAnalytics.length} dimensiones
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-semibold">
                                {Math.round(avgScore)}
                              </span>
                              <Badge className={RISK_COLORS[worstRisk]}>
                                {worstRisk}
                              </Badge>
                            </div>
                            <Progress value={avgScore} className="w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {displayAnalytics.map((item) => {
                const instrument = SCIENTIFIC_INSTRUMENTS.find(i => i.id === item.instrument_id);
                const dimension = item.dimension_id ? 
                  instrument?.dimensions.find(d => d.id === item.dimension_id) : null;

                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{instrument?.abbreviation}</Badge>
                            {dimension && (
                              <Badge variant="secondary">{dimension.name}</Badge>
                            )}
                            <Badge className={RISK_COLORS[item.risk_level]}>
                              {item.risk_level}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">
                            {dimension ? dimension.name : instrument?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {dimension ? dimension.description : instrument?.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.sample_size} participantes
                            </span>
                            {item.confidence_interval && (
                              <span>
                                CI: {Math.round(item.confidence_interval.low)}-{Math.round(item.confidence_interval.high)}
                              </span>
                            )}
                            {item.benchmark_data?.industry_percentile && (
                              <span>
                                Percentil: {item.benchmark_data.industry_percentile}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {Math.round(item.score)}
                          </div>
                          <Progress value={item.score} className="w-20 mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.calculated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Items */}
      {riskAssessment.riskCounts.critical > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Acciones Requeridas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Se detectaron {riskAssessment.riskCounts.critical} métricas en estado crítico que requieren atención inmediata.
            </p>
            <Button variant="destructive" size="sm">
              Ver Plan de Acción
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};