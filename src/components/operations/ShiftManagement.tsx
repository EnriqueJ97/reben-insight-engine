import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Settings, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

const ShiftManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calendario de Turnos</span>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Generar Horarios
                  </Button>
                  <Button>
                    Asignación Automática
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-8 rounded-lg text-center">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Calendario de Turnos</h3>
                <p className="text-muted-foreground">
                  Aquí se mostrará el calendario interactivo de turnos con la posibilidad de arrastrar y soltar asignaciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Empleados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">María García</h4>
                          <p className="text-sm text-muted-foreground">Desarrolladora Senior</p>
                        </div>
                        <Badge variant="secondary">Preferencias: 85%</Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Mañana</span>
                          <span className="text-green-600">+8</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tarde</span>
                          <span className="text-yellow-600">+2</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Noche</span>
                          <span className="text-red-600">-5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Carlos López</h4>
                          <p className="text-sm text-muted-foreground">DevOps Engineer</p>
                        </div>
                        <Badge variant="secondary">Preferencias: 92%</Badge>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Mañana</span>
                          <span className="text-green-600">+10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tarde</span>
                          <span className="text-green-600">+6</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Noche</span>
                          <span className="text-yellow-600">+1</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">0.12</div>
                <p className="text-sm text-muted-foreground">Índice de equidad (desviación estándar)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">89%</div>
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