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
  console.log('🔧 ShiftPreferencesGrid props:', { 
    plantillasTurnos: plantillasTurnos.length, 
    preferencias: preferencias.length,
    onUpdatePreference: typeof onUpdatePreference 
  });
  const diasSemana = [
    { num: 1, nombre: 'Lunes', corto: 'L' },
    { num: 2, nombre: 'Martes', corto: 'M' },
    { num: 3, nombre: 'Miércoles', corto: 'X' },
    { num: 4, nombre: 'Jueves', corto: 'J' },
    { num: 5, nombre: 'Viernes', corto: 'V' },
    { num: 6, nombre: 'Sábado', corto: 'S' },
    { num: 0, nombre: 'Domingo', corto: 'D' }
  ];

  const obtenerPreferencia = (weekday: number, shiftId: string) => {
    const pref = preferencias.find(p => p.weekday === weekday && p.shift_template_id === shiftId);
    return pref?.weight || 0;
  };

  const getPreferenceIcon = (weight: number) => {
    switch (weight) {
      case 5: return <Heart className="w-4 h-4 text-green-600" />;
      case 4: return <Star className="w-4 h-4 text-blue-600" />;
      case 3: return <Meh className="w-4 h-4 text-yellow-600" />;
      case 2: return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 1: return <X className="w-4 h-4 text-red-600" />;
      case 0: return <X className="w-4 h-4 text-red-800" />;
      default: return null;
    }
  };

  const getPreferenceLabel = (weight: number) => {
    switch (weight) {
      case 5: return 'Favorito';
      case 4: return 'Me gusta';
      case 3: return 'Neutral';
      case 2: return 'Poco';
      case 1: return 'Evitar';
      case 0: return 'No disponible';
      default: return 'Sin configurar';
    }
  };

  const getPreferenceColor = (weight: number) => {
    switch (weight) {
      case 5: return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 4: return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 3: return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 2: return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 1: return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 0: return 'bg-red-100 border-red-300 hover:bg-red-200';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const handlePreferenceClick = (weekday: number, shiftId: string, currentWeight: number) => {
    console.log('🔍 Preference click:', { weekday, shiftId, currentWeight });
    
    // Ciclar entre las opciones: sin configurar -> 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> sin configurar
    const nextWeight = currentWeight >= 5 ? 0 : currentWeight + 1;
    console.log('➡️ Next weight:', nextWeight);
    
    onUpdatePreference(weekday, shiftId, nextWeight);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Mis Preferencias de Turnos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura tus preferencias para cada día y turno. Haz clic en cada celda para cambiar tu nivel de preferencia.
        </p>
        
        {/* Leyenda simplificada */}
        <div className="flex flex-wrap gap-3 mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium">Favorito (5)</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-xs">Me gusta (4)</span>
          </div>
          <div className="flex items-center gap-1">
            <Meh className="w-4 h-4 text-yellow-600" />
            <span className="text-xs">Neutral (3)</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-xs">No disponible (0)</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {plantillasTurnos.map((turno) => (
            <div key={turno.id} className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{turno.name}</h3>
                  <Badge variant="outline" className="text-sm">
                    {formatTime(turno.start_time)} - {formatTime(turno.end_time)}
                  </Badge>
                </div>
              </div>
              
              {/* Grid de días para este turno */}
              <div className="grid grid-cols-7 gap-2 p-4">
                {diasSemana.map((dia) => {
                  const currentWeight = obtenerPreferencia(dia.num, turno.id);
                  return (
                    <div key={`${turno.id}-${dia.num}`} className="flex flex-col items-center">
                      <span className="font-medium text-sm mb-2 text-center">{dia.nombre}</span>
                      <Button
                        variant="ghost"
                        size="lg"
                        className={cn(
                          "flex flex-col items-center gap-2 h-20 w-full border-2 transition-all",
                          getPreferenceColor(currentWeight)
                        )}
                        onClick={() => handlePreferenceClick(dia.num, turno.id, currentWeight)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {getPreferenceIcon(currentWeight)}
                          <span className="text-xs font-medium text-center leading-tight">
                            {getPreferenceLabel(currentWeight)}
                          </span>
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Información adicional */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">💡 ¿Cómo funciona?</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Favorito (5):</strong> Tu turno preferido para este día</li>
              <li>• <strong>Me gusta (4):</strong> Te parece bien este turno</li>
              <li>• <strong>Neutral (3):</strong> No tienes preferencia especial</li>
              <li>• <strong>No disponible (0):</strong> No puedes trabajar en este turno</li>
              <li>• El manager usa estas preferencias para asignar turnos automáticamente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftPreferencesGrid;