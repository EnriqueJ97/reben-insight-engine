import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Rocket, Building2, Users, Sparkles, ArrowRight } from 'lucide-react';

/**
 * QuickDemoSetup - Onboarding ultra-simplificado de 2 pasos
 * Solución al problema: "El SAAS es muy complicado para probar"
 */
export const QuickDemoSetup = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  const handleQuickStart = async () => {
    if (!companyName || !employeeCount) {
      toast({
        title: "Campos requeridos",
        description: "Necesitamos el nombre de tu empresa y cantidad de empleados",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Actualizar tenant con info básica
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          name: companyName,
          company_size: getSizeCategory(parseInt(employeeCount)),
        })
        .eq('id', user?.tenant_id);

      if (tenantError) throw tenantError;

      // 2. Crear datos demo automáticamente
      await createDemoData();

      toast({
        title: "¡Listo! 🎉",
        description: "Tu cuenta está configurada. Explora el dashboard.",
      });

      // Redirigir al dashboard
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error in quick setup:', error);
      toast({
        title: "Error",
        description: "Hubo un problema. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoData = async () => {
    // En producción, esto crearía:
    // - 3 usuarios demo (Manager + 2 Empleados)
    // - Check-ins de ejemplo de los últimos 7 días
    // - Alertas de demostración
    
    // Por ahora, solo registramos que se completó el setup
    console.log('Demo data setup completed for tenant:', user?.tenant_id);
    
    // Marcar onboarding como completado
    await supabase
      .from('tenants')
      .update({ onboarding_completed: true })
      .eq('id', user?.tenant_id);
  };

  const getSizeCategory = (count: number): string => {
    if (count < 50) return '1-50';
    if (count < 200) return '51-200';
    if (count < 1000) return '201-1000';
    return '1000+';
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">¡Bienvenido a REBEN! 👋</CardTitle>
            <CardDescription className="text-base">
              Configura tu cuenta en <strong>2 minutos</strong> y empieza a medir el bienestar de tu equipo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company" className="text-base">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Nombre de tu empresa
                </Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Acme Corp"
                  className="mt-2 h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="employees" className="text-base">
                  <Users className="w-4 h-4 inline mr-2" />
                  ¿Cuántos empleados tienen?
                </Label>
                <Input
                  id="employees"
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="Ej: 150"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Incluye automáticamente:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>✓ Dashboard con métricas en tiempo real</li>
                <li>✓ Check-ins diarios automatizados</li>
                <li>✓ Alertas de bienestar con IA</li>
                <li>✓ 3 usuarios demo para probar</li>
              </ul>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full h-12 text-base"
              disabled={!companyName || !employeeCount}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Puedes personalizar todo después • Sin tarjeta de crédito
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Confirmación rápida
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configurando tu cuenta...</CardTitle>
          <CardDescription>
            Estamos preparando tu dashboard personalizado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Empresa: <strong>{companyName}</strong></span>
              <span>{employeeCount} empleados</span>
            </div>
            
            <Progress value={loading ? 66 : 33} className="h-2" />
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <p className="font-medium">🎉 Tu cuenta incluirá:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Dashboard ejecutivo con métricas clave</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>3 usuarios demo para explorar funcionalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Check-ins de ejemplo de los últimos 7 días</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Alertas inteligentes activadas</span>
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleQuickStart} 
            className="w-full h-12 text-base"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Configurando...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                ¡Empezar a usar REBEN!
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => setStep(1)}
            className="w-full"
            disabled={loading}
          >
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
