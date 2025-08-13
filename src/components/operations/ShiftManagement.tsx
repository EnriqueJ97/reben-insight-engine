import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Settings, Calendar as CalendarIcon, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ShiftAssignmentCalendar from '@/components/shifts/ShiftAssignmentCalendar';
import EmployeePreferences from '@/components/shifts/EmployeePreferences';

const ShiftManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [assigning, setAssigning] = useState(false);
  const [metrics, setMetrics] = useState<{ equityIndex: number; preferenceMatch: number; averageWorkload: number } | null>(null);
  const handleAutoAssign = async () => {
    if (!user?.tenant_id) {
      toast({ title: 'Falta tenant', description: 'No se pudo detectar el tenant', variant: 'destructive' });
      return;
    }
    setAssigning(true);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 13); // 14 días
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const { data, error } = await supabase.functions.invoke('assign-shifts', {
        body: {
          startDate,
          endDate,
          tenantId: user.tenant_id,
        },
      });
      if (error) throw error;
      if (data?.success) {
        const m = data.metrics || null;
        setMetrics(m);
        toast({ title: 'Asignación completada', description: `${data.assignmentsCreated} turnos generados` });
      } else {
        toast({ title: 'Error al asignar', description: data?.error || 'Intenta nuevamente', variant: 'destructive' });
      }
    } catch (e) {
      console.error('assign-shifts error', e);
      toast({ title: 'Error', description: 'No se pudo completar la asignación', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Preferencias
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plantillas de Turnos</span>
                <Button>
                  <Clock className="w-4 h-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Turno Mañana</h4>
                      <p className="text-sm text-muted-foreground">08:00 - 16:00</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Mín: 5 personas</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Turno Tarde</h4>
                      <p className="text-sm text-muted-foreground">14:00 - 22:00</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Mín: 3 personas</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Turno Noche</h4>
                      <p className="text-sm text-muted-foreground">22:00 - 06:00</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Mín: 2 personas</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="flex gap-2 mb-6">
            <Button variant="outline" onClick={handleAutoAssign} disabled={assigning}>
              <RefreshCw className={`w-4 h-4 mr-2 ${assigning ? 'animate-spin' : ''}`} />
              Generar Horarios
            </Button>
            <Button onClick={handleAutoAssign} disabled={assigning}>
              {assigning ? 'Asignando...' : 'Asignación Automática'}
            </Button>
          </div>
          <ShiftAssignmentCalendar />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <EmployeePreferences />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics ? metrics.equityIndex.toFixed(2) : '—'}</div>
                <p className="text-sm text-muted-foreground">Índice de equidad (desviación estándar)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{metrics ? `${metrics.preferenceMatch}%` : '—%'}</div>
                <p className="text-sm text-muted-foreground">Coincidencia con preferencias</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intercambios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">3</div>
                <p className="text-sm text-muted-foreground">Solicitudes pendientes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div>
                    <h4 className="font-medium">Alta carga de trabajo</h4>
                    <p className="text-sm text-muted-foreground">Carlos López tiene 3 turnos nocturnos consecutivos</p>
                  </div>
                  <Badge variant="secondary">Medio</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <h4 className="font-medium">Equidad baja</h4>
                    <p className="text-sm text-muted-foreground">Distribución desigual de turnos de fin de semana</p>
                  </div>
                  <Badge variant="destructive">Alto</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftManagement;