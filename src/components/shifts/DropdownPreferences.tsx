import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

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

interface DropdownPreferencesProps {
  plantillasTurnos: ShiftTemplate[];
  preferencias: Preference[];
  onUpdatePreference: (weekday: number, shiftTemplateId: string, weight: number) => void;
}

const DropdownPreferences: React.FC<DropdownPreferencesProps> = ({
  plantillasTurnos,
  preferencias,
  onUpdatePreference,
}) => {
  const diasSemana = [
    { num: 1, nombre: 'Lunes' },
    { num: 2, nombre: 'Martes' },
    { num: 3, nombre: 'Miércoles' },
    { num: 4, nombre: 'Jueves' },
    { num: 5, nombre: 'Viernes' },
    { num: 6, nombre: 'Sábado' },
    { num: 0, nombre: 'Domingo' }
  ];

  const opciones = [
    { value: '0', label: '❌ No disponible', emoji: '❌' },
    { value: '3', label: '✅ Disponible', emoji: '✅' },
    { value: '5', label: '💚 Preferido', emoji: '💚' }
  ];

  const obtenerPreferencia = (weekday: number, shiftId: string) => {
    const pref = preferencias.find(p => p.weekday === weekday && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const handlePreferenceChange = (weekday: number, shiftId: string, value: string) => {
    const weight = parseInt(value);
    onUpdatePreference(weekday, shiftId, weight);
  };

  const getPreferenceEmoji = (weight: number) => {
    const opcion = opciones.find(o => parseInt(o.value) === weight);
    return opcion?.emoji || '❓';
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Tu Disponibilidad Semanal</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona tu disponibilidad para cada día y turno desde los desplegables.
        </p>
      </div>

      {plantillasTurnos.map((turno) => (
        <Card key={turno.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {turno.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatTime(turno.start_time)} - {formatTime(turno.end_time)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {diasSemana.map((dia) => {
                const currentWeight = obtenerPreferencia(dia.num, turno.id);
                const currentValue = currentWeight.toString();
                
                return (
                  <div key={dia.num} className="space-y-2">
                    <div className="text-sm font-medium text-center text-muted-foreground">
                      {dia.nombre}
                    </div>
                    <Select
                      value={currentValue}
                      onValueChange={(value) => handlePreferenceChange(dia.num, turno.id, value)}
                    >
                      <SelectTrigger className="w-full h-12 text-center">
                        <SelectValue>
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-lg">{getPreferenceEmoji(currentWeight)}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {opciones.map((opcion) => (
                          <SelectItem key={opcion.value} value={opcion.value} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{opcion.emoji}</span>
                              <span className="text-sm">{opcion.label.split(' ').slice(1).join(' ')}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Opciones disponibles:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {opciones.map((opcion) => (
            <div key={opcion.value} className="flex items-center gap-2">
              <span className="text-lg">{opcion.emoji}</span>
              <span>{opcion.label.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Solo un click por día para configurar tu disponibilidad. Tu manager lo verá al planificar turnos.
        </p>
      </div>
    </div>
  );
};

export default DropdownPreferences;