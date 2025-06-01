
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { createTestExecution, getTestCases, getTestPlans } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { TestExecution, TestCase, TestPlan } from '@/types';

interface TestExecutionFormProps {
  onSuccess?: (execution: TestExecution) => void;
  onCancel?: () => void;
  caseId?: string;
  planId?: string;
}

export const TestExecutionForm = ({ onSuccess, onCancel, caseId, planId }: TestExecutionFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [formData, setFormData] = useState({
    case_id: caseId || '',
    plan_id: planId || '',
    status: 'not_tested' as const,
    actual_result: '',
    notes: '',
    executed_by: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      loadPlans();
      if (planId) {
        loadCases(planId);
      }
    }
  }, [user, planId]);

  useEffect(() => {
    if (formData.plan_id && !planId) {
      loadCases(formData.plan_id);
    }
  }, [formData.plan_id, planId]);

  useEffect(() => {
    if (caseId && cases.length > 0) {
      const caseData = cases.find(c => c.id === caseId);
      setSelectedCase(caseData || null);
    }
  }, [caseId, cases]);

  const loadPlans = async () => {
    try {
      const data = await getTestPlans(user!.id);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const loadCases = async (selectedPlanId: string) => {
    try {
      const data = await getTestCases(user!.id, selectedPlanId);
      setCases(data);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const execution = await createTestExecution({
        ...formData,
        user_id: user.id
      });

      toast({
        title: "Sucesso",
        description: "Execução registrada com sucesso!"
      });

      onSuccess?.(execution);
    } catch (error) {
      console.error('Erro ao criar execução:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar execução",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'case_id') {
      const caseData = cases.find(c => c.id === value);
      setSelectedCase(caseData || null);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Execução de Teste</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!planId && (
            <div>
              <Label htmlFor="plan_id">Plano de Teste *</Label>
              <Select value={formData.plan_id} onValueChange={(value) => handleChange('plan_id', value)} required>
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

          {!caseId && (
            <div>
              <Label htmlFor="case_id">Caso de Teste *</Label>
              <Select 
                value={formData.case_id} 
                onValueChange={(value) => handleChange('case_id', value)} 
                required
                disabled={!formData.plan_id && !planId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caso de teste" />
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
          )}

          {selectedCase && (
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">{selectedCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedCase.description}
                </p>
                {selectedCase.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Passos:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedCase.steps.map((step) => (
                        <li key={step.id} className="text-sm">
                          <strong>Ação:</strong> {step.action}
                          <br />
                          <strong>Esperado:</strong> {step.expected_result}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passed">Aprovado</SelectItem>
                <SelectItem value="failed">Reprovado</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
                <SelectItem value="not_tested">Não Testado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="actual_result">Resultado Obtido</Label>
            <Textarea
              id="actual_result"
              value={formData.actual_result}
              onChange={(e) => handleChange('actual_result', e.target.value)}
              rows={4}
              placeholder="Descreva o resultado obtido durante a execução"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              placeholder="Adicione observações sobre a execução"
            />
          </div>

          <div>
            <Label htmlFor="executed_by">Executado por *</Label>
            <Textarea
              id="executed_by"
              value={formData.executed_by}
              onChange={(e) => handleChange('executed_by', e.target.value)}
              rows={1}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading || !formData.case_id || !formData.plan_id}>
              {loading ? 'Registrando...' : 'Registrar Execução'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
