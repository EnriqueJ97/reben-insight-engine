-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR_ADMIN');

-- Create tenants table for multi-tenant support
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'EMPLOYEE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, tenant_id)
);

-- Add foreign key constraint for team manager
ALTER TABLE public.teams ADD CONSTRAINT teams_manager_id_fkey 
  FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create check-ins table
CREATE TABLE public.checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  question_id TEXT NOT NULL,
  response_value INTEGER NOT NULL CHECK (response_value >= 0 AND response_value <= 4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR_ADMIN can update their tenant" ON public.tenants
  FOR UPDATE USING (
    id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

-- Create RLS policies for profiles
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "HR_ADMIN can manage profiles in their tenant" ON public.profiles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'HR_ADMIN'
    )
  );

-- Create RLS policies for teams
CREATE POLICY "Users can view teams in their tenant" ON public.teams
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers and HR_ADMIN can manage teams" ON public.teams
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('MANAGER', 'HR_ADMIN')
    )
  );

-- Create RLS policies for checkins
CREATE POLICY "Users can view their own checkins" ON public.checkins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own checkins" ON public.checkins
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view checkins from their team" ON public.checkins
  FOR SELECT USING (
    user_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.teams t ON p.team_id = t.id
      WHERE t.manager_id = auth.uid()
    )
  );

CREATE POLICY "HR_ADMIN can view all checkins in their tenant" ON public.checkins
  FOR SELECT USING (
    user_id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() AND role = 'HR_ADMIN'
      )
    )
  );

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" ON public.alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view alerts from their team" ON public.alerts
  FOR SELECT USING (
    user_id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.teams t ON p.team_id = t.id
      WHERE t.manager_id = auth.uid()
    )
  );

CREATE POLICY "HR_ADMIN can view all alerts in their tenant" ON public.alerts
  FOR SELECT USING (
    user_id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() AND role = 'HR_ADMIN'
      )
    )
  );

CREATE POLICY "Managers and HR_ADMIN can manage alerts" ON public.alerts
  FOR ALL USING (
    user_id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('MANAGER', 'HR_ADMIN')
      )
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- For now, we'll create a default tenant if none exists
  -- In production, this would be handled differently during company signup
  INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
  VALUES (
    NEW.id,
    (SELECT id FROM public.tenants LIMIT 1), -- Temporary: use first tenant
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'EMPLOYEE')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert a default tenant for testing
INSERT INTO public.tenants (name, domain, settings)
VALUES (
  'REBEN Demo Company',
  'demo.reben.com',
  '{"slack_enabled": false, "email_enabled": true, "daily_checkin_time": "09:00"}'
);