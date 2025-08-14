import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Users, Plus, Settings, Trash2, UserPlus, Shield, Link, Copy, Upload, 
  Search, Filter, MoreVertical, TrendingUp, AlertTriangle, CheckCircle,
  Building, Calendar, Mail, Phone, MapPin, Award, Clock, Target
} from 'lucide-react';

interface TeamData {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  member_count: number;
  manager?: {
    id: string;
    full_name?: string;
    email: string;
  };
  members?: Array<{
    id: string;
    full_name?: string;
    email: string;
    role: string;
    created_at: string;
  }>;
}

interface Profile {
  id: string;
  full_name?: string;
  email: string;
  role: string;
  team_id?: string;
  created_at: string;
  phone?: string;
  position?: string;
}

const EnhancedTeamsManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  
  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    managerId: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  useEffect(() => {
    if (user?.role === 'HR_ADMIN') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTeams(), loadProfiles()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        manager:profiles!teams_manager_id_fkey(id, full_name, email),
        member_count:profiles(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Process the data to get actual member counts
    const teamsWithCounts = await Promise.all(
      (data || []).map(async (team) => {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);
        
        return { ...team, member_count: count || 0 };
      })
    );

    setTeams(teamsWithCounts);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw error;
    setProfiles(data || []);
  };

  const createTeam = async () => {
    try {
      // Get current user's tenant
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('teams')
        .insert({
          name: teamForm.name,
          manager_id: teamForm.managerId === 'no-manager' ? null : teamForm.managerId,
          tenant_id: userProfile?.tenant_id
        });

      if (error) throw error;

      toast({
        title: 'Equipo creado',
        description: 'El equipo ha sido creado exitosamente'
      });

      setIsCreateTeamOpen(false);
      setTeamForm({ name: '', managerId: '' });
      loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el equipo',
        variant: 'destructive'
      });
    }
  };

  const updateTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamForm.name,
          manager_id: teamForm.managerId === 'no-manager' ? null : teamForm.managerId
        })
        .eq('id', selectedTeam.id);

      if (error) throw error;

      toast({
        title: 'Equipo actualizado',
        description: 'Los cambios han sido guardados'
      });

      setIsEditTeamOpen(false);
      setSelectedTeam(null);
      setTeamForm({ name: '', managerId: '' });
      loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive'
      });
    }
  };

  const deleteTeam = async (team: TeamData) => {
    if (!confirm(`¿Eliminar el equipo "${team.name}"? Los miembros quedarán sin equipo.`)) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;

      toast({
        title: 'Equipo eliminado',
        description: 'El equipo ha sido eliminado exitosamente'
      });

      loadTeams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el equipo',
        variant: 'destructive'
      });
    }
  };

  const assignEmployee = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          team_id: selectedTeamForAssignment === 'unassigned' ? null : selectedTeamForAssignment
        })
        .eq('id', selectedEmployee);

      if (error) throw error;

      toast({
        title: 'Empleado asignado',
        description: 'La asignación ha sido actualizada'
      });

      setIsAssignEmployeeOpen(false);
      setSelectedEmployee('');
      setSelectedTeamForAssignment('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo asignar el empleado',
        variant: 'destructive'
      });
    }
  };

  const openEditTeam = (team: TeamData) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      managerId: team.manager_id || 'no-manager'
    });
    setIsEditTeamOpen(true);
  };

  const openMemberDetail = (member: Profile) => {
    setSelectedMember(member);
    setIsMemberDetailOpen(true);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unassignedEmployees = profiles.filter(p => !p.team_id);
  const managers = profiles.filter(p => p.role === 'MANAGER');

  const getTeamStats = () => {
    const totalEmployees = profiles.length;
    const assignedEmployees = profiles.filter(p => p.team_id).length;
    const assignmentRate = totalEmployees > 0 ? (assignedEmployees / totalEmployees) * 100 : 0;

    return {
      totalTeams: teams.length,
      totalEmployees,
      assignedEmployees,
      unassignedEmployees: unassignedEmployees.length,
      assignmentRate
    };
  };

  const stats = getTeamStats();

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores HR pueden acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
            <p className="text-muted-foreground">
              Administra equipos y asignaciones de toda la compañía
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignEmployeeOpen} onOpenChange={setIsAssignEmployeeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Empleado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Empleado a Equipo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Empleado</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || profile.email}
                          {profile.team_id && <span className="text-muted-foreground"> (Asignado)</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Equipo</Label>
                  <Select value={selectedTeamForAssignment} onValueChange={setSelectedTeamForAssignment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin equipo</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={assignEmployee} 
                  disabled={!selectedEmployee || !selectedTeamForAssignment}
                  className="w-full"
                >
                  Asignar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Equipo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Equipo</Label>
                  <Input
                    id="name"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    placeholder="Ej: Equipo de Desarrollo"
                  />
                </div>
                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Select value={teamForm.managerId} onValueChange={(value) => setTeamForm({ ...teamForm, managerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-manager">Sin manager</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.full_name || manager.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createTeam} disabled={!teamForm.name} className="w-full">
                  Crear Equipo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Equipos</p>
                <p className="text-2xl font-bold">{stats.totalTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Empleados</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Asignados</p>
                <p className="text-2xl font-bold">{stats.assignedEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sin Asignar</p>
                <p className="text-2xl font-bold">{stats.unassignedEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tasa de Asignación</span>
            <span className="text-sm text-muted-foreground">{stats.assignmentRate.toFixed(1)}%</span>
          </div>
          <Progress value={stats.assignmentRate} className="w-full" />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{team.name}</CardTitle>
              </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditTeam(team)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTeam(team)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Manager:</span>
                <Badge variant={team.manager ? "default" : "secondary"}>
                  {team.manager?.full_name || team.manager?.email || 'Sin asignar'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Miembros:</span>
                <Badge variant="outline">
                  {team.member_count} persona{team.member_count !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground">
                Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay equipos creados</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer equipo para comenzar a organizar a los empleados.
            </p>
            <Button onClick={() => setIsCreateTeamOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Equipo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre del Equipo</Label>
              <Input
                id="edit-name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-manager">Manager</Label>
              <Select value={teamForm.managerId} onValueChange={(value) => setTeamForm({ ...teamForm, managerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un manager" />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-manager">Sin manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name || manager.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updateTeam} disabled={!teamForm.name} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTeamsManagement;