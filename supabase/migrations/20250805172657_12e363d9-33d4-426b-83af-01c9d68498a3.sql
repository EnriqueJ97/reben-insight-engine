-- Add company information fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN industry text,
ADD COLUMN company_size text,
ADD COLUMN timezone text DEFAULT 'America/Mexico_City',
ADD COLUMN description text;