import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedTeamsManagement from '@/components/operations/EnhancedTeamsManagement';
import EmployeeImport from '@/components/EmployeeImport';

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

  // Render specific content based on the current path
  if (location.pathname.includes('/import')) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold">Importar Empleados</h1>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-muted-foreground mb-6">
            Importa empleados masivamente usando un archivo CSV para una integración rápida y sencilla en la plataforma.
          </p>
          <EmployeeImport />
        </div>
      </div>
    );
  }

  // Default: Enhanced Teams management
  return <EnhancedTeamsManagement />;
};

export default TeamsManagement;