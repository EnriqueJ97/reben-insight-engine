import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';
import { EmployeeImportWizard } from './EmployeeImportWizard';

const STEPS = [
  { id: 1, title: 'Información de la empresa', icon: Building2 },
  { id: 2, title: 'Importar empleados', icon: Users },
  { id: 3, title: 'Configuración inicial', icon: FileSpreadsheet },
  { id: 4, title: 'Activar IA', icon: Sparkles },
];

export const ProductionOnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState({
    name: '',
    industry: '',
    company_size: '',
    timezone: 'America/Mexico_City',
    description: ''
  });

  const [configData, setConfigData] = useState({
    daily_checkin_time: '09:00',
    weekly_reports: true,
    email_enabled: true,
    slack_enabled: false
  });

  const handleCompanySubmit = async () => {
    if (!companyData.name || !companyData.industry || !companyData.company_size) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: companyData.name,
          industry: companyData.industry,
          company_size: companyData.company_size,
          timezone: companyData.timezone,
          description: companyData.description,
        })
        .eq('id', user?.tenant_id);

      if (error) throw error;

      // Limpiar datos demo
      await cleanDemoData();

      toast({
        title: "Empresa configurada",
        description: "Información guardada correctamente"
      });

      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cleanDemoData = async () => {
    try {
      // Eliminar alertas demo
      await supabase
        .from('alerts')
        .delete()
        .in('user_id', [
          '077afb5f-5517-49ab-a5a2-5b78461b9e27',
          '21492075-9c79-4bfd-9665-11612a41dbe2',
          '7b0838be-6081-4c53-9e5d-b9acdd1086d3'
        ]);

      // Eliminar check-ins demo
      await supabase
        .from('checkins')
        .delete()
        .in('user_id', [
          '077afb5f-5517-49ab-a5a2-5b78461b9e27',
          '21492075-9c79-4bfd-9665-11612a41dbe2',
          '7b0838be-6081-4c53-9e5d-b9acdd1086d3'
        ]);

      console.log('Demo data cleaned successfully');
    } catch (error) {
      console.error('Error cleaning demo data:', error);
    }
  };

  const handleConfigSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          settings: {
            daily_checkin_time: configData.daily_checkin_time,
            weekly_reports: configData.weekly_reports,
            email_enabled: configData.email_enabled,
            slack_enabled: configData.slack_enabled
          }
        })
        .eq('id', user?.tenant_id);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Preferencias actualizadas correctamente"
      });

      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAI = async () => {
    setLoading(true);
    try {
      // Marcar onboarding como completado
      const { error } = await supabase
        .from('tenants')
        .update({ onboarding_completed: true })
        .eq('id', user?.tenant_id);

      if (error) throw error;

      toast({
        title: "¡Bienvenido a REBEN!",
        description: "Tu plataforma está lista para usar",
        duration: 5000
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "No se pudo completar el onboarding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-3xl">Configuración Inicial</CardTitle>
              <CardDescription className="text-lg mt-2">
                Configura tu empresa en {STEPS.length} pasos simples
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Paso {currentStep} de {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Steps indicator */}
          <div className="flex justify-between mt-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <span className="text-xs text-center max-w-[100px]">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la empresa *</Label>
                <Input
                  id="company-name"
                  placeholder="Ej: Tech Solutions México"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <Select
                    value={companyData.industry}
                    onValueChange={(value) => setCompanyData({ ...companyData, industry: value })}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Selecciona industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufactura</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Tamaño *</Label>
                  <Select
                    value={companyData.company_size}
                    onValueChange={(value) => setCompanyData({ ...companyData, company_size: value })}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Número de empleados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="501-1000">501-1000 empleados</SelectItem>
                      <SelectItem value="1001+">1001+ empleados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zona horaria</Label>
                <Select
                  value={companyData.timezone}
                  onValueChange={(value) => setCompanyData({ ...companyData, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    <SelectItem value="America/Monterrey">Monterrey (GMT-6)</SelectItem>
                    <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
                    <SelectItem value="America/Cancun">Cancún (GMT-5)</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Breve descripción de tu empresa"
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleCompanySubmit} disabled={loading}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Import Employees */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <EmployeeImportWizard onComplete={() => setCurrentStep(3)} />
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="checkin-time">Hora de check-in diario</Label>
                <Input
                  id="checkin-time"
                  type="time"
                  value={configData.daily_checkin_time}
                  onChange={(e) => setConfigData({ ...configData, daily_checkin_time: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Los empleados recibirán recordatorios a esta hora
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reportes semanales automáticos</Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe resúmenes semanales por email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.weekly_reports}
                    onChange={(e) => setConfigData({ ...configData, weekly_reports: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por email</Label>
                    <p className="text-xs text-muted-foreground">
                      Alertas y recordatorios por correo
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.email_enabled}
                    onChange={(e) => setConfigData({ ...configData, email_enabled: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Atrás
                </Button>
                <Button onClick={handleConfigSubmit} disabled={loading}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Activate AI */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-4 py-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Sistema de IA Activado</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  REBEN comenzará a analizar el bienestar de tu equipo automáticamente. 
                  Los empleados recibirán check-ins diarios y el sistema detectará riesgos de burnout y rotación.
                </p>

                <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Detección automática de burnout</p>
                      <p className="text-sm text-muted-foreground">
                        Análisis predictivo con IA de Google Gemini
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Predicción de rotación</p>
                      <p className="text-sm text-muted-foreground">
                        Identifica empleados en riesgo antes de que renuncien
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Recomendaciones personalizadas</p>
                      <p className="text-sm text-muted-foreground">
                        Acciones concretas basadas en datos reales
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Impacto económico automático</p>
                      <p className="text-sm text-muted-foreground">
                        Calcula ROI y savings en tiempo real
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Atrás
                </Button>
                <Button onClick={handleActivateAI} disabled={loading} size="lg">
                  Comenzar a usar REBEN
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
