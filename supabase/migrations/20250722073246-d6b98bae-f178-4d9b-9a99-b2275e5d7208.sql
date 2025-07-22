-- Update Xavi's role to HR_ADMIN so he can manage teams
UPDATE profiles 
SET role = 'HR_ADMIN' 
WHERE email = 'javiergarciatort@gmail.com';