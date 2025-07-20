-- Crear tabla para campañas de email
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  question_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  scheduled_time TIME NOT NULL DEFAULT '09:00:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Crear tabla para tracking de emails enviados
CREATE TABLE public.email_sent_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent',
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns(id) ON DELETE CASCADE
);

-- RLS para email_campaigns
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR_ADMIN can manage email campaigns in their tenant" 
ON public.email_campaigns 
FOR ALL
TO public
USING (tenant_id = get_current_user_tenant_id() AND get_current_user_role() = 'HR_ADMIN');

CREATE POLICY "Users can view email campaigns in their tenant" 
ON public.email_campaigns 
FOR SELECT
TO public
USING (tenant_id = get_current_user_tenant_id());

-- RLS para email_sent_log
ALTER TABLE public.email_sent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR_ADMIN can view email logs in their tenant" 
ON public.email_sent_log 
FOR SELECT
TO public
USING (
  campaign_id IN (
    SELECT id FROM public.email_campaigns 
    WHERE tenant_id = get_current_user_tenant_id() 
    AND get_current_user_role() = 'HR_ADMIN'
  )
);

CREATE POLICY "Users can view their own email logs" 
ON public.email_sent_log 
FOR SELECT
TO public
USING (user_id = auth.uid());