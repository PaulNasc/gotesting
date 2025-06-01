
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { createTestCase, getTestPlans } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { TestCase, TestPlan, TestStep } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface TestCaseFormProps {
  onSuccess?: (testCase: TestCase) => void;
  onCancel?: () => void;
  planId?: string;
}

export const TestCaseForm = ({ onSuccess, onCancel, planId }: TestCaseFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preconditions: '',
    expected_result: '',
    priority: 'medium' as const,
    type: 'functional' as const,
    plan_id: planId || ''
  });
  const [steps, setSteps] = useState<TestStep[]>([
    { id: '1', action: '', expected_result: '', order: 1 }
  ]);

  useEffect(() => {
    if (user && !planId) {
      loadPlans();
    }
  }, [user, planId]);

  const loadPlans = async () => {
    try {
      const data = await getTestPlans(user!.id);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const testCase = await createTestCase({
        ...formData,
        steps: steps.filter(step => step.action.trim() !== ''),
        user_id: user.id,
        generated_by_ai: false
      });

      toast({
        title: "Sucesso",
        description: "Caso de teste criado com sucesso!"
      });

      onSuccess?.(testCase);
    } catch (error) {
      console.error('Erro ao criar caso:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar caso de teste",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStep = () => {
    const newStep: TestStep = {
      id: Date.now().toString(),
      action: '',
      expected_result: '',
      order: steps.length + 1
    };
    setSteps(prev => [...prev, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, field: keyof TestStep, value: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Caso de Teste</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            {!planId && (
              <div>
                <Label htmlFor="plan_id">Plano de Teste</Label>
                <Select value={formData.plan_id} onValueChange={(value) => handleChange('plan_id', value)}>
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
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Funcional</SelectItem>
                  <SelectItem value="integration">Integração</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                  <SelectItem value="usability">Usabilidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="preconditions">Pré-condições</Label>
            <Textarea
              id="preconditions"
              value={formData.preconditions}
              onChange={(e) => handleChange('preconditions', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label>Passos do Teste</Label>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Passo {index + 1}</Label>
                    {steps.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div>
                      <Label>Ação</Label>
                      <Textarea
                        value={step.action}
                        onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Resultado Esperado</Label>
                      <Textarea
                        value={step.expected_result}
                        onChange={(e) => updateStep(step.id, 'expected_result', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Passo
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="expected_result">Resultado Esperado Final</Label>
            <Textarea
              id="expected_result"
              value={formData.expected_result}
              onChange={(e) => handleChange('expected_result', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Caso'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
