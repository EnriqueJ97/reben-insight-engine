import { useEffect } from 'react';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown, Activity, Zap, Clock } from 'lucide-react';

interface AnomalyDetectionPanelProps {
  period?: string;
  scope?: string;
}

const AnomalyDetectionPanel = ({ period = '30', scope = 'all' }: AnomalyDetectionPanelProps) => {
  const { user } = useAuth();
  const { loading, anomalies, detectAnomalies } = useAnomalyDetection();

  useEffect(() => {
    if (user?.tenant_id) {
      detectAnomalies(30);
    }
  }, [user?.tenant_id, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Zap className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sudden_drop': return 'Caída Súbita';
      case 'consistent_decline': return 'Declive Consistente';
      case 'volatility_spike': return 'Volatilidad Alta';
      case 'response_pattern': return 'Patrón Anómalo';
      case 'team_deviation': return 'Desviación de Equipo';
      default: return type;
    }
  };

  const criticalAnomalies = anomalies?.filter(a => a.severity === 'critical') || [];
  const highAnomalies = anomalies?.filter(a => a.severity === 'high') || [];
  const mediumAnomalies = anomalies?.filter(a => a.severity === 'medium') || [];
  const lowAnomalies = anomalies?.filter(a => a.severity === 'low') || [];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{criticalAnomalies.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Altas</p>
                <p className="text-2xl font-bold text-orange-600">{highAnomalies.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medias</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumAnomalies.length}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bajas</p>
                <p className="text-2xl font-bold text-blue-600">{lowAnomalies.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAnomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Anomalías Críticas - Acción Inmediata Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAnomalies.map((anomaly, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{getTypeLabel(anomaly.anomaly_type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {anomaly.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Detectado: {new Date(anomaly.detected_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Anomalies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Todas las Anomalías Detectadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies && anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(anomaly.severity)}
                    <div>
                      <p className="font-medium">{getTypeLabel(anomaly.anomaly_type)}</p>
                      <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(anomaly.detected_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confianza: {anomaly.metrics?.confidence_score?.toFixed(0) || 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se han detectado anomalías en este período</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esto indica patrones de bienestar estables en la organización
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetectionPanel;