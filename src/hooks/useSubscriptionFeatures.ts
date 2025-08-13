import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  price_per_employee: number;
  min_employees?: number;
  max_employees?: number;
  billing_cycle: string;
  features: {
    checkins?: {
      manual?: boolean;
      automatic?: boolean;
      contextual?: boolean;
      custom?: boolean;
    };
    dashboard?: {
      basic?: boolean;
      team_breakdown?: boolean;
      executive?: boolean;
      custom?: boolean;
    };
    export?: {
      csv?: boolean;
      pdf?: boolean;
      excel?: boolean;
      custom?: boolean;
    };
    ai_chat?: {
      enabled?: boolean;
      basic?: boolean;
      advanced?: boolean;
      custom?: boolean;
    };
    alerts?: {
      basic?: boolean;
      predictive?: boolean;
      custom?: boolean;
    };
    burnout_analysis?: {
      enabled?: boolean;
      advanced?: boolean;
    };
    wellness_score?: {
      enabled?: boolean;
      custom?: boolean;
    };
    what_if_simulator?: {
      enabled?: boolean;
      advanced?: boolean;
    };
    flexible_work?: {
      enabled?: boolean;
      shift_management?: boolean;
    };
    time_tracking?: {
      basic?: boolean;
      advanced?: boolean;
      realtime?: boolean;
    };
    integrations?: {
      slack?: boolean;
      teams?: boolean;
      hris?: boolean;
      api?: boolean;
      custom?: boolean;
    };
    compliance?: {
      csrd?: boolean;
      custom?: boolean;
    };
    support?: {
      email_48h?: boolean;
      priority?: boolean;
      dedicated_manager?: boolean;
      onboarding?: boolean;
      training?: boolean;
    };
  };
  is_active: boolean;
}

export interface PricingInfo {
  monthly_total: number;
  annual_total: number;
  price_per_employee: number;
  total_employees: number;
  volume_discount: number;
}

export function useSubscriptionFeatures() {
  const { user, tenant } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id) {
      fetchPlanData();
    }
  }, [tenant?.id]);

  const fetchPlanData = async () => {
    if (!tenant?.id) return;

    try {
      setLoading(true);

      // Obtener el plan actual del tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', tenant.id)
        .single();

      if (tenantError) throw tenantError;

      // Obtener detalles del plan de suscripción
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_name', tenantData.subscription_plan)
        .single();

      if (planError) throw planError;

      setPlan(planData as SubscriptionPlan);

      // Calcular precios
      const { data: pricingData, error: pricingError } = await supabase
        .rpc('calculate_tenant_pricing', { tenant_uuid: tenant.id });

      if (pricingError) throw pricingError;

      if (pricingData && pricingData.length > 0) {
        setPricing(pricingData[0]);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featurePath: string): boolean => {
    if (!plan?.features) return false;

    const keys = featurePath.split('.');
    let current: any = plan.features;

    for (const key of keys) {
      if (current[key] === undefined) return false;
      current = current[key];
    }

    return current === true;
  };

  const getFeatureValue = (featurePath: string): any => {
    if (!plan?.features) return undefined;

    const keys = featurePath.split('.');
    let current: any = plan.features;

    for (const key of keys) {
      if (current[key] === undefined) return undefined;
      current = current[key];
    }

    return current;
  };

  const canUseFeature = (feature: string): boolean => {
    switch (feature) {
      case 'ai_chat':
        return hasFeature('ai_chat.enabled');
      case 'predictive_alerts':
        return hasFeature('alerts.predictive');
      case 'executive_dashboard':
        return hasFeature('dashboard.executive');
      case 'burnout_analysis':
        return hasFeature('burnout_analysis.enabled');
      case 'what_if_simulator':
        return hasFeature('what_if_simulator.enabled');
      case 'compliance_csrd':
        return hasFeature('compliance.csrd');
      case 'integrations_slack':
        return hasFeature('integrations.slack');
      case 'integrations_teams':
        return hasFeature('integrations.teams');
      case 'integrations_hris':
        return hasFeature('integrations.hris');
      case 'export_pdf':
        return hasFeature('export.pdf');
      case 'export_excel':
        return hasFeature('export.excel');
      case 'flexible_work':
        return hasFeature('flexible_work.enabled');
      case 'advanced_time_tracking':
        return hasFeature('time_tracking.advanced');
      default:
        return false;
    }
  };

  const getPlanLimitations = (): string[] => {
    const limitations: string[] = [];

    if (!hasFeature('ai_chat.enabled')) {
      limitations.push('Chat IA no disponible');
    }
    if (!hasFeature('dashboard.executive')) {
      limitations.push('Dashboard ejecutivo no disponible');
    }
    if (!hasFeature('alerts.predictive')) {
      limitations.push('Alertas predictivas no disponibles');
    }
    if (!hasFeature('export.pdf')) {
      limitations.push('Exportación PDF no disponible');
    }
    if (!hasFeature('integrations.slack')) {
      limitations.push('Integración con Slack no disponible');
    }

    return limitations;
  };

  return {
    plan,
    pricing,
    loading,
    hasFeature,
    getFeatureValue,
    canUseFeature,
    getPlanLimitations,
    refresh: fetchPlanData
  };
}