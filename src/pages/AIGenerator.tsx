
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, TestTube, ArrowLeft } from 'lucide-react';
import { AIGeneratorForm } from '@/components/forms/AIGeneratorForm';
import { useNavigate } from 'react-router-dom';

export const AIGenerator = () => {
  const [showForm, setShowForm] = useState(false);
  const [generationType, setGenerationType] = useState<'plan' | 'case'>('plan');
  const navigate = useNavigate();

  const handleGenerationSuccess = (data: any) => {
    setShowForm(false);
    // Redirecionar para a página apropriada
    if (generationType === 'plan') {
      navigate('/plans');
    } else {
      navigate('/cases');
    }
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
            Gerar {generationType === 'plan' ? 'Plano' : 'Caso'} de Teste com IA
          </h2>
        </div>
        
        <AIGeneratorForm onSuccess={handleGenerationSuccess} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gerador IA</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use inteligência artificial para gerar planos e casos de teste automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="text-center cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => { setGenerationType('plan'); setShowForm(true); }}>
          <CardHeader>
            <div className="mx-auto mb-4">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Gerar Plano de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crie planos de teste completos baseados na descrição do seu projeto
            </p>
            <Button className="w-full">
              Começar Geração
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setGenerationType('case'); setShowForm(true); }}>
          <CardHeader>
            <div className="mx-auto mb-4">
              <TestTube className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Gerar Casos de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gere casos de teste detalhados para funcionalidades específicas
            </p>
            <Button className="w-full" variant="outline">
              Começar Geração
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Como funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Descreva seu projeto</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Forneça informações sobre o sistema que será testado
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">IA analisa e gera</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nossa IA cria planos e casos de teste personalizados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Revise e execute</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ajuste conforme necessário e execute seus testes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
