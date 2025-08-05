import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Home, Wifi, Settings, TrendingUp, Clock, MapPin } from 'lucide-react';

const FlexibleCulture = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('policies');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Políticas de Flexibilidad</span>
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Nueva Política
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Política General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-days">Días mínimos en oficina</Label>
                        <Input id="min-days" type="number" defaultValue="3" />
                      </div>
                      <div>
                        <Label htmlFor="core-hours">Horario núcleo</Label>
                        <Input id="core-hours" defaultValue="10:00 - 15:00" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="allowed-modes">Modalidades permitidas</Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="office" defaultChecked />
                          <label htmlFor="office" className="text-sm">Oficina</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="remote" defaultChecked />
                          <label htmlFor="remote" className="text-sm">Remoto</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="hybrid" defaultChecked />
                          <label htmlFor="hybrid" className="text-sm">Híbrido</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Guardar Cambios</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Solicitudes de Flexibilidad</span>
                <Badge variant="outline">5 pendientes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Ana Rodríguez</h4>
                          <Badge variant="secondary">Pendiente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Solicita trabajo remoto el 15 de Enero por cita médica
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Wifi className="w-4 h-4" />
                            <span>Remoto</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>08:00 - 16:00</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Rechazar</Button>
                        <Button size="sm">Aprobar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Luis Martín</h4>
                          <Badge variant="secondary">Pendiente</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Solicita horario flexible (7:00-15:00) por tema familiar
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            <span>Oficina</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>07:00 - 15:00</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Rechazar</Button>
                        <Button size="sm">Aprobar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Sofia Chen</h4>
                          <Badge variant="default">Aprobada</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Modalidad híbrida: L-M-X en oficina, J-V remoto
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Híbrido</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>09:00 - 17:00</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Activo</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguimiento de Modalidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">María García</h4>
                          <p className="text-sm text-muted-foreground">Hoy</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Oficina</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Entrada:</span>
                          <span>08:45</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ubicación:</span>
                          <span>Madrid Centro</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Carlos López</h4>
                          <p className="text-sm text-muted-foreground">Hoy</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Remoto</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Entrada:</span>
                          <span>09:00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ubicación:</span>
                          <span>Casa</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Ana Rodríguez</h4>
                          <p className="text-sm text-muted-foreground">Hoy</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">Híbrido</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Entrada:</span>
                          <span>08:30</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ubicación:</span>
                          <span>Barcelona Norte</span>
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
                <CardTitle className="text-lg">Adopción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">78%</div>
                <p className="text-sm text-muted-foreground">Empleados usando flexibilidad</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">4.2</div>
                <p className="text-sm text-muted-foreground">Puntuación media (1-5)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">+12%</div>
                <p className="text-sm text-muted-foreground">Mejora vs. modalidad fija</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Modalidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>Oficina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm">45%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span>Remoto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm">35%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Híbrido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm">20%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones del EIE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium">Introducir día sin reuniones</h4>
                  <p className="text-sm text-muted-foreground">
                    Los empleados remotos reportan menor concentración en días con muchas reuniones
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium">Optimizar horarios núcleo</h4>
                  <p className="text-sm text-muted-foreground">
                    Considerar reducir el horario núcleo a 11:00-14:00 para mayor flexibilidad
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlexibleCulture;