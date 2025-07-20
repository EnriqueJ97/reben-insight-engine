
import { useAuth } from '@/contexts/AuthContext';
import { WellnessOverview, WellnessMetrics } from '@/components/ui/wellness-metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, Users, AlertTriangle, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data based on user role
  const getMetrics = () => {
    if (user?.role === 'EMPLOYEE') {
      return [
        { title: 'Mi Bienestar', value: 72, trend: 'stable' as const, status: 'warning' as const, description: 'Últimos 7 días' },
        { title: 'Burnout Risk', value: 35, trend: 'down' as const, status: 'good' as const, description: 'Bajo control' },
        { title: 'Satisfacción', value: 68, trend: 'up' as const, status: 'warning' as const, description: 'Mejorando' },
        { title: 'Balance Vida', value: 58, trend: 'stable' as const, status: 'warning' as const, description: 'Necesita atención' }
      ];
    }

    if (user?.role === 'MANAGER') {
      return [
        { title: 'Equipo General', value: 78, trend: 'up' as const, status: 'good' as const, description: '12 miembros' },
        { title: 'Riesgo Alto', value: 15, trend: 'down' as const, status: 'good' as const, description: '2 personas' },
        { title: 'Satisfacción', value: 74, trend: 'stable' as const, status: 'good' as const, description: 'Estable' },
        { title: 'Retención', value: 88, trend: 'up' as const, status: 'good' as const, description: 'Excelente' }
      ];
    }

    // HR_ADMIN
    return [
      { title: 'Bienestar General', value: 75, trend: 'up' as const, status: 'good' as const, description: '150 empleados' },
      { title: 'Burnout Risk', value: 22, trend: 'down' as const, status: 'good' as const, description: '33 empleados' },
      { title: 'Intención Rotación', value: 18, trend: 'stable' as const, status: 'good' as const, description: '27 empleados' },
      { title: 'Satisfacción', value: 71, trend: 'up' as const, status: 'warning' as const, description: 'Mejorando' }
    ];
  };

  const getRecentActivity = () => {
    if (user?.role === 'EMPLOYEE') {
      return [
        { type: 'check-in', message: 'Completaste tu check-in diario', time: 'Hoy 9:15 AM', status: 'success' },
        { type: 'tip', message: 'Nuevo consejo de bienestar disponible', time: 'Ayer 2:30 PM', status: 'info' },
        { type: 'reminder', message: 'Recuerda tomar una pausa de 15 minutos', time: 'Ayer 11:00 AM', status: 'warning' }
      ];
    }

    if (user?.role === 'MANAGER') {
      return [
        { type: 'alert', message: 'María reporta bajo ánimo (3 días)', time: 'Hoy 10:30 AM', status: 'warning' },
        { type: 'report', message: 'Informe semanal del equipo generado', time: 'Lun 8:00 AM', status: 'info' },
        { type: 'improvement', message: 'El bienestar del equipo mejoró 5%', time: 'Vie 3:45 PM', status: 'success' }
      ];
    }

    // HR_ADMIN
    return [
      { type: 'alert', message: '8 nuevas alertas de riesgo alto', time: 'Hoy 8:30 AM', status: 'warning' },
      { type: 'report', message: 'Informe mensual PDF generado', time: 'Hoy 7:00 AM', status: 'success' },
      { type: 'integration', message: 'Slack integrado correctamente', time: 'Ayer 4:20 PM', status: 'info' },
      { type: 'metric', message: 'Bienestar general subió a 75%', time: 'Ayer 1:15 PM', status: 'success' }
    ];
  };

  const metrics = getMetrics();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">¡Hola, {user?.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'EMPLOYEE' && 'Aquí tienes tu resumen de bienestar personal'}
            {user?.role === 'MANAGER' && 'Resumen del bienestar de tu equipo'}
            {user?.role === 'HR_ADMIN' && 'Panel de control organizacional de bienestar'}
          </p>
        </div>
        <Button asChild>
          <Link to={user?.role === 'EMPLOYEE' ? '/checkin' : '/reports'}>
            {user?.role === 'EMPLOYEE' ? (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Check-in Diario
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Informes
              </>
            )}
          </Link>
        </Button>
      </div>

      {/* Overview Card for Managers and HR */}
      {(user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && (
        <WellnessOverview
          overallScore={user?.role === 'MANAGER' ? 78 : 75}
          riskLevel={user?.role === 'MANAGER' ? 'low' : 'medium'}
          totalEmployees={user?.role === 'MANAGER' ? 12 : 150}
          activeAlerts={user?.role === 'MANAGER' ? 2 : 8}
        />
      )}

      {/* Metrics Grid */}
      <WellnessMetrics metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-success' :
                    activity.status === 'warning' ? 'bg-warning' :
                    'bg-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Acciones Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {user?.role === 'EMPLOYEE' && (
                <>
                  <Button variant="outline" asChild className="h-20">
                    <Link to="/checkin" className="flex flex-col items-center space-y-2">
                      <Heart className="h-5 w-5" />
                      <span className="text-xs">Check-in</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20">
                    <div className="flex flex-col items-center space-y-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs">Mi Progreso</span>
                    </div>
                  </Button>
                </>
              )}
              
              {user?.role === 'MANAGER' && (
                <>
                  <Button variant="outline" asChild className="h-20">
                    <Link to="/team" className="flex flex-col items-center space-y-2">
                      <Users className="h-5 w-5" />
                      <span className="text-xs">Mi Equipo</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-20">
                    <Link to="/reports" className="flex flex-col items-center space-y-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs">Informes</span>
                    </Link>
                  </Button>
                </>
              )}
              
              {user?.role === 'HR_ADMIN' && (
                <>
                  <Button variant="outline" asChild className="h-20">
                    <Link to="/teams" className="flex flex-col items-center space-y-2">
                      <Users className="h-5 w-5" />
                      <span className="text-xs">Equipos</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-20">
                    <Link to="/settings" className="flex flex-col items-center space-y-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-xs">Configurar</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Insight */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-primary">💡 Insight del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {user?.role === 'EMPLOYEE' && 
              "Tomar descansos regulares puede mejorar tu productividad en un 25%. ¡Programa una pausa de 15 minutos hoy!"
            }
            {user?.role === 'MANAGER' && 
              "Los equipos con check-ins regulares muestran 30% menos rotación. Considera programar una reunión 1:1 con María."
            }
            {user?.role === 'HR_ADMIN' && 
              "Las empresas con programas de bienestar activos reducen el ausentismo en un 28%. El ROI promedio es de 3:1."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
