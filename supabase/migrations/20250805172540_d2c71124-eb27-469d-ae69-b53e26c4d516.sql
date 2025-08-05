-- Add onboarding_completed column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;