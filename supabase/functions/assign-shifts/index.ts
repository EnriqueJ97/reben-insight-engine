import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShiftAssignmentRequest {
  startDate: string;
  endDate: string;
  tenantId: string;
  teamId?: string;
}

interface EmployeePreference {
  employee_id: string;
  weekday: number;
  shift_template_id: string;
  weight: number;
  blocked: boolean;
}

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  min_staff: number;
  skill_tags: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { startDate, endDate, tenantId, teamId }: ShiftAssignmentRequest = await req.json();

    console.log(`Starting shift assignment for tenant ${tenantId} from ${startDate} to ${endDate}`);

    // 1. Get shift templates
    const { data: templates, error: templatesError } = await supabaseClient
      .from('shift_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (templatesError) {
      throw new Error(`Error fetching shift templates: ${templatesError.message}`);
    }

    // 2. Get employees first
    const { data: employees, error: employeesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, team_id')
      .eq('tenant_id', tenantId)
      .eq('role', 'EMPLOYEE');

    if (employeesError) {
      throw new Error(`Error fetching employees: ${employeesError.message}`);
    }

    // 3. Get employee preferences separately
    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('employee_shift_prefs')
      .select('*')
      .eq('tenant_id', tenantId);

    if (preferencesError) {
      throw new Error(`Error fetching preferences: ${preferencesError.message}`);
    }

    // 4. Get existing workload (last 14 days) - simplified query
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: recentShifts, error: shiftsError } = await supabaseClient
      .from('rotas')
      .select('employee_id, day, shift_template_id')
      .gte('day', fourteenDaysAgo.toISOString().split('T')[0])
      .lt('day', startDate);

    if (shiftsError) {
      throw new Error(`Error fetching recent shifts: ${shiftsError.message}`);
    }

    // 5. Calculate workload for each employee (simplified)
    const workloadMap = new Map<string, number>();
    recentShifts?.forEach(shift => {
      const employeeId = shift.employee_id;
      // Simplified: assume 8 hours per shift
      workloadMap.set(employeeId, (workloadMap.get(employeeId) || 0) + 8);
    });

    // 6. Generate assignments using simplified algorithm
    const assignments = generateOptimalAssignments({
      templates: templates as ShiftTemplate[],
      preferences: preferences as EmployeePreference[],
      workloadMap,
      profiles: employees || [],
      startDate,
      endDate
    });

    // 7. Clear existing AUTO assignments in the date range
    const { error: deleteError } = await supabaseClient
      .from('rotas')
      .delete()
      .eq('status', 'AUTO')
      .gte('day', startDate)
      .lte('day', endDate);

    if (deleteError) {
      console.error('Error clearing existing assignments:', deleteError);
    }

    // 8. Insert new assignments
    if (assignments.length > 0) {
      const { data: insertedAssignments, error: insertError } = await supabaseClient
        .from('rotas')
        .insert(assignments);

      if (insertError) {
        throw new Error(`Error inserting assignments: ${insertError.message}`);
      }

      console.log(`Successfully assigned ${assignments.length} shifts`);
    }

    // 9. Calculate metrics
    const metrics = calculateAssignmentMetrics(assignments, preferences as EmployeePreference[], workloadMap);

    return new Response(JSON.stringify({
      success: true,
      assignmentsCreated: assignments.length,
      metrics,
      message: `Successfully generated ${assignments.length} shift assignments`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in shift assignment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateShiftHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function generateOptimalAssignments({
  templates,
  preferences,
  workloadMap,
  profiles,
  startDate,
  endDate
}: {
  templates: ShiftTemplate[];
  preferences: EmployeePreference[];
  workloadMap: Map<string, number>;
  profiles: any[];
  startDate: string;
  endDate: string;
}) {
  const assignments: any[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Iterate through each day in the range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateString = date.toISOString().split('T')[0];

    // For each shift template, assign employees
    templates.forEach(template => {
      const availableEmployees = getAvailableEmployees(
        preferences,
        profiles,
        template.id,
        weekday,
        workloadMap
      );

      // Sort by preference weight and workload
      availableEmployees.sort((a, b) => {
        const preferenceA = a.preference?.weight || 0;
        const preferenceB = b.preference?.weight || 0;
        const workloadA = workloadMap.get(a.employee_id) || 0;
        const workloadB = workloadMap.get(b.employee_id) || 0;

        // Higher preference weight = better, lower workload = better
        const scoreA = preferenceA - (workloadA * 0.1);
        const scoreB = preferenceB - (workloadB * 0.1);

        return scoreB - scoreA;
      });

      // Assign minimum required staff
      const assignedCount = Math.min(template.min_staff, availableEmployees.length);
      
      for (let i = 0; i < assignedCount; i++) {
        const employee = availableEmployees[i];
        assignments.push({
          day: dateString,
          shift_template_id: template.id,
          employee_id: employee.employee_id,
          status: 'AUTO'
        });

        // Update workload for next assignments
        const shiftHours = calculateShiftHours(template.start_time, template.end_time);
        workloadMap.set(employee.employee_id, (workloadMap.get(employee.employee_id) || 0) + shiftHours);
      }
    });
  }

  return assignments;
}

function getAvailableEmployees(
  preferences: EmployeePreference[],
  profiles: any[],
  shiftTemplateId: string,
  weekday: number,
  workloadMap: Map<string, number>
) {
  const availableEmployees: any[] = [];

  profiles.forEach(profile => {
    // Find preference for this employee, shift, and weekday
    const preference = preferences.find(p => 
      p.employee_id === profile.id && 
      p.shift_template_id === shiftTemplateId && 
      p.weekday === weekday
    );

    // Skip if blocked or no preference (default to neutral)
    if (preference?.blocked) {
      return;
    }

    // Skip if overloaded (more than 50 hours in last 14 days)
    const currentWorkload = workloadMap.get(profile.id) || 0;
    if (currentWorkload > 50) {
      return;
    }

    availableEmployees.push({
      employee_id: profile.id,
      preference,
      workload: currentWorkload
    });
  });

  return availableEmployees;
}

function calculateAssignmentMetrics(
  assignments: any[],
  preferences: EmployeePreference[],
  workloadMap: Map<string, number>
) {
  if (assignments.length === 0) {
    return {
      equityIndex: 0,
      preferenceMatch: 0,
      averageWorkload: 0
    };
  }

  // Calculate equity index (standard deviation of hours)
  const workloads = Array.from(workloadMap.values());
  const avgWorkload = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
  const equityIndex = Math.sqrt(variance) / avgWorkload;

  // Calculate preference match percentage
  let matchingPreferences = 0;
  assignments.forEach(assignment => {
    const preference = preferences.find(p => 
      p.employee_id === assignment.employee_id && 
      p.shift_template_id === assignment.shift_template_id
    );
    if (preference && preference.weight > 0) {
      matchingPreferences++;
    }
  });

  const preferenceMatch = (matchingPreferences / assignments.length) * 100;

  return {
    equityIndex: Math.round(equityIndex * 100) / 100,
    preferenceMatch: Math.round(preferenceMatch),
    averageWorkload: Math.round(avgWorkload * 10) / 10
  };
}