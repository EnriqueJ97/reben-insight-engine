import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Eye, EyeOff, CheckCircle2, ShieldCheck, LineChart, Users, BellRing } from 'lucide-react';

const Login = () => {
  const { user, login, signUp, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN',
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  // SEO: título y meta descripción
  useEffect(() => {
    document.title = 'Login | REBEN - Bienestar Laboral';
    const desc = 'Inicia sesión en REBEN para gestionar el bienestar laboral con datos, alertas y acciones.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);


  // If user is already authenticated, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(loginData.email, loginData.password);

      if (error) {
        toast({
          title: "Error de autenticación",
          description: error.message || "Credenciales incorrectas",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sesión iniciada",
          description: "Bienvenido/a de vuelta",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(signupData.email, signupData.password, {
        fullName: signupData.fullName,
        role: signupData.role,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Usuario ya existe",
            description: "Esta dirección de email ya está registrada",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error de registro",
            description: error.message || "No se pudo crear la cuenta",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Cuenta creada",
          description: "Revisa tu email para confirmar la cuenta",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-background to-muted/40">
      <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-b from-primary/5 to-background border-r border-border">
        <header className="flex items-center gap-3">
          <img
            src="/lovable-uploads/16d593b1-7c69-44c4-8906-d86ff05ffc56.png"
            alt="Logo REBEN - plataforma de bienestar laboral"
            loading="lazy"
            className="h-10 w-auto"
          />
          <span className="sr-only">REBEN</span>
        </header>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">Bienestar laboral con impacto</h2>
          <p className="text-muted-foreground max-w-md">Reduce el burnout, mejora la retención y toma decisiones con datos y acciones guiadas.</p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Experiencia segura y rápida</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <span>Privacidad y cumplimiento</span>
            </li>
            <li className="flex items-start gap-3">
              <LineChart className="h-5 w-5 text-primary mt-0.5" />
              <span>Insights 30 vs 30 y objetivos por empresa</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <span>Enfoque en equipos y managers</span>
            </li>
            <li className="flex items-start gap-3">
              <BellRing className="h-5 w-5 text-primary mt-0.5" />
              <span>Alertas por email y Slack</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} REBEN</div>
      </aside>

      <main className="flex items-center justify-center p-6">
        <section className="w-full max-w-md animate-fade-in">
          <h1 className="sr-only">Iniciar sesión en REBEN</h1>
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4 lg:hidden">
                <img
                  src="/lovable-uploads/16d593b1-7c69-44c4-8906-d86ff05ffc56.png"
                  alt="Logo REBEN - plataforma de bienestar laboral"
                  loading="lazy"
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold tracking-tight">REBEN</span>
              </div>
              <CardTitle>Plataforma de Bienestar Laboral</CardTitle>
              <CardDescription>Accede a tu cuenta o crea una nueva</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4" aria-label="Formulario de inicio de sesión">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@empresa.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          autoComplete="current-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((v) => !v)}
                          aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full hover-scale" 
                      disabled={isLoading}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4" aria-label="Formulario de registro">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                        required
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@empresa.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Rol</Label>
                      <select
                        id="signup-role"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        value={signupData.role}
                        onChange={(e) => setSignupData({ ...signupData, role: e.target.value as any })}
                      >
                        <option value="EMPLOYEE">Empleado</option>
                        <option value="MANAGER">Manager</option>
                        <option value="HR_ADMIN">Administrador RRHH</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((v) => !v)}
                          aria-label={showSignupPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showSignupConfirm ? 'text' : 'password'}
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                          autoComplete="new-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirm((v) => !v)}
                          aria-label={showSignupConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showSignupConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full hover-scale" 
                      disabled={isLoading}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <Alert className="mt-6">
                <AlertDescription>
                  <strong>Cuentas de prueba:</strong><br />
                  • <strong>Empleado:</strong> empleado@demo.com / password123<br />
                  • <strong>Manager:</strong> manager@demo.com / password123<br />
                  • <strong>HR Admin:</strong> admin@demo.com / password123
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Login;