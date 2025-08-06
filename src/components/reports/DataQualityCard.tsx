import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ReportData } from '@/hooks/useReports';

interface DataQualityCardProps {
  reportData: ReportData | null;
  period: string;
}

export const DataQualityCard = ({ reportData, period }: DataQualityCardProps) => {
  // Calculate data quality metrics
  const totalExpectedResponses = 100; // Expected responses based on active employees
  const actualResponses = reportData?.total_checkins || 0;
  const responseRate = Math.round((actualResponses / totalExpectedResponses) * 100);
  
  // Mock integration health
  const integrationHealth = {
    slack: true,
    email: true,
    calendar: false // Simulate one integration issue
  };
  
  const healthyIntegrations = Object.values(integrationHealth).filter(Boolean).length;
  const totalIntegrations = Object.keys(integrationHealth).length;
  const integrationScore = Math.round((healthyIntegrations / totalIntegrations) * 100);
  
  // Calculate overall data quality score
  const dataQualityScore = Math.round((responseRate * 0.6) + (integrationScore * 0.4));
  
  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-4 w-4 text-success" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="cursor-help hover:bg-muted/50 transition-colors">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getQualityIcon(dataQualityScore)}
                  <span className="text-sm font-medium">Calidad de datos</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <Badge 
                  variant="outline" 
                  className={getQualityColor(dataQualityScore)}
                >
                  {dataQualityScore}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Métricas de Calidad</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tasa de respuesta:</span>
                  <span className={responseRate >= 70 ? 'text-success' : 'text-warning'}>
                    {responseRate}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Integraciones activas:</span>
                  <span className={integrationScore >= 80 ? 'text-success' : 'text-warning'}>
                    {healthyIntegrations}/{totalIntegrations}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Respuestas recibidas:</span>
                  <span>{actualResponses}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-2">
              <h5 className="font-medium text-xs mb-1">Estado de Integraciones</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Slack:</span>
                  <span className={integrationHealth.slack ? 'text-success' : 'text-destructive'}>
                    {integrationHealth.slack ? '✓ Activa' : '✗ Error'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className={integrationHealth.email ? 'text-success' : 'text-destructive'}>
                    {integrationHealth.email ? '✓ Activa' : '✗ Error'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Calendario:</span>
                  <span className={integrationHealth.calendar ? 'text-success' : 'text-destructive'}>
                    {integrationHealth.calendar ? '✓ Activa' : '✗ Error'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-2 text-xs text-muted-foreground">
              <p>
                {dataQualityScore >= 85 && "Excelente calidad de datos. Los resultados son muy confiables."}
                {dataQualityScore >= 70 && dataQualityScore < 85 && "Buena calidad de datos. Algunos resultados pueden tener variaciones menores."}
                {dataQualityScore < 70 && "Calidad de datos mejorable. Considera aumentar la participación o revisar integraciones."}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};