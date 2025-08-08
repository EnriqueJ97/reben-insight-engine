-- Anonymous Feedback feature (Points 4 & 5)

-- Create table for anonymous feedback
CREATE TABLE IF NOT EXISTS public.anonymous_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('wellness','policy','manager','workload','culture','other')),
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Any authenticated user can submit anonymous feedback for their tenant
CREATE POLICY "Employees can submit anonymous feedback"
ON public.anonymous_feedback
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = public.get_current_user_tenant_id()
);

-- Policy: HR, Managers, and Super Admin can view feedback within their tenant
CREATE POLICY "HR and Managers can view tenant feedback"
ON public.anonymous_feedback
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN','MANAGER','SUPER_ADMIN')
);

-- Policy: Only HR Admin and Super Admin can delete feedback
CREATE POLICY "HR and Super Admin can delete feedback"
ON public.anonymous_feedback
FOR DELETE
TO authenticated
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN','SUPER_ADMIN')
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_anonymous_feedback_tenant ON public.anonymous_feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_feedback_category ON public.anonymous_feedback(category);
CREATE INDEX IF NOT EXISTS idx_anonymous_feedback_created_at ON public.anonymous_feedback(created_at);
