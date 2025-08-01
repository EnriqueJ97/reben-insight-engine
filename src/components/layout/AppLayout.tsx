import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Heart, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Upload,
  Plug,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Check-in', href: '/dashboard/checkin', icon: Heart, roles: ['EMPLOYEE'] },
    { name: 'Mi Equipo', href: '/dashboard/team', icon: Users, roles: ['MANAGER'] },
    { name: 'Equipos', href: '/dashboard/teams', icon: Users, roles: ['HR_ADMIN'] },
    { name: 'Gestión de Equipos', href: '/dashboard/teams/manage', icon: Settings, roles: ['HR_ADMIN'] },
    { name: 'Alertas', href: '/dashboard/alerts', icon: AlertTriangle, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Integraciones', href: '/dashboard/integrations', icon: Plug, roles: ['HR_ADMIN'] },
    { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings, roles: ['HR_ADMIN'] },
    { name: 'Importar Empleados', href: '/dashboard/employees/import', icon: Upload, roles: ['HR_ADMIN'] },
    { name: 'Super Admin', href: '/dashboard/super-admin', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredNavigationItems = navigationItems.filter(item => item.roles.includes(user?.role || 'EMPLOYEE'));

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 text-muted-foreground hover:text-foreground focus:outline-none"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-card w-64 flex-shrink-0 border-r border-border overflow-y-auto fixed lg:static top-0 left-0 h-full z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4">
          {/* Logo and App Title */}
          <Link to="/dashboard" className="flex items-center space-x-2 font-semibold text-foreground">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <span>REBEN</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {filteredNavigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center py-2 px-4 space-x-2 hover:bg-accent transition-colors ${
                location.pathname === item.href ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto">
          <Button variant="ghost" className="w-full justify-start space-x-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-end p-4 border-b border-border bg-card/50">
          {user && (
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{user.full_name || user.email}</span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
