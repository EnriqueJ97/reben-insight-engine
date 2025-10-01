import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  CheckCircle2
} from 'lucide-react';

export const SimplifiedEmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Bienestar</h1>
        <p className="text-muted-foreground">Tu panel personal</p>
      </div>

      {/* Check-in rápido */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              ¿Cómo te sientes hoy?
            </CardTitle>
            <Badge>Check-in Diario</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tu último check-in fue hace 2 días
          </p>
          <Button className="w-full">
            <Heart className="h-4 w-4 mr-2" />
            Hacer Check-in Ahora
          </Button>
        </CardContent>
      </Card>

      {/* Métricas personales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tu Bienestar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">4.2</div>
              <div className="flex-1">
                <Progress value={84} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  Muy bien
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha de Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-3xl font-bold">12</div>
                <div className="text-xs text-muted-foreground">días consecutivos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas Trabajadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <div className="text-3xl font-bold">38h</div>
                <div className="text-xs text-muted-foreground">esta semana</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos turnos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mis Próximos Turnos
            </CardTitle>
            <Button variant="outline" size="sm">Ver calendario</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Lunes 7 Oct</div>
              <div className="text-sm text-muted-foreground">09:00 - 18:00 • Oficina</div>
            </div>
            <Badge>Confirmado</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Martes 8 Oct</div>
              <div className="text-sm text-muted-foreground">09:00 - 18:00 • Remoto</div>
            </div>
            <Badge>Confirmado</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Miércoles 9 Oct</div>
              <div className="text-sm text-muted-foreground">09:00 - 18:00 • Híbrido</div>
            </div>
            <Badge variant="outline">Pendiente</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progreso personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tu Progreso Este Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Gráfico de tu evolución aquí</p>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Mis Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completar check-ins diarios</span>
              <span className="text-muted-foreground">12/20 días</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Mantener bienestar {'>'} 4.0</span>
              <span className="text-muted-foreground">En progreso</span>
            </div>
            <Progress value={84} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
