import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Loader2, Upload, FileText } from 'lucide-react';
import { generateStructuredContent } from '@/integrations/gemini/client';
import * as ModelControlService from '@/services/modelControlService';

interface AIBatchGeneratorFormProps {
  onSuccess?: (data: any) => void;
}

export const AIBatchGeneratorForm = ({ onSuccess }: AIBatchGeneratorFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [context, setContext] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      if (selectedFile.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocumentContent(event.target?.result as string);
        };
        reader.readAsText(selectedFile);
      } else {
        toast({
          title: "Aviso",
          description: "Para arquivos que não são texto puro, cole o conteúdo manualmente no campo abaixo.",
          variant: "default"
        });
      }
    }
  };

  const generateBatchPlans = async (
    documentContent: string, 
    context?: string, 
    userId?: string
  ) => {
    const prompt = `
      Analise o seguinte documento e identifique AUTONOMAMENTE diferentes funcionalidades, sistemas ou módulos que necessitam de planos de teste específicos.

      DOCUMENTO:
      ${documentContent}

      ${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

      INSTRUÇÕES IMPORTANTES:
      - Analise o documento e identifique automaticamente as diferentes funcionalidades/sistemas
      - Para cada funcionalidade identificada, crie um plano de teste específico e focado
      - Seja DIRETO e ESPECÍFICO, evite contexto desnecessário
      - Cada plano deve ser independente e testável
      - Gere apenas o essencial baseado nas informações fornecidas

      Retorne um JSON válido com esta estrutura EXATA:
      {
        "plans": [
          {
            "title": "título específico do plano",
            "description": "descrição direta e objetiva",
            "objective": "objetivo claro do teste",
            "scope": "escopo específico a ser testado",
            "approach": "abordagem de teste direta",
            "criteria": "critérios de aceite objetivos",
            "resources": "recursos necessários",
            "schedule": "estimativa de cronograma",
            "risks": "principais riscos identificados"
          }
        ]
      }

      IMPORTANTE: Gere quantos planos forem necessários baseado na análise do documento, mas seja específico e direto.
    `;

    try {
      // Usar o ModelControlService para executar a tarefa
      const generatedData = await ModelControlService.executeTask(
        'general-completion',
        { prompt },
      );
      
      if (!generatedData.plans || !Array.isArray(generatedData.plans)) {
        throw new Error('Formato de resposta inválido: plans array esperado');
      }

      // Adicionar IDs únicos para cada plano
      return generatedData.plans.map((plan: any) => ({
        ...plan,
        id: crypto.randomUUID(),
        user_id: userId,
        generated_by_ai: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
    } catch (error) {
      console.error('Erro na função de geração em lote:', error);
      throw new Error(`Erro na geração em lote: ${error.message}`);
    }
  };

  const savePlansToSupabase = async (plans: any[]) => {
    try {
      const { data, error } = await supabase
        .from('test_plans')
        .insert(plans);
        
      if (error) throw error;
      
      return {
        success: true, 
        plans,
        count: plans.length
      };
    } catch (error) {
      console.error('Erro ao salvar planos em lote:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !documentContent.trim()) return;

    setLoading(true);
    try {
      // Gerar planos em lote usando a API do Gemini
      const plans = await generateBatchPlans(documentContent, context, user.id);
      
      // Salvar planos gerados no Supabase
      const result = await savePlansToSupabase(plans);

      toast({
        title: "Sucesso",
        description: `Análise do documento concluída! ${plans.length} planos gerados com IA.`
      });

      onSuccess?.(result);
    } catch (error) {
      console.error('Erro ao gerar planos em lote:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar planos. Verifique se a chave da API está configurada.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Geração em Lote de Planos de Teste
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload de Documento (Opcional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  .txt, .md, .doc, .docx
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="document-content">
                Conteúdo do Documento *
                <span className="text-sm text-gray-500 font-normal ml-2">
                  (Cole aqui o conteúdo completo do documento para análise)
                </span>
              </Label>
              <Textarea
                id="document-content"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                rows={12}
                placeholder="Cole aqui o conteúdo completo do documento que contém os requisitos, especificações ou descrições dos sistemas que precisam de planos de teste. A IA analisará automaticamente e identificará cada situação/funcionalidade para gerar planos específicos."
                required
                className="min-h-[300px]"
              />
            </div>

            <div>
              <Label htmlFor="context">Contexto Adicional</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                placeholder="Forneça informações adicionais sobre o contexto do projeto, tecnologias utilizadas, padrões de teste preferidos, etc."
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como funciona a geração em lote:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A IA analisará o documento fornecido</li>
              <li>• Identificará automaticamente diferentes funcionalidades/sistemas</li>
              <li>• Gerará planos de teste específicos para cada situação encontrada</li>
              <li>• Você poderá revisar, aprovar, rejeitar ou refazer cada plano individualmente</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !documentContent.trim()} 
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando Documento...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Planos com IA
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
