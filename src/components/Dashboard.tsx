
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  TestTube, 
  PlayCircle, 
  TrendingUp,
  Plus,
  Sparkles,
  Calendar,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestPlans, getTestCases, getTestExecutions } from '@/services/supabaseService';
import { TestPlan, TestCase, TestExecution } from '@/types';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { TestPlanForm } from '@/components/forms/TestPlanForm';
import { TestCaseForm } from '@/components/forms/TestCaseForm';
import { TestExecutionForm } from '@/components/forms/TestExecutionForm';
import { DetailModal } from '@/components/DetailModal';
import { StandardButton } from '@/components/StandardButton';
import { useNavigate } from 'react-router-dom';

interface RecentItem {
  id: string;
  type: 'plan' | 'case' | 'execution';
  title: string;
  description?: string;
  updated_at: Date;
  generated_by_ai?: boolean;
  data: TestPlan | TestCase | TestExecution;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { settings } = useDashboardSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalCases: 0,
    totalExecutions: 0,
    successRate: 0
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecentItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

      // Combinar todos os itens recentes
      const allItems: RecentItem[] = [
        ...plans.map(plan => ({
          id: plan.id,
          type: 'plan' as const,
          title: plan.title,
          description: plan.description,
          updated_at: plan.updated_at,
          generated_by_ai: plan.generated_by_ai,
          data: plan
        })),
        ...cases.map(testCase => ({
          id: testCase.id,
          type: 'case' as const,
          title: testCase.title,
          description: testCase.description,
          updated_at: testCase.updated_at,
          generated_by_ai: testCase.generated_by_ai,
          data: testCase
        })),
        ...executions.map(execution => ({
          id: execution.id,
          type: 'execution' as const,
          title: `Execução #${execution.id.slice(0, 8)}`,
          description: execution.notes,
          updated_at: execution.executed_at,
          data: execution
        }))
      ];

      // Ordenar por data mais recente e pegar os 5 primeiros
      allItems.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
      setRecentItems(allItems.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item: RecentItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const getQuickActionConfig = () => {
    switch (settings.quickActionType) {
      case 'case':
        return {
          label: 'Novo Caso',
          component: TestCaseForm,
          onSuccess: loadDashboardData
        };
      case 'execution':
        return {
          label: 'Nova Execução',
          component: TestExecutionForm,
          onSuccess: loadDashboardData
        };
      default:
        return {
          label: 'Novo Plano',
          component: TestPlanForm,
          onSuccess: loadDashboardData
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plan': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'case': return <TestTube className="h-4 w-4 text-green-600" />;
      case 'execution': return <PlayCircle className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'plan': return 'Plano';
      case 'case': return 'Caso';
      case 'execution': return 'Execução';
      default: return type;
    }
  };

  const quickActionConfig = getQuickActionConfig();
  const FormComponent = quickActionConfig.component;

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
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <StandardButton icon={Plus}>
                {quickActionConfig.label}
              </StandardButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <FormComponent 
                onSuccess={() => {
                  quickActionConfig.onSuccess();
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
          <StandardButton 
            variant="outline" 
            icon={Sparkles}
            onClick={() => navigate('/ai-generator')}
          >
            Gerar com IA
          </StandardButton>
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

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length > 0 ? (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {getTypeLabel(item.type)}
                        </span>
                        {item.generated_by_ai && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            <Sparkles className="h-3 w-3" />
                            IA
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        {item.updated_at.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <StandardButton 
                    variant="outline" 
                    size="sm"
                    icon={Eye}
                    onClick={() => handleViewDetails(item)}
                  >
                    Ver Detalhes
                  </StandardButton>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma atividade recente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece criando seus primeiros planos, casos ou execuções de teste
              </p>
              <StandardButton onClick={() => setShowForm(true)}>
                {quickActionConfig.label}
              </StandardButton>
            </div>
          )}
        </CardContent>
      </Card>

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem?.data || null}
        type={selectedItem?.type || 'plan'}
        onEdit={() => {
          // TODO: Implementar edição
          setShowDetailModal(false);
        }}
        onDelete={() => {
          // TODO: Implementar exclusão
          setShowDetailModal(false);
        }}
      />
    </div>
  );
};
