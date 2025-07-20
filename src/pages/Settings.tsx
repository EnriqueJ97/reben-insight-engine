
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EmailCampaignManager } from '@/components/emails/EmailCampaignManager';
import { QuestionManager } from '@/components/questions/QuestionManager';
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { IntegrationsCenter } from '@/components/integrations/IntegrationsCenter';
import { Settings as SettingsIcon, Mail, HelpCircle, AlertTriangle, Plug } from 'lucide-react';

export default function Settings() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');

  const isHRAdmin = profile?.role === 'HR_ADMIN';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Configuración</h1>
        <Badge variant="outline">{profile?.role}</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2" disabled={!isHRAdmin}>
            <HelpCircle className="w-4 h-4" />
            Preguntas
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2" disabled={!isHRAdmin}>
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2" disabled={!isHRAdmin}>
            <Plug className="w-4 h-4" />
            Integraciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <EmailCampaignManager />
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
