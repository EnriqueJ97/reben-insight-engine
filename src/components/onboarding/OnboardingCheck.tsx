import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProductionOnboardingWizard } from './ProductionOnboardingWizard';

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SUPER_ADMIN no necesita onboarding
    if (user?.role === 'SUPER_ADMIN') {
      setLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    if (user?.tenant_id) {
      checkOnboardingStatus();
    } else if (user && !user.tenant_id) {
      setLoading(false);
      setNeedsOnboarding(false);
    }
  }, [user?.tenant_id, user, user?.role]);

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

      const isCompleted = data?.onboarding_completed || false;
      setNeedsOnboarding(!isCompleted);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding && user?.role === 'HR_ADMIN') {
    return <ProductionOnboardingWizard />;
  }

  return <>{children}</>;
};

export default OnboardingCheck;