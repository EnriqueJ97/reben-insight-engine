
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmailCampaignManager } from '@/components/emails/EmailCampaignManager';
import { QuestionManager } from '@/components/questions/QuestionManager';
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { IntegrationsCenter } from '@/components/integrations/IntegrationsCenter';
import PolicyConfigurator from '@/components/settings/PolicyConfigurator';
import { Settings as SettingsIcon, Mail, HelpCircle, AlertTriangle, Plug, Sliders } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the active tab from URL path
  const getActiveTabFromPath = (path: string) => {
    if (path.includes('/campaigns')) return 'campaigns';
    if (path.includes('/questions')) return 'questions';
    if (path.includes('/alerts')) return 'alerts';
    if (path.includes('/integrations')) return 'integrations';
    if (path.includes('/policies')) return 'policies';
    return 'campaigns'; // default
  };

  const [activeTab, setActiveTab] = useState(() => getActiveTabFromPath(location.pathname));

  // Update tab when URL changes
  useEffect(() => {
    const newTab = getActiveTabFromPath(location.pathname);
    setActiveTab(newTab);
  }, [location.pathname]);

  // Navigate to first tab if on base settings page
  useEffect(() => {
    if (location.pathname === '/dashboard/settings') {
      navigate('/dashboard/settings/campaigns', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/settings/${value}`);
  };

  // For now, we'll assume users are HR_ADMIN. In a real app, this would come from the user's profile
  const isHRAdmin = true; // This should be fetched from user profile/role

  // Render specific content based on the current path
  const renderContent = () => {
    if (location.pathname.includes('/campaigns')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Campañas de Email</h1>
            <Badge variant="outline">HR_ADMIN</Badge>
          </div>
          <EmailCampaignManager />
        </div>
      );
    }

    if (location.pathname.includes('/questions')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Gestión de Preguntas</h1>
            <Badge variant="outline">HR_ADMIN</Badge>
          </div>
          {isHRAdmin ? (
            <QuestionManager />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                <p className="text-muted-foreground">
                  Solo los administradores HR pueden gestionar las preguntas del sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (location.pathname.includes('/alerts')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Centro de Alertas</h1>
            <Badge variant="outline">HR_ADMIN</Badge>
          </div>
          {isHRAdmin ? (
            <AlertsCenter />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                <p className="text-muted-foreground">
                  Solo los administradores HR pueden gestionar las alertas del sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (location.pathname.includes('/integrations')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Plug className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Integraciones</h1>
            <Badge variant="outline">HR_ADMIN</Badge>
          </div>
          {isHRAdmin ? (
            <IntegrationsCenter />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Plug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                <p className="text-muted-foreground">
                  Solo los administradores HR pueden gestionar las integraciones del sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (location.pathname.includes('/policies')) {
      return (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Sliders className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Configuración de Políticas</h1>
            <Badge variant="outline">HR_ADMIN</Badge>
          </div>
          {isHRAdmin ? (
            <PolicyConfigurator />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Sliders className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
                <p className="text-muted-foreground">
                  Solo los administradores HR pueden configurar las políticas del sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // Default fallback - redirect to campaigns
    return null;
  };

  return renderContent();
}
