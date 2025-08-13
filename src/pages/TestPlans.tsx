import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Calendar, Sparkles, Grid, List, Eye, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestPlans, deleteTestPlan } from '@/services/supabaseService';
import { TestPlan } from '@/types';
import { TestPlanForm } from '@/components/forms/TestPlanForm';
import { DetailModal } from '@/components/DetailModal';
import { StandardButton } from '@/components/StandardButton';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const TestPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [editingPlan, setEditingPlan] = useState<TestPlan | null>(null);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const data = await getTestPlans(user!.id);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = (plan: TestPlan) => {
    setPlans(prev => [plan, ...prev]);
    setShowForm(false);
    setEditingPlan(null);
  };

  const handleViewDetails = (plan: TestPlan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const handleEdit = (plan: TestPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
    setShowDetailModal(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Plano excluído com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano",
        variant: "destructive"
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const { exportSupabaseData } = await import('../utils/export');
      await exportSupabaseData('planos_teste', plans, format, `planos_teste_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Exportação realizada",
        description: `Planos exportados em formato ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro na exportação",
        description: error.message || `Erro ao exportar planos em formato ${format}`,
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (format: 'txt' | 'md') => {
    try {
      const { copyTableData } = await import('../utils/export');
      
      // Converter dados dos planos para formato de exportação
      const headers = ['Título', 'Descrição', 'Gerado por IA', 'Criado em', 'Atualizado em'];
      const rows = plans.map(plan => [
        plan.title,
        plan.description,
        plan.generated_by_ai ? 'Sim' : 'Não',
        plan.created_at.toLocaleDateString('pt-BR'),
        plan.updated_at.toLocaleDateString('pt-BR')
      ]);

      const success = await copyTableData({ headers, rows }, format, 'Planos de Teste');
      
      if (success) {
        toast({
          title: "Conteúdo copiado",
          description: `Planos copiados em formato ${format.toUpperCase()} para a área de transferência`,
        });
      } else {
        throw new Error('Falha ao copiar conteúdo');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao copiar",
        description: error.message || `Erro ao copiar planos em formato ${format}`,
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Planos de Teste</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus planos de teste</p>
        </div>
        <div className="flex gap-2 items-center">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {plans.length > 0 && (
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
          <Dialog open={showForm} onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingPlan(null);
          }}>
            <DialogTrigger asChild>
              <StandardButton icon={Plus}>
                Novo Plano
              </StandardButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TestPlanForm 
                initialData={editingPlan}
                onSuccess={handlePlanCreated}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {plans.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow h-[280px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 leading-tight">{plan.title}</CardTitle>
                    {plan.generated_by_ai && (
                      <Badge variant="secondary" className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 mb-4 flex-1">
                    {plan.description}
                  </p>
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {plan.updated_at.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <StandardButton 
                        variant="outline" 
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDetails(plan)}
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
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{plan.title}</h3>
                        {plan.generated_by_ai && (
                          <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                            <Sparkles className="h-3 w-3" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {plan.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {plan.updated_at.toLocaleDateString()}
                      </div>
                    </div>
                    <StandardButton 
                      variant="outline" 
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDetails(plan)}
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
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece criando seu primeiro plano de teste
          </p>
          <StandardButton onClick={() => setShowForm(true)}>
            Criar Primeiro Plano
          </StandardButton>
        </div>
      )}

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedPlan}
        type="plan"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
