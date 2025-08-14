import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ChevronLeft, ChevronRight, Save, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface Preference {
  weekday: number;
  shift_template_id: string;
  weight: number;
}

interface DatePreference {
  date: string; // YYYY-MM-DD format
  shift_template_id: string;
  weight: number;
}

interface AdvancedShiftPreferencesProps {
  plantillasTurnos: ShiftTemplate[];
  preferencias: Preference[];
  datePreferences?: DatePreference[];
  onUpdatePreference: (weekday: number, shiftTemplateId: string, weight: number) => void;
  onUpdateDatePreference?: (date: string, shiftTemplateId: string, weight: number) => void;
  onSave?: () => void;
}

const AdvancedShiftPreferences: React.FC<AdvancedShiftPreferencesProps> = ({
  plantillasTurnos,
  preferencias,
  datePreferences = [],
  onUpdatePreference,
  onUpdateDatePreference,
  onSave
}) => {
  const [selectedShift, setSelectedShift] = useState<string>(plantillasTurnos[0]?.id || '');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const diasSemana = [
    { num: 1, nombre: 'Lun', full: 'Lunes' },
    { num: 2, nombre: 'Mar', full: 'Martes' },
    { num: 3, nombre: 'Mié', full: 'Miércoles' },
    { num: 4, nombre: 'Jue', full: 'Jueves' },
    { num: 5, nombre: 'Vie', full: 'Viernes' },
    { num: 6, nombre: 'Sáb', full: 'Sábado' },
    { num: 0, nombre: 'Dom', full: 'Domingo' }
  ];

  const obtenerPreferencia = (weekday: number, shiftId: string) => {
    const pref = preferencias.find(p => p.weekday === weekday && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const obtenerPreferenciaFecha = (date: string, shiftId: string) => {
    const pref = datePreferences.find(p => p.date === date && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const getPreferenceColor = (weight: number) => {
    switch (weight) {
      case 5: return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
      case 4: return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
      case 3: return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500';
      case 2: return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500';
      case 1: return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
      case 0: return 'bg-gray-200 hover:bg-gray-300 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-500 border-gray-200';
    }
  };

  const getPreferenceEmoji = (weight: number) => {
    switch (weight) {
      case 5: return '😍';
      case 4: return '😊';
      case 3: return '😐';
      case 2: return '😕';
      case 1: return '😞';
      case 0: return '❌';
      default: return '❓';
    }
  };

  const handlePreferenceClick = (weekday: number, currentWeight: number) => {
    const nextWeight = currentWeight >= 5 ? 0 : currentWeight + 1;
    onUpdatePreference(weekday, selectedShift, nextWeight);
  };

  const handleDatePreferenceClick = (date: string, currentWeight: number) => {
    if (!onUpdateDatePreference) return;
    const nextWeight = currentWeight >= 5 ? 0 : currentWeight + 1;
    onUpdateDatePreference(date, selectedShift, nextWeight);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const selectedShiftData = plantillasTurnos.find(t => t.id === selectedShift);

  // Calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDateString = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getWeekdayFromDate = (date: Date) => {
    const day = getDay(date);
    return day; // Sunday = 0, Monday = 1, etc.
  };

  const hasDatePreference = (date: Date) => {
    const dateStr = getDateString(date);
    return datePreferences.some(p => p.date === dateStr);
  };

  const getEffectivePreference = (date: Date, shiftId: string) => {
    const dateStr = getDateString(date);
    const datePref = obtenerPreferenciaFecha(dateStr, shiftId);
    if (datePref > 0) return datePref;
    
    const weekday = getWeekdayFromDate(date);
    return obtenerPreferencia(weekday, shiftId);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configura tus Preferencias de Turnos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura tus preferencias generales por día de la semana y preferencias específicas para fechas concretas.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Selector de turno */}
          <div className="space-y-3">
            <h3 className="font-medium">Selecciona el turno:</h3>
            <div className="flex flex-wrap gap-2">
              {plantillasTurnos.map((turno) => (
                <Button
                  key={turno.id}
                  variant={selectedShift === turno.id ? "default" : "outline"}
                  onClick={() => setSelectedShift(turno.id)}
                  className="h-auto p-3"
                >
                  <div className="text-center">
                    <div className="font-medium">{turno.name}</div>
                    <div className="text-xs opacity-70">
                      {formatTime(turno.start_time)} - {formatTime(turno.end_time)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Preferencias Semanales</TabsTrigger>
              <TabsTrigger value="specific">Fechas Específicas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-4">
              {selectedShiftData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      Preferencias generales para: {selectedShiftData.name}
                    </h3>
                    <Badge variant="outline">
                      {formatTime(selectedShiftData.start_time)} - {formatTime(selectedShiftData.end_time)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-3">
                    {diasSemana.map((dia) => {
                      const currentWeight = obtenerPreferencia(dia.num, selectedShift);
                      return (
                        <div key={dia.num} className="text-center">
                          <div className="font-medium text-sm mb-2">{dia.nombre}</div>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-16 w-full flex flex-col items-center justify-center text-2xl border-2 transition-all",
                              getPreferenceColor(currentWeight)
                            )}
                            onClick={() => handlePreferenceClick(dia.num, currentWeight)}
                          >
                            <span className="text-2xl">{getPreferenceEmoji(currentWeight)}</span>
                            <span className="text-xs font-normal mt-1">
                              {currentWeight === 0 ? 'No' : `Nivel ${currentWeight}`}
                            </span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specific" className="space-y-4">
              {selectedShiftData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      Fechas específicas para: {selectedShiftData.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-medium min-w-[120px] text-center">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-sm">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    
                    {calendarDays.map((day, index) => {
                      const dateStr = getDateString(day);
                      const currentWeight = obtenerPreferenciaFecha(dateStr, selectedShift);
                      const effectiveWeight = getEffectivePreference(day, selectedShift);
                      const hasSpecificPref = hasDatePreference(day);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className={cn(
                            "h-12 p-1 flex flex-col items-center justify-center relative",
                            currentWeight > 0 ? getPreferenceColor(currentWeight) : 
                            effectiveWeight > 0 ? `${getPreferenceColor(effectiveWeight)} opacity-50` : 
                            "hover:bg-muted",
                            isToday && "ring-2 ring-primary",
                            hasSpecificPref && "ring-1 ring-accent"
                          )}
                          onClick={() => onUpdateDatePreference && handleDatePreferenceClick(dateStr, currentWeight)}
                          disabled={!isSameMonth(day, currentMonth)}
                        >
                          <span className="text-xs font-medium">
                            {format(day, 'd')}
                          </span>
                          {(currentWeight > 0 || effectiveWeight > 0) && (
                            <span className="text-xs">
                              {getPreferenceEmoji(currentWeight > 0 ? currentWeight : effectiveWeight)}
                            </span>
                          )}
                          {hasSpecificPref && currentWeight > 0 && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Haz clic en cualquier fecha para configurar una preferencia específica</p>
                    <p>• Las fechas con punto azul tienen preferencias específicas configuradas</p>
                    <p>• Las fechas sin configuración específica usan las preferencias semanales generales</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Leyenda */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-sm">Niveles de preferencia:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">😍</span>
                <span>5 - Me encanta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">😊</span>
                <span>4 - Me gusta</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">😐</span>
                <span>3 - Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">😕</span>
                <span>2 - Poco</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">😞</span>
                <span>1 - Evitar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">❌</span>
                <span>0 - No disponible</span>
              </div>
            </div>
          </div>

          {onSave && (
            <div className="flex justify-end">
              <Button onClick={onSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar Preferencias
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedShiftPreferences;