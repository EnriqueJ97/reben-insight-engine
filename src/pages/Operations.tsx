import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ShiftManagement from '@/components/operations/ShiftManagement';
import FlexibleCulture from '@/components/operations/FlexibleCulture';

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
    if (location.pathname.includes('/shifts')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Turnos Inteligentes</h1>
            <Badge variant="outline">{user.role}</Badge>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-muted-foreground mb-6">
              Sistema inteligente de asignación automática de turnos basado en preferencias, carga de trabajo y métricas de bienestar.
            </p>
            <ShiftManagement />
          </div>
        </div>
      );
    }

    if (location.pathname.includes('/flexible')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Cultura Flexible</h1>
            <Badge variant="outline">{user.role}</Badge>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-muted-foreground mb-6">
              Gestión de modalidades de trabajo flexibles, solicitudes de teletrabajo y políticas de conciliación.
            </p>
            <FlexibleCulture />
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Operaciones</h1>
          <Badge variant="outline">{user.role}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Turnos Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema automático de asignación de turnos basado en preferencias, carga de trabajo y bienestar del equipo.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Cultura Flexible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestión de modalidades de trabajo flexibles, teletrabajo y políticas de conciliación laboral.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default Operations;