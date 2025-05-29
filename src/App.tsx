
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthGuard } from "@/components/AuthGuard";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { TestPlans } from "@/pages/TestPlans";
import { TestCases } from "@/pages/TestCases";
import { TestExecutions } from "@/pages/TestExecutions";
import { AIGenerator } from "@/pages/AIGenerator";
import { History } from "@/pages/History";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AuthGuard>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/plans" element={<TestPlans />} />
                  <Route path="/cases" element={<TestCases />} />
                  <Route path="/executions" element={<TestExecutions />} />
                  <Route path="/ai-generator" element={<AIGenerator />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/legacy" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </AuthGuard>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
