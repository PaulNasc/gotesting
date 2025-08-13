import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, TestTube, PlayCircle, ArrowLeft, Settings, Files, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AIGeneratorForm } from '@/components/forms/AIGeneratorForm';
import { AIBatchGeneratorForm } from '@/components/forms/AIBatchGeneratorForm';
import { AIBatchModal } from '@/components/AIBatchModal';
import { useNavigate } from 'react-router-dom';
import { useAISettings } from '@/hooks/useAISettings';

interface GeneratedItem {
  id: string;
  title: string;
  description: string;
  objective?: string;
  scope?: string;
  approach?: string;
  criteria?: string;
  resources?: string;
  schedule?: string;
  risks?: string;
  preconditions?: string;
  expected_result?: string;
  priority?: string;
  type?: string;
  steps?: Array<{
    action: string;
    expected_result: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'regenerating';
}

export const AIGenerator = () => {
  const [showForm, setShowForm] = useState(false);
  const [generationType, setGenerationType] = useState<'plan' | 'case' | 'execution'>('plan');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<GeneratedItem | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const navigate = useNavigate();
  const { settings, updateSettings } = useAISettings();

  const handleGenerationSuccess = (data: any) => {
    setShowForm(false);
    if ((settings.batchGenerationEnabled && generationType === 'plan') || 
        (settings.batchCaseGenerationEnabled && generationType === 'case')) {
      // Para geração em lote, abrir o modal de revisão
      if (data.plans || data.cases) {
        const itemsWithStatus = (data.plans || data.cases).map((item: any) => ({
          ...item,
          id: item.id || Math.random().toString(36).substr(2, 9),
          status: 'pending' as const
        }));
        setGeneratedPlans(itemsWithStatus);
        setShowBatchModal(true);
      }
    } else {
      // Para geração individual, redirecionar normalmente
      if (generationType === 'plan') {
        navigate('/plans');
      } else if (generationType === 'case') {
        navigate('/cases');
      } else {
        navigate('/executions');
      }
    }
  };

  const handlePlanApprove = (planId: string) => {
    setGeneratedPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, status: 'approved' as const } : plan
      )
    );
  };

  const handlePlanReject = (planId: string) => {
    setGeneratedPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, status: 'rejected' as const } : plan
      )
    );
  };

  const handlePlanRegenerate = (planId: string, feedback: string) => {
    setGeneratedPlans(prev => 
      prev.map(plan => 
        plan.id === planId ? { ...plan, status: 'regenerating' as const } : plan
      )
    );
    // Aqui você implementaria a lógica para regenerar o plano com o feedback
    console.log(`Regenerating plan ${planId} with feedback: ${feedback}`);
  };

  const handleViewPlanDetails = (plan: GeneratedItem) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {(settings.batchGenerationEnabled && generationType === 'plan') ? 'Gerar Vários Planos de Teste com IA' :
             (settings.batchCaseGenerationEnabled && generationType === 'case') ? 'Gerar Vários Casos de Teste com IA' :
              `Gerar ${generationType === 'plan' ? 'Plano' : generationType === 'case' ? 'Caso' : 'Execução'} de Teste com IA`
            }
          </h2>
        </div>
        
        {(settings.batchGenerationEnabled && generationType === 'plan') || 
         (settings.batchCaseGenerationEnabled && generationType === 'case') ? (
          <AIBatchGeneratorForm onSuccess={handleGenerationSuccess} type={generationType} />
        ) : (
          <AIGeneratorForm onSuccess={handleGenerationSuccess} initialType={generationType} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gerador IA</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Use inteligência artificial para gerar planos, casos e execuções de teste automaticamente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500 h-[320px] flex flex-col" 
              onClick={() => { setGenerationType('plan'); setShowForm(true); }}>
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
              {settings.batchGenerationEnabled ? (
                <Files className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              {settings.batchGenerationEnabled ? 'Gerar Vários Planos' : 'Gerar Plano de Teste'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 flex items-center justify-center">
              {settings.batchGenerationEnabled 
                ? 'Analise documentos e gere múltiplos planos de teste automaticamente'
                : 'Crie planos de teste completos baseados na descrição do seu projeto'
              }
            </p>
            <Button className="w-full h-10 font-medium">
              Começar Geração
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-500 h-[320px] flex flex-col"
              onClick={() => { setGenerationType('case'); setShowForm(true); }}>
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="mx-auto mb-4 p-4 bg-green-100 dark:bg-green-900 rounded-full w-fit">
              {settings.batchCaseGenerationEnabled ? (
                <Files className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
              <TestTube className="h-8 w-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              {settings.batchCaseGenerationEnabled ? 'Gerar Vários Casos' : 'Gerar Casos de Teste'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 flex items-center justify-center">
              {settings.batchCaseGenerationEnabled 
                ? 'Analise documentos em múltiplos formatos e gere casos de teste automaticamente'
                : 'Gere casos de teste detalhados para funcionalidades específicas'
              }
            </p>
            <Button className="w-full h-10 font-medium bg-green-600 hover:bg-green-700 text-white">
              Começar Geração
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-purple-500 h-[320px] flex flex-col"
              onClick={() => { setGenerationType('execution'); setShowForm(true); }}>
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="mx-auto mb-4 p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
              <PlayCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Gerar Execução de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 flex items-center justify-center">
              Simule execuções de teste automaticamente baseadas em casos existentes
            </p>
            <Button className="w-full h-10 font-medium bg-purple-600 hover:bg-purple-700 text-white">
              Começar Geração
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              <Sparkles />
              Como funciona?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[2rem_1fr] items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-6">
                    {settings.batchGenerationEnabled ? 'Forneça o documento' : 'Descreva seu projeto'}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {settings.batchGenerationEnabled 
                      ? 'Cole ou faça upload do documento com as especificações do sistema'
                      : 'Forneça informações sobre o sistema que será testado'
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[2rem_1fr] items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">2</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-6">IA analisa e gera</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {settings.batchGenerationEnabled 
                      ? 'Nossa IA identifica automaticamente diferentes funcionalidades e gera planos específicos'
                      : 'Nossa IA cria planos, casos e execuções de teste personalizados'
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[2rem_1fr] items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">3</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-6">Revise e execute</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {settings.batchGenerationEnabled 
                      ? 'Aprove, rejeite ou refaça cada plano individualmente antes de salvar'
                      : 'Ajuste conforme necessário e execute seus testes'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIBatchModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        plans={generatedPlans}
        onApprove={handlePlanApprove}
        onReject={handlePlanReject}
        onRegenerate={handlePlanRegenerate}
        onViewDetails={handleViewPlanDetails}
      />

      {/* Modal de Detalhes */}
      <Dialog open={showPlanDetails} onOpenChange={setShowPlanDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes do {generationType === 'case' ? 'Caso' : 'Plano'} Gerado
            </DialogTitle>
            <DialogDescription>
              Visualize todos os detalhes do {generationType === 'case' ? 'caso' : 'plano'} de teste gerado pela IA
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedPlan.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedPlan.description}</p>
              </div>
              
              {generationType === 'plan' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Objetivo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.objective}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Escopo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.scope}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Abordagem</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.approach}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Critérios</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.criteria}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recursos</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.resources}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cronograma</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.schedule}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">Riscos</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.risks}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPlan.preconditions && (
                    <div>
                      <h4 className="font-medium mb-2">Pré-condições</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.preconditions}</p>
                    </div>
                  )}
                  
                  {selectedPlan.steps && selectedPlan.steps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Passos do Teste</h4>
                      <div className="space-y-2">
                        {selectedPlan.steps.map((step: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="font-medium text-sm">Passo {index + 1}</div>
                            <div className="text-sm mt-1">
                              <strong>Ação:</strong> {step.action}
                            </div>
                            <div className="text-sm">
                              <strong>Resultado Esperado:</strong> {step.expected_result}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPlan.expected_result && (
                    <div>
                      <h4 className="font-medium mb-2">Resultado Final Esperado</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.expected_result}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    {selectedPlan.priority && (
                      <div>
                        <h4 className="font-medium mb-2">Prioridade</h4>
                        <Badge className={
                          selectedPlan.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedPlan.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedPlan.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {selectedPlan.priority}
                        </Badge>
                      </div>
                    )}
                    
                    {selectedPlan.type && (
                      <div>
                        <h4 className="font-medium mb-2">Tipo</h4>
                        <Badge variant="outline">{selectedPlan.type}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
