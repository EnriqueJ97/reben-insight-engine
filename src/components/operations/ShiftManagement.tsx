import { useAuth } from '@/contexts/AuthContext';
import ManagerShiftManagement from './ManagerShiftManagement';
import HRShiftManagement from './HRShiftManagement';

const ShiftManagement = () => {
  const { user } = useAuth();

  // Redirect based on user role
  if (user?.role === 'HR_ADMIN') {
    return <HRShiftManagement />;
  }

  // Default to Manager view
  return <ManagerShiftManagement />;
};

export default ShiftManagement;