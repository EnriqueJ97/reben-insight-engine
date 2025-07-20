
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Heart, Users } from 'lucide-react';

interface WellnessMetric {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'danger';
  description?: string;
}

interface WellnessMetricsProps {
  metrics: WellnessMetric[];
  className?: string;
}

export const WellnessMetrics = ({ metrics, className }: WellnessMetricsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'danger': return 'bg-destructive/10';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.value}%
              </span>
              {getTrendIcon(metric.trend)}
            </div>
            
            <Progress 
              value={metric.value} 
              className="h-2 mb-2"
            />
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className={`${getStatusBg(metric.status)} ${getStatusColor(metric.status)} text-xs`}
              >
                {metric.status === 'good' && 'Bueno'}
                {metric.status === 'warning' && 'Atención'}
                {metric.status === 'danger' && 'Riesgo'}
              </Badge>
            </div>
            
            {metric.description && (
              <p className="text-xs text-muted-foreground mt-2">
                {metric.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface WellnessOverviewProps {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalEmployees: number;
  activeAlerts: number;
}

export const WellnessOverview = ({ 
  overallScore, 
  riskLevel, 
  totalEmployees, 
  activeAlerts 
}: WellnessOverviewProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10';
      case 'medium': return 'bg-warning/10';
      case 'high': return 'bg-destructive/10';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-primary" />
          <span>Resumen de Bienestar</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{overallScore}%</div>
            <p className="text-sm text-muted-foreground">Puntuación General</p>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getRiskColor(riskLevel)}`}>
              {riskLevel === 'low' && '🟢'}
              {riskLevel === 'medium' && '🟡'}
              {riskLevel === 'high' && '🔴'}
            </div>
            <p className="text-sm text-muted-foreground">Nivel de Riesgo</p>
            <Badge 
              variant="secondary" 
              className={`mt-1 ${getRiskBg(riskLevel)} ${getRiskColor(riskLevel)}`}
            >
              {riskLevel === 'low' && 'Bajo'}
              {riskLevel === 'medium' && 'Medio'}
              {riskLevel === 'high' && 'Alto'}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">{totalEmployees}</div>
            <p className="text-sm text-muted-foreground">Empleados Totales</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">{activeAlerts}</div>
            <p className="text-sm text-muted-foreground">Alertas Activas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
