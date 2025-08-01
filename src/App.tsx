import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CheckIn from "@/pages/CheckIn";
import Team from "@/pages/Team";
import TeamsManagement from "@/pages/TeamsManagement";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import TeamAnalysis from "@/pages/TeamAnalysis";
import NotFound from "@/pages/NotFound";
import JoinTeam from "@/pages/JoinTeam";
import SuperAdmin from "@/pages/SuperAdmin";
import Landing from "@/pages/Landing";
import { AlertsCenter } from '@/components/alerts/AlertsCenter';
import { IntegrationsCenter } from '@/components/integrations/IntegrationsCenter';
import EmployeeImport from '@/components/EmployeeImport.tsx';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

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
            <AppLayout />
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
        <Route path="alerts" element={<AlertsCenter />} />
        <Route path="integrations" element={<IntegrationsCenter />} />
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
          path="settings"
          element={
            <RoleProtectedRoute allowedRoles={['HR_ADMIN']}>
              <Settings />
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
