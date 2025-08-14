import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface SimpleShiftPreferencesProps {
  plantillasTurnos: ShiftTemplate[];
  preferencias: Preference[];
  onUpdatePreference: (weekday: number, shiftTemplateId: string, weight: number) => void;
  onSave?: () => void;
}

const SimpleShiftPreferences: React.FC<SimpleShiftPreferencesProps> = ({
  plantillasTurnos,
  preferencias,
  onUpdatePreference,
  onSave
}) => {
  const [selectedShift, setSelectedShift] = useState<string>(plantillasTurnos[0]?.id || '');
  
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

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const selectedShiftData = plantillasTurnos.find(t => t.id === selectedShift);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configura tus Preferencias de Turnos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona un turno y marca tus preferencias para cada día. Haz clic en cada día para cambiar tu preferencia.
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

          {/* Calendario semanal simplificado */}
          {selectedShiftData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Preferencias para: {selectedShiftData.name}
                </h3>
                <Badge variant="outline">
                  {formatTime(selectedShiftData.start_time)} - {formatTime(selectedShiftData.end_time)}
                </Badge>
              </div>
              
              {/* Grid de días */}
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

          {/* Botón guardar */}
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

export default SimpleShiftPreferences;