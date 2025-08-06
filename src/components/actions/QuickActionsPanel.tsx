import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Users, 
  AlertTriangle, 
  Clock, 
  Target,
  ExternalLink,
  Coffee,
  BookOpen
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  participationRate: number;
}

interface QuickActionsPanelProps {
  teamMembers: TeamMember[];
  highRiskCount: number;
  lowParticipationCount: number;
}

export const QuickActionsPanel = ({ teamMembers, highRiskCount, lowParticipationCount }: QuickActionsPanelProps) => {
  const createGoogleCalendarEvent = (title: string, description: string) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Mañana
    startDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    const endDate = new Date(startDate);
    endDate.setHours(11, 0, 0, 0); // 11:00 AM
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(description)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const createOutlookEvent = (title: string, description: string) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(11, 0, 0, 0);
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}`;
    
    window.open(outlookUrl, '_blank');
  };

  const generateReminderEmail = () => {
    const subject = "Recordatorio: Completa tu check-in de bienestar";
    const body = `Hola,

Hemos notado que no has completado tu check-in de bienestar esta semana. 

Tu participación es importante para nosotros y nos ayuda a entender cómo te sientes en el trabajo. Solo toma 2 minutos completarlo.

Accede aquí: ${window.location.origin}/check-in

¡Gracias por tu participación!

Equipo de Recursos Humanos`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-6">
      {/* Acciones Recomendadas Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Acciones Recomendadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Alerta de alto riesgo */}
            {highRiskCount > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">Acción Urgente</span>
                    <Badge variant="destructive" className="ml-2">{highRiskCount}</Badge>
                  </div>
                </div>
                <p className="text-sm mb-3 text-destructive">
                  {highRiskCount} miembro(s) en riesgo alto requieren atención inmediata.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => createGoogleCalendarEvent(
                      "Reunión 1:1 - Seguimiento Bienestar",
                      "Reunión individual para evaluar el bienestar del empleado y ofrecer apoyo necesario."
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Programar 1:1 (Google)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => createOutlookEvent(
                      "Reunión 1:1 - Seguimiento Bienestar",
                      "Reunión individual para evaluar el bienestar del empleado y ofrecer apoyo necesario."
                    )}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Programar 1:1 (Outlook)
                  </Button>
                </div>
              </div>
            )}

            {/* Baja participación */}
            {lowParticipationCount > 0 && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="font-medium text-warning">Mejorar Participación</span>
                    <Badge variant="secondary" className="ml-2 bg-warning/20 text-warning">
                      {lowParticipationCount}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mb-3 text-warning">
                  {lowParticipationCount} miembro(s) con baja participación en check-ins.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    className="bg-warning hover:bg-warning/90 text-warning-foreground"
                    onClick={generateReminderEmail}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Enviar Recordatorio
                  </Button>
                </div>
              </div>
            )}

            {/* Acción preventiva general */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Coffee className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">Fortalecimiento del Equipo</span>
              </div>
              <p className="text-sm mb-3 text-primary">
                Programa actividades para mejorar la cohesión y comunicación del equipo.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => createGoogleCalendarEvent(
                    "Team Building - Sesión de Equipo",
                    "Actividad grupal para fortalecer la comunicación y cohesión del equipo."
                  )}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Programar Team Building
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enlaces Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Recursos y Herramientas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <a href="/dashboard/team" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Gestión Completa del Equipo
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <a href="/dashboard/alerts" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Centro de Alertas Avanzado
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              asChild
            >
              <a href="/dashboard/reports" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Reportes y Analytics
              </a>
            </Button>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground"
              onClick={() => window.open('https://support.company.com/wellness-guide', '_blank')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Guía de Bienestar Laboral
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};