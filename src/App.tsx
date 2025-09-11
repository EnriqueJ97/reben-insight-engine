import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, RoleProtectedRoute } from "@/components/routing/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CheckIn from "@/pages/CheckIn";
import Team from "@/pages/Team";
import TeamsManagement from "@/pages/TeamsManagement";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import TeamAnalysis from "@/pages/TeamAnalysis";
import HRChat from "@/pages/HRChat";
import NotFound from "@/pages/NotFound";
import JoinTeam from "@/pages/JoinTeam";
import SuperAdmin from "@/pages/SuperAdmin";
import Landing from "@/pages/Landing";
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { IntegrationsCenter } from '@/components/integrations/IntegrationsCenter';
import EmployeeImport from '@/components/EmployeeImport.tsx';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import InviteTeamMembers from '@/components/invitations/InviteTeamMembers';
import OnboardingCheck from '@/components/onboarding/OnboardingCheck';
import FlexibleCompensationHub from '@/components/compensation/FlexibleCompensationHub';
import Operations from '@/pages/Operations';
import MisTurnos from '@/pages/MisTurnos';
import TrabajoFlexible from '@/pages/TrabajoFlexible';
import CSRDDashboard from '@/pages/sustainability/CSRDDashboard';
import DiagnosticoCSRD from '@/pages/sustainability/DiagnosticoCSRD';
import Materialidad from '@/pages/sustainability/Materialidad';
import DataHubESRS from '@/pages/sustainability/DataHubESRS';
import TareasCompliance from '@/pages/sustainability/TareasCompliance';
import ReportesCSRD from '@/pages/sustainability/ReportesCSRD';
import SimuladorWhatIf from '@/pages/SimuladorWhatIf';
import AdvancedOrganizationalAnalytics from '@/components/analytics/AdvancedOrganizationalAnalytics';
import REBENExplained from '@/pages/REBENExplained';

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/join-team/:inviteCode" element={<JoinTeam />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingCheck>
              <AppLayout />
            </OnboardingCheck>
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="checkin"
          element={
            <RoleProtectedRoute allowedRoles={['EMPLOYEE']}>
              <CheckIn />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team/overview"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="reben-explained"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPER_ADMIN']}>
              <REBENExplained />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team/recognition"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team/turnover"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team/management"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route path="alerts" element={<AlertsCenter />} />
        <Route path="integrations" element={<IntegrationsCenter />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="invite" element={<InviteTeamMembers />} />
        <Route
          path="teams"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Team />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="teams/manage"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <TeamsManagement />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/simulador"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/compensation"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/360feedback"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/integrations"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/resources"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/shifts"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/flexible"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <Operations />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="operations/hr-analytics"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <AdvancedOrganizationalAnalytics />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="mis-turnos"
          element={
            <RoleProtectedRoute allowedRoles={['EMPLOYEE']}>
              <MisTurnos />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="trabajo-flexible"
          element={
            <RoleProtectedRoute allowedRoles={['EMPLOYEE']}>
              <TrabajoFlexible />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="mi-plan-flexible"
          element={
            <RoleProtectedRoute allowedRoles={['EMPLOYEE']}>
              <FlexibleCompensationHub />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/csrd"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <CSRDDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/diagnostico"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <DiagnosticoCSRD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/materialidad"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <Materialidad />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/data-hub"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <DataHubESRS />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/tareas"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <TareasCompliance />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="sustainability/reportes"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'COMPLIANCE_OFFICER']}>
              <ReportesCSRD />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <Reports />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="team-analysis"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER', 'HR_ADMIN']}>
              <TeamAnalysis />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="hr-chat"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <HRChat />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings/campaigns"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings/questions"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings/alerts"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings/integrations"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="settings/policies"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="teams/import"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN', 'MANAGER']}>
              <EmployeeImport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="employees/import"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <EmployeeImport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="super-admin"
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdmin />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
