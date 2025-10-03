import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading: authLoading } = useAuth();

  // Solo mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Permitir acceso directo al dashboard sin verificar onboarding
  // El onboarding solo se mostrará si el usuario navega explícitamente a esa ruta
  return <>{children}</>;
};

export default OnboardingCheck;