
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  team_id?: string;
  tenant_id: string;
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings?: {
    slack_enabled?: boolean;
    email_enabled?: boolean;
    daily_checkin_time?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
