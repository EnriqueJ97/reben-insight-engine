-- Update existing teams that don't have invite_code
UPDATE public.teams 
SET invite_code = 'team-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || substr(md5(random()::text), 1, 6)
WHERE invite_code IS NULL;