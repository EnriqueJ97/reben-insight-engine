import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface AlertData {
  id: string;
  type: 'burnout' | 'low_engagement' | 'high_stress' | 'absence_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employee_alias: string;
  team: string;
  created_at: string;
  resolved: boolean;
  resolution_time?: number;
  impact_score: number;
  trends: any[];
}

interface EnhancedAlertsSectionProps {
  alertData?: AlertData[];
  onAlertClick?: (alertId: string) => void;
  userRole?: string;
  onTeamFilter?: (teamId: string | null) => void;
  selectedTeam?: string | null;
  teamOptions?: Array<{ id: string; name: string }>;
}

export const EnhancedAlertsSection = ({ 
  alertData = [], 
  onAlertClick, 
  userRole = 'EMPLOYEE',
  onTeamFilter,
  selectedTeam,
  teamOptions = []
}: EnhancedAlertsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'critical' | 'trends' | 'resolution'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredAlerts = alertData
    .filter(alert => filterSeverity === 'all' || alert.severity === filterSeverity)
    .filter(alert => filterStatus === 'all' || (filterStatus === 'resolved' ? alert.resolved : !alert.resolved))
    .sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium': return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'CRÍTICO';
      case 'high': return 'ALTO';
      case 'medium': return 'MEDIO';
      case 'low': return 'BAJO';
      default: return 'DESCONOCIDO';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'burnout': return 'Riesgo Burnout';
      case 'low_engagement': return 'Baja Participación';
      case 'high_stress': return 'Estrés Elevado';
      case 'absence_pattern': return 'Patrón Ausencias';
      default: return 'Otros';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'burnout': return 'text-red-600';
      case 'low_engagement': return 'text-blue-600';
      case 'high_stress': return 'text-orange-600';
      case 'absence_pattern': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Statistics
  const stats = {
    total: alertData.length,
    critical: alertData.filter(a => a.severity === 'critical').length,
    resolved: alertData.filter(a => a.resolved).length,
    avgResolutionTime: alertData.filter(a => a.resolved && a.resolution_time).reduce((acc, a) => acc + (a.resolution_time || 0), 0) / alertData.filter(a => a.resolved && a.resolution_time).length || 0,
    resolutionRate: alertData.length > 0 ? (alertData.filter(a => a.resolved).length / alertData.length) * 100 : 0
  };

  // Chart data
  const severityDistribution = [
    { name: 'Crítico', value: alertData.filter(a => a.severity === 'critical').length, color: '#dc2626' },
    { name: 'Alto', value: alertData.filter(a => a.severity === 'high').length, color: '#ea580c' },
    { name: 'Medio', value: alertData.filter(a => a.severity === 'medium').length, color: '#d97706' },
    { name: 'Bajo', value: alertData.filter(a => a.severity === 'low').length, color: '#2563eb' },
  ];

  const typeDistribution = [
    { name: 'Burnout', value: alertData.filter(a => a.type === 'burnout').length },
    { name: 'Participación', value: alertData.filter(a => a.type === 'low_engagement').length },
    { name: 'Estrés', value: alertData.filter(a => a.type === 'high_stress').length },
    { name: 'Ausencias', value: alertData.filter(a => a.type === 'absence_pattern').length },
  ];

  const AlertCard = ({ alert }: { alert: AlertData }) => (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4"
      style={{ borderLeftColor: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#d97706' }}
      onClick={() => onAlertClick?.(alert.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${getTypeColor(alert.type)}`} />
              <span className="font-medium text-sm">{getTypeLabel(alert.type)}</span>
              <Badge className={`${getSeverityColor(alert.severity)} border text-xs`}>
                {getSeverityLabel(alert.severity)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{alert.employee_alias}</span>
              <span>•</span>
              <span>{alert.team}</span>
            </div>
          </div>
          <div className="text-right">
            {alert.resolved ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <Clock className="h-5 w-5 text-amber-500" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Impacto</span>
            <span className="font-medium">{alert.impact_score}/10</span>
          </div>
          <Progress value={alert.impact_score * 10} className="h-1" />
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{new Date(alert.created_at).toLocaleDateString('es-ES')}</span>
            <span>
              {alert.resolved 
                ? `Resuelto en ${alert.resolution_time || 0}h`
                : `${Math.floor((Date.now() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60))}h pendiente`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Centro de Alertas Inteligente
            {userRole === 'HR_ADMIN' && (
              <Badge variant="outline" className="ml-2">Vista Global</Badge>
            )}
            {userRole === 'MANAGER' && (
              <Badge variant="outline" className="ml-2">Mi Equipo</Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {userRole === 'HR_ADMIN' 
              ? 'Vista global de todas las alertas de la empresa'
              : userRole === 'MANAGER'
              ? 'Alertas de tu equipo en tiempo real'
              : 'Monitoreo en tiempo real y gestión de intervenciones'
            }
          </p>
        </div>
        
        {/* Team filter for HR_ADMIN */}
        {userRole === 'HR_ADMIN' && teamOptions.length > 0 && onTeamFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filtrar por equipo:</span>
            <select 
              value={selectedTeam || 'all'} 
              onChange={(e) => onTeamFilter(e.target.value === 'all' ? null : e.target.value)}
              className="px-3 py-1 border border-input rounded-md text-sm bg-background"
            >
              <option value="all">Todos los equipos</option>
              {teamOptions.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Alertas</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Críticas</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">Resueltas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.resolutionRate.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Tasa Resolución</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime.toFixed(0)}h</div>
            <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterSeverity === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('all')}
        >
          Todas
        </Button>
        <Button
          variant={filterSeverity === 'critical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('critical')}
        >
          <Filter className="h-3 w-3 mr-1" />
          Críticas
        </Button>
        <Button
          variant={filterSeverity === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('high')}
        >
          Altas
        </Button>
        
        <div className="h-4 w-px bg-border mx-2" />
        
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Todos Estados
        </Button>
        <Button
          variant={filterStatus === 'open' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('open')}
        >
          <Clock className="h-3 w-3 mr-1" />
          Pendientes
        </Button>
        <Button
          variant={filterStatus === 'resolved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('resolved')}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Resueltas
        </Button>
      </div>

      {/* Tabs content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="critical">Críticas</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="resolution">Resolución</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribución por Severidad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  {severityDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tipos de Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent alerts */}
          <div>
            <h4 className="font-medium mb-4">Alertas Recientes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlerts.slice(0, 6).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-800">Alertas Críticas Activas</h4>
            </div>
            <p className="text-sm text-red-700">
              Estas alertas requieren atención inmediata. Se han enviado notificaciones automáticas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredAlerts
              .filter(alert => alert.severity === 'critical' && !alert.resolved)
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={alertData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="created_at" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="impact_score" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.resolutionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                <Progress value={stats.resolutionRate} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avgResolutionTime.toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {alertData.filter(a => a.resolved).length}
                </div>
                <div className="text-sm text-muted-foreground">Casos Resueltos</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};