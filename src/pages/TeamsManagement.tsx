
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/useTeams';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Settings, Trash2, UserPlus, Shield, Link, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeamsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { teams, loading, createTeam, updateTeam, deleteTeam, assignEmployeeToTeam, generateInviteLink } = useTeams();
  const { profiles } = useProfiles();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', managerId: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTeamForAssignment, setSelectedTeamForAssignment] = useState('');

  // Filter profiles to get potential managers (MANAGER role) and all employees
  const managers = profiles.filter(p => p.role === 'MANAGER');
  const unassignedEmployees = profiles.filter(p => !p.team_id);

  const handleCreateTeam = async () => {
    try {
      await createTeam(formData.name, formData.managerId === 'no-manager' ? undefined : formData.managerId);
      toast({
        title: "Equipo creado",
        description: "El equipo ha sido creado exitosamente."
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', managerId: '' });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el equipo. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    try {
      await updateTeam(selectedTeam.id, {
        name: formData.name,
        manager_id: formData.managerId === 'no-manager' ? undefined : formData.managerId
      });
      toast({
        title: "Equipo actualizado",
        description: "Los cambios han sido guardados exitosamente."
      });
      setIsEditDialogOpen(false);
      setSelectedTeam(null);
      setFormData({ name: '', managerId: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (team: any) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el equipo "${team.name}"? Los empleados asignados quedarán sin equipo.`)) {
      try {
        await deleteTeam(team.id);
        toast({
          title: "Equipo eliminado",
          description: "El equipo ha sido eliminado exitosamente."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el equipo. Intenta nuevamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAssignEmployee = async () => {
    try {
      await assignEmployeeToTeam(
        selectedEmployee, 
        selectedTeamForAssignment === 'unassigned' ? null : selectedTeamForAssignment
      );
      toast({
        title: "Asignación actualizada",
        description: "El empleado ha sido asignado exitosamente."
      });
      setIsAssignDialogOpen(false);
      setSelectedEmployee('');
      setSelectedTeamForAssignment('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar el empleado. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (team: any) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      managerId: team.manager_id || 'no-manager'
    });
    setIsEditDialogOpen(true);
  };

  const openInviteDialog = (team: any) => {
    setSelectedTeam(team);
    setIsInviteDialogOpen(true);
  };

  const copyInviteLink = (teamId: string) => {
    const link = generateInviteLink(teamId);
    if (link) {
      navigator.clipboard.writeText(link);
      toast({
        title: "Enlace copiado",
        description: "El enlace de invitación ha sido copiado al portapapeles."
      });
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary" />
            <span>Gestión de Equipos</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los equipos y asigna empleados y managers
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
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
                          {profile.team_id && <span className="text-muted-foreground"> (Ya asignado)</span>}
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
                  onClick={handleAssignEmployee} 
                  disabled={!selectedEmployee || !selectedTeamForAssignment}
                  className="w-full"
                >
                  Asignar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Equipo de Desarrollo"
                  />
                </div>
                <div>
                  <Label htmlFor="manager">Manager (Opcional)</Label>
                  <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
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
                <Button onClick={handleCreateTeam} disabled={!formData.name} className="w-full">
                  Crear Equipo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{team.name}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInviteDialog(team)}
                    title="Generar enlace de invitación"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(team)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manager:</span>
                  <Badge variant={team.manager ? "default" : "secondary"}>
                    {team.manager?.full_name || team.manager?.email || 'Sin asignar'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Miembros:</span>
                  <Badge variant="outline">
                    {team.member_count || 0} persona{(team.member_count || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay equipos creados</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer equipo para comenzar a organizar a los empleados.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Equipo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre del Equipo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-manager">Manager</Label>
              <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
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
            <Button onClick={handleUpdateTeam} disabled={!formData.name} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar al Equipo: {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Comparte este enlace para que las personas se registren directamente en el equipo:
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={generateInviteLink(selectedTeam?.id) || ''}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyInviteLink(selectedTeam?.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Alert>
              <AlertDescription>
                Las personas que usen este enlace se registrarán automáticamente como empleados y se asignarán a este equipo.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsManagement;
