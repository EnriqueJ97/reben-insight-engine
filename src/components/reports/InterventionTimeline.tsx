import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';

interface InterventionTimelineProps {
  period: string;
}

// Mock data for interventions
const mockInterventions = [
  {
    id: '1',
    date: '2024-01-15',
    alias: 'EMP-A23F',
    action: 'Sesión coaching 1:1',
    status: 'completed',
    outcome: 'Empleado reporta mejora en gestión del tiempo',
    type: 'coaching'
  },
  {
    id: '2', 
    date: '2024-01-12',
    alias: 'EMP-B7G9',
    action: 'Derivación a servicio médico',
    status: 'completed',
    outcome: 'Evaluación psicológica programada',
    type: 'medical'
  },
  {
    id: '3',
    date: '2024-01-10',
    alias: 'EMP-C4K2',
    action: 'Reunión con manager',
    status: 'pending',
    outcome: 'Pendiente de seguimiento',
    type: 'management'
  },
  {
    id: '4',
    date: '2024-01-08',
    alias: 'EMP-D8L5',
    action: 'Sesión mindfulness grupal',
    status: 'completed',
    outcome: 'Participación activa, feedback positivo',
    type: 'wellness'
  },
  {
    id: '5',
    date: '2024-01-05',
    alias: 'EMP-E9M3',
    action: 'Ajuste de carga de trabajo',
    status: 'completed',
    outcome: 'Reducción del 20% en horas extras',
    type: 'workload'
  }
];

export const InterventionTimeline = ({ period }: InterventionTimelineProps) => {
  const [showHistorical, setShowHistorical] = useState(false);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'coaching': return <MessageSquare className="h-4 w-4" />;
      case 'medical': return <User className="h-4 w-4" />;
      case 'management': return <User className="h-4 w-4" />;
      case 'wellness': return <Calendar className="h-4 w-4" />;
      case 'workload': return <Clock className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-success text-success-foreground">Completado</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      coaching: 'border-l-blue-500',
      medical: 'border-l-red-500', 
      management: 'border-l-purple-500',
      wellness: 'border-l-green-500',
      workload: 'border-l-orange-500'
    };
    return colors[type as keyof typeof colors] || 'border-l-gray-500';
  };

  const filteredInterventions = showHistorical 
    ? mockInterventions 
    : mockInterventions.filter(intervention => intervention.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Timeline de Intervenciones</span>
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">Histórico</span>
            <Switch 
              checked={showHistorical}
              onCheckedChange={setShowHistorical}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredInterventions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay intervenciones {showHistorical ? 'registradas' : 'pendientes'}</p>
                <p className="text-sm mt-1">
                  {showHistorical 
                    ? 'Todas las acciones se han completado' 
                    : '¡Excelente! No hay acciones pendientes 🎉'
                  }
                </p>
              </div>
            ) : (
              filteredInterventions.map((intervention) => (
                <div 
                  key={intervention.id}
                  className={`p-4 border-l-4 ${getTypeColor(intervention.type)} bg-card rounded-lg hover:bg-muted/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getActionIcon(intervention.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{intervention.action}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {intervention.alias}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(intervention.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(intervention.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground ml-12">
                    {intervention.outcome}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {mockInterventions.filter(i => i.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {mockInterventions.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
          <div className="text-center md:col-span-1 col-span-2">
            <div className="text-2xl font-bold text-primary">
              {Math.round((mockInterventions.filter(i => i.status === 'completed').length / mockInterventions.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Tasa de éxito</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};