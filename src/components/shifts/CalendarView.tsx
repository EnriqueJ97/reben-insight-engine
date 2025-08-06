import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shift {
  id: string;
  day: string;
  status: string;
  shift_templates?: {
    name: string;
    start_time: string;
    end_time: string;
  };
}

interface CalendarViewProps {
  shifts: Shift[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ shifts }) => {
  // Agrupar turnos por día - solo el último/más relevante por día
  const groupedShifts = shifts.reduce((acc, shift) => {
    const date = shift.day;
    // Solo mantener un turno por día (el más reciente o manual tiene prioridad)
    if (!acc[date] || 
        shift.status === 'MANUAL' || 
        (shift.status === 'SWAP_REQ' && acc[date].status !== 'MANUAL')) {
      acc[date] = shift;
    }
    return acc;
  }, {} as Record<string, Shift>);

  // Generar los próximos 14 días
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        isToday: dateStr === today.toISOString().split('T')[0],
        shift: groupedShifts[dateStr] || null
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getShiftColor = (shiftName: string, status: string) => {
    const colors = {
      'Turno Mañana': 'bg-amber-100 border-amber-300 text-amber-800',
      'Turno Tarde': 'bg-blue-100 border-blue-300 text-blue-800', 
      'Turno Noche': 'bg-purple-100 border-purple-300 text-purple-800',
      'Horario Flexible': 'bg-green-100 border-green-300 text-green-800'
    };
    
    const baseColor = colors[shiftName as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
    
    if (status === 'SWAP_REQ') {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    
    return baseColor;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AUTO': { label: 'Auto', variant: 'secondary' as const },
      'MANUAL': { label: 'Manual', variant: 'outline' as const },
      'SWAP_REQ': { label: 'Intercambio', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatTime = (time: string | null | undefined) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {calendarDays.map((day) => (
        <Card 
          key={day.date} 
          className={cn(
            "relative overflow-hidden transition-all duration-200 hover:shadow-md",
            day.isToday && "ring-2 ring-primary ring-offset-2",
            !day.shift && "opacity-60"
          )}
        >
          <CardContent className="p-3">
            {/* Header del día */}
            <div className="flex flex-col items-center mb-3 pb-2 border-b">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {day.dayName}
              </span>
              <span className="text-lg font-semibold">
                {day.dayNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                {day.month}
              </span>
            </div>

            {/* Turno del día */}
            <div className="space-y-2">
              {day.shift ? (
                <div
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    getShiftColor(day.shift.shift_templates?.name || '', day.shift.status)
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs truncate">
                      {day.shift.shift_templates?.name || 'Sin asignar'}
                    </span>
                    {getStatusBadge(day.shift.status)}
                  </div>
                  
                  {day.shift.shift_templates && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatTime(day.shift.shift_templates.start_time)} - {formatTime(day.shift.shift_templates.end_time)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                  <CalendarIcon className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-xs">Sin turnos</span>
                </div>
              )}
            </div>
          </CardContent>
          
          {day.isToday && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CalendarView;