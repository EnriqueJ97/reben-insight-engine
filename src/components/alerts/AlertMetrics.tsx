import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Timer, Filter } from 'lucide-react';
import { useMemo } from 'react';

interface AlertMetricsProps {
  alerts: any[];
  onHighPriorityFilter?: () => void;
}

export const AlertMetrics = ({ alerts, onHighPriorityFilter }: AlertMetricsProps) => {
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
    
    // Calculate average resolution time for resolved alerts
    const resolvedWithTimes = alerts.filter(alert => 
      alert.resolved && alert.resolved_at && alert.created_at
    );
    
    const avgResolutionTime = resolvedWithTimes.length > 0
      ? resolvedWithTimes.reduce((sum, alert) => {
          const created = new Date(alert.created_at);
          const resolved = new Date(alert.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0) / resolvedWithTimes.length
      : 0;
    
    // Convert to hours
    const avgResolutionHours = Math.round(avgResolutionTime / (1000 * 60 * 60));
    
    // SLA: objetivo < 48h para alta prioridad, < 72h para media/baja
    const slaTarget = 48; // hours
    const slaStatus = avgResolutionHours <= slaTarget ? 'good' : 
                     avgResolutionHours <= slaTarget * 1.5 ? 'warning' : 'critical';
    
    return {
      total,
      unresolved,
      resolved,
      highSeverity,
      trend,
      recentAlerts,
      avgResolutionHours,
      slaStatus,
      slaTarget
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

  const getSLAColor = () => {
    switch (metrics.slaStatus) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de alta prioridad clickeable */}
      {metrics.highSeverity > 0 && (
        <Card 
          className="border-destructive bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors"
          onClick={onHighPriorityFilter}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">
                    {metrics.highSeverity} alertas de alta prioridad requieren atención inmediata
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Haz clic para filtrar y revisar las alertas críticas
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Ver críticas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        <Card 
          className={metrics.highSeverity > 0 ? "border-destructive/50 cursor-pointer hover:border-destructive" : ""}
          onClick={metrics.highSeverity > 0 ? onHighPriorityFilter : undefined}
        >
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
            <CardTitle className="text-sm font-medium">TMR / SLA</CardTitle>
            <Timer className={`h-4 w-4 ${getSLAColor()}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSLAColor()}`}>
              {metrics.avgResolutionHours}h
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge 
                variant={metrics.slaStatus === 'good' ? 'default' : 
                        metrics.slaStatus === 'warning' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {metrics.slaStatus === 'good' ? '🟢' : 
                 metrics.slaStatus === 'warning' ? '🟡' : '🔴'} SLA {metrics.slaTarget}h
              </Badge>
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
    </div>
  );
};