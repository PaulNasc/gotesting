import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ThemeProvider } from '@/hooks/useTheme';
import Index from '@/pages/Index';
import { TestPlans } from '@/pages/TestPlans';
import { TestCases } from '@/pages/TestCases';
import { TestExecutions } from '@/pages/TestExecutions';
import { AIGenerator } from '@/pages/AIGenerator';
import { History } from '@/pages/History';
import { Reports } from '@/pages/Reports';
import { ModelControlPanel } from '@/pages/ModelControlPanel';
import { UserManagement } from '@/pages/UserManagement';
import { TodoList } from '@/pages/TodoList';
import { About } from '@/pages/About';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import LinkToken from '@/pages/LinkToken';
import ResetPassword from '@/pages/ResetPassword';
import './App.css';

const queryClient = new QueryClient();

// Componente para gerenciar redirecionamentos
function AppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/link-token" element={<LinkToken />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rotas protegidas */}
      <Route element={<AuthGuard><Layout /></AuthGuard>}>
        <Route path="/" element={<Index />} />
        <Route path="/plans" element={<PermissionGuard requiredPermission="can_manage_plans"><TestPlans /></PermissionGuard>} />
        <Route path="/cases" element={<PermissionGuard requiredPermission="can_manage_cases"><TestCases /></PermissionGuard>} />
        <Route path="/executions" element={<PermissionGuard requiredPermission="can_manage_executions"><TestExecutions /></PermissionGuard>} />
        <Route path="/ai-generator" element={<PermissionGuard requiredPermission="can_use_ai"><AIGenerator /></PermissionGuard>} />
        <Route path="/todo" element={<PermissionGuard requiredPermission="can_access_todo"><TodoList /></PermissionGuard>} />
        <Route path="/history" element={<PermissionGuard><History /></PermissionGuard>} />
        <Route path="/reports" element={<PermissionGuard requiredPermission="can_view_reports"><Reports /></PermissionGuard>} />
        <Route path="/model-control" element={<PermissionGuard requiredRole="admin" redirect="/"><ModelControlPanel /></PermissionGuard>} />
        <Route path="/user-management" element={<PermissionGuard requiredPermission="can_manage_users" redirect="/"><UserManagement /></PermissionGuard>} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRouter />
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
