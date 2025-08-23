import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckins } from '@/hooks/useCheckins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalProgressPanel from './PersonalProgressPanel';
import { 
  Heart, 
  Calendar, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  Star,
  Gift,
  Coffee,
  Clock,
  Users,
  BarChart3,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProgressMetric {
  title: string;
  current: number;
  total: number;
  icon: React.ComponentType<any>;
  message: string;
  color: string;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { getCheckinStats, getCurrentStreak } = useCheckins();
  
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const checkinStats = await getCheckinStats();
      
      // Calcular métricas reales
      const weeklyCheckins = Math.min(checkinStats.total || 0, 5);
      const { current } = await getCurrentStreak();
      setStreakDays(current);
      
      setProgressMetrics([
        {
          title: 'Check-ins Esta Semana',
          current: weeklyCheckins,
          total: 5,
          icon: Heart,
          message: weeklyCheckins >= 4 ? '¡Excelente constancia!' : `${5 - weeklyCheckins} check-ins pendientes`,
          color: 'text-pink-500'
        },
        {
          title: 'Participación Mensual',
          current: Math.min(checkinStats.total || 0, 20),
          total: 20,
          icon: Star,
          message: checkinStats.total >= 15 ? '¡Muy activo!' : 'Sigue completando tus check-ins',
          color: 'text-yellow-500'
        }
      ]);
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => [
    { 
      label: 'Completar Check-in', 
      href: '/dashboard/checkin', 
      icon: Heart, 
      urgent: true,
      description: 'Comparte cómo te sientes hoy'
    },
    { 
      label: 'Ver Mi Progreso', 
      href: '/dashboard/reports', 
      icon: TrendingUp, 
      urgent: false,
      description: 'Revisa tu historial personal'
    },
    { 
      label: 'Mis Turnos', 
      href: '/dashboard/shifts', 
      icon: Calendar, 
      urgent: false,
      description: 'Gestiona tu horario'
    }
  ];

  const getNovedades = () => [
    {
      id: 1,
      title: 'Nuevo reto de pausas activas',
      description: 'Únete al desafío de tomar 3 micro-pausas diarias',
      icon: Coffee,
      type: 'challenge',
      time: 'Hace 2 horas'
    },
    {
      id: 2,
      title: 'Trabajo flexible aprobado',
      description: 'Tu solicitud de horario flexible ha sido aprobada',
      icon: Clock,
      type: 'approval',
      time: 'Ayer'
    },
    {
      id: 3,
      title: 'Sesión de team building',
      description: 'Actividad de equipo programada para el viernes',
      icon: Users,
      type: 'event',
      time: 'Hace 3 días'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu día...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          ¡Hola, {user?.name || user?.full_name || user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Tu centro de bienestar personal y seguimiento de progreso
        </p>
      </div>

      {/* Tabs para organizar el contenido */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Resumen del Día</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Mi Progreso</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">

      {/* Racha de participación */}
      {streakDays > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">
                  ¡{streakDays} días seguidos completando check-ins!
                </span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Gift className="h-3 w-3 mr-1" />
                ¡Bien hecho!
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progreso de Participación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progressMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span>{metric.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.current}/{metric.total}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((metric.current / metric.total) * 100)}%
                  </span>
                </div>
                
                <Progress 
                  value={(metric.current / metric.total) * 100} 
                  className="h-2"
                />
                
                <p className="text-xs text-muted-foreground">
                  {metric.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Acciones de Hoy</span>
            </CardTitle>
            <CardDescription>
              Tareas recomendadas para ti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getQuickActions().map((action, index) => (
                <Link key={index} to={action.href}>
                  <Button 
                    variant={action.urgent ? "default" : "outline"} 
                    className="w-full h-auto p-4 justify-start hover:scale-[1.02] transition-transform"
                  >
                    <action.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Novedades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Novedades</span>
            </CardTitle>
            <CardDescription>
              Actualizaciones y eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getNovedades().map((novedad) => (
                <div key={novedad.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <novedad.icon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{novedad.title}</p>
                    <p className="text-xs text-muted-foreground">{novedad.description}</p>
                    <p className="text-xs text-muted-foreground">{novedad.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {novedad.type === 'challenge' && '🎯'}
                    {novedad.type === 'approval' && '✅'}
                    {novedad.type === 'event' && '📅'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Footer */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Última actualización: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Mantente al día con tus rutinas de bienestar 💪
              </div>
            </div>
          </CardContent>
        </Card>
        
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <PersonalProgressPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDashboard;