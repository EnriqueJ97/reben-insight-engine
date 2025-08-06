import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface EnhancedWellnessMetric {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  description?: string;
  icon?: React.ComponentType<any>;
  delta?: number; // Cambio en últimos 7 días
  formula?: string; // Fórmula de cálculo para tooltip
  sparklineData?: number[]; // 7 puntos para mini gráfico
}

interface EnhancedWellnessMetricsProps {
  metrics: EnhancedWellnessMetric[];
  className?: string;
}

export const EnhancedWellnessMetrics = ({ metrics, className }: EnhancedWellnessMetricsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success/10 border-success/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      case 'critical': return 'bg-destructive/10 border-destructive/20';
      default: return 'bg-muted border-muted';
    }
  };

  const getTrendIcon = (trend: string, delta?: number) => {
    const deltaText = delta ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : '';
    switch (trend) {
      case 'up': return (
        <div className="flex items-center text-success">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs ml-1">{deltaText}</span>
        </div>
      );
      case 'down': return (
        <div className="flex items-center text-destructive">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs ml-1">{deltaText}</span>
        </div>
      );
      default: return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-xs ml-1">{deltaText}</span>
        </div>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <Badge className="bg-success/20 text-success border-success/30">Bueno</Badge>;
      case 'warning': return <Badge className="bg-warning/20 text-warning border-warning/30">Atención</Badge>;
      case 'critical': return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Crítico</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getParticipationBadge = (value: number) => {
    if (value >= 70) return <Badge className="bg-success/20 text-success border-success/30">Alta</Badge>;
    if (value >= 40) return <Badge className="bg-warning/20 text-warning border-warning/30">Media</Badge>;
    return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Baja</Badge>;
  };

  const renderSparkline = (data: number[]) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end space-x-1 h-8 w-16 mt-2">
        {data.map((value, index) => {
          const height = Math.max(2, ((value - min) / range) * 24);
          return (
            <div
              key={index}
              className="flex-1 bg-primary/30 rounded-t-sm"
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          
          return (
            <Card key={index} className={`relative overflow-hidden border-2 ${getStatusBg(metric.status)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{metric.title}</span>
                  </span>
                  {metric.formula && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{metric.formula}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.title === 'Participación' ? `${metric.value}%` : 
                     metric.title === 'Miembros en Riesgo Alto' ? metric.value :
                     metric.title === 'Alertas Activas' ? metric.value :
                     `${metric.value}%`}
                  </span>
                  {getTrendIcon(metric.trend, metric.delta)}
                </div>
                
                {metric.title !== 'Miembros en Riesgo Alto' && metric.title !== 'Alertas Activas' && (
                  <Progress 
                    value={metric.value} 
                    className="h-2 mb-2"
                  />
                )}
                
                <div className="flex items-center justify-between mb-2">
                  {metric.title === 'Participación' ? 
                    getParticipationBadge(metric.value) : 
                    getStatusBadge(metric.status)
                  }
                </div>
                
                {metric.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </p>
                )}
                
                {/* Mini sparkline histórico */}
                {metric.sparklineData && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">7 días</span>
                    {renderSparkline(metric.sparklineData)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};