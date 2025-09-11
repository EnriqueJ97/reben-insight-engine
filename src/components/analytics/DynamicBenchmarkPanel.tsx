import { useEffect } from 'react';
import { useDynamicBenchmarking } from '@/hooks/useDynamicBenchmarking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TrendingUp, Building, Users, Target, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface DynamicBenchmarkPanelProps {
  period?: string;
  scope?: string;
}

const DynamicBenchmarkPanel = ({ period = '30', scope = 'all' }: DynamicBenchmarkPanelProps) => {
  const { loading, benchmarkData, refreshBenchmarks } = useDynamicBenchmarking();

  useEffect(() => {
    refreshBenchmarks();
  }, [period, refreshBenchmarks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-yellow-600';
    if (percentile >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'wellness_score': return 'Puntuación de Bienestar';
      case 'burnout_index': return 'Índice de Burnout';
      case 'participation_rate': return 'Tasa de Participación';
      case 'turnover_rate': return 'Tasa de Rotación';
      default: return metric;
    }
  };

  const getCompetitiveColor = (index: number) => {
    if (index >= 80) return 'text-green-600 bg-green-50';
    if (index >= 60) return 'text-yellow-600 bg-yellow-50';
    if (index >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {benchmarkData && (
        <>
          {/* Context Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Contexto de Benchmarking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Industria</p>
                  <p className="font-semibold capitalize">{benchmarkData.context.industry}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Tamaño</p>
                  <p className="font-semibold capitalize">{benchmarkData.context.companySize}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Región</p>
                  <p className="font-semibold capitalize">{benchmarkData.context.region}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-semibold">{benchmarkData.context.timeframe}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Index */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Índice Competitivo General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getPercentileColor(benchmarkData.competitiveIndex)}`}>
                  {benchmarkData.competitiveIndex.toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Percentil vs Competencia</p>
                <Progress value={benchmarkData.competitiveIndex} className="h-3" />
                <Badge className={`mt-2 ${getCompetitiveColor(benchmarkData.competitiveIndex)}`}>
                  {benchmarkData.competitiveIndex >= 75 ? 'Líder del Sector' :
                   benchmarkData.competitiveIndex >= 50 ? 'Por Encima del Promedio' :
                   benchmarkData.competitiveIndex >= 25 ? 'Promedio del Sector' :
                   'Por Debajo del Promedio'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benchmarkData.metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {getMetricLabel(metric.metric)}
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nuestro Valor</span>
                    <span className="font-bold text-lg">{metric.ourValue.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cuartil Superior</span>
                      <span className="text-green-600">{metric.topQuartile.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Promedio Industria</span>
                      <span className="text-gray-600">{metric.industryAverage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cuartil Inferior</span>
                      <span className="text-red-600">{metric.bottomQuartile.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Percentil</span>
                      <span className={`font-semibold ${getPercentileColor(metric.percentile)}`}>
                        {metric.percentile.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={metric.percentile} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Confianza</span>
                    <span>{(metric.confidenceLevel * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          {benchmarkData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recomendaciones Estratégicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benchmarkData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DynamicBenchmarkPanel;