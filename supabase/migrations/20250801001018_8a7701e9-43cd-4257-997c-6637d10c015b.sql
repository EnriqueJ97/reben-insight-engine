-- Set enriquejimenezcruz@gmail.com as SUPER_ADMIN
UPDATE public.profiles 
SET role = 'SUPER_ADMIN' 
WHERE email = 'enriquejimenezcruz@gmail.com';