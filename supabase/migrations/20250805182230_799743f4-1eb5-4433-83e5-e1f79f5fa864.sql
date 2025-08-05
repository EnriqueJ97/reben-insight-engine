-- Crear enum para niveles de aseguramiento CSRD
CREATE TYPE public.assurance_level AS ENUM ('limited', 'reasonable');

-- Crear enum para estados de cobertura ESRS
CREATE TYPE public.coverage_status AS ENUM ('OK', 'MISSING', 'ESTIMATE');

-- Crear enum para cuadrantes de materialidad
CREATE TYPE public.materiality_quadrant AS ENUM ('high_high', 'high_low', 'low_high', 'low_low');

-- Crear enum para estados de compliance
CREATE TYPE public.compliance_status AS ENUM ('DRAFT', 'SUBMITTED', 'QA', 'FINAL');

-- Crear enum para estados de tareas
CREATE TYPE public.task_status AS ENUM ('TODO', 'IN_PROGRESS', 'READY', 'COMPLETED');

-- Agregar nuevo rol de usuario
ALTER TYPE public.user_role ADD VALUE 'COMPLIANCE_OFFICER';

-- 1. Perfil CSRD de la empresa
CREATE TABLE public.csrd_profile (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    company_size TEXT NOT NULL, -- 'small', 'medium', 'large', 'public_interest'
    sector TEXT NOT NULL,
    is_eu_entity BOOLEAN NOT NULL DEFAULT true,
    employee_count INTEGER,
    total_assets DECIMAL,
    net_turnover DECIMAL,
    year_first_report INTEGER,
    assurance_level public.assurance_level NOT NULL DEFAULT 'limited',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Matriz de materialidad
CREATE TABLE public.materiality_matrix (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    csrd_profile_id UUID NOT NULL,
    topic_code TEXT NOT NULL, -- ej: 'E1', 'S1', 'G1'
    topic_name TEXT NOT NULL,
    impact_score DECIMAL(3,2), -- 0.0 a 5.0
    financial_score DECIMAL(3,2), -- 0.0 a 5.0
    quadrant public.materiality_quadrant,
    is_material BOOLEAN DEFAULT false,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Catálogo de IROs (Impactos, Riesgos, Oportunidades)
CREATE TABLE public.iro_catalog (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    materiality_id UUID NOT NULL,
    type TEXT NOT NULL, -- 'impact', 'risk', 'opportunity'
    description TEXT NOT NULL,
    likelihood TEXT, -- 'low', 'medium', 'high'
    magnitude TEXT, -- 'low', 'medium', 'high'
    time_horizon TEXT, -- 'short', 'medium', 'long'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Puntos de datos ESRS
CREATE TABLE public.esrs_data_points (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    code TEXT NOT NULL, -- ej: 'S1-1', 'E1-5'
    esrs_standard TEXT NOT NULL, -- 'E1', 'E2', 'S1', etc.
    title TEXT NOT NULL,
    description TEXT,
    unit TEXT, -- '%', 'hours', 'euros', etc.
    data_type TEXT NOT NULL, -- 'numeric', 'text', 'percentage', 'boolean'
    is_mandatory BOOLEAN DEFAULT true,
    owner_role TEXT, -- quien debe completarlo
    source_system TEXT, -- 'manual', 'hris', 'erp', 'eie'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, code)
);

-- 5. Valores de datos ESRS
CREATE TABLE public.esrs_values (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    data_point_id UUID NOT NULL,
    reporting_period INTEGER NOT NULL, -- año
    value_numeric DECIMAL,
    value_text TEXT,
    value_boolean BOOLEAN,
    coverage_status public.coverage_status NOT NULL DEFAULT 'MISSING',
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    source_description TEXT,
    last_updated_by UUID,
    evidence_file_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Archivos de evidencia
CREATE TABLE public.evidence_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID NOT NULL,
    description TEXT,
    checksum TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Tareas de compliance
CREATE TABLE public.compliance_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    data_point_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID,
    status public.task_status NOT NULL DEFAULT 'TODO',
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Comentarios de tareas
CREATE TABLE public.task_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    task_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Versiones de reportes
CREATE TABLE public.report_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    version_number TEXT NOT NULL,
    reporting_period INTEGER NOT NULL,
    status public.compliance_status NOT NULL DEFAULT 'DRAFT',
    generated_by UUID NOT NULL,
    file_path TEXT,
    xhtml_content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Mapeo de etiquetas XBRL
CREATE TABLE public.tag_map (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_version_id UUID NOT NULL,
    data_point_id UUID NOT NULL,
    xbrl_tag TEXT NOT NULL,
    tag_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Revisiones de aseguramiento
CREATE TABLE public.assurance_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_version_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    assurance_level public.assurance_level NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    findings TEXT,
    recommendations TEXT,
    digital_signature TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Log de auditoría
CREATE TABLE public.audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    assurance_review_id UUID NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'data_point', 'task', 'report'
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejorar performance
CREATE INDEX idx_materiality_matrix_tenant ON public.materiality_matrix(tenant_id);
CREATE INDEX idx_esrs_data_points_tenant_code ON public.esrs_data_points(tenant_id, code);
CREATE INDEX idx_esrs_values_tenant_period ON public.esrs_values(tenant_id, reporting_period);
CREATE INDEX idx_compliance_tasks_assigned ON public.compliance_tasks(assigned_to, status);
CREATE INDEX idx_report_versions_tenant_period ON public.report_versions(tenant_id, reporting_period);

-- Foreign Keys
ALTER TABLE public.materiality_matrix ADD CONSTRAINT fk_materiality_csrd_profile 
    FOREIGN KEY (csrd_profile_id) REFERENCES public.csrd_profile(id) ON DELETE CASCADE;

ALTER TABLE public.iro_catalog ADD CONSTRAINT fk_iro_materiality 
    FOREIGN KEY (materiality_id) REFERENCES public.materiality_matrix(id) ON DELETE CASCADE;

ALTER TABLE public.esrs_values ADD CONSTRAINT fk_esrs_values_data_point 
    FOREIGN KEY (data_point_id) REFERENCES public.esrs_data_points(id) ON DELETE CASCADE;

ALTER TABLE public.esrs_values ADD CONSTRAINT fk_esrs_values_evidence 
    FOREIGN KEY (evidence_file_id) REFERENCES public.evidence_files(id) ON DELETE SET NULL;

ALTER TABLE public.compliance_tasks ADD CONSTRAINT fk_compliance_tasks_data_point 
    FOREIGN KEY (data_point_id) REFERENCES public.esrs_data_points(id) ON DELETE CASCADE;

ALTER TABLE public.task_comments ADD CONSTRAINT fk_task_comments_task 
    FOREIGN KEY (task_id) REFERENCES public.compliance_tasks(id) ON DELETE CASCADE;

ALTER TABLE public.tag_map ADD CONSTRAINT fk_tag_map_report 
    FOREIGN KEY (report_version_id) REFERENCES public.report_versions(id) ON DELETE CASCADE;

ALTER TABLE public.tag_map ADD CONSTRAINT fk_tag_map_data_point 
    FOREIGN KEY (data_point_id) REFERENCES public.esrs_data_points(id) ON DELETE CASCADE;

ALTER TABLE public.assurance_reviews ADD CONSTRAINT fk_assurance_review_report 
    FOREIGN KEY (report_version_id) REFERENCES public.report_versions(id) ON DELETE CASCADE;

ALTER TABLE public.audit_log ADD CONSTRAINT fk_audit_log_review 
    FOREIGN KEY (assurance_review_id) REFERENCES public.assurance_reviews(id) ON DELETE CASCADE;

-- Triggers para updated_at
CREATE TRIGGER update_csrd_profile_updated_at 
    BEFORE UPDATE ON public.csrd_profile 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiality_matrix_updated_at 
    BEFORE UPDATE ON public.materiality_matrix 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iro_catalog_updated_at 
    BEFORE UPDATE ON public.iro_catalog 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esrs_data_points_updated_at 
    BEFORE UPDATE ON public.esrs_data_points 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_esrs_values_updated_at 
    BEFORE UPDATE ON public.esrs_values 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_tasks_updated_at 
    BEFORE UPDATE ON public.compliance_tasks 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_versions_updated_at 
    BEFORE UPDATE ON public.report_versions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE public.csrd_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiality_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iro_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esrs_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esrs_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assurance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- CSRD Profile
CREATE POLICY "Users can view CSRD profile in their tenant" ON public.csrd_profile
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "HR_ADMIN and COMPLIANCE_OFFICER can manage CSRD profile" ON public.csrd_profile
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Materiality Matrix
CREATE POLICY "Users can view materiality matrix in their tenant" ON public.materiality_matrix
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage materiality matrix" ON public.materiality_matrix
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- IRO Catalog
CREATE POLICY "Users can view IRO catalog in their tenant" ON public.iro_catalog
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage IRO catalog" ON public.iro_catalog
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- ESRS Data Points
CREATE POLICY "Users can view ESRS data points in their tenant" ON public.esrs_data_points
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage ESRS data points" ON public.esrs_data_points
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- ESRS Values
CREATE POLICY "Users can view ESRS values in their tenant" ON public.esrs_values
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update assigned ESRS values" ON public.esrs_values
    FOR UPDATE USING (
        tenant_id = get_current_user_tenant_id() AND 
        (get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text]) OR 
         last_updated_by = auth.uid())
    );

CREATE POLICY "COMPLIANCE_OFFICER can manage all ESRS values" ON public.esrs_values
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Evidence Files
CREATE POLICY "Users can view evidence files in their tenant" ON public.evidence_files
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can upload evidence files" ON public.evidence_files
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() AND uploaded_by = auth.uid());

CREATE POLICY "COMPLIANCE_OFFICER can manage evidence files" ON public.evidence_files
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Compliance Tasks
CREATE POLICY "Users can view compliance tasks in their tenant" ON public.compliance_tasks
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update assigned tasks" ON public.compliance_tasks
    FOR UPDATE USING (
        tenant_id = get_current_user_tenant_id() AND 
        (assigned_to = auth.uid() OR 
         get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text]))
    );

CREATE POLICY "COMPLIANCE_OFFICER can manage compliance tasks" ON public.compliance_tasks
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Task Comments
CREATE POLICY "Users can view task comments in their tenant" ON public.task_comments
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can add comments to tasks" ON public.task_comments
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id() AND user_id = auth.uid());

-- Report Versions
CREATE POLICY "Users can view report versions in their tenant" ON public.report_versions
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage report versions" ON public.report_versions
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Tag Map
CREATE POLICY "Users can view tag map in their tenant" ON public.tag_map
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage tag map" ON public.tag_map
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Assurance Reviews
CREATE POLICY "Users can view assurance reviews in their tenant" ON public.assurance_reviews
    FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "COMPLIANCE_OFFICER can manage assurance reviews" ON public.assurance_reviews
    FOR ALL USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

-- Audit Log
CREATE POLICY "COMPLIANCE_OFFICER can view audit log" ON public.audit_log
    FOR SELECT USING (
        tenant_id = get_current_user_tenant_id() AND 
        get_current_user_role() = ANY(ARRAY['HR_ADMIN'::text, 'COMPLIANCE_OFFICER'::text])
    );

CREATE POLICY "System can insert audit log entries" ON public.audit_log
    FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id());