import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductionOnboardingWizard } from './ProductionOnboardingWizard';
import { QuickDemoSetup } from './QuickDemoSetup';

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Esperar a que auth termine de cargar
    if (authLoading) {
      return;
    }

    // Si no hay user, no hacer nada
    if (!user) {
      setChecking(false);
      return;
    }

    // SUPER_ADMIN nunca necesita onboarding
    if (user.role === 'SUPER_ADMIN') {
      setNeedsOnboarding(false);
      setChecking(false);
      return;
    }

    // Si no tiene tenant_id, no necesita onboarding (se asignará automáticamente)
    if (!user.tenant_id) {
      setNeedsOnboarding(false);
      setChecking(false);
      return;
    }

    // Verificar estado de onboarding del tenant
    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('onboarding_completed')
          .eq('id', user.tenant_id)
          .single();

        if (error) {
          console.error('Error checking onboarding:', error);
          // En caso de error, asumir que NO necesita onboarding (mejor experiencia)
          setNeedsOnboarding(false);
        } else {
          // Solo mostrar onboarding si es HR_ADMIN y el tenant NO está completado
          const needsIt = user.role === 'HR_ADMIN' && !data?.onboarding_completed;
          setNeedsOnboarding(needsIt);
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setNeedsOnboarding(false);
      } finally {
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [user?.id, authLoading]); // Solo depender de user.id y authLoading

  // Mostrar loading solo si auth está cargando O si estamos verificando
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si necesita onboarding, mostrar el wizard
  if (needsOnboarding) {
    return <QuickDemoSetup />;
  }

  // Caso normal: mostrar la app
  return <>{children}</>;
};

export default OnboardingCheck;