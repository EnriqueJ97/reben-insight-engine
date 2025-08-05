import { UserRole } from '@/types';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CheckIn from '@/pages/CheckIn';
import Team from '@/pages/Team';
import TeamsManagement from '@/pages/TeamsManagement';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import TeamAnalysis from '@/pages/TeamAnalysis';
import NotFound from '@/pages/NotFound';
import JoinTeam from '@/pages/JoinTeam';
import SuperAdmin from '@/pages/SuperAdmin';
import Landing from '@/pages/Landing';
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { IntegrationsCenter } from '@/components/integrations/IntegrationsCenter';
import EmployeeImport from '@/components/EmployeeImport';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  allowedRoles?: UserRole[];
  title?: string;
  icon?: React.ComponentType;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: '/login',
    element: Login,
    title: 'Iniciar Sesión'
  },
  {
    path: '/join-team/:inviteCode',
    element: JoinTeam,
    title: 'Unirse al Equipo'
  },
  {
    path: '/landing',
    element: Landing,
    title: 'Bienvenido'
  },
  {
    path: '/',
    element: Dashboard,
    protected: true,
    title: 'Dashboard'
  },
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true,
    title: 'Dashboard',
    children: [
      {
        path: 'checkin',
        element: CheckIn,
        protected: true,
        allowedRoles: ['EMPLOYEE'],
        title: 'Check-in'
      },
      {
        path: 'team',
        element: Team,
        protected: true,
        allowedRoles: ['MANAGER'],
        title: 'Mi Equipo'
      },
      {
        path: 'alerts',
        element: AlertsCenter,
        protected: true,
        title: 'Centro de Alertas'
      },
      {
        path: 'integrations',
        element: IntegrationsCenter,
        protected: true,
        title: 'Integraciones'
      },
      {
        path: 'teams',
        element: Team,
        protected: true,
        allowedRoles: ['HR_ADMIN'],
        title: 'Equipos'
      },
      {
        path: 'teams/manage',
        element: TeamsManagement,
        protected: true,
        allowedRoles: ['HR_ADMIN'],
        title: 'Gestión de Equipos'
      },
      {
        path: 'reports',
        element: Reports,
        protected: true,
        allowedRoles: ['MANAGER', 'HR_ADMIN'],
        title: 'Reportes'
      },
      {
        path: 'team-analysis',
        element: TeamAnalysis,
        protected: true,
        allowedRoles: ['MANAGER', 'HR_ADMIN'],
        title: 'Análisis de Equipo'
      },
      {
        path: 'settings',
        element: Settings,
        protected: true,
        allowedRoles: ['HR_ADMIN'],
        title: 'Configuración',
        children: [
          {
            path: 'campaigns',
            element: Settings,
            protected: true,
            allowedRoles: ['HR_ADMIN'],
            title: 'Campañas'
          },
          {
            path: 'questions',
            element: Settings,
            protected: true,
            allowedRoles: ['HR_ADMIN'],
            title: 'Preguntas'
          },
          {
            path: 'alerts',
            element: Settings,
            protected: true,
            allowedRoles: ['HR_ADMIN'],
            title: 'Alertas'
          },
          {
            path: 'integrations',
            element: Settings,
            protected: true,
            allowedRoles: ['HR_ADMIN'],
            title: 'Integraciones'
          }
        ]
      },
      {
        path: 'employees/import',
        element: EmployeeImport,
        protected: true,
        allowedRoles: ['HR_ADMIN'],
        title: 'Importar Empleados'
      },
      {
        path: 'super-admin',
        element: SuperAdmin,
        protected: true,
        allowedRoles: ['SUPER_ADMIN'],
        title: 'Super Administrador'
      }
    ]
  },
  {
    path: '*',
    element: NotFound,
    title: 'Página no encontrada'
  }
];

export const getRouteByPath = (path: string): RouteConfig | undefined => {
  const findRoute = (routes: RouteConfig[]): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.path === path) return route;
      if (route.children) {
        const childRoute = findRoute(route.children);
        if (childRoute) return childRoute;
      }
    }
    return undefined;
  };
  
  return findRoute(routes);
};

export const getRoutesForRole = (role: UserRole): RouteConfig[] => {
  return routes.filter(route => {
    if (!route.protected) return true;
    if (!route.allowedRoles) return true;
    return route.allowedRoles.includes(role);
  });
}; 