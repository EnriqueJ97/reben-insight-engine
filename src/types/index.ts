// User and Authentication Types
export interface UserProfile {
  id: string;
  tenant_id: string;
  team_id?: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  name?: string;
  avatar?: string;
}

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'COMPLIANCE_OFFICER' | 'SUPER_ADMIN';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  features: {
    aiInsights?: boolean;
    teamAnalytics?: boolean;
    hrChat?: boolean;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard and Metrics Types
export interface DashboardMetrics {
  wellnessScore: number;
  burnoutRisk: number;
  activeAlerts: number;
  participation: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface CheckinStats {
  total: number;
  average_mood: number;
  trend: 'up' | 'down' | 'stable';
  last_checkin?: string;
}

export interface AlertStats {
  total: number;
  unresolved: number;
  critical: number;
  warning: number;
}

// Form and Validation Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file';
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: string | number;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// CSV Import Types
export interface CSVRow {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  equipo: string;
  valid: boolean;
  errors: string[];
}

export interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  imported: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Route Types
export interface AppRoute {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  allowedRoles?: UserRole[];
  title?: string;
  icon?: React.ComponentType;
} 