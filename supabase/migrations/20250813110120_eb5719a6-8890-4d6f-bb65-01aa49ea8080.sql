-- Tabla para gestionar facturación de tenants
CREATE TABLE public.tenant_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  billing_email TEXT NOT NULL,
  billing_address JSONB,
  payment_method TEXT DEFAULT 'monthly_invoice', -- 'monthly_invoice', 'annual_invoice', 'credit_card', 'bank_transfer'
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  annual_price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  payment_day INTEGER DEFAULT 1, -- día del mes para facturar
  next_billing_date DATE,
  last_payment_date DATE,
  payment_status TEXT DEFAULT 'current', -- 'current', 'overdue', 'cancelled'
  tax_rate DECIMAL(5,2) DEFAULT 21.0, -- IVA por defecto 21%
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Tabla para el historial de facturas
CREATE TABLE public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'paid', 'overdue', 'cancelled'
  sent_date DATE,
  paid_date DATE,
  due_date DATE,
  file_path TEXT, -- PDF de la factura
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(invoice_number)
);

-- RLS para tenant_billing
ALTER TABLE public.tenant_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all billing data"
ON public.tenant_billing
FOR ALL
USING (get_current_user_role() = 'SUPER_ADMIN');

-- RLS para billing_invoices  
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all invoices"
ON public.billing_invoices
FOR ALL
USING (get_current_user_role() = 'SUPER_ADMIN');

-- Actualizar tabla tenants para agregar campos de facturación
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS mrr DECIMAL(10,2) DEFAULT 0, -- Monthly Recurring Revenue
ADD COLUMN IF NOT EXISTS arr DECIMAL(10,2) DEFAULT 0; -- Annual Recurring Revenue

-- Trigger para actualizar updated_at en tenant_billing
CREATE TRIGGER update_tenant_billing_updated_at
  BEFORE UPDATE ON public.tenant_billing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar datos de facturación por defecto para tenants existentes
INSERT INTO public.tenant_billing (tenant_id, billing_email, monthly_price, payment_method)
SELECT 
  id,
  COALESCE(domain, 'admin@' || LOWER(REPLACE(name, ' ', '')) || '.com') as billing_email,
  CASE 
    WHEN subscription_plan = 'basic' THEN 99.00
    WHEN subscription_plan = 'premium' THEN 299.00
    WHEN subscription_plan = 'enterprise' THEN 999.00
    ELSE 99.00
  END as monthly_price,
  'monthly_invoice' as payment_method
FROM public.tenants
WHERE id NOT IN (SELECT tenant_id FROM public.tenant_billing);