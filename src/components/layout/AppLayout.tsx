import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import EmployeeOnboarding from '@/components/onboarding/EmployeeOnboarding';
import { 
  Home, 
  Heart, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  HelpCircle,
  Plug,
  Upload,
  Clock,
  Calendar,
  Leaf,
  TrendingUp,
  Eye,
  Award,
  Target,
  Briefcase,
  Sliders
} from 'lucide-react';
import { useState } from 'react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => 
    location.pathname.startsWith('/dashboard/settings')
  );
  const [isOperationsOpen, setIsOperationsOpen] = useState(() => 
    location.pathname.startsWith('/dashboard/operations')
  );
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(() => 
    location.pathname.startsWith('/dashboard/sustainability')
  );

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Check-in', href: '/dashboard/checkin', icon: Heart, roles: ['EMPLOYEE'] },
    { name: 'Mis Turnos', href: '/dashboard/mis-turnos', icon: Clock, roles: ['EMPLOYEE'] },
    { name: 'Trabajo Flexible', href: '/dashboard/trabajo-flexible', icon: Calendar, roles: ['EMPLOYEE'] },
    { name: 'Mi Equipo', href: '/dashboard/team', icon: Users, roles: ['MANAGER'] },
    { name: 'Análisis Organizacional', href: '/dashboard/operations/hr-analytics', icon: TrendingUp, roles: ['HR_ADMIN'] },
    { name: 'Alertas', href: '/dashboard/alerts', icon: AlertTriangle, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3, roles: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'] },
    { name: 'Super Admin', href: '/dashboard/super-admin', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const settingsSubItems = [
    { name: 'Campañas', href: '/dashboard/settings/campaigns', icon: Mail },
    { name: 'Preguntas', href: '/dashboard/settings/questions', icon: HelpCircle },
    { name: 'Integraciones', href: '/dashboard/settings/integrations', icon: Plug },
    { name: 'Configuración de Políticas', href: '/dashboard/settings/policies', icon: Sliders },
  ];


  const operationsSubItems = user?.role === 'HR_ADMIN' ? [
    { name: 'Simulador What-If', href: '/dashboard/operations/simulador', icon: TrendingUp },
    { name: 'Insights Avanzados', href: '/dashboard/operations/360feedback', icon: BarChart3 },
    { name: 'Turnos Inteligentes', href: '/dashboard/operations/shifts', icon: Clock },
    { name: 'Cultura Flexible', href: '/dashboard/operations/flexible', icon: Calendar },
  ] : user?.role === 'MANAGER' ? [
    { name: 'Turnos de mi Equipo', href: '/dashboard/operations/shifts', icon: Clock },
    { name: 'Integraciones', href: '/dashboard/operations/integrations', icon: Plug },
    { name: 'Recursos', href: '/dashboard/operations/resources', icon: HelpCircle },
  ] : [];

  const sustainabilitySubItems = [
    { name: 'CSRD Dashboard', href: '/dashboard/sustainability/csrd', icon: Leaf },
    { name: 'Diagnóstico', href: '/dashboard/sustainability/diagnostico', icon: HelpCircle },
    { name: 'Materialidad', href: '/dashboard/sustainability/materialidad', icon: BarChart3 },
    { name: 'Data Hub ESRS', href: '/dashboard/sustainability/data-hub', icon: Upload },
    { name: 'Tareas', href: '/dashboard/sustainability/tareas', icon: AlertTriangle },
    { name: 'Reportes', href: '/dashboard/sustainability/reportes', icon: Mail },
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
          
          {/* Settings Collapsible Section - Only for HR_ADMIN */}
          {user?.role === 'HR_ADMIN' && (
            <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 space-x-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </div>
                {isSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {settingsSubItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    className={`flex items-center py-2 pl-10 pr-4 space-x-2 hover:bg-accent transition-colors ${
                      location.pathname === subItem.href ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          
          {/* Operations Collapsible Section - For MANAGER and HR_ADMIN */}
          {(user?.role === 'MANAGER' || user?.role === 'HR_ADMIN') && operationsSubItems.length > 0 && (
            <Collapsible open={isOperationsOpen} onOpenChange={setIsOperationsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 space-x-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Operaciones</span>
                </div>
                {isOperationsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {operationsSubItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    className={`flex items-center py-2 pl-10 pr-4 space-x-2 hover:bg-accent transition-colors ${
                      location.pathname === subItem.href ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Sustainability Collapsible Section - For HR_ADMIN and COMPLIANCE_OFFICER */}
          {(user?.role === 'HR_ADMIN' || user?.role === 'COMPLIANCE_OFFICER') && (
            <Collapsible open={isSustainabilityOpen} onOpenChange={setIsSustainabilityOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 space-x-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <div className="flex items-center space-x-2">
                  <Leaf className="w-4 h-4" />
                  <span>Sostenibilidad</span>
                </div>
                {isSustainabilityOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {sustainabilitySubItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    to={subItem.href}
                    className={`flex items-center py-2 pl-10 pr-4 space-x-2 hover:bg-accent transition-colors ${
                      location.pathname === subItem.href ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
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

      {/* Onboarding para empleados */}
      <EmployeeOnboarding />

      {/* Widget flotante de Chat Inteligente */}
      <FloatingChatWidget />
    </div>
  );
};

export default AppLayout;
