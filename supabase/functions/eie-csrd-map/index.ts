import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CSRD Social KPIs mapping
const CSRD_MAPPINGS = {
  'S1-1': {
    name: 'Políticas sobre condiciones de trabajo',
    calculator: (inputs: any) => inputs.policies_implemented || 0,
    unit: 'count',
    threshold: 5
  },
  'S1-2': {
    name: 'Procesos para relacionarse con trabajadores',
    calculator: (inputs: any) => inputs.engagement_processes || 0,
    unit: 'count',
    threshold: 3
  },
  'S1-3': {
    name: 'Canales de comunicación con trabajadores',
    calculator: (inputs: any) => inputs.communication_channels || 0,
    unit: 'count',
    threshold: 2
  },
  'S1-4': {
    name: 'Cobertura de negociación colectiva',
    calculator: (inputs: any) => (inputs.collective_agreement_workers / inputs.total_workers) * 100,
    unit: 'percentage',
    threshold: 50
  },
  'S1-5': {
    name: 'Equilibrio trabajo-vida',
    calculator: (inputs: any) => inputs.wellbeing_score || 0,
    unit: 'score',
    threshold: 70
  },
  'S1-6': {
    name: 'Remuneración justa',
    calculator: (inputs: any) => inputs.fair_compensation_ratio || 0,
    unit: 'ratio',
    threshold: 1.0
  },
  'S1-7': {
    name: 'Formación y desarrollo',
    calculator: (inputs: any) => (inputs.training_hours_total / inputs.total_workers),
    unit: 'hours',
    threshold: 20
  },
  'S1-8': {
    name: 'Salud y seguridad laboral',
    calculator: (inputs: any) => inputs.safety_incident_rate || 0,
    unit: 'rate',
    threshold: 2.0,
    inverse: true // Lower is better
  },
  'S1-9': {
    name: 'Diversidad e inclusión',
    calculator: (inputs: any) => inputs.diversity_index || 0,
    unit: 'index',
    threshold: 0.7
  },
  'S1-10': {
    name: 'Derechos humanos en el lugar de trabajo',
    calculator: (inputs: any) => inputs.human_rights_violations || 0,
    unit: 'count',
    threshold: 0,
    inverse: true
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { inputs } = await req.json();

    console.log('Mapping CSRD KPIs with inputs:', Object.keys(inputs));

    // Get user's tenant for security
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      throw new Error('Unauthorized');
    }

    const results = [];

    for (const [kpiCode, mapping] of Object.entries(CSRD_MAPPINGS)) {
      try {
        // Calculate the KPI value
        const rawValue = mapping.calculator(inputs);
        const value = rawValue || 0;

        // Determine data quality and coverage
        let coverage = 0;
        let data_quality: 'excellent' | 'good' | 'acceptable' | 'poor' = 'poor';

        // Coverage calculation based on input availability
        const requiredInputs = getRequiredInputs(kpiCode);
        const availableInputs = requiredInputs.filter(input => inputs[input] !== undefined && inputs[input] !== null);
        coverage = Math.round((availableInputs.length / requiredInputs.length) * 100);

        // Data quality assessment
        if (coverage >= 90 && value > 0) {
          data_quality = 'excellent';
        } else if (coverage >= 70 && value > 0) {
          data_quality = 'good';
        } else if (coverage >= 50) {
          data_quality = 'acceptable';
        } else {
          data_quality = 'poor';
        }

        // Audit readiness
        const threshold = mapping.threshold;
        const ready_for_audit = mapping.inverse 
          ? value <= threshold && coverage >= 70
          : value >= threshold && coverage >= 70;

        results.push({
          kpi_code: kpiCode,
          name: mapping.name,
          value: Math.round(value * 100) / 100,
          unit: mapping.unit,
          coverage,
          ready_for_audit,
          data_quality,
          threshold,
          meets_threshold: mapping.inverse ? value <= threshold : value >= threshold
        });

      } catch (error) {
        console.error(`Error calculating KPI ${kpiCode}:`, error);
        results.push({
          kpi_code: kpiCode,
          name: mapping.name,
          value: 0,
          unit: mapping.unit,
          coverage: 0,
          ready_for_audit: false,
          data_quality: 'poor' as const,
          threshold: mapping.threshold,
          meets_threshold: false,
          error: error.message
        });
      }
    }

    // Calculate overall coverage
    const overallCoverage = Math.round(
      results.reduce((sum, r) => sum + r.coverage, 0) / results.length
    );

    const auditReadyCount = results.filter(r => r.ready_for_audit).length;
    const auditReadyPercentage = Math.round((auditReadyCount / results.length) * 100);

    console.log(`CSRD mapping complete: ${auditReadyCount}/${results.length} KPIs ready for audit (${auditReadyPercentage}%)`);

    return new Response(JSON.stringify({
      kpis: results,
      summary: {
        total_kpis: results.length,
        audit_ready: auditReadyCount,
        audit_ready_percentage: auditReadyPercentage,
        overall_coverage: overallCoverage,
        excellent_quality: results.filter(r => r.data_quality === 'excellent').length,
        good_quality: results.filter(r => r.data_quality === 'good').length,
        acceptable_quality: results.filter(r => r.data_quality === 'acceptable').length,
        poor_quality: results.filter(r => r.data_quality === 'poor').length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eie-csrd-map:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      kpis: [],
      summary: {
        total_kpis: 0,
        audit_ready: 0,
        audit_ready_percentage: 0,
        overall_coverage: 0,
        excellent_quality: 0,
        good_quality: 0,
        acceptable_quality: 0,
        poor_quality: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to get required inputs for each KPI
function getRequiredInputs(kpiCode: string): string[] {
  const inputMappings: Record<string, string[]> = {
    'S1-1': ['policies_implemented'],
    'S1-2': ['engagement_processes'],
    'S1-3': ['communication_channels'],
    'S1-4': ['collective_agreement_workers', 'total_workers'],
    'S1-5': ['wellbeing_score'],
    'S1-6': ['fair_compensation_ratio'],
    'S1-7': ['training_hours_total', 'total_workers'],
    'S1-8': ['safety_incident_rate'],
    'S1-9': ['diversity_index'],
    'S1-10': ['human_rights_violations']
  };

  return inputMappings[kpiCode] || [];
}