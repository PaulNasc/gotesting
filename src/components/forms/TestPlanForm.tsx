
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { createTestPlan } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { TestPlan } from '@/types';

interface TestPlanFormProps {
  onSuccess?: (plan: TestPlan) => void;
  onCancel?: () => void;
}

export const TestPlanForm = ({ onSuccess, onCancel }: TestPlanFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    scope: '',
    approach: '',
    criteria: '',
    resources: '',
    schedule: '',
    risks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const plan = await createTestPlan({
        ...formData,
        user_id: user.id,
        generated_by_ai: false
      });

      toast({
        title: "Sucesso",
        description: "Plano de teste criado com sucesso!"
      });

      onSuccess?.(plan);
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar plano de teste",
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
        <CardTitle>Criar Novo Plano de Teste</CardTitle>
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
            <div>
              <Label htmlFor="objective">Objetivo</Label>
              <Input
                id="objective"
                value={formData.objective}
                onChange={(e) => handleChange('objective', e.target.value)}
              />
            </div>
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
              <Label htmlFor="scope">Escopo</Label>
              <Textarea
                id="scope"
                value={formData.scope}
                onChange={(e) => handleChange('scope', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="approach">Abordagem</Label>
              <Textarea
                id="approach"
                value={formData.approach}
                onChange={(e) => handleChange('approach', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="criteria">Critérios</Label>
              <Textarea
                id="criteria"
                value={formData.criteria}
                onChange={(e) => handleChange('criteria', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="resources">Recursos</Label>
              <Textarea
                id="resources"
                value={formData.resources}
                onChange={(e) => handleChange('resources', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule">Cronograma</Label>
              <Textarea
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleChange('schedule', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="risks">Riscos</Label>
              <Textarea
                id="risks"
                value={formData.risks}
                onChange={(e) => handleChange('risks', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Plano'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
