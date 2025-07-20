import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Filter,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

interface IntegrationLog {
  id: string;
  timestamp: string;
  integration: string;
  event_type: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  duration_ms?: number;
  endpoint?: string;
}

export const IntegrationLogs = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([
    {
      id: '1',
      timestamp: '2024-01-20T10:30:00Z',
      integration: 'Slack',
      event_type: 'alert_notification',
      status: 'success',
      message: 'Alerta de burnout enviada correctamente',
      details: { alert_id: 'alert_123', channel: '#bienestar', user: 'María García' },
      duration_ms: 245,
      endpoint: 'https://hooks.slack.com/services/...'
    },
    {
      id: '2',
      timestamp: '2024-01-20T10:25:00Z',
      integration: 'Email',
      event_type: 'weekly_report',
      status: 'success',
      message: 'Reporte semanal enviado a managers',
      details: { recipients: 5, report_type: 'team_wellness' },
      duration_ms: 1200
    },
    {
      id: '3',
      timestamp: '2024-01-20T10:20:00Z',
      integration: 'Microsoft Teams',
      event_type: 'alert_notification',
      status: 'error',
      message: 'Error de autenticación en webhook',
      details: { error_code: 401, retry_count: 3 },
      duration_ms: 5000,
      endpoint: 'https://empresa.webhook.office.com/...'
    },
    {
      id: '4',
      timestamp: '2024-01-20T10:15:00Z',
      integration: 'Zapier',
      event_type: 'employee_checkin',
      status: 'success',
      message: 'Check-in procesado y enviado a CRM',
      details: { employee_id: 'emp_456', mood_score: 7 },
      duration_ms: 890
    },
    {
      id: '5',
      timestamp: '2024-01-20T10:10:00Z',
      integration: 'Webhook RRHH',
      event_type: 'sync_employee_data',
      status: 'warning',
      message: 'Respuesta lenta del servidor destino',
      details: { sync_count: 45, slow_threshold_exceeded: true },
      duration_ms: 8500,
      endpoint: 'https://api.empresa.com/webhooks/bienestar'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState<IntegrationLog[]>(logs);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [integrationFilter, setIntegrationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  useEffect(() => {
    let filtered = logs;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Filter by integration
    if (integrationFilter !== 'all') {
      filtered = filtered.filter(log => log.integration === integrationFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.integration.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, statusFilter, integrationFilter, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In real implementation, fetch new logs from API
        console.log('Auto-refreshing logs...');
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-success text-success-foreground">Éxito</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-warning text-warning-foreground">Advertencia</Badge>;
      default: return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getDurationColor = (duration?: number) => {
    if (!duration) return 'text-muted-foreground';
    if (duration < 1000) return 'text-success';
    if (duration < 5000) return 'text-warning';
    return 'text-destructive';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getUniqueIntegrations = () => {
    return [...new Set(logs.map(log => log.integration))];
  };

  const refreshLogs = async () => {
    // In real implementation, fetch fresh logs from API
    console.log('Refreshing logs...');
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Integration', 'Event Type', 'Status', 'Message', 'Duration (ms)'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.integration,
        log.event_type,
        log.status,
        `"${log.message}"`,
        log.duration_ms || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>Logs de Integraciones</span>
          </h2>
          <p className="text-muted-foreground">
            Monitorea la actividad y estado de todas las integraciones
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-primary/10' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button variant="outline" onClick={exportLogs}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-2xl font-bold text-success">
              {logs.filter(l => l.status === 'success').length}
            </div>
            <div className="text-sm text-muted-foreground">Exitosos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-destructive">
              {logs.filter(l => l.status === 'error').length}
            </div>
            <div className="text-sm text-muted-foreground">Errores</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold text-warning">
              {logs.filter(l => l.status === 'warning').length}
            </div>
            <div className="text-sm text-muted-foreground">Advertencias</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {logs.reduce((sum, log) => sum + (log.duration_ms || 0), 0) / logs.length | 0}ms
            </div>
            <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded border border-input bg-background"
              >
                <option value="all">Todos los estados</option>
                <option value="success">Éxito</option>
                <option value="error">Error</option>
                <option value="warning">Advertencia</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={integrationFilter}
                onChange={(e) => setIntegrationFilter(e.target.value)}
                className="px-3 py-2 rounded border border-input bg-background"
              >
                <option value="all">Todas las integraciones</option>
                {getUniqueIntegrations().map(integration => (
                  <option key={integration} value={integration}>
                    {integration}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Mostrando {filteredLogs.length} de {logs.length} eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(log.status)}
                      <span className="font-medium">{log.integration}</span>
                      {getStatusBadge(log.status)}
                      <Badge variant="outline" className="text-xs">
                        {log.event_type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-2">{log.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{formatTimestamp(log.timestamp)}</span>
                      
                      {log.duration_ms && (
                        <span className={getDurationColor(log.duration_ms)}>
                          {log.duration_ms}ms
                        </span>
                      )}
                      
                      {log.endpoint && (
                        <div className="flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {log.endpoint}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer hover:underline">
                          Ver detalles
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin logs encontrados</h3>
                <p className="text-muted-foreground">
                  No hay eventos que coincidan con los filtros aplicados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};