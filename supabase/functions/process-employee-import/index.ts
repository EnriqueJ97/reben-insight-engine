import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData, tenant_id } = await req.json();

    if (!csvData || !tenant_id) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse CSV
    const lines = csvData.split('\n').filter((line: string) => line.trim());
    const rawHeaders = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    
    // Map of possible column names to standard names
    const columnMap: Record<string, string> = {
      'full_name': 'full_name',
      'nombre': 'nombre',
      'apellido': 'apellido',
      'nombre completo': 'full_name',
      'name': 'full_name',
      'first_name': 'nombre',
      'last_name': 'apellido',
      'email': 'email',
      'correo': 'email',
      'correo electrónico': 'email',
      'e-mail': 'email',
      'role': 'role',
      'rol': 'role',
      'puesto': 'role',
      'cargo': 'role',
      'team_name': 'team_name',
      'equipo': 'team_name',
      'team': 'team_name',
      'departamento': 'team_name',
      'department': 'team_name'
    };

    // Normalize headers
    const headers = rawHeaders.map(h => columnMap[h] || h);
    
    // Check if we have nombre + apellido instead of full_name
    const hasNombreApellido = headers.includes('nombre') && headers.includes('apellido');
    const hasFullName = headers.includes('full_name');
    
    let imported = 0;
    let errors = 0;
    const details: string[] = [];

    // Validate required headers exist
    if (!hasFullName && !hasNombreApellido) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Falta la columna requerida: full_name (o nombre + apellido). Columnas encontradas: ${rawHeaders.join(', ')}`,
          imported: 0,
          errors: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!headers.includes('email')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Falta la columna requerida: email. Columnas encontradas: ${rawHeaders.join(', ')}`,
          imported: 0,
          errors: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!headers.includes('role')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Falta la columna requerida: role. Columnas encontradas: ${rawHeaders.join(', ')}`,
          imported: 0,
          errors: 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create default team
    let { data: defaultTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('name', 'Equipo General')
      .single();

    if (!defaultTeam) {
      const { data: newTeam } = await supabase
        .from('teams')
        .insert({ 
          tenant_id, 
          name: 'Equipo General' 
        })
        .select('id')
        .single();
      
      defaultTeam = newTeam;
    }

    // Process each employee
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v: string) => v.trim());
        const employee: Record<string, string> = {};
        
        headers.forEach((header: string, index: number) => {
          employee[header] = values[index];
        });

        // Combine nombre + apellido if needed
        if (hasNombreApellido && !employee.full_name) {
          employee.full_name = `${employee.nombre || ''} ${employee.apellido || ''}`.trim();
        }

        // Validate required fields
        if (!employee.full_name || !employee.email || !employee.role) {
          details.push(`Línea ${i + 1}: Faltan campos requeridos (full_name: ${!!employee.full_name}, email: ${!!employee.email}, role: ${!!employee.role})`);
          errors++;
          continue;
        }

        // Validate role
        const validRoles = ['EMPLOYEE', 'MANAGER', 'HR_ADMIN'];
        if (!validRoles.includes(employee.role.toUpperCase())) {
          details.push(`Línea ${i + 1}: Rol inválido "${employee.role}"`);
          errors++;
          continue;
        }

        // Check if email already exists
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', employee.email)
          .eq('tenant_id', tenant_id)
          .single();

        if (existing) {
          details.push(`Línea ${i + 1}: Email ${employee.email} ya existe`);
          errors++;
          continue;
        }

        // Get or create team if specified
        let teamId = defaultTeam?.id;
        if (employee.team_name) {
          let { data: team } = await supabase
            .from('teams')
            .select('id')
            .eq('tenant_id', tenant_id)
            .eq('name', employee.team_name)
            .single();

          if (!team) {
            const { data: newTeam } = await supabase
              .from('teams')
              .insert({
                tenant_id,
                name: employee.team_name
              })
              .select('id')
              .single();
            
            team = newTeam;
          }

          if (team) {
            teamId = team.id;
          }
        }

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: employee.email,
          email_confirm: true,
          user_metadata: {
            full_name: employee.full_name,
            role: employee.role.toUpperCase()
          }
        });

        if (authError) {
          details.push(`Línea ${i + 1}: Error creando usuario: ${authError.message}`);
          errors++;
          continue;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            tenant_id,
            team_id: teamId,
            email: employee.email,
            full_name: employee.full_name,
            role: employee.role.toUpperCase()
          });

        if (profileError) {
          details.push(`Línea ${i + 1}: Error creando perfil: ${profileError.message}`);
          errors++;
          continue;
        }

        imported++;
        details.push(`✓ ${employee.full_name} (${employee.email}) importado`);

      } catch (error) {
        console.error(`Error processing line ${i + 1}:`, error);
        details.push(`Línea ${i + 1}: Error inesperado`);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        errors,
        details,
        total: lines.length - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        errors: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
