-- Add invite_code column to teams table
ALTER TABLE public.teams 
ADD COLUMN invite_code TEXT UNIQUE;

-- Add index for better performance
CREATE INDEX idx_teams_invite_code ON public.teams(invite_code);