import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Shield, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TeamData {
  id: string;
  name: string;
  manager_id?: string;
  created_at: string;
  member_count: number;
  manager?: {
    full_name?: string;
    email: string;
  };
}

const HRTeamsManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    totalTeams: 0,
    averageTeamSize: 0,
    unassignedEmployees: 0,
    riskLevel: 'bajo' as 'bajo' | 'medio' | 'alto'
  });

  useEffect(() => {
    if (user?.role === 'HR_ADMIN') {
      loadTeamsData();
    }
  }, [user]);

  const loadTeamsData = async () => {
    try {
      setLoading(true);
      
      // Get teams with manager info and member count
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          manager_id,
          created_at,
          manager:profiles!teams_manager_id_fkey(full_name, email)
        `)
        .eq('tenant_id', user?.tenant_id);

      if (teamsError) throw teamsError;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (teamsData || []).map(async (team) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
            .eq('tenant_id', user?.tenant_id);

          return {
            ...team,
            member_count: count || 0
          };
        })
      );

      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user?.tenant_id);

      // Get unassigned employees
      const { count: unassignedEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user?.tenant_id)
        .is('team_id', null);

      setTeams(teamsWithCounts);
      setMetrics({
        totalEmployees: totalEmployees || 0,
        totalTeams: teamsWithCounts.length,
        averageTeamSize: teamsWithCounts.length > 0 
          ? Math.round(teamsWithCounts.reduce((acc, team) => acc + team.member_count, 0) / teamsWithCounts.length)
          : 0,
        unassignedEmployees: unassignedEmployees || 0,
        riskLevel: (unassignedEmployees || 0) > 10 ? 'alto' : (unassignedEmployees || 0) > 5 ? 'medio' : 'bajo'
      });

    } catch (error) {
      console.error('Error loading teams data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos de equipos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'medio': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Gestión Organizacional</h1>
        <Badge variant="outline">HR Admin</Badge>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTeams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Equipo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageTeamSize}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Equipo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.unassignedEmployees}</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRiskBadgeColor(metrics.riskLevel)}`}>
              Riesgo {metrics.riskLevel}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="structure">Estructura Organizacional</TabsTrigger>
          <TabsTrigger value="insights">Insights Estratégicos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Equipos - Vista Agregada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {team.manager?.full_name || 'Sin manager asignado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Creado: {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{team.member_count}</div>
                      <div className="text-sm text-muted-foreground">miembros</div>
                      <Badge 
                        variant="outline" 
                        className={team.member_count === 0 ? 'border-amber-200 text-amber-700' : 'border-green-200 text-green-700'}
                      >
                        {team.member_count === 0 ? 'Vacío' : 'Activo'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {teams.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay equipos configurados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Alert>
            <Building className="h-4 w-4" />
            <AlertDescription>
              La estructura organizacional se gestiona a través de integraciones con el HRIS. 
              Los cambios manuales están deshabilitados por seguridad.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Equipos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between">
                  <span className="font-medium">{team.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-accent rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${metrics.totalEmployees > 0 ? (team.member_count / metrics.totalEmployees) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {metrics.totalEmployees > 0 ? Math.round((team.member_count / metrics.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones Estratégicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">Optimización</h4>
                  <p className="text-sm">Considera fusionar equipos con menos de 3 miembros</p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-amber-700">Atención</h4>
                  <p className="text-sm">{metrics.unassignedEmployees} empleados sin equipo requieren asignación</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Oportunidad</h4>
                  <p className="text-sm">Equipos balanceados muestran mejor rendimiento general</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Salud Organizacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cobertura de equipos</span>
                  <Badge variant="outline">
                    {metrics.totalEmployees > 0 
                      ? Math.round(((metrics.totalEmployees - metrics.unassignedEmployees) / metrics.totalEmployees) * 100)
                      : 0}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Distribución equilibrada</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Buena
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Managers asignados</span>
                  <Badge variant="outline">
                    {teams.filter(team => team.manager_id).length}/{teams.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRTeamsManagement;