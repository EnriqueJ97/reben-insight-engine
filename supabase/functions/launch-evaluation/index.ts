import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId } = await req.json();

    if (!campaignId) {
      throw new Error('Campaign ID is required');
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('evaluation_campaigns')
      .select(`
        *,
        profiles!evaluation_campaigns_created_by_fkey(tenant_id)
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Get target employees based on campaign configuration
    let employeeQuery = supabase
      .from('profiles')
      .select('id, email, full_name, team_id')
      .eq('tenant_id', campaign.profiles.tenant_id);

    // Apply targeting filters
    const targetAudience = campaign.target_audience as any;
    if (!targetAudience.allEmployees) {
      if (targetAudience.specificTeams?.length > 0) {
        employeeQuery = employeeQuery.in('team_id', targetAudience.specificTeams);
      }
      if (targetAudience.specificRoles?.length > 0) {
        employeeQuery = employeeQuery.in('role', targetAudience.specificRoles);
      }
      if (targetAudience.specificUsers?.length > 0) {
        employeeQuery = employeeQuery.in('id', targetAudience.specificUsers);
      }
    }

    const { data: employees, error: employeesError } = await employeeQuery;
    if (employeesError) throw employeesError;

    // Create notifications for each employee
    const notifications = employees.map(employee => ({
      tenant_id: campaign.profiles.tenant_id,
      campaign_id: campaignId,
      user_id: employee.id,
      notification_type: 'invitation',
      status: 'pending',
      metadata: {
        email: employee.email,
        full_name: employee.full_name,
        campaign_name: campaign.name
      }
    }));

    const { error: notificationsError } = await supabase
      .from('evaluation_notifications')
      .insert(notifications);

    if (notificationsError) throw notificationsError;

    // Update campaign participant count
    const { error: updateError } = await supabase
      .from('evaluation_campaigns')
      .update({ 
        total_participants: employees.length,
        launch_date: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', campaignId);

    if (updateError) throw updateError;

    // Send email notifications (this would integrate with your email service)
    for (const employee of employees) {
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: employee.email,
            subject: `Nueva evaluación: ${campaign.name}`,
            template: 'evaluation-invitation',
            data: {
              employeeName: employee.full_name,
              campaignName: campaign.name,
              campaignDescription: campaign.description,
              evaluationUrl: `${Deno.env.get('SUPABASE_URL')}/dashboard/evaluations/${campaignId}/respond`,
              anonymous: campaign.anonymous
            }
          }
        });

        // Mark notification as sent
        await supabase
          .from('evaluation_notifications')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('campaign_id', campaignId)
          .eq('user_id', employee.id)
          .eq('notification_type', 'invitation');

      } catch (emailError) {
        console.error(`Failed to send email to ${employee.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        participantsNotified: employees.length,
        campaignId: campaignId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error launching evaluation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});