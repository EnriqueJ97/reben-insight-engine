import { useAuth } from '@/contexts/AuthContext';
import HRCompensationPanel from './HRCompensationPanel';
import EmployeeFlexPlan from './EmployeeFlexPlan';

const FlexibleCompensationHub = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando...</div>;
  }

  // HR Admin sees configuration and analytics
  if (user.role === 'HR_ADMIN') {
    return <HRCompensationPanel />;
  }

  // Employees see their personal flexible plan
  return <EmployeeFlexPlan />;
};

export default FlexibleCompensationHub;