-- Revert Xavi's role back to EMPLOYEE
UPDATE profiles 
SET role = 'EMPLOYEE' 
WHERE email = 'javiergarciatort@gmail.com';