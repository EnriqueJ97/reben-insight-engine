import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Shield, Settings, MessageSquare, BookOpen, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ShiftManagement from '@/components/operations/ShiftManagement';
import FlexibleCulture from '@/components/operations/FlexibleCulture';
import Performance360 from '@/components/operations/Performance360';
import IntegrationsHub from '@/components/operations/IntegrationsHub';
import ManagerResources from '@/components/operations/ManagerResources';

const Operations = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !['MANAGER', 'HR_ADMIN'].includes(user.role)) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los Managers y administradores HR pueden acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render specific content based on the current path
  const renderContent = () => {
    // Always show the main dashboard with tabs instead of individual components
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Operaciones Avanzadas</h1>
          <Badge variant="outline">{user.role}</Badge>
        </div>
        
        <Tabs defaultValue="360feedback" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="360feedback">360º & Performance</TabsTrigger>
            <TabsTrigger value="integrations">Integraciones</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="shifts">Turnos Inteligentes</TabsTrigger>
            <TabsTrigger value="flexible">Cultura Flexible</TabsTrigger>
          </TabsList>

          <TabsContent value="360feedback" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Feedback 360º & Gestión del Desempeño</h2>
            </div>
            <Performance360 />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Hub de Integraciones</h2>
            </div>
            <IntegrationsHub />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Biblioteca de Recursos</h2>
            </div>
            <ManagerResources />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestión Inteligente de Turnos</h2>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <p className="text-muted-foreground mb-6">
                Sistema inteligente de asignación automática de turnos basado en preferencias, carga de trabajo y métricas de bienestar.
              </p>
              <ShiftManagement />
            </div>
          </TabsContent>

          <TabsContent value="flexible" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Cultura de Trabajo Flexible</h2>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <p className="text-muted-foreground mb-6">
                Gestión de modalidades de trabajo flexibles, solicitudes de teletrabajo y políticas de conciliación.
              </p>
              <FlexibleCulture />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return renderContent();
};

export default Operations;