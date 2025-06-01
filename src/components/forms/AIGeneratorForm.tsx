
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGeneratorFormProps {
  onSuccess?: (data: any) => void;
}

export const AIGeneratorForm = ({ onSuccess }: AIGeneratorFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'plan' as 'plan' | 'case',
    description: '',
    context: '',
    requirements: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: {
          type: formData.type,
          description: formData.description,
          context: formData.context,
          requirements: formData.requirements,
          userId: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${formData.type === 'plan' ? 'Plano' : 'Caso'} de teste gerado com IA!`
      });

      onSuccess?.(data);
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
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição do Sistema/Funcionalidade *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Descreva o sistema ou funcionalidade que será testada"
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

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="min-w-[200px]">
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
