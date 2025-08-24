import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import HRTeamsManagement from '@/components/operations/HRTeamsManagement';

const TeamsManagement = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== 'HR_ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores HR pueden acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Default: HR Teams Management with strategic focus
  return <HRTeamsManagement />;
};

export default TeamsManagement;