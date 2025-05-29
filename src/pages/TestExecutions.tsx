
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, PlayCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestExecutions } from '@/services/supabaseService';
import { TestExecution } from '@/types';

export const TestExecutions = () => {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExecutions();
    }
  }, [user]);

  const loadExecutions = async () => {
    try {
      const data = await getTestExecutions(user!.id);
      setExecutions(data);
    } catch (error) {
      console.error('Erro ao carregar execuções:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'blocked': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'not_tested': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'passed': return 'Aprovado';
      case 'failed': return 'Reprovado';
      case 'blocked': return 'Bloqueado';
      case 'not_tested': return 'Não Testado';
      default: return status;
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Execuções de Teste</h2>
          <p className="text-gray-600 dark:text-gray-400">Acompanhe suas execuções de teste</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Execução
        </Button>
      </div>

      {executions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {executions.map((execution) => (
            <Card key={execution.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Execução #{execution.id.slice(0, 8)}</CardTitle>
                  <Badge className={getStatusColor(execution.status)}>
                    {getStatusLabel(execution.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Executado por:</span> {execution.executed_by}
                  </p>
                  {execution.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {execution.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {execution.executed_at.toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma execução encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece executando seus primeiros testes
          </p>
          <Button>Criar Primeira Execução</Button>
        </div>
      )}
    </div>
  );
};
