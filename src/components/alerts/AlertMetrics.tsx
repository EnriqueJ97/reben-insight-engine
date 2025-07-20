import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

interface AlertMetricsProps {
  alerts: any[];
}

export const AlertMetrics = ({ alerts }: AlertMetricsProps) => {
  const metrics = useMemo(() => {
    const total = alerts.length;
    const unresolved = alerts.filter(alert => !alert.resolved).length;
    const resolved = alerts.filter(alert => alert.resolved).length;
    const highSeverity = alerts.filter(alert => alert.severity === 'high' && !alert.resolved).length;
    
    // Calculate trend (alerts in last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentAlerts = alerts.filter(alert => 
      new Date(alert.created_at) >= last7Days
    ).length;
    
    const previousAlerts = alerts.filter(alert => 
      new Date(alert.created_at) >= previous7Days && 
      new Date(alert.created_at) < last7Days
    ).length;
    
    const trend = recentAlerts - previousAlerts;
    
    return {
      total,
      unresolved,
      resolved,
      highSeverity,
      trend,
      recentAlerts
    };
  }, [alerts]);

  const getStatusColor = (value: number, isGood: boolean = false) => {
    if (isGood) {
      return value > 0 ? 'text-success' : 'text-muted-foreground';
    }
    if (value === 0) return 'text-success';
    if (value <= 3) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
          <Clock className={`h-4 w-4 ${getStatusColor(metrics.unresolved)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.unresolved)}`}>
            {metrics.unresolved}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.total} totales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alta Prioridad</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${getStatusColor(metrics.highSeverity)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.highSeverity)}`}>
            {metrics.highSeverity}
          </div>
          <p className="text-xs text-muted-foreground">
            Requieren atención inmediata
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
          <CheckCircle className={`h-4 w-4 ${getStatusColor(metrics.resolved, true)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.resolved, true)}`}>
            {metrics.resolved}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tendencia (7d)</CardTitle>
          <TrendingUp className={`h-4 w-4 ${
            metrics.trend > 0 ? 'text-destructive' : 
            metrics.trend < 0 ? 'text-success' : 'text-muted-foreground'
          }`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            metrics.trend > 0 ? 'text-destructive' : 
            metrics.trend < 0 ? 'text-success' : 'text-muted-foreground'
          }`}>
            {metrics.trend > 0 ? '+' : ''}{metrics.trend}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.recentAlerts} esta semana
          </p>
        </CardContent>
      </Card>
    </div>
  );
};