import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import OnboardingWizard from './OnboardingWizard';

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, tenant } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.tenant_id) {
      checkOnboardingStatus();
    } else if (user && !user.tenant_id) {
      // Si el usuario existe pero no tiene tenant_id, no necesita onboarding
      setLoading(false);
      setNeedsOnboarding(false);
    }
  }, [user?.tenant_id, user]); // Incluir user para manejar el caso sin tenant_id

  const checkOnboardingStatus = async () => {
    if (!user?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('onboarding_completed')
        .eq('id', user.tenant_id)
        .single();

      if (error) throw error;

      // Check if onboarding is completed
      const isCompleted = data?.onboarding_completed || false;
      setNeedsOnboarding(!isCompleted);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing onboarding if there's an error
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  // Show onboarding wizard if needed
  if (needsOnboarding && user?.role === 'HR_ADMIN') {
    return <OnboardingWizard />;
  }

  // Show normal app content
  return <>{children}</>;
};

export default OnboardingCheck; 