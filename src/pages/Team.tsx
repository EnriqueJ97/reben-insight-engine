
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WellnessMetrics } from '@/components/ui/wellness-metrics';
import { Users, AlertTriangle, MessageSquare, TrendingUp, Heart, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Team = () => {
  const { user } = useAuth();

  // Mock team data
  const teamMembers = [
    { id: '1', name: 'María Rodríguez', email: 'maria@empresa.com', avatar: '👩‍💻', wellnessScore: 58, riskLevel: 'high', lastCheckin: '2 horas', alerts: 3 },
    { id: '2', name: 'Juan Pérez', email: 'juan@empresa.com', avatar: '👨‍💼', wellnessScore: 82, riskLevel: 'low', lastCheckin: '1 día', alerts: 0 },
    { id: '3', name: 'Ana López', email: 'ana.lopez@empresa.com', avatar: '👩‍🎨', wellnessScore: 75, riskLevel: 'medium', lastCheckin: '3 horas', alerts: 1 },
    { id: '4', name: 'Pedro Martín', email: 'pedro@empresa.com', avatar: '👨‍🔧', wellnessScore: 88, riskLevel: 'low', lastCheckin: '5 horas', alerts: 0 },
    { id: '5', name: 'Sofia García', email: 'sofia@empresa.com', avatar: '👩‍🔬', wellnessScore: 65, riskLevel: 'medium', lastCheckin: '1 día', alerts: 2 }
  ];

  const teamMetrics = [
    { title: 'Bienestar Promedio', value: 74, trend: 'up' as const, status: 'good' as const, description: '5 miembros activos' },
    { title: 'Riesgo Alto', value: 20, trend: 'stable' as const, status: 'warning' as const, description: '1 persona' },
    { title: 'Participación', value: 100, trend: 'up' as const, status: 'good' as const, description: 'Todos activos' },
    { title: 'Satisfacción', value: 78, trend: 'up' as const, status: 'good' as const, description: 'Tendencia positiva' }
  ];

  const recentAlerts = [
    { id: '1', member: 'María Rodríguez', type: 'ALERTA_BURNOUT_ALTO', message: 'Reporta agotamiento emocional alto (3 días)', time: '2 horas', severity: 'high' },
    { id: '2', member: 'Ana López', type: 'ALERTA_FUGA_TALENTO', message: 'Indica intención de búsqueda activa', time: '1 día', severity: 'medium' },
    { id: '3', member: 'Sofia García', type: 'ALERTA_INSATISFACCION', message: 'Baja satisfacción con políticas actuales', time: '2 días', severity: 'medium' }
  ];

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <span>Mi Equipo</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitorea el bienestar de tu equipo y apoya a quienes lo necesiten
          </p>
        </div>
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Reunión de Equipo
        </Button>
      </div>

      {/* Team Metrics */}
      <WellnessMetrics metrics={teamMetrics} />

      {/* Active Alerts */}
      {recentAlerts.length > 0 && (
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alertas Activas:</strong> Tienes {recentAlerts.length} alertas que requieren tu atención.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Miembros del Equipo</span>
                <Badge variant="secondary">{teamMembers.length} personas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Último check-in: hace {member.lastCheckin}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRiskColor(member.riskLevel)}`}>
                          {member.wellnessScore}%
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getRiskBg(member.riskLevel)} ${getRiskColor(member.riskLevel)} text-xs`}
                        >
                          {member.riskLevel === 'low' && 'Bajo Riesgo'}
                          {member.riskLevel === 'medium' && 'Riesgo Medio'}
                          {member.riskLevel === 'high' && 'Alto Riesgo'}
                        </Badge>
                      </div>
                      
                      {member.alerts > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {member.alerts} alerta{member.alerts > 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Hablar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Alertas Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border-l-4 border-l-warning bg-warning/5">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{alert.member}</p>
                      <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                        {alert.severity === 'high' ? 'Alto' : 'Medio'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">hace {alert.time}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-6">
                        Revisar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Acciones Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Reunión 1:1</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Programa una conversación con María sobre su carga de trabajo
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="h-3 w-3 mr-2" />
                    Agendar
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Plan de Mejora</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Crear estrategia para mejorar la satisfacción del equipo
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Crear Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Team;
