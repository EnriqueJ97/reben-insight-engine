import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MisTurnos = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [preferencias, setPreferencias] = useState<any[]>([]);
  const [plantillasTurnos, setPlantillasTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarTurnos(),
        cargarPreferencias(),
        cargarPlantillasTurnos()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarTurnos = async () => {
    const { data, error } = await supabase
      .from('rotas')
      .select(`
        *,
        shift_templates (name, start_time, end_time)
      `)
      .eq('employee_id', user?.id)
      .gte('day', new Date().toISOString().split('T')[0])
      .order('day', { ascending: true })
      .limit(14);

    if (error) throw error;
    setTurnos(data || []);
  };

  const cargarPreferencias = async () => {
    const { data, error } = await supabase
      .from('employee_shift_prefs')
      .select(`
        *,
        shift_templates (name, start_time, end_time)
      `)
      .eq('employee_id', user?.id);

    if (error) throw error;
    setPreferencias(data || []);
  };

  const cargarPlantillasTurnos = async () => {
    const { data, error } = await supabase
      .from('shift_templates')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    setPlantillasTurnos(data || []);
  };

  const actualizarPreferencia = async (weekday: number, shiftTemplateId: string, weight: number) => {
    try {
      const { error } = await supabase
        .from('employee_shift_prefs')
        .upsert({
          employee_id: user?.id,
          weekday,
          shift_template_id: shiftTemplateId,
          weight
        });

      if (error) throw error;
      
      toast.success('Preferencia actualizada');
      cargarPreferencias();
    } catch (error) {
      console.error('Error actualizando preferencia:', error);
      toast.error('Error al actualizar preferencia');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatearHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'AUTO': return 'default';
      case 'MANUAL': return 'secondary';
      case 'SWAP_REQ': return 'destructive';
      default: return 'outline';
    }
  };

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando turnos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Mis Turnos</h1>
      </div>

      <Tabs defaultValue="turnos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="turnos">Próximos Turnos</TabsTrigger>
          <TabsTrigger value="preferencias">Mis Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="turnos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Turnos Asignados (Próximos 14 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {turnos.length > 0 ? (
                <div className="grid gap-4">
                  {turnos.map((turno) => (
                    <div key={turno.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{formatearFecha(turno.day)}</p>
                        <p className="text-sm text-muted-foreground">
                          {turno.shift_templates?.name} • 
                          {formatearHora(turno.shift_templates?.start_time)} - 
                          {formatearHora(turno.shift_templates?.end_time)}
                        </p>
                      </div>
                      <Badge variant={obtenerColorEstado(turno.status)}>
                        {turno.status === 'AUTO' ? 'Automático' : 
                         turno.status === 'MANUAL' ? 'Manual' : 
                         'Intercambio Solicitado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes turnos asignados próximamente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar Preferencias de Turnos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {diasSemana.map((dia, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium">{dia}</h4>
                    <div className="grid gap-2">
                      {plantillasTurnos.map((plantilla) => {
                        const preferenciaActual = preferencias.find(
                          p => p.weekday === index && p.shift_template_id === plantilla.id
                        );
                        
                        return (
                          <div key={plantilla.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{plantilla.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatearHora(plantilla.start_time)} - {formatearHora(plantilla.end_time)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {[0, 1, 2, 3, 4, 5].map((peso) => (
                                <Button
                                  key={peso}
                                  size="sm"
                                  variant={preferenciaActual?.weight === peso ? "default" : "outline"}
                                  onClick={() => actualizarPreferencia(index, plantilla.id, peso)}
                                >
                                  {peso}
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
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Sistema de Puntuación:</strong> 0 = No disponible, 1 = Muy baja preferencia, 
                  5 = Máxima preferencia. El sistema usará estas preferencias para asignar turnos automáticamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisTurnos;