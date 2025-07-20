
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana@empresa.com',
    password: 'demo123',
    role: 'HR_ADMIN',
    tenant_id: 'tenant-1',
    avatar: '👩‍💼'
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@empresa.com',
    password: 'demo123',
    role: 'MANAGER',
    team_id: 'team-1',
    tenant_id: 'tenant-1',
    avatar: '👨‍💼'
  },
  {
    id: '3',
    name: 'María Rodríguez',
    email: 'maria@empresa.com',
    password: 'demo123',
    role: 'EMPLOYEE',
    team_id: 'team-1',
    tenant_id: 'tenant-1',
    avatar: '👩‍💻'
  }
];

const MOCK_TENANT: Tenant = {
  id: 'tenant-1',
  name: 'Empresa Demo',
  domain: 'empresa.com',
  settings: {
    slack_enabled: false,
    email_enabled: true,
    daily_checkin_time: '09:00'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem('reben_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setTenant(MOCK_TENANT);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!mockUser) {
      throw new Error('Credenciales inválidas');
    }

    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword);
    setTenant(MOCK_TENANT);
    localStorage.setItem('reben_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
    localStorage.removeItem('reben_user');
  };

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
