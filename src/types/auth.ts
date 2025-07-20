export interface UserProfile {
  id: string;
  tenant_id: string;
  team_id?: string;
  email: string;
  full_name?: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  created_at: string;
  updated_at: string;
  // Computed properties for backward compatibility
  name?: string;
  avatar?: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: any;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

// Legacy interfaces for backward compatibility
export interface User extends UserProfile {}