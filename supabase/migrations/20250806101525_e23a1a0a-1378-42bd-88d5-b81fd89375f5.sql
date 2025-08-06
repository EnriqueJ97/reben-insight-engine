-- Create alias system for privacy-first interventions
CREATE TABLE IF NOT EXISTS public.employee_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alias_code TEXT NOT NULL UNIQUE, -- e.g., "EMP-9F2A"
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'), -- Rotating aliases
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create intervention messages table for blind messaging
CREATE TABLE IF NOT EXISTS public.intervention_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alias_id UUID NOT NULL REFERENCES public.employee_aliases(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL, -- 'coach_offer', 'reminder', 'hr_offer'
  content JSONB NOT NULL, -- Message content and options
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response JSONB, -- User response
  consent_given BOOLEAN DEFAULT false, -- If user consents to reveal identity
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id)
);

-- Create privacy audit log
CREATE TABLE IF NOT EXISTS public.privacy_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'alias_created', 'data_accessed', 'consent_given', 'identity_revealed'
  user_id UUID REFERENCES auth.users(id),
  affected_user_id UUID REFERENCES auth.users(id),
  alias_id UUID REFERENCES public.employee_aliases(id),
  details JSONB,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_aliases
CREATE POLICY "Users can view their own alias" 
ON public.employee_aliases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "HR can view active aliases without user identity" 
ON public.employee_aliases 
FOR SELECT 
USING (
  is_active = true 
  AND tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN', 'COMPLIANCE_OFFICER')
);

-- RLS Policies for intervention_messages
CREATE POLICY "Users can view their own intervention messages" 
ON public.intervention_messages 
FOR SELECT 
USING (
  alias_id IN (
    SELECT id FROM public.employee_aliases WHERE user_id = auth.uid()
  )
);

CREATE POLICY "HR can view intervention messages for their tenant" 
ON public.intervention_messages 
FOR ALL 
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() IN ('HR_ADMIN', 'COMPLIANCE_OFFICER')
);

-- RLS Policies for privacy_audit_log
CREATE POLICY "Only compliance officers can view audit logs" 
ON public.privacy_audit_log 
FOR SELECT 
USING (
  tenant_id = public.get_current_user_tenant_id()
  AND public.get_current_user_role() = 'COMPLIANCE_OFFICER'
);

-- Function to create rotating aliases
CREATE OR REPLACE FUNCTION public.create_employee_alias(employee_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_alias TEXT;
  tenant_uuid UUID;
BEGIN
  -- Get tenant
  SELECT tenant_id INTO tenant_uuid FROM public.profiles WHERE id = employee_id;
  
  -- Generate unique alias
  new_alias := 'EMP-' || UPPER(substring(md5(random()::text || employee_id::text) from 1 for 4));
  
  -- Deactivate old aliases
  UPDATE public.employee_aliases 
  SET is_active = false 
  WHERE user_id = employee_id AND is_active = true;
  
  -- Create new alias
  INSERT INTO public.employee_aliases (user_id, alias_code, tenant_id)
  VALUES (employee_id, new_alias, tenant_uuid);
  
  -- Log action
  INSERT INTO public.privacy_audit_log (action, affected_user_id, details, tenant_id)
  VALUES ('alias_created', employee_id, jsonb_build_object('alias', new_alias), tenant_uuid);
  
  RETURN new_alias;
END;
$function$;

-- Function to send intervention message
CREATE OR REPLACE FUNCTION public.send_intervention_message(
  employee_alias TEXT,
  alert_uuid UUID,
  msg_type TEXT,
  msg_content JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  alias_record RECORD;
  message_id UUID;
  tenant_uuid UUID;
BEGIN
  -- Get alias record
  SELECT * INTO alias_record 
  FROM public.employee_aliases 
  WHERE alias_code = employee_alias AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Alias not found or expired';
  END IF;
  
  -- Get current user's tenant
  SELECT tenant_id INTO tenant_uuid FROM public.profiles WHERE id = auth.uid();
  
  -- Insert intervention message
  INSERT INTO public.intervention_messages (
    alias_id, alert_id, message_type, content, created_by, tenant_id
  )
  VALUES (
    alias_record.id, alert_uuid, msg_type, msg_content, auth.uid(), tenant_uuid
  )
  RETURNING id INTO message_id;
  
  -- Log action
  INSERT INTO public.privacy_audit_log (
    action, user_id, affected_user_id, alias_id, details, tenant_id
  )
  VALUES (
    'intervention_sent', auth.uid(), alias_record.user_id, alias_record.id,
    jsonb_build_object('message_type', msg_type, 'message_id', message_id),
    tenant_uuid
  );
  
  RETURN message_id;
END;
$function$;

-- Function to handle consent for identity revelation
CREATE OR REPLACE FUNCTION public.grant_identity_consent(message_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  message_record RECORD;
  tenant_uuid UUID;
BEGIN
  -- Get message record and verify user owns it
  SELECT im.*, ea.user_id 
  INTO message_record
  FROM public.intervention_messages im
  JOIN public.employee_aliases ea ON im.alias_id = ea.id
  WHERE im.id = message_uuid AND ea.user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or access denied';
  END IF;
  
  -- Get tenant
  SELECT tenant_id INTO tenant_uuid FROM public.profiles WHERE id = auth.uid();
  
  -- Update consent
  UPDATE public.intervention_messages 
  SET consent_given = true, responded_at = now()
  WHERE id = message_uuid;
  
  -- Log consent
  INSERT INTO public.privacy_audit_log (
    action, user_id, alias_id, details, tenant_id
  )
  VALUES (
    'consent_given', auth.uid(), message_record.alias_id,
    jsonb_build_object('message_id', message_uuid),
    tenant_uuid
  );
  
  RETURN true;
END;
$function$;

-- Indexes for performance
CREATE INDEX idx_employee_aliases_active ON public.employee_aliases(is_active, expires_at);
CREATE INDEX idx_intervention_messages_alias ON public.intervention_messages(alias_id);
CREATE INDEX idx_privacy_audit_tenant ON public.privacy_audit_log(tenant_id, created_at);

-- Add triggers for automatic alias rotation
CREATE OR REPLACE FUNCTION public.cleanup_expired_aliases()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.employee_aliases 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;