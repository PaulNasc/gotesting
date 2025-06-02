import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TestTube, Calendar, Sparkles, Grid, List, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestCases } from '@/services/supabaseService';
import { TestCase } from '@/types';
import { TestCaseForm } from '@/components/forms/TestCaseForm';
import { DetailModal } from '@/components/DetailModal';
import { StandardButton } from '@/components/StandardButton';
import { ViewModeToggle } from '@/components/ViewModeToggle';

export const TestCases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    if (user) {
      loadCases();
    }
  }, [user]);

  const loadCases = async () => {
    try {
      const data = await getTestCases(user!.id);
      setCases(data);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (testCase: TestCase) => {
    setCases(prev => [testCase, ...prev]);
    setShowForm(false);
  };

  const handleViewDetails = (testCase: TestCase) => {
    setSelectedCase(testCase);
    setShowDetailModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Casos de Teste</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus casos de teste</p>
        </div>
        <div className="flex gap-2 items-center">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <StandardButton icon={Plus}>
                Novo Caso
              </StandardButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TestCaseForm 
                onSuccess={handleCaseCreated}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {cases.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((testCase) => (
              <Card key={testCase.id} className="hover:shadow-md transition-shadow h-[280px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 leading-tight">{testCase.title}</CardTitle>
                    {testCase.generated_by_ai && (
                      <Badge variant="secondary" className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                      {testCase.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getPriorityColor(testCase.priority)}>
                        {testCase.priority}
                      </Badge>
                      <Badge variant="outline">
                        {testCase.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {testCase.updated_at.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <StandardButton 
                        variant="outline" 
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDetails(testCase)}
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
            {cases.map((testCase) => (
              <Card key={testCase.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{testCase.title}</h3>
                        {testCase.generated_by_ai && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {testCase.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                        <Badge variant="outline">
                          {testCase.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {testCase.updated_at.toLocaleDateString()}
                      </div>
                    </div>
                    <StandardButton 
                      variant="outline" 
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDetails(testCase)}
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
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum caso encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece criando seu primeiro caso de teste
          </p>
          <StandardButton onClick={() => setShowForm(true)}>
            Criar Primeiro Caso
          </StandardButton>
        </div>
      )}

      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedCase}
        type="case"
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
