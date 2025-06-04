import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { getTestPlans, getTestCases, createTestPlan, createTestCase, createTestExecution } from '@/services/supabaseService';
import { TestPlan, TestCase, AIModelTask } from '@/types';
import * as ModelControlService from '@/services/modelControlService';

interface AIGeneratorFormProps {
  onSuccess?: (data: any) => void;
  initialType?: 'plan' | 'case' | 'execution';
}

export const AIGeneratorForm = ({ onSuccess, initialType = 'plan' }: AIGeneratorFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [formData, setFormData] = useState({
    type: initialType,
    description: '',
    context: '',
    requirements: '',
    planId: '',
    caseId: ''
  });

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  useEffect(() => {
    if (formData.planId && formData.type === 'execution') {
      loadCases(formData.planId);
    }
  }, [formData.planId, formData.type]);

  const loadPlans = async () => {
    try {
      const data = await getTestPlans(user!.id);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const loadCases = async (planId: string) => {
    try {
      const data = await getTestCases(user!.id, planId);
      setCases(data);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    }
  };

  const generateWithAI = async () => {
    if (!user) return null;

    const taskType: AIModelTask = 
      formData.type === 'plan' ? 'test-plan-generation' : 
      formData.type === 'case' ? 'test-case-generation' : 
      'general-completion';

    const variables: any = {
      description: formData.description,
      context: formData.context,
      requirements: formData.requirements,
    };

    if (formData.type === 'execution') {
      // Buscar detalhes do caso e plano selecionados
      const selectedCase = cases.find(c => c.id === formData.caseId);
      const selectedPlan = plans.find(p => p.id === formData.planId);
      
      if (!selectedCase || !selectedPlan) {
        throw new Error('Caso ou plano de teste não encontrado');
      }
      
      variables.testCase = selectedCase;
      variables.testPlan = selectedPlan;
    } else if (formData.type === 'case' && formData.planId) {
      const selectedPlan = plans.find(p => p.id === formData.planId);
      if (selectedPlan) {
        variables.testPlan = selectedPlan;
      }
    }

    try {
      // Usar ModelControlService para gerar o conteúdo com AI
      const result = await ModelControlService.executeTask(taskType, variables);
      
      if (formData.type === 'plan') {
        // Criar o plano de teste no Supabase
        const newPlan = await createTestPlan({
          ...result,
          user_id: user.id,
          generated_by_ai: true
        });
        return { ...newPlan, type: 'plan' };
      } 
      else if (formData.type === 'case') {
        // Criar o caso de teste no Supabase
        const newCase = await createTestCase({
          ...result,
          plan_id: formData.planId || null,
          user_id: user.id,
          generated_by_ai: true
        });
        return { ...newCase, type: 'case' };
      } 
      else if (formData.type === 'execution') {
        // Criar a execução de teste no Supabase
        const newExecution = await createTestExecution({
          ...result,
          plan_id: formData.planId,
          case_id: formData.caseId,
          user_id: user.id,
          executed_by: user.id
        });
        return { ...newExecution, type: 'execution' };
      }
    } catch (error) {
      console.error('Erro ao gerar com IA:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await generateWithAI();

      toast({
        title: "Sucesso",
        description: `${formData.type === 'plan' ? 'Plano' : formData.type === 'case' ? 'Caso' : 'Execução'} de teste gerado com IA!`
      });

      onSuccess?.(result);
    } catch (error) {
      console.error('Erro ao gerar com IA:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar conteúdo com IA. Verifique se a chave da API está configurada.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Gerador de Testes com IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Geração *</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plan">Plano de Teste</SelectItem>
                <SelectItem value="case">Caso de Teste</SelectItem>
                <SelectItem value="execution">Execução de Teste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'execution' && (
            <>
              <div>
                <Label htmlFor="planId">Plano de Teste *</Label>
                <Select value={formData.planId} onValueChange={(value) => handleChange('planId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caseId">Caso de Teste *</Label>
                <Select 
                  value={formData.caseId} 
                  onValueChange={(value) => handleChange('caseId', value)} 
                  required
                  disabled={!formData.planId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um caso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((testCase) => (
                      <SelectItem key={testCase.id} value={testCase.id}>
                        {testCase.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.type === 'case' && (
            <div>
              <Label htmlFor="planId">Plano de Teste (Opcional)</Label>
              <Select value={formData.planId} onValueChange={(value) => handleChange('planId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="description">
              {formData.type === 'execution' 
                ? 'Contexto da Execução *' 
                : 'Descrição do Sistema/Funcionalidade *'
              }
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder={
                formData.type === 'execution'
                  ? "Descreva o contexto da execução, ambiente de teste, etc."
                  : "Descreva o sistema ou funcionalidade que será testada"
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="context">Contexto Adicional</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => handleChange('context', e.target.value)}
              rows={3}
              placeholder="Forneça informações adicionais sobre o contexto, tecnologias utilizadas, etc."
            />
          </div>

          {formData.type !== 'execution' && (
            <div>
              <Label htmlFor="requirements">Requisitos Específicos</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                rows={3}
                placeholder="Liste requisitos específicos ou cenários que devem ser cobertos"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || (formData.type === 'execution' && (!formData.planId || !formData.caseId))} 
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
