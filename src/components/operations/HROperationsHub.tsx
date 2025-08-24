import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, TrendingUp, Shield, Settings, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HROperationsHub = () => {
  const { user } = useAuth();

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores HR pueden acceder a esta funcionalidad.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Análisis Organizacional Básico</h1>
        <Badge variant="outline">HR Admin</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="teams">Comparativa Equipos</TabsTrigger>
          <TabsTrigger value="patterns">Patrones Globales</TabsTrigger>
          <TabsTrigger value="privacy">Control de Privacidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  Distribuidos en 8 áreas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgo Global</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Personas en riesgo de rotación
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa entre Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Ventas</h4>
                    <p className="text-sm text-muted-foreground">15 personas • Manager: Ana García</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 85%</Badge>
                    <Badge variant="outline">Productividad: 92%</Badge>
                    <Badge className="bg-green-100 text-green-800">Bajo Riesgo</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Desarrollo</h4>
                    <p className="text-sm text-muted-foreground">22 personas • Manager: Carlos López</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 72%</Badge>
                    <Badge variant="outline">Productividad: 88%</Badge>
                    <Badge className="bg-amber-100 text-amber-800">Riesgo Medio</Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equipo Soporte</h4>
                    <p className="text-sm text-muted-foreground">8 personas • Manager: María Rodríguez</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Bienestar: 91%</Badge>
                    <Badge variant="outline">Productividad: 87%</Badge>
                    <Badge className="bg-green-100 text-green-800">Bajo Riesgo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrones Organizacionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700">Tendencia Positiva</h4>
                <p className="text-sm">Los equipos con trabajo flexible muestran 15% mayor retención</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-amber-700">Área de Atención</h4>
                <p className="text-sm">El área de IT tiene 23% mayor rotación que el promedio organizacional</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700">Oportunidad</h4>
                <p className="text-sm">Managers con feedback 360° regular tienen equipos 18% más productivos</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-700">Riesgo Identificado</h4>
                <p className="text-sm">5 equipos muestran signos tempranos de burnout colectivo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Los datos personales y sensibles están agregados para proteger la privacidad individual.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Mostrar nombres en análisis de riesgo</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">Deshabilitado</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Acceso a datos de salarios por managers</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">Restringido</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Comparativas cross-equipo anónimas</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Habilitado</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Exportación de datos agregados</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Solo HR Admin</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HROperationsHub;