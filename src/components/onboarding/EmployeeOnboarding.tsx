import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Target, Trophy } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'employee_onboarding_completed_v1';

const steps = [
  {
    title: 'Bienvenido/a a tu espacio de bienestar',
    description: 'Tu check-in diario te ayuda a cuidar tu salud emocional y a construir mejores hábitos. Solo te tomará 30 segundos.',
    icon: Sparkles,
  },
  {
    title: 'Check-in y EIE',
    description: 'Comparte cómo te sientes y completa el EIE cuando toque. Tus respuestas son privadas y se usan de forma agregada.',
    icon: Heart,
  },
  {
    title: 'Insignias y rachas',
    description: 'Gana insignias por constancia y mantén tu racha de check-ins. Te enviaremos recomendaciones personalizadas.',
    icon: Trophy,
  },
];

const EmployeeOnboarding: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'EMPLOYEE') return;
    const completed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!completed) setOpen(true);
  }, [user]);

  const closeAndComplete = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    setOpen(false);
  };

  if (!user || user.role !== 'EMPLOYEE') return null;

  const CurrentIcon = steps[step].icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Tu onboarding de bienestar
          </DialogTitle>
          <DialogDescription>
            3 pasos rápidos para empezar con buen pie.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-semibold">{steps[step].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[step].description}</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Privacidad</Badge>
            <Badge variant="secondary">30s al día</Badge>
            <Badge variant="secondary">Recomendaciones</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Paso {step + 1} de {steps.length}</div>
            <div className="space-x-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Atrás
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                  Siguiente
                </Button>
              ) : (
                <Button size="sm" onClick={closeAndComplete}>
                  ¡Empezar!
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeOnboarding;
