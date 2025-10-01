import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Heart,
  Clock,
  Target,
  MessageSquare
} from 'lucide-react';

export const SimplifiedManagerDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Equipo</h1>
        <p className="text-muted-foreground">Panel de gestión simplificado</p>
      </div>

      <Tabs defaultValue="equipo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipo">👥 Mi Equipo</TabsTrigger>
          <TabsTrigger value="alertas">⚠️ Alertas</TabsTrigger>
          <TabsTrigger value="progreso">📈 Progreso</TabsTrigger>
        </TabsList>

        <TabsContent value="equipo" className="space-y-4">
          {/* Resumen rápido */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">Miembros</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">3.9</div>
                  <div className="text-sm text-muted-foreground">Bienestar Promedio</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">2</div>
                  <div className="text-sm text-muted-foreground">Necesitan Apoyo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de empleados */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Empleado 1 */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-medium">CL</span>
                  </div>
                  <div>
                    <div className="font-medium">Carlos López</div>
                    <div className="text-sm text-muted-foreground">Senior Developer</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Riesgo Alto</Badge>
                  <Button size="sm">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    1-on-1
                  </Button>
                </div>
              </div>

              {/* Empleado 2 */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-medium">AM</span>
                  </div>
                  <div>
                    <div className="font-medium">Ana Martínez</div>
                    <div className="text-sm text-muted-foreground">UX Designer</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Normal</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4 fill-current text-green-500" />
                    <span>4.2</span>
                  </div>
                </div>
              </div>

              {/* Más empleados... */}
              <Button variant="outline" className="w-full">
                Ver todo el equipo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card className="border-l-4 border-l-destructive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Carlos López - Burnout Risk</CardTitle>
                <Badge variant="destructive">Crítico</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                5 check-ins consecutivos con estrés alto • 12h trabajo/día
              </p>
              <Button size="sm">Programar reunión</Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sobrecarga del Equipo</CardTitle>
                <Badge className="bg-orange-500">Alto</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Reuniones promedio: 6.5h/día • 60% reporta sobrecarga
              </p>
              <Button size="sm" variant="outline">Ver detalles</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progreso" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Gráfico de progreso aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
