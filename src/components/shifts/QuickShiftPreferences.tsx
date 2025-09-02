import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ShiftType = 'M' | 'T' | 'N' | 'X';

interface DayPreferences {
  monday: ShiftType;
  tuesday: ShiftType;
  wednesday: ShiftType;
  thursday: ShiftType;
  friday: ShiftType;
  saturday: ShiftType;
  sunday: ShiftType;
}

const DAYS = [
  { key: 'monday' as keyof DayPreferences, label: 'Lun' },
  { key: 'tuesday' as keyof DayPreferences, label: 'Mar' },
  { key: 'wednesday' as keyof DayPreferences, label: 'Mié' },
  { key: 'thursday' as keyof DayPreferences, label: 'Jue' },
  { key: 'friday' as keyof DayPreferences, label: 'Vie' },
  { key: 'saturday' as keyof DayPreferences, label: 'Sáb' },
  { key: 'sunday' as keyof DayPreferences, label: 'Dom' }
];

const SHIFT_OPTIONS = [
  { value: 'M' as ShiftType, label: 'M', name: 'Mañana', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'T' as ShiftType, label: 'T', name: 'Tarde', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { value: 'N' as ShiftType, label: 'N', name: 'Noche', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { value: 'X' as ShiftType, label: 'X', name: 'No disponible', color: 'bg-gray-100 border-gray-300 text-gray-600' }
];

export const QuickShiftPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DayPreferences>({
    monday: 'M',
    tuesday: 'M',
    wednesday: 'M',
    thursday: 'M',
    friday: 'M',
    saturday: 'X',
    sunday: 'X'
  });
  const [selectedForCopy, setSelectedForCopy] = useState<ShiftType>('M');
  const [loading, setLoading] = useState(false);

  // Cargar preferencias existentes
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shift_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (data?.preferences) {
        setPreferences(data.preferences as unknown as DayPreferences);
      }
    } catch (error) {
      console.log('No hay preferencias guardadas previamente');
    }
  };

  const handleShiftChange = (day: keyof DayPreferences, shift: ShiftType) => {
    setPreferences(prev => ({
      ...prev,
      [day]: shift
    }));
  };

  const applyToAllDays = () => {
    const newPreferences: DayPreferences = {
      monday: selectedForCopy,
      tuesday: selectedForCopy,
      wednesday: selectedForCopy,
      thursday: selectedForCopy,
      friday: selectedForCopy,
      saturday: selectedForCopy,
      sunday: selectedForCopy
    };
    setPreferences(newPreferences);
    toast({
      title: "Aplicado a toda la semana",
      description: `${SHIFT_OPTIONS.find(s => s.value === selectedForCopy)?.name} aplicado a todos los días`
    });
  };

  const savePreferences = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar preferencias",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Obtener el tenant_id del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase
        .from('shift_preferences')
        .upsert({
          user_id: user.id,
          tenant_id: profile?.tenant_id,
          preferences: preferences as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "¡Preferencias guardadas!",
        description: "Tus preferencias de turno han sido actualizadas correctamente"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getShiftStyle = (shift: ShiftType, isSelected: boolean) => {
    const option = SHIFT_OPTIONS.find(s => s.value === shift);
    const baseStyle = "w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-200 active:scale-95";
    
    if (isSelected) {
      return `${baseStyle} ${option?.color} scale-105 shadow-md`;
    }
    return `${baseStyle} bg-white border-gray-200 text-gray-400 hover:border-gray-300`;
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-center">
          Mis Preferencias de Turnos
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Selecciona tu turno preferido para cada día
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Leyenda de turnos */}
        <div className="flex justify-center space-x-2 text-xs">
          {SHIFT_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-1">
              <div className={`w-6 h-6 rounded border ${option.color} flex items-center justify-center font-semibold`}>
                {option.label}
              </div>
              <span className="text-muted-foreground">{option.name}</span>
            </div>
          ))}
        </div>

        {/* Grid de días y turnos */}
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day.key} className="flex items-center space-x-3">
              <div className="w-12 text-sm font-medium text-muted-foreground">
                {day.label}
              </div>
              <div className="flex space-x-2 flex-1">
                {SHIFT_OPTIONS.map((shift) => (
                  <button
                    key={shift.value}
                    onClick={() => handleShiftChange(day.key, shift.value)}
                    className={getShiftStyle(shift.value, preferences[day.key] === shift.value)}
                    aria-label={`${day.label} - ${shift.name}`}
                  >
                    {shift.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Aplicar a todos los días */}
        <div className="border-t pt-4 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Aplicar a toda la semana:
          </div>
          <div className="flex space-x-2">
            {SHIFT_OPTIONS.map((shift) => (
              <button
                key={shift.value}
                onClick={() => setSelectedForCopy(shift.value)}
                className={getShiftStyle(shift.value, selectedForCopy === shift.value)}
                aria-label={`Seleccionar ${shift.name} para copiar`}
              >
                {shift.label}
              </button>
            ))}
            <Button
              onClick={applyToAllDays}
              variant="outline"
              size="sm"
              className="ml-2 h-12 px-3"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Botón guardar */}
        <Button 
          onClick={savePreferences}
          disabled={loading}
          className="w-full h-12 text-base font-semibold"
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Guardar mis preferencias
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};