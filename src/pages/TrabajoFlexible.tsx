import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Home, Building, Users, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const TrabajoFlexible = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [politicas, setPoliticas] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNuevaSolicitud, setShowNuevaSolicitud] = useState(false);

  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    fecha: '',
    modo: '',
    horasInicio: '',
    horasFin: '',
    razon: ''
  });

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarSolicitudes(),
        cargarPoliticas(),
        cargarHistorial()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudes = async () => {
    const { data, error } = await supabase
      .from('flex_requests')
      .select('*')
      .eq('employee_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSolicitudes(data || []);
  };

  const cargarPoliticas = async () => {
    const { data, error } = await supabase
      .from('flex_policies')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    setPoliticas(data || []);
  };

  const cargarHistorial = async () => {
    const { data, error } = await supabase
      .from('work_mode_logs')
      .select('*')
      .eq('employee_id', user?.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    setHistorial(data || []);
  };

  const enviarSolicitud = async () => {
    try {
      const { error } = await supabase
        .from('flex_requests')
        .insert({
          employee_id: user?.id,
          date: nuevaSolicitud.fecha,
          requested_mode: nuevaSolicitud.modo,
          requested_hours: {
            start: nuevaSolicitud.horasInicio,
            end: nuevaSolicitud.horasFin
          },
          reason: nuevaSolicitud.razon,
          status: 'PENDING'
        });

      if (error) throw error;

      toast.success('Solicitud enviada correctamente');
      setShowNuevaSolicitud(false);
      setNuevaSolicitud({
        fecha: '',
        modo: '',
        horasInicio: '',
        horasFin: '',
        razon: ''
      });
      cargarSolicitudes();
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'PENDING': return 'secondary';
      case 'APPROVED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return estado;
    }
  };

  const obtenerIconoModo = (modo: string) => {
    switch (modo) {
      case 'REMOTE': return <Home className="w-4 h-4" />;
      case 'OFFICE': return <Building className="w-4 h-4" />;
      case 'HYBRID': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const obtenerTextoModo = (modo: string) => {
    switch (modo) {
      case 'REMOTE': return 'Remoto';
      case 'OFFICE': return 'Oficina';
      case 'HYBRID': return 'Híbrido';
      default: return modo;
    }
  };

  const formatearFecha = (fecha: string | null | undefined) => {
    return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '--/--/----';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Trabajo Flexible</h1>
        </div>
        
        <Dialog open={showNuevaSolicitud} onOpenChange={setShowNuevaSolicitud}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Solicitud de Flexibilidad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="date"
                  value={nuevaSolicitud.fecha}
                  onChange={(e) => setNuevaSolicitud(prev => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Modalidad</label>
                <Select value={nuevaSolicitud.modo} onValueChange={(value) => setNuevaSolicitud(prev => ({ ...prev, modo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REMOTE">Remoto</SelectItem>
                    <SelectItem value="OFFICE">Oficina</SelectItem>
                    <SelectItem value="HYBRID">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Hora Inicio</label>
                  <Input
                    type="time"
                    value={nuevaSolicitud.horasInicio}
                    onChange={(e) => setNuevaSolicitud(prev => ({ ...prev, horasInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hora Fin</label>
                  <Input
                    type="time"
                    value={nuevaSolicitud.horasFin}
                    onChange={(e) => setNuevaSolicitud(prev => ({ ...prev, horasFin: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Motivo</label>
                <Textarea
                  value={nuevaSolicitud.razon}
                  onChange={(e) => setNuevaSolicitud(prev => ({ ...prev, razon: e.target.value }))}
                  placeholder="Explica el motivo de tu solicitud..."
                />
              </div>
              
              <Button onClick={enviarSolicitud} className="w-full">
                Enviar Solicitud
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="solicitudes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitudes">Mis Solicitudes</TabsTrigger>
          <TabsTrigger value="politicas">Políticas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitudes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Flexibilidad</CardTitle>
            </CardHeader>
            <CardContent>
              {solicitudes.length > 0 ? (
                <div className="space-y-4">
                  {solicitudes.map((solicitud) => (
                    <div key={solicitud.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {obtenerIconoModo(solicitud.requested_mode)}
                          <p className="font-medium">
                            {obtenerTextoModo(solicitud.requested_mode)} - {formatearFecha(solicitud.date)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {solicitud.requested_hours?.start} - {solicitud.requested_hours?.end}
                        </p>
                        {solicitud.reason && (
                          <p className="text-sm text-muted-foreground">{solicitud.reason}</p>
                        )}
                      </div>
                      <Badge variant={obtenerColorEstado(solicitud.status)}>
                        {obtenerTextoEstado(solicitud.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes solicitudes de flexibilidad</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="politicas" className="space-y-4">
          {politicas.map((politica) => (
            <Card key={politica.id}>
              <CardHeader>
                <CardTitle>{politica.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Días mínimos en oficina:</strong> {politica.min_on_site_days}</p>
                  <p><strong>Horario central:</strong> {politica.core_hours?.start} - {politica.core_hours?.end}</p>
                  <p><strong>Modalidades permitidas:</strong> {politica.allowed_modes?.map(obtenerTextoModo).join(', ')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Trabajo (Últimos 30 días)</CardTitle>
            </CardHeader>
            <CardContent>
              {historial.length > 0 ? (
                <div className="space-y-2">
                  {historial.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {obtenerIconoModo(log.actual_mode)}
                        <div>
                          <p className="font-medium">{formatearFecha(log.date)}</p>
                          <p className="text-sm text-muted-foreground">
                            {obtenerTextoModo(log.actual_mode)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {log.check_in_time && log.check_out_time ? 
                            `${new Date(log.check_in_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${new Date(log.check_out_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` :
                            'Sin registro'
                          }
                        </p>
                        {log.location && (
                          <p className="text-xs text-muted-foreground">{log.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay registros de trabajo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrabajoFlexible;