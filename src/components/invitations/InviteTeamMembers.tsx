import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  UserPlus, 
  Mail, 
  Users, 
  CheckCircle, 
  Clock, 
  X, 
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CSVRow } from '@/types';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

const InviteTeamMembers = () => {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN',
    message: ''
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !user?.tenant_id) return;

    setIsLoading(true);
    try {
      // Generate invite code
      const inviteCode = generateInviteCode();
      
      // Create invitation in database
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          tenant_id: user.tenant_id,
          email: inviteData.email.toLowerCase(),
          role: inviteData.role,
          invite_code: inviteCode,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          message: inviteData.message
        })
        .select()
        .single();

      if (error) throw error;

      // Send email invitation (mock for now)
      await sendInvitationEmail(inviteData.email, inviteCode, inviteData.role);

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteData.email}`
      });

      // Reset form
      setInviteData({
        email: '',
        role: 'EMPLOYEE',
        message: ''
      });

      // Refresh invitations list
      fetchInvitations();

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const sendInvitationEmail = async (email: string, code: string, role: string) => {
    // Mock email sending - in production this would use a real email service
    console.log(`Sending invitation to ${email} with code ${code} for role ${role}`);
    
    // For demo purposes, we'll simulate email sending
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const fetchInvitations = async () => {
    if (!user?.tenant_id) return;

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitación revocada",
        description: "La invitación ha sido cancelada"
      });

      fetchInvitations();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo revocar la invitación",
        variant: "destructive"
      });
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join-team/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Enlace copiado",
      description: "El enlace de invitación ha sido copiado al portapapeles"
    });
  };

  const handleBulkImport = async () => {
    if (csvData.length === 0) return;

    setIsLoading(true);
    try {
      const validInvitations = csvData.filter(row => row.valid);
      
      for (const row of validInvitations) {
        const inviteCode = generateInviteCode();
        
        await supabase
          .from('invitations')
          .insert({
            tenant_id: user?.tenant_id,
            email: row.email.toLowerCase(),
            role: row.rol.toUpperCase(),
            invite_code: inviteCode,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });

        // Send email invitation
        await sendInvitationEmail(row.email, inviteCode, row.rol);
      }

      toast({
        title: "Importación completada",
        description: `${validInvitations.length} invitaciones han sido enviadas`
      });

      setShowBulkImport(false);
      setCsvData([]);
      fetchInvitations();

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la importación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "nombre,email,rol,equipo\nJuan Pérez,juan@empresa.com,EMPLOYEE,Desarrollo\nMaría García,maria@empresa.com,MANAGER,Marketing";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitaciones_equipo.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'accepted':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Aceptada</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'EMPLOYEE':
        return 'Empleado';
      case 'MANAGER':
        return 'Gerente';
      case 'HR_ADMIN':
        return 'Admin HR';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invitar Miembros del Equipo</h2>
          <p className="text-muted-foreground">
            Invita a los miembros de tu equipo para comenzar a monitorear el bienestar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkImport(!showBulkImport)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
        </div>
      </div>

      {/* Bulk Import Section */}
      {showBulkImport && (
        <Card>
          <CardHeader>
            <CardTitle>Importar Invitaciones</CardTitle>
            <CardDescription>
              Sube un archivo CSV con la información de los miembros del equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Total: {csvData.length}</Label>
                </div>
                <div>
                  <Label>Válidos: {csvData.filter(row => row.valid).length}</Label>
                </div>
                <div>
                  <Label>Con errores: {csvData.filter(row => !row.valid).length}</Label>
                </div>
              </div>
              
              {csvData.length > 0 && (
                <div className="max-h-60 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.nombre}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{getRoleLabel(row.rol)}</TableCell>
                          <TableCell>
                            {row.valid ? (
                              <Badge variant="default">Válido</Badge>
                            ) : (
                              <Badge variant="destructive">
                                {row.errors.join(', ')}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleBulkImport} disabled={csvData.length === 0 || isLoading}>
                  Enviar Invitaciones ({csvData.filter(row => row.valid).length})
                </Button>
                <Button variant="outline" onClick={() => setShowBulkImport(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar Miembro Individual
          </CardTitle>
          <CardDescription>
            Invita a un miembro específico del equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="empleado@empresa.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="HR_ADMIN">Admin HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Mensaje Personalizado (Opcional)</Label>
              <Input
                id="message"
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="¡Te invitamos a unirte a nuestra plataforma de bienestar!"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitaciones Enviadas
          </CardTitle>
          <CardDescription>
            Gestiona las invitaciones enviadas a tu equipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay invitaciones enviadas</p>
              <p className="text-sm">Las invitaciones aparecerán aquí una vez enviadas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell>
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.invite_code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvitation(invitation.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteTeamMembers; 