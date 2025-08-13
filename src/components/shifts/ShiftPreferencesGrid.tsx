import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Star, Meh, X, AlertCircle } from 'lucide-react';
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
    { num: 1, nombre: 'Lun', corto: 'L' },
    { num: 2, nombre: 'Mar', corto: 'M' },
    { num: 3, nombre: 'Mié', corto: 'X' },
    { num: 4, nombre: 'Jue', corto: 'J' },
    { num: 5, nombre: 'Vie', corto: 'V' },
    { num: 6, nombre: 'Sáb', corto: 'S' },
    { num: 0, nombre: 'Dom', corto: 'D' }
  ];

  const obtenerPreferencia = (weekday: number, shiftId: string) => {
    const pref = preferencias.find(p => p.weekday === weekday && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const getPreferenceIcon = (weight: number) => {
    switch (weight) {
      case 5: return <Heart className="w-3 h-3 text-green-600" />;
      case 4: return <Star className="w-3 h-3 text-blue-600" />;
      case 3: return <Meh className="w-3 h-3 text-yellow-600" />;
      case 2: return <AlertCircle className="w-3 h-3 text-orange-600" />;
      case 1: return <X className="w-3 h-3 text-red-600" />;
      case 0: return <X className="w-3 h-3 text-red-800" />;
      default: return null;
    }
  };

  const getPreferenceLabel = (weight: number) => {
    switch (weight) {
      case 5: return '😍';
      case 4: return '👍';
      case 3: return '😐';
      case 2: return '👎';
      case 1: return '❌';
      case 0: return '🚫';
      default: return '❓';
    }
  };

  const getPreferenceColor = (weight: number) => {
    switch (weight) {
      case 5: return 'bg-green-100 border-green-300 hover:bg-green-200 text-green-800';
      case 4: return 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800';
      case 3: return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800';
      case 2: return 'bg-orange-100 border-orange-300 hover:bg-orange-200 text-orange-800';
      case 1: return 'bg-red-100 border-red-300 hover:bg-red-200 text-red-800';
      case 0: return 'bg-red-200 border-red-400 hover:bg-red-300 text-red-900';
      default: return 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const handlePreferenceClick = (weekday: number, shiftId: string, currentWeight: number) => {
    // Ciclar entre las opciones: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 0
    const nextWeight = currentWeight >= 5 ? 0 : currentWeight + 1;
    onUpdatePreference(weekday, shiftId, nextWeight);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Configurar Preferencias
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Haz clic en cada celda para cambiar tu preferencia
          </p>
          
          {/* Leyenda compacta */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span>😍 Favorito</span>
            <span>👍 Me gusta</span>
            <span>😐 Neutral</span>
            <span>👎 Poco</span>
            <span>❌ Evitar</span>
            <span>🚫 No disponible</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {plantillasTurnos.map((turno) => (
            <Card key={turno.id} className="border border-gray-200">
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">{turno.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {formatTime(turno.start_time)} - {formatTime(turno.end_time)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Grid compacto de días */}
                <div className="grid grid-cols-7 gap-1">
                  {diasSemana.map((dia) => {
                    const currentWeight = obtenerPreferencia(dia.num, turno.id);
                    return (
                      <div key={`${turno.id}-${dia.num}`} className="flex flex-col items-center">
                        <span className="text-xs font-medium mb-1">{dia.nombre}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-12 w-full border-2 transition-all text-lg font-medium",
                            getPreferenceColor(currentWeight)
                          )}
                          onClick={() => handlePreferenceClick(dia.num, turno.id, currentWeight)}
                        >
                          {getPreferenceLabel(currentWeight)}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Ayuda compacta */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> El manager usará estas preferencias para asignar turnos automáticamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftPreferencesGrid;