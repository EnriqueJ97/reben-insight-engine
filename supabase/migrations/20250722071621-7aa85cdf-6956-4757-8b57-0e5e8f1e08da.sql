-- Allow public access to teams table for invite code lookup
CREATE POLICY "Public can view teams by invite code" 
ON public.teams 
FOR SELECT 
TO public
USING (invite_code IS NOT NULL);