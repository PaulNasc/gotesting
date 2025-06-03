
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import { TestPlans } from '@/pages/TestPlans';
import { TestCases } from '@/pages/TestCases';
import { TestExecutions } from '@/pages/TestExecutions';
import { AIGenerator } from '@/pages/AIGenerator';
import { History } from '@/pages/History';
import { Reports } from '@/pages/Reports';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/plans" element={<TestPlans />} />
                <Route path="/cases" element={<TestCases />} />
                <Route path="/executions" element={<TestExecutions />} />
                <Route path="/ai-generator" element={<AIGenerator />} />
                <Route path="/history" element={<History />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthGuard>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
