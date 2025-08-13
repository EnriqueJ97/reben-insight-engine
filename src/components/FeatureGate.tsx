import React from 'react';
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, Star } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

interface PlanUpgradeProps {
  currentPlan: string;
  requiredFeature: string;
}

const PlanUpgrade: React.FC<PlanUpgradeProps> = ({ currentPlan, requiredFeature }) => {
  const getRequiredPlan = (feature: string): string => {
    switch (feature) {
      case 'ai_chat':
        return 'esencial';
      case 'executive_dashboard':
      case 'burnout_analysis':
      case 'what_if_simulator':
      case 'compliance_csrd':
        return 'profesional';
      case 'flexible_work':
        return 'enterprise';
      default:
        return 'profesional';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'lite': return <Zap className="w-4 h-4" />;
      case 'esencial': return <Star className="w-4 h-4" />;
      case 'profesional': return <Crown className="w-4 h-4" />;
      case 'enterprise': return <Crown className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getPlanPrice = (plan: string): string => {
    switch (plan) {
      case 'lite': return '1,90€/empleado/mes';
      case 'esencial': return '3,90€/empleado/mes';
      case 'profesional': return '7,90€/empleado/mes';
      case 'enterprise': return 'Precio personalizado';
      default: return '';
    }
  };

  const requiredPlan = getRequiredPlan(requiredFeature);
  
  return (
    <Card className="border-dashed border-2 border-orange-200 bg-orange-50/50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
          <Lock className="w-6 h-6 text-orange-600" />
        </div>
        <CardTitle className="text-lg">Función Premium</CardTitle>
        <CardDescription>
          Esta funcionalidad requiere el plan <strong>{requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}</strong> o superior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getPlanIcon(currentPlan)}
            Plan Actual: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
          </Badge>
          <span className="text-muted-foreground">→</span>
          <Badge className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500">
            {getPlanIcon(requiredPlan)}
            Requerido: {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </Badge>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Desde {getPlanPrice(requiredPlan)}
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            Actualizar Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true 
}) => {
  const { canUseFeature, plan, loading } = useSubscriptionFeatures();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade && plan) {
    return <PlanUpgrade currentPlan={plan.plan_name} requiredFeature={feature} />;
  }

  return (
    <div className="opacity-50 pointer-events-none relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded flex items-center justify-center z-10">
        <Badge variant="outline" className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Función Premium
        </Badge>
      </div>
      {children}
    </div>
  );
};

// Hook para usar directamente en componentes
export const useFeatureGate = (feature: string) => {
  const { canUseFeature, plan } = useSubscriptionFeatures();
  
  return {
    canUse: canUseFeature(feature),
    planName: plan?.plan_name || 'lite',
    FeatureGate: ({ children, fallback, showUpgrade = true }: Omit<FeatureGateProps, 'feature'>) => (
      <FeatureGate 
        feature={feature} 
        fallback={fallback} 
        showUpgrade={showUpgrade}
      >
        {children}
      </FeatureGate>
    )
  };
};