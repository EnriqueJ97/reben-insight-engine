import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReportData } from '@/hooks/useReports';

interface StoryTilesProps {
  reportData: ReportData | null;
  period: string;
}

export const StoryTiles = ({ reportData, period }: StoryTilesProps) => {
  if (!reportData) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-pulse h-4 w-4 bg-muted rounded"></div>
            <span className="text-sm">Cargando análisis narrativo...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 2) return `subió +${trend} puntos`;
    if (trend < -2) return `bajó ${trend} puntos`;
    return 'se mantuvo estable';
  };

  // Generate narrative based on data
  const wellnessTrend = reportData.wellness_score - 65; // Assuming baseline of 65
  const alertChange = (reportData.total_alerts || 0) - (reportData.critical_alerts || 0) * 2;
  const participationRate = Math.round(((reportData.total_checkins || 0) / 100) * 85);
  
  const bestTeam = reportData.team_breakdown?.reduce((best, current) => 
    current.wellness_score > (best?.wellness_score || 0) ? current : best
  );

  const periodText = period === '7d' ? '7 días' : period === '30d' ? '30 días' : period === '90d' ? '3 meses' : '1 año';

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getTrendIcon(wellnessTrend)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
              <span>📊 Resumen Ejecutivo</span>
              <Badge variant="outline" className="text-xs">{periodText}</Badge>
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <span className="font-medium text-foreground">En los últimos {periodText}</span>{' '}
                el bienestar organizacional {getTrendText(wellnessTrend)}, 
                {wellnessTrend > 0 && (
                  <span className="text-success font-medium"> impulsado por mejoras en el ambiente laboral</span>
                )}
                {wellnessTrend < 0 && (
                  <span className="text-destructive font-medium"> requiriendo atención en las áreas de mayor carga</span>
                )}
                {Math.abs(wellnessTrend) <= 2 && (
                  <span className="text-muted-foreground"> manteniéndose en niveles consistentes</span>
                )}.
              </p>
              
              {participationRate > 70 && (
                <p>
                  <span className="font-medium text-success">Excelente participación</span> del {participationRate}% 
                  de los empleados en las evaluaciones de bienestar.
                </p>
              )}
              
              {bestTeam && (
                <p>
                  El equipo con mejor rendimiento alcanzó un{' '}
                  <span className="font-medium text-success">{Math.round(bestTeam.wellness_score)}% de bienestar</span>, 
                  marcando el camino a seguir para el resto de la organización.
                </p>
              )}
              
              {(reportData.critical_alerts || 0) > 0 ? (
                <p>
                  <span className="font-medium text-warning">Se identificaron {reportData.critical_alerts} alertas críticas</span>{' '}
                  que requieren intervención inmediata del equipo de RR.HH.
                </p>
              ) : (
                <p>
                  <span className="font-medium text-success">No se detectaron alertas críticas</span>, 
                  indicando un ambiente laboral saludable.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};