import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
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
  onRequestSwap?: (shiftId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ shifts, onRequestSwap }) => {
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
    // Colores distintos según el estado del turno
    if (status === 'SWAP_REQ') {
      return 'bg-red-100 border-red-300 text-red-800'; // Rojo = pendiente intercambio
    }
    
    // Azul = asignado (todos los turnos asignados)
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SWAP_REQ') {
      return (
        <Badge variant="destructive" className="text-xs">
          ⏳ Intercambio solicitado
        </Badge>
      );
    }
    return null; // No mostrar badge para turnos normales asignados
  };

  const formatTime = (time: string | null | undefined) => {
    return time ? time.substring(0, 5) : '--:--';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {calendarDays.map((day) => (
        <Card 
          key={day.date} 
          tabIndex={0}
          role="button"
          aria-label={`Turno del ${day.dayNumber} de ${day.month}: ${day.shift?.shift_templates?.name || 'Sin turnos'}`}
          className={cn(
            "relative overflow-hidden transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-2",
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
                  {/* Nombre del turno */}
                  <div className="text-center mb-2">
                    <span className="font-semibold text-sm block">
                      {day.shift.shift_templates?.name || 'Sin asignar'}
                    </span>
                  </div>
                  
                  {/* Horario prominente */}
                  {day.shift.shift_templates && (
                    <div className="text-center mb-3">
                      <Badge className="bg-primary text-primary-foreground text-sm font-bold py-1 px-3">
                        {formatTime(day.shift.shift_templates.start_time)} - {formatTime(day.shift.shift_templates.end_time)}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Badge de intercambio solo si aplica */}
                  {getStatusBadge(day.shift.status) && (
                    <div className="text-center mb-2">
                      {getStatusBadge(day.shift.status)}
                    </div>
                  )}
                 
                  {/* Botón de solicitar cambio solo para turnos normales */}
                  {onRequestSwap && day.shift.status !== 'SWAP_REQ' && new Date(day.date) > new Date() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs mt-2"
                      onClick={() => onRequestSwap(day.shift!.id)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Solicitar cambio
                    </Button>
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