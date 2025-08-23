import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, AlertTriangle, MessageSquare, TrendingUp, Calendar, Award, Target, Settings, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import PrivacyCompliantTeamView from '@/components/team/PrivacyCompliantTeamView';
import RecognitionSystem from '@/components/team/RecognitionSystem';
import TurnoverPrediction from '@/components/team/TurnoverPrediction';

const Team = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/overview')) return 'overview';
    if (location.pathname.includes('/recognition')) return 'recognition';  
    if (location.pathname.includes('/turnover')) return 'turnover';
    if (location.pathname.includes('/management')) return 'management';
    return 'overview'; // default
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <span>Mi Equipo</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu equipo de forma integral y ética
            </p>
          </div>
          <Badge variant="outline">{user?.role}</Badge>
        </div>

        <Tabs value={getActiveTabFromPath()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">👁️ Vista General</TabsTrigger>
            <TabsTrigger value="recognition">🏆 Reconocimiento</TabsTrigger>
            <TabsTrigger value="turnover">🎯 Predicción Rotación</TabsTrigger>
            <TabsTrigger value="management">👥 Gestión Equipo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Vista General del Equipo</h2>
            </div>
            <PrivacyCompliantTeamView />
          </TabsContent>

          <TabsContent value="recognition" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Sistema de Reconocimiento</h2>
            </div>
            <RecognitionSystem />
          </TabsContent>

          <TabsContent value="turnover" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Predicción de Rotación</h2>
            </div>
            <TurnoverPrediction />
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Herramientas de Gestión</h2>
            </div>
            <TeamManagementTools />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

const TeamManagementTools = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* One-on-One Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            One-on-Ones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Programa reuniones individuales con tu equipo
          </p>
          <Button className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Programar Reunión
          </Button>
        </CardContent>
      </Card>

      {/* Goal Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Establece y rastrea objetivos del equipo
          </p>
          <Button className="w-full" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Crear Objetivo
          </Button>
        </CardContent>
      </Card>

      {/* Performance Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gestiona evaluaciones de desempeño
          </p>
          <Button className="w-full" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Nueva Evaluación
          </Button>
        </CardContent>
      </Card>

      {/* Team Development */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desarrollo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Planes de desarrollo profesional
          </p>
          <Button className="w-full" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Plan de Desarrollo
          </Button>
        </CardContent>
      </Card>

      {/* Feedback Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Centro de feedback bidireccional
          </p>
          <Button className="w-full" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Dar Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Team Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Análisis avanzado del equipo
          </p>
          <Button className="w-full" variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ver Métricas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;