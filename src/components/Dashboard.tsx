
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  TestTube, 
  PlayCircle, 
  TrendingUp,
  Plus,
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestPlans, getTestCases, getTestExecutions } from '@/services/supabaseService';
import { TestPlan, TestCase, TestExecution } from '@/types';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalCases: 0,
    totalExecutions: 0,
    successRate: 0
  });
  const [recentPlans, setRecentPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [plans, cases, executions] = await Promise.all([
        getTestPlans(user!.id),
        getTestCases(user!.id),
        getTestExecutions(user!.id)
      ]);

      const passedExecutions = executions.filter(e => e.status === 'passed').length;
      const successRate = executions.length > 0 ? (passedExecutions / executions.length) * 100 : 0;

      setStats({
        totalPlans: plans.length,
        totalCases: cases.length,
        totalExecutions: executions.length,
        successRate: Math.round(successRate)
      });

      setRecentPlans(plans.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Visão geral dos seus testes</p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos de Teste</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              Total de planos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos de Teste</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              Total de casos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              Total de execuções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Testes aprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlans.length > 0 ? (
            <div className="space-y-4">
              {recentPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <h3 className="font-medium">{plan.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {plan.generated_by_ai && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                          <Sparkles className="h-3 w-3" />
                          IA
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {plan.updated_at.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum plano criado ainda
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece criando seu primeiro plano de teste
              </p>
              <Button>Criar Primeiro Plano</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
