import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Star } from 'lucide-react';
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

interface ShiftPreferencesGridProps {
  plantillasTurnos: ShiftTemplate[];
  preferencias: Preference[];
  onUpdatePreference: (weekday: number, shiftTemplateId: string, weight: number) => void;
}

const ShiftPreferencesGrid: React.FC<ShiftPreferencesGridProps> = ({
  plantillasTurnos,
  preferencias,
  onUpdatePreference
}) => {
  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const formatearHora = (hora: string | null | undefined) => {
    return hora ? hora.substring(0, 5) : '--:--';
  };

  const getPreferenceValue = (weekday: number, shiftTemplateId: string) => {
    const pref = preferencias.find(
      p => p.weekday === weekday && p.shift_template_id === shiftTemplateId
    );
    return pref?.weight || 0;
  };

  const getWeightColor = (weight: number) => {
    const colors = {
      0: 'bg-red-100 text-red-800 border-red-200',
      1: 'bg-orange-100 text-orange-800 border-orange-200',
      2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      3: 'bg-blue-100 text-blue-800 border-blue-200',
      4: 'bg-green-100 text-green-800 border-green-200',
      5: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[weight as keyof typeof colors] || colors[0];
  };

  const getWeightLabel = (weight: number) => {
    const labels = {
      0: 'No disponible',
      1: 'Muy baja',
      2: 'Baja', 
      3: 'Media',
      4: 'Alta',
      5: 'Muy alta'
    };
    return labels[weight as keyof typeof labels] || 'No definido';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurar Preferencias de Turnos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Leyenda */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-4 bg-muted/30 rounded-lg">
            {[0, 1, 2, 3, 4, 5].map((weight) => (
              <div key={weight} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded border", getWeightColor(weight))}></div>
                <span className="text-xs">{weight}: {getWeightLabel(weight)}</span>
              </div>
            ))}
          </div>

          {/* Grid de preferencias */}
          <div className="space-y-6">
            {diasSemana.map((dia, weekdayIndex) => (
              <div key={weekdayIndex} className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  {dia}
                  {[5, 6].includes(weekdayIndex) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Fin de semana
                    </span>
                  )}
                </h4>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {plantillasTurnos.map((plantilla) => {
                    const currentWeight = getPreferenceValue(weekdayIndex, plantilla.id);
                    
                    return (
                      <div 
                        key={plantilla.id} 
                        className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1">{plantilla.name}</h5>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Settings className="w-3 h-3" />
                              {formatearHora(plantilla.start_time)} - {formatearHora(plantilla.end_time)}
                            </p>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded text-xs font-medium border",
                            getWeightColor(currentWeight)
                          )}>
                            {getWeightLabel(currentWeight)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-1">
                          {[0, 1, 2, 3, 4, 5].map((peso) => (
                            <Button
                              key={peso}
                              size="sm"
                              variant={currentWeight === peso ? "default" : "outline"}
                              onClick={() => onUpdatePreference(weekdayIndex, plantilla.id, peso)}
                              className={cn(
                                "h-8 text-xs transition-all",
                                currentWeight === peso && getWeightColor(peso),
                                peso === 0 && "hover:bg-red-50",
                                peso === 5 && "hover:bg-emerald-50"
                              )}
                            >
                              {peso === 5 && <Star className="w-3 h-3" />}
                              {peso !== 5 && peso}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">💡 Cómo funciona el sistema</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>0:</strong> No estás disponible para este turno</li>
              <li>• <strong>1-2:</strong> Preferencia baja (solo en caso necesario)</li>
              <li>• <strong>3:</strong> Preferencia neutral</li>
              <li>• <strong>4-5:</strong> Preferencia alta (turnos preferidos)</li>
              <li>• El sistema usa estas preferencias para asignar turnos automáticamente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftPreferencesGrid;