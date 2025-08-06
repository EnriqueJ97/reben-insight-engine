import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarView from '@/components/shifts/CalendarView';
import ShiftPreferencesGrid from '@/components/shifts/ShiftPreferencesGrid';

const MisTurnos = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [preferencias, setPreferencias] = useState<any[]>([]);
  const [plantillasTurnos, setPlantillasTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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

  const formatearHora = (hora: string | null | undefined) => {
    return hora ? hora.substring(0, 5) : '--:--';
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'AUTO': return 'default';
      case 'MANUAL': return 'secondary';
      case 'SWAP_REQ': return 'destructive';
      default: return 'outline';
    }
  };

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

  const renderListView = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Turnos Asignados (Próximos 14 días)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('calendar')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Vista Calendario
        </Button>
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
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    turno.status === 'AUTO' ? 'bg-green-100 text-green-800' :
                    turno.status === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {turno.status === 'AUTO' ? 'Automático' : 
                     turno.status === 'MANUAL' ? 'Manual' : 
                     'Intercambio Solicitado'}
                  </span>
                </div>
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
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Mis Turnos</h1>
        </div>
        
        <Button
          variant="outline"
          onClick={cargarDatos}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="turnos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="turnos">Mis Turnos</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="turnos" className="space-y-4">
          {viewMode === 'calendar' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Calendario de Turnos</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-2" />
                  Vista Lista
                </Button>
              </div>
              <CalendarView shifts={turnos} />
            </div>
          ) : (
            renderListView()
          )}
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-4">
          <ShiftPreferencesGrid
            plantillasTurnos={plantillasTurnos}
            preferencias={preferencias}
            onUpdatePreference={actualizarPreferencia}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MisTurnos;