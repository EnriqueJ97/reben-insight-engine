import { useAuth } from '@/contexts/AuthContext';
import ManagerReports from '@/components/reports/ManagerReports';
import HRAdminReports from '@/components/reports/HRAdminReports';

const Reports = () => {
  const { user } = useAuth();

  // Redirect based on user role
  if (user?.role === 'HR_ADMIN') {
    return <HRAdminReports />;
  }

  // Default to Manager view
  return <ManagerReports />;
};

export default Reports;