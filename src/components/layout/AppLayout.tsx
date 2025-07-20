
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Heart, 
  Settings, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Bell,
  Plug
} from 'lucide-react';
import { useState } from 'react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ];

    if (user?.role === 'EMPLOYEE') {
      return [
        ...baseItems,
        { href: '/dashboard/checkin', icon: Heart, label: 'Check-in Diario' },
        { href: '/dashboard/alerts', icon: Bell, label: 'Mis Alertas' }
      ];
    }

    if (user?.role === 'MANAGER') {
      return [
        ...baseItems,
        { href: '/dashboard/team', icon: Users, label: 'Mi Equipo' },
        { href: '/dashboard/alerts', icon: Bell, label: 'Alertas del Equipo' },
        { href: '/dashboard/reports', icon: BarChart3, label: 'Informes' }
      ];
    }

    if (user?.role === 'HR_ADMIN') {
      return [
        ...baseItems,
        { href: '/dashboard/teams', icon: Users, label: 'Equipos' },
        { href: '/dashboard/alerts', icon: Bell, label: 'Centro de Alertas' },
        { href: '/dashboard/integrations', icon: Plug, label: 'Integraciones' },
        { href: '/dashboard/reports', icon: BarChart3, label: 'Informes' },
        { href: '/dashboard/settings', icon: Settings, label: 'Configuración' }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'fixed inset-0 z-50 lg:hidden' : 'hidden lg:flex'} bg-card border-r`}>
      {mobile && (
        <div className="fixed inset-0 bg-background/80" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${mobile ? 'fixed left-0 top-0 h-full w-64 bg-card' : 'w-64'} flex flex-col`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">REBEN</span>
            </div>
            {mobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={mobile ? () => setSidebarOpen(false) : undefined}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarFallback>{user?.avatar || user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 minimum-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Sidebar mobile />

      <div className="lg:ml-64">
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Bienestar Laboral</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.name}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.avatar || user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
