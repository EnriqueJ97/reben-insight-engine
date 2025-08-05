-- ================================
-- OPERACIONES: TURNOS INTELIGENTES
-- ================================

-- 1. Plantillas de turnos
CREATE TABLE public.shift_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  min_staff INTEGER NOT NULL DEFAULT 1,
  skill_tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Preferencias de turnos de empleados
CREATE TABLE public.employee_shift_prefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  shift_template_id UUID REFERENCES public.shift_templates(id),
  weight INTEGER NOT NULL DEFAULT 0 CHECK (weight BETWEEN -10 AND 10), -- Peso de preferencia
  blocked BOOLEAN NOT NULL DEFAULT false, -- No disponible para este turno
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, weekday, shift_template_id)
);

-- 3. Calendario de turnos (rotas)
CREATE TABLE public.rotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day DATE NOT NULL,
  shift_template_id UUID REFERENCES public.shift_templates(id),
  employee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'AUTO' CHECK (status IN ('AUTO', 'MANUAL', 'SWAP_REQ', 'CONFIRMED')),
  requested_swap_to UUID NULL, -- ID del empleado con quien se quiere cambiar
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day, shift_template_id, employee_id)
);

-- 4. Auditoría de cambios en turnos
CREATE TABLE public.rota_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rota_id UUID REFERENCES public.rotas(id),
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE, SWAP_REQUEST, SWAP_APPROVED
  old_employee_id UUID NULL,
  new_employee_id UUID NULL,
  changed_by UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- ================================
-- OPERACIONES: CULTURA FLEXIBLE
-- ================================

-- 5. Políticas de flexibilidad
CREATE TABLE public.flex_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  min_on_site_days INTEGER NOT NULL DEFAULT 3,
  core_hours JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "17:00"}',
  allowed_modes TEXT[] NOT NULL DEFAULT ARRAY['OFFICE', 'REMOTE', 'HYBRID'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Solicitudes de flexibilidad
CREATE TABLE public.flex_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  requested_mode TEXT NOT NULL CHECK (requested_mode IN ('OFFICE', 'REMOTE', 'HYBRID')),
  requested_hours JSONB, -- {"start": "08:00", "end": "16:00"}
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by UUID NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Registro de modalidades de trabajo
CREATE TABLE public.work_mode_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  actual_mode TEXT NOT NULL CHECK (actual_mode IN ('OFFICE', 'REMOTE', 'HYBRID')),
  actual_hours JSONB, -- {"start": "08:30", "end": "17:15"}
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  location TEXT, -- Oficina específica o "Remote"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- ================================
-- ÍNDICES PARA RENDIMIENTO
-- ================================

CREATE INDEX idx_shift_templates_tenant ON public.shift_templates(tenant_id);
CREATE INDEX idx_shift_templates_team ON public.shift_templates(team_id);
CREATE INDEX idx_employee_shift_prefs_employee ON public.employee_shift_prefs(employee_id);
CREATE INDEX idx_rotas_day ON public.rotas(day);
CREATE INDEX idx_rotas_employee ON public.rotas(employee_id);
CREATE INDEX idx_rota_audit_rota ON public.rota_audit(rota_id);
CREATE INDEX idx_flex_policies_tenant ON public.flex_policies(tenant_id);
CREATE INDEX idx_flex_requests_employee ON public.flex_requests(employee_id);
CREATE INDEX idx_flex_requests_date ON public.flex_requests(date);
CREATE INDEX idx_work_mode_logs_employee ON public.work_mode_logs(employee_id);
CREATE INDEX idx_work_mode_logs_date ON public.work_mode_logs(date);

-- ================================
-- TRIGGERS PARA UPDATED_AT
-- ================================

CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_shift_prefs_updated_at
  BEFORE UPDATE ON public.employee_shift_prefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rotas_updated_at
  BEFORE UPDATE ON public.rotas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flex_policies_updated_at
  BEFORE UPDATE ON public.flex_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flex_requests_updated_at
  BEFORE UPDATE ON public.flex_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================
-- RLS POLICIES
-- ================================

-- Shift Templates
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR_ADMIN can manage shift templates in their tenant"
  ON public.shift_templates FOR ALL
  USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Managers can view shift templates in their tenant"
  ON public.shift_templates FOR SELECT
  USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() IN ('MANAGER', 'HR_ADMIN'));

