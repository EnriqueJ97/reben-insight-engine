import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterventionRequest {
  user_id: string;
  type: 'FOCO_BLOQUEO' | 'DESCONEXION_MODO' | 'REDISTRIBUCION_CARGA';
  risk_score_id: string;
  tenant_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, type, risk_score_id, tenant_id }: InterventionRequest = await req.json();

    console.log('Executing intervention:', { user_id, type, risk_score_id });

    // Obtener datos del usuario
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    let interventionResult = '';
    let estimatedSavings = 0;

    // Ejecutar la intervención específica
    switch (type) {
      case 'FOCO_BLOQUEO':
        interventionResult = await executeFocusBlockIntervention(user_id, supabase);
        estimatedSavings = 2500; // €2.5k por mejora de productividad
        break;
      
      case 'DESCONEXION_MODO':
        interventionResult = await executeDisconnectionIntervention(user_id, supabase);
        estimatedSavings = 1200; // €1.2k por prevención de burnout
        break;
      
      case 'REDISTRIBUCION_CARGA':
        interventionResult = await executeWorkloadRedistribution(user_id, tenant_id, supabase);
        estimatedSavings = 15000; // €15k por prevención de rotación
        break;
      
      default:
        throw new Error(`Unknown intervention type: ${type}`);
    }

    // Registrar la intervención en la base de datos
    const { data: intervention, error: interventionError } = await supabase
      .from('interventions')
      .insert({
        user_id,
        type,
        risk_score_id,
        tenant_id,
        status: 'EXECUTED',
        result: interventionResult,
        estimated_savings: estimatedSavings,
        executed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (interventionError) throw interventionError;

    // Crear evento ROI
    await supabase
      .from('roi_events')
      .insert({
        type: getROIEventType(type),
        employee_id: user_id,
        intervention_id: intervention.id,
        estimated_savings: estimatedSavings,
        description: `Intervención automática: ${getInterventionName(type)}`,
        tenant_id,
        calculated_at: new Date().toISOString()
      });

    // Enviar notificación (simulado)
    await sendNotification(user, type, interventionResult);

    // Log para auditoría
    console.log('Intervention executed successfully:', {
      intervention_id: intervention.id,
      type,
      user: user.email,
      savings: estimatedSavings
    });

    return new Response(
      JSON.stringify({
        success: true,
        intervention_id: intervention.id,
        result: interventionResult,
        estimated_savings: estimatedSavings
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error executing intervention:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function executeFocusBlockIntervention(userId: string, supabase: any): Promise<string> {
  // En producción, esto se integraría con Google Calendar/Outlook
  console.log('Creating focus blocks for user:', userId);
  
  // Simular creación de bloques de foco
  const focusBlocks = [
    { start: '09:00', end: '11:00', title: 'Bloque de Foco - REBEN' },
    { start: '14:00', end: '16:00', title: 'Trabajo Concentrado - REBEN' }
  ];

  // Registrar en log de integraciones
  await supabase
    .from('integration_logs')
    .insert({
      integration_type: 'CALENDAR',
      action: 'CREATE_FOCUS_BLOCKS',
      user_id: userId,
      payload: { blocks: focusBlocks },
      status: 'SUCCESS',
      executed_at: new Date().toISOString()
    });

  return `Bloques de foco creados: ${focusBlocks.length} sesiones programadas automáticamente`;
}

async function executeDisconnectionIntervention(userId: string, supabase: any): Promise<string> {
  // En producción, esto configuraría Slack/Teams Do Not Disturb
  console.log('Activating disconnection mode for user:', userId);

  const disconnectionConfig = {
    mode: 'STRICT',
    hours: '18:00-08:00',
    weekends: true,
    notifications_blocked: ['email', 'slack', 'teams']
  };

  // Registrar configuración
  await supabase
    .from('integration_logs')
    .insert({
      integration_type: 'COMMUNICATION',
      action: 'ACTIVATE_DND',
      user_id: userId,
      payload: disconnectionConfig,
      status: 'SUCCESS',
      executed_at: new Date().toISOString()
    });

  return `Modo desconexión activado: Sin notificaciones de 18:00 a 08:00 + fines de semana`;
}

async function executeWorkloadRedistribution(userId: string, tenantId: string, supabase: any): Promise<string> {
  // En producción, esto se integraría con Jira/Asana para redistribuir tareas
  console.log('Redistributing workload for user:', userId);

  // Obtener empleados del mismo equipo con menor carga
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select(`
      id, full_name,
      risk_scores!inner(level, score)
    `)
    .eq('tenant_id', tenantId)
    .neq('id', userId)
    .eq('risk_scores.level', 'VERDE')
    .order('risk_scores.score', { ascending: true })
    .limit(3);

  const redistributionPlan = teamMembers?.map((member: any) => ({
    to_user: member.full_name,
    tasks_reassigned: Math.floor(Math.random() * 5) + 1,
    estimated_hours: Math.floor(Math.random() * 10) + 5
  })) || [];

  // Registrar plan de redistribución
  await supabase
    .from('integration_logs')
    .insert({
      integration_type: 'PROJECT_MANAGEMENT',
      action: 'REDISTRIBUTE_WORKLOAD',
      user_id: userId,
      payload: { redistribution_plan: redistributionPlan },
      status: 'SUCCESS',
      executed_at: new Date().toISOString()
    });

  const totalTasksReassigned = redistributionPlan.reduce((sum: number, plan: any) => sum + plan.tasks_reassigned, 0);
  
  return `Carga redistribuida: ${totalTasksReassigned} tareas reasignadas a ${redistributionPlan.length} compañeros`;
}

async function sendNotification(user: any, type: string, result: string) {
  // En producción, esto enviaría emails/notificaciones reales
  console.log('Sending notification:', {
    to: user.email,
    intervention: type,
    result: result
  });
}

function getInterventionName(type: string): string {
  switch (type) {
    case 'FOCO_BLOQUEO': return 'Bloques de Foco Automáticos';
    case 'DESCONEXION_MODO': return 'Modo Desconexión Digital';
    case 'REDISTRIBUCION_CARGA': return 'Redistribución de Carga de Trabajo';
    default: return type;
  }
}

function getROIEventType(interventionType: string): string {
  switch (interventionType) {
    case 'FOCO_BLOQUEO': return 'PRODUCTIVIDAD_MEJORADA';
    case 'DESCONEXION_MODO': return 'ABSENTISMO_EVITADO';
    case 'REDISTRIBUCION_CARGA': return 'ROTACION_EVITADA';
    default: return 'PRODUCTIVIDAD_MEJORADA';
  }
}