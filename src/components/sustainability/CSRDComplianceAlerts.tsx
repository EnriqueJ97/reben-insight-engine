import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, ExternalLink } from 'lucide-react';
import { useCSRDCompliance } from '@/hooks/useCSRDCompliance';
import { toast } from 'sonner';

interface ComplianceAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  action_required: boolean;
  deadline?: Date;
  related_data_points?: string[];
}

export const CSRDComplianceAlerts = () => {
  const { metrics, detectComplianceGaps } = useCSRDCompliance();
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const gaps = await detectComplianceGaps();
      
      const generatedAlerts: ComplianceAlert[] = [];

      // Alerta de deadline cercano
      if (metrics.daysToDeadline < 90 && metrics.daysToDeadline > 0) {
        generatedAlerts.push({
          id: 'deadline_warning',
          severity: metrics.daysToDeadline < 30 ? 'critical' : 'high',
          category: 'Deadline',
          title: `Deadline CSRD en ${metrics.daysToDeadline} días`,
          description: `El plazo para presentar el reporte CSRD se aproxima. Quedan ${metrics.daysToDeadline} días.`,
          action_required: true,
          deadline: new Date(Date.now() + metrics.daysToDeadline * 24 * 60 * 60 * 1000)
        });
      }

      // Alertas de gaps críticos
      if (metrics.criticalGaps > 0) {
        generatedAlerts.push({
          id: 'critical_gaps',
          severity: 'critical',
          category: 'Datos Faltantes',
          title: `${metrics.criticalGaps} datos obligatorios sin completar`,
          description: `Existen ${metrics.criticalGaps} puntos de datos ESRS obligatorios que aún no han sido completados.`,
          action_required: true,
          related_data_points: gaps.filter(g => g.is_mandatory).map(g => g.code)
        });
      }

      // Alerta de compliance bajo
      if (metrics.complianceIndex < 50) {
        generatedAlerts.push({
          id: 'low_compliance',
          severity: 'critical',
          category: 'Cumplimiento',
          title: 'Índice de cumplimiento muy bajo',
          description: `El índice de cumplimiento actual es del ${metrics.complianceIndex}%, muy por debajo del objetivo del 90%.`,
          action_required: true
        });
      } else if (metrics.complianceIndex < 75) {
        generatedAlerts.push({
          id: 'medium_compliance',
          severity: 'high',
          category: 'Cumplimiento',
          title: 'Índice de cumplimiento necesita mejora',
          description: `El índice de cumplimiento actual es del ${metrics.complianceIndex}%. Se recomienda alcanzar al menos 90%.`,
          action_required: true
        });
      }

      // Alerta de datos estimados
      if (metrics.estimatedDataPoints > metrics.completedDataPoints * 0.3) {
        generatedAlerts.push({
          id: 'too_many_estimates',
          severity: 'medium',
          category: 'Calidad de Datos',
          title: 'Demasiados datos estimados',
          description: `${metrics.estimatedDataPoints} puntos de datos son estimaciones. Los auditores pueden requerir datos reales.`,
          action_required: false
        });
      }

      // Alerta de aseguramiento
      const currentYear = new Date().getFullYear();
      if (currentYear >= 2028) {
        generatedAlerts.push({
          id: 'assurance_upgrade',
          severity: 'high',
          category: 'Aseguramiento',
          title: 'Se requiere aseguramiento razonable',
          description: 'A partir de 2028, se requiere aseguramiento razonable (no limitado) para los reportes CSRD.',
          action_required: true
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Error cargando alertas');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Clock className="w-5 h-5" />;
      default:
        return <TrendingDown className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Cumplimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alertas de Cumplimiento CSRD
          </CardTitle>
          <Badge variant={alerts.length > 0 ? "destructive" : "default"}>
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No hay alertas activas. El cumplimiento CSRD está en buen estado.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-2 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h3 className="font-semibold">{alert.title}</h3>
                      <p className="text-sm mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alert.category}
                  </Badge>
                </div>

                {alert.deadline && (
                  <div className="mt-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {alert.deadline.toLocaleDateString('es-ES')}</span>
                  </div>
                )}

                {alert.related_data_points && alert.related_data_points.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2">Data points afectados:</p>
                    <div className="flex flex-wrap gap-1">
                      {alert.related_data_points.slice(0, 5).map((dp) => (
                        <Badge key={dp} variant="secondary" className="text-xs">
                          {dp}
                        </Badge>
                      ))}
                      {alert.related_data_points.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alert.related_data_points.length - 5} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alert.action_required && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Tomar Acción
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
