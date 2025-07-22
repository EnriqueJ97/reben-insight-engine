
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Building2 } from 'lucide-react';

const JoinTeam = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, signUp, login } = useAuth();
  const { getTeamByInviteCode } = useTeams();
  const { toast } = useToast();
  
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  useEffect(() => {
    const loadTeam = async () => {
      if (!inviteCode) return;
      
      try {
        const teamData = await getTeamByInviteCode(inviteCode);
        setTeam(teamData);
      } catch (error) {
        console.error('Error loading team:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [inviteCode, getTeamByInviteCode]);

  // If user is already authenticated, redirect to team page
  if (user) {
    return <Navigate to="/dashboard/team" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Sign up flow
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive"
        });
        return;
      }

      const { error } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        role: 'EMPLOYEE',
        teamId: team?.id
      });

      if (error) {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registro exitoso",
          description: `Te has unido al equipo ${team?.name}. Revisa tu email para confirmar la cuenta.`
        });
      }
    } else {
      // Login flow
      const { error } = await login(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Invitación no válida</h3>
            <p className="text-muted-foreground">
              Esta invitación no existe o ha expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">REBEN</h1>
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Únete al equipo {team.name}</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6">
            <UserPlus className="h-4 w-4" />
            <AlertDescription>
              Has sido invitado/a a unirte al equipo <strong>{team.name}</strong>. 
              {isLogin ? ' Inicia sesión para continuar.' : ' Regístrate para formar parte del equipo.'}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              {isLogin ? 'Iniciar Sesión' : 'Unirse al Equipo'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? '¿Nuevo usuario? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTeam;
