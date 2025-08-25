import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
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

interface SimplePreferencesProps {
  plantillasTurnos: ShiftTemplate[];
  preferencias: Preference[];
  onUpdatePreference: (weekday: number, shiftTemplateId: string, weight: number) => void;
}

const SimplePreferences: React.FC<SimplePreferencesProps> = ({
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

  const obtenerPreferencia = (weekday: number, shiftId: string) => {
    const pref = preferencias.find(p => p.weekday === weekday && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const handlePreferenceClick = (weekday: number, shiftId: string, currentWeight: number) => {
    // Solo 3 estados: 0 (no disponible), 3 (disponible), 5 (preferido)
    let nextWeight;
    if (currentWeight === 0) nextWeight = 3;
    else if (currentWeight === 3) nextWeight = 5;
    else nextWeight = 0;
    
    onUpdatePreference(weekday, shiftId, nextWeight);
  };

  const getPreferenceDisplay = (weight: number) => {
    switch (weight) {
      case 5: return { emoji: '💚', text: 'Preferido', color: 'bg-green-100 text-green-800 border-green-200' };
      case 3: return { emoji: '✅', text: 'Disponible', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default: return { emoji: '❌', text: 'No disponible', color: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Configura tu Disponibilidad</h3>
        <p className="text-sm text-muted-foreground">
          Marca cuando estás disponible y qué turnos prefieres. Solo toma unos segundos.
        </p>
      </div>

      <div className="space-y-4">
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
              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const currentWeight = obtenerPreferencia(dia.num, turno.id);
                  const display = getPreferenceDisplay(currentWeight);
                  
                  return (
                    <div key={dia.num} className="text-center">
                      <div className="text-xs font-medium mb-1 text-muted-foreground">
                        {dia.nombre.slice(0, 3)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-12 w-full flex flex-col items-center justify-center gap-1 border-2 transition-all hover:scale-105",
                          display.color
                        )}
                        onClick={() => handlePreferenceClick(dia.num, turno.id, currentWeight)}
                      >
                        <span className="text-lg">{display.emoji}</span>
                        <span className="text-xs font-medium">{display.text.split(' ')[0]}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2 text-sm">Cómo funciona:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">💚</span>
            <span><strong>Preferido</strong> - Tu turno ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span><strong>Disponible</strong> - Puedes trabajar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <span><strong>No disponible</strong> - No puedes</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Haz clic en cada día para cambiar tu disponibilidad. Tu manager lo verá al planificar.
        </p>
      </div>
    </div>
  );
};

export default SimplePreferences;