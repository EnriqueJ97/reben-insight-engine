import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Shield, Settings, MessageSquare, BookOpen, Zap, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SimuladorWhatIf from '@/components/operations/SimuladorWhatIf';
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

  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/simulador')) return 'simulator';
    if (location.pathname.includes('/360feedback')) return '360feedback';
    if (location.pathname.includes('/integrations')) return 'integrations';
    if (location.pathname.includes('/resources')) return 'resources';
    if (location.pathname.includes('/shifts')) return 'shifts';
    if (location.pathname.includes('/flexible')) return 'flexible';
    return 'simulator'; // default
  };

  const renderContent = () => {
    const currentTab = getActiveTabFromPath();

    // Render only the specific component based on the route, no tabs
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Operaciones Avanzadas</h1>
          <Badge variant="outline">{user.role}</Badge>
        </div>
        
        {currentTab === 'simulator' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Simulador What-If con IA</h2>
            </div>
            <SimuladorWhatIf />
          </div>
        )}

        {currentTab === '360feedback' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Insights Avanzados - Análisis Profundo</h2>
            </div>
            <Performance360 showMetrics={false} />
          </div>
        )}

        {currentTab === 'integrations' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Hub de Integraciones</h2>
            </div>
            <IntegrationsHub />
          </div>
        )}

        {currentTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Biblioteca de Recursos</h2>
            </div>
            <ManagerResources />
          </div>
        )}

        {currentTab === 'shifts' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestión Inteligente de Turnos</h2>
            </div>
            <ShiftManagement />
          </div>
        )}

        {currentTab === 'flexible' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Cultura de Trabajo Flexible</h2>
            </div>
            <FlexibleCulture />
          </div>
        )}
      </div>
    );
  };

  return renderContent();
};

export default Operations;