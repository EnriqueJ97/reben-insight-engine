import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Building2, Users, Settings, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  completed: boolean;
}

interface CompanySetup {
  name: string;
  industry: string;
  size: string;
  timezone: string;
  description: string;
}

const OnboardingWizard = () => {
  const { user, tenant } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [companySetup, setCompanySetup] = useState<CompanySetup>({
    name: '',
    industry: '',
    size: '',
    timezone: '',
    description: ''
  });

  const steps: OnboardingStep[] = [
    {
      id: 'company',
      title: 'Información de la Empresa',
      description: 'Configura los datos básicos de tu empresa',
      icon: Building2,
      completed: false
    },
    {
      id: 'team',
      title: 'Configurar Equipo',
      description: 'Invita a los miembros de tu equipo',
      icon: Users,
      completed: false
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Personaliza la experiencia de bienestar',
      icon: Settings,
      completed: false
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura las alertas y recordatorios',
      icon: Bell,
      completed: false
    }
  ];

  const handleCompanyUpdate = (field: keyof CompanySetup, value: string) => {
    setCompanySetup(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      // Save company information
      await saveCompanyInfo();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const saveCompanyInfo = async () => {
    if (!user?.tenant_id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: companySetup.name,
          industry: companySetup.industry,
          company_size: companySetup.size,
          timezone: companySetup.timezone,
          description: companySetup.description,
        })
        .eq('id', user.tenant_id);

      if (error) throw error;

      toast({
        title: "Información guardada",
        description: "Los datos de la empresa se han actualizado correctamente"
      });

      steps[0].completed = true;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la información de la empresa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user?.tenant_id) return;
    
    setIsLoading(true);
    try {
      // Mark onboarding as completed
      const { error } = await supabase
        .from('tenants')
        .update({ onboarding_completed: true })
        .eq('id', user.tenant_id);

      if (error) throw error;

      toast({
        title: "¡Onboarding completado!",
        description: "Tu empresa está lista para usar la plataforma"
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el onboarding",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name">Nombre de la Empresa *</Label>
                <Input
                  id="company-name"
                  value={companySetup.name}
                  onChange={(e) => handleCompanyUpdate('name', e.target.value)}
                  placeholder="Ej: TechCorp"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industria *</Label>
                <Select value={companySetup.industry} onValueChange={(value) => handleCompanyUpdate('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una industria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Tecnología</SelectItem>
                    <SelectItem value="healthcare">Salud</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                    <SelectItem value="education">Educación</SelectItem>
                    <SelectItem value="retail">Comercio</SelectItem>
                    <SelectItem value="manufacturing">Manufactura</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Tamaño de la Empresa *</Label>
                <Select value={companySetup.size} onValueChange={(value) => handleCompanyUpdate('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 empleados</SelectItem>
                    <SelectItem value="11-50">11-50 empleados</SelectItem>
                    <SelectItem value="51-200">51-200 empleados</SelectItem>
                    <SelectItem value="201-500">201-500 empleados</SelectItem>
                    <SelectItem value="500+">500+ empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Zona Horaria *</Label>
                <Select value={companySetup.timezone} onValueChange={(value) => handleCompanyUpdate('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                    <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={companySetup.description}
                onChange={(e) => handleCompanyUpdate('description', e.target.value)}
                placeholder="Describe brevemente tu empresa..."
                rows={3}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Invitar Miembros del Equipo</h3>
              <p className="text-muted-foreground">
                Invita a los miembros de tu equipo para comenzar a monitorear el bienestar
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Próximos pasos:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Configura la información de la empresa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Invita a los miembros del equipo
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  Personaliza la configuración
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  Configura notificaciones
                </li>
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Configuración de Bienestar</h3>
              <p className="text-muted-foreground">
                Personaliza la experiencia de bienestar para tu equipo
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Frecuencia de Check-ins</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Horario de Recordatorios</Label>
                <Select defaultValue="morning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Mañana (9:00 AM)</SelectItem>
                    <SelectItem value="afternoon">Mediodía (12:00 PM)</SelectItem>
                    <SelectItem value="evening">Tarde (5:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Configurar Notificaciones</h3>
              <p className="text-muted-foreground">
                Configura cómo recibir alertas y notificaciones
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Alertas de Burnout</h4>
                  <p className="text-sm text-muted-foreground">Notificaciones cuando un empleado muestre signos de burnout</p>
                </div>
                <Badge variant="secondary">Activado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Reportes Semanales</h4>
                  <p className="text-sm text-muted-foreground">Resumen semanal del bienestar del equipo</p>
                </div>
                <Badge variant="secondary">Activado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Recordatorios de Check-in</h4>
                  <p className="text-sm text-muted-foreground">Recordatorios diarios para completar check-ins</p>
                </div>
                <Badge variant="secondary">Activado</Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Configuración Inicial</CardTitle>
          <CardDescription>
            Configura tu empresa para comenzar a monitorear el bienestar del equipo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Paso {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} />
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Completar Configuración
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard; 