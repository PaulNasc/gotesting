import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, PlayCircle, Calendar, Grid, List, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestExecutions } from '@/services/supabaseService';
import { TestExecution } from '@/types';
import { TestExecutionForm } from '@/components/forms/TestExecutionForm';
import { DetailModal } from '@/components/DetailModal';
import { StandardButton } from '@/components/StandardButton';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export const TestExecutions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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

  const handleExecutionCreated = (execution: TestExecution) => {
    setExecutions(prev => [execution, ...prev]);
    setShowForm(false);
  };

  const handleViewDetails = (execution: TestExecution) => {
    setSelectedExecution(execution);
    setShowDetailModal(true);
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

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const { exportSupabaseData } = await import('../utils/export');
      await exportSupabaseData('execucoes_teste', executions, format, `execucoes_teste_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Exportação realizada",
        description: `Execuções exportadas em formato ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message || `Erro ao exportar execuções em formato ${format}`,
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (format: 'txt' | 'md') => {
    try {
      const { copyTableData } = await import('../utils/export');
      
      // Converter dados das execuções para formato de exportação
      const headers = ['ID', 'Status', 'Executado por', 'Notas', 'Data de Execução'];
      const rows = executions.map(execution => [
        execution.id.slice(0, 8),
        getStatusLabel(execution.status),
        execution.executed_by,
        execution.notes || 'Sem notas',
        execution.executed_at.toLocaleDateString('pt-BR')
      ]);

      const success = await copyTableData({ headers, rows }, format, 'Execuções de Teste');
      
      if (success) {
        toast({
          title: "Conteúdo copiado",
          description: `Execuções copiadas em formato ${format.toUpperCase()} para a área de transferência`,
        });
      } else {
        throw new Error('Falha ao copiar conteúdo');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao copiar",
        description: error.message || `Erro ao copiar execuções em formato ${format}`,
        variant: "destructive",
      });
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
        <div className="flex gap-2 items-center">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {executions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <StandardButton variant="outline" icon={Download}>
                  Exportar
                </StandardButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  📁 Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  📊 Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  📄 Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCopy('txt')}>
                  📋 Copiar como Texto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopy('md')}>
                  📝 Copiar como Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <StandardButton icon={Plus}>
                Nova Execução
              </StandardButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TestExecutionForm 
                onSuccess={handleExecutionCreated}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {executions.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executions.map((execution) => (
              <Card key={execution.id} className="hover:shadow-md transition-shadow h-[280px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 leading-tight">Execução #{execution.id.slice(0, 8)}</CardTitle>
                    <Badge className={`${getStatusColor(execution.status)} flex-shrink-0`}>
                      {getStatusLabel(execution.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Executado por:</span> {execution.executed_by}
                    </p>
                    {execution.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {execution.notes}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {execution.executed_at.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <StandardButton 
                        variant="outline" 
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDetails(execution)}
                        className="flex-1"
                      >
                        Ver Detalhes
                      </StandardButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <Card key={execution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">Execução #{execution.id.slice(0, 8)}</h3>
                        <Badge className={`${getStatusColor(execution.status)} flex-shrink-0`}>
                          {getStatusLabel(execution.status)}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Executado por:</span> {execution.executed_by}
                      </p>
                      {execution.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {execution.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {execution.executed_at.toLocaleDateString()}
                      </div>
                    </div>
                    <StandardButton 
                      variant="outline" 
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDetails(execution)}
                      className="ml-4 flex-shrink-0"
                    >
                      Ver Detalhes
                    </StandardButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma execução encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece executando seus primeiros testes
          </p>
          <StandardButton onClick={() => setShowForm(true)}>
            Criar Primeira Execução
          </StandardButton>
        </div>
      )}

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedExecution}
        type="execution"
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
