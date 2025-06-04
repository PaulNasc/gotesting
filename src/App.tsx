import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { PermissionGuard } from '@/components/PermissionGuard';
import Index from '@/pages/Index';
import { TestPlans } from '@/pages/TestPlans';
import { TestCases } from '@/pages/TestCases';
import { TestExecutions } from '@/pages/TestExecutions';
import { AIGenerator } from '@/pages/AIGenerator';
import { History } from '@/pages/History';
import { Reports } from '@/pages/Reports';
import { ModelControlPanel } from '@/pages/ModelControlPanel';
import { UserManagement } from '@/pages/UserManagement';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              
              <Route path="/plans" element={
                <PermissionGuard requiredPermission="can_manage_plans">
                  <TestPlans />
                </PermissionGuard>
              } />
              
              <Route path="/cases" element={
                <PermissionGuard requiredPermission="can_manage_cases">
                  <TestCases />
                </PermissionGuard>
              } />
              
              <Route path="/executions" element={
                <PermissionGuard requiredPermission="can_manage_executions">
                  <TestExecutions />
                </PermissionGuard>
              } />
              
              <Route path="/ai-generator" element={
                <PermissionGuard requiredPermission="can_use_ai">
                  <AIGenerator />
                </PermissionGuard>
              } />
              
              <Route path="/history" element={
                <PermissionGuard>
                  <History />
                </PermissionGuard>
              } />
              
              <Route path="/reports" element={
                <PermissionGuard requiredPermission="can_view_reports">
                  <Reports />
                </PermissionGuard>
              } />
              
              <Route path="/model-control" element={
                <PermissionGuard requiredRole="admin" redirect="/">
                  <ModelControlPanel />
                </PermissionGuard>
              } />
              
              <Route path="/user-management" element={
                <PermissionGuard requiredPermission="can_manage_users" redirect="/">
                  <UserManagement />
                </PermissionGuard>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </AuthGuard>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