CREATE POLICY "Employees can view shift templates in their tenant"
  ON public.shift_templates FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- Employee Shift Preferences
ALTER TABLE public.employee_shift_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage their own shift preferences"
  ON public.employee_shift_prefs FOR ALL
  USING (employee_id = auth.uid());

CREATE POLICY "Managers can view team shift preferences"
  ON public.employee_shift_prefs FOR SELECT
  USING (employee_id IN (
    SELECT p.id FROM profiles p 
    JOIN teams t ON p.team_id = t.id 
    WHERE t.manager_id = auth.uid()
  ));

CREATE POLICY "HR_ADMIN can view all shift preferences in tenant"
  ON public.employee_shift_prefs FOR SELECT
  USING (employee_id IN (
    SELECT id FROM profiles WHERE tenant_id = get_current_user_tenant_id()
  ) AND get_current_user_role() = 'HR_ADMIN');

-- Rotas
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own rotas"
  ON public.rotas FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Managers can manage rotas for their team"
  ON public.rotas FOR ALL
  USING (employee_id IN (
    SELECT p.id FROM profiles p 
    JOIN teams t ON p.team_id = t.id 
    WHERE t.manager_id = auth.uid()
  ));

CREATE POLICY "HR_ADMIN can manage all rotas in tenant"
  ON public.rotas FOR ALL
  USING (employee_id IN (
    SELECT id FROM profiles WHERE tenant_id = get_current_user_tenant_id()
  ) AND get_current_user_role() = 'HR_ADMIN');

-- Rota Audit
ALTER TABLE public.rota_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rota audit in their tenant"
  ON public.rota_audit FOR SELECT
  USING (rota_id IN (
    SELECT r.id FROM rotas r 
    JOIN profiles p ON r.employee_id = p.id 
    WHERE p.tenant_id = get_current_user_tenant_id()
  ));

-- Flex Policies
ALTER TABLE public.flex_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR_ADMIN can manage flex policies in their tenant"
  ON public.flex_policies FOR ALL
  USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Users can view flex policies in their tenant"
  ON public.flex_policies FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- Flex Requests
ALTER TABLE public.flex_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can manage their own flex requests"
  ON public.flex_requests FOR ALL
  USING (employee_id = auth.uid());

CREATE POLICY "Managers can manage flex requests from their team"
  ON public.flex_requests FOR ALL
  USING (employee_id IN (
    SELECT p.id FROM profiles p 
    JOIN teams t ON p.team_id = t.id 
    WHERE t.manager_id = auth.uid()
  ));

CREATE POLICY "HR_ADMIN can manage all flex requests in tenant"
  ON public.flex_requests FOR ALL
  USING (employee_id IN (
    SELECT id FROM profiles WHERE tenant_id = get_current_user_tenant_id()
  ) AND get_current_user_role() = 'HR_ADMIN');

-- Work Mode Logs
ALTER TABLE public.work_mode_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own work mode logs"
  ON public.work_mode_logs FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Managers can view work mode logs from their team"
  ON public.work_mode_logs FOR SELECT
  USING (employee_id IN (
    SELECT p.id FROM profiles p 
    JOIN teams t ON p.team_id = t.id 
    WHERE t.manager_id = auth.uid()
  ));

CREATE POLICY "HR_ADMIN can view all work mode logs in tenant"
  ON public.work_mode_logs FOR SELECT
  USING (employee_id IN (
    SELECT id FROM profiles WHERE tenant_id = get_current_user_tenant_id()
  ) AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "System can insert work mode logs"
  ON public.work_mode_logs FOR INSERT
  WITH CHECK (true); -- Para permitir inserciones desde edge functions