
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, TestTube, PlayCircle, ArrowLeft } from 'lucide-react';
import { AIGeneratorForm } from '@/components/forms/AIGeneratorForm';
import { useNavigate } from 'react-router-dom';

export const AIGenerator = () => {
  const [showForm, setShowForm] = useState(false);
  const [generationType, setGenerationType] = useState<'plan' | 'case' | 'execution'>('plan');
  const navigate = useNavigate();

  const handleGenerationSuccess = (data: any) => {
    setShowForm(false);
    // Redirecionar para a página apropriada
    if (generationType === 'plan') {
      navigate('/plans');
    } else if (generationType === 'case') {
      navigate('/cases');
    } else {
      navigate('/executions');
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
            Gerar {generationType === 'plan' ? 'Plano' : generationType === 'case' ? 'Caso' : 'Execução'} de Teste com IA
          </h2>
        </div>
        
        <AIGeneratorForm onSuccess={handleGenerationSuccess} initialType={generationType} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gerador IA</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use inteligência artificial para gerar planos, casos e execuções de teste automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500 h-[320px] flex flex-col" 
              onClick={() => { setGenerationType('plan'); setShowForm(true); }}>
          <CardHeader className="pb-4 flex-shrink-0">
            <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Gerar Plano de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 flex items-center justify-center">
              Crie planos de teste completos baseados na descrição do seu projeto
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
              <TestTube className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Gerar Casos de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 flex items-center justify-center">
              Gere casos de teste detalhados para funcionalidades específicas
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
          <CardHeader>
            <CardTitle>Como funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 min-w-[2rem] h-8 flex items-center justify-center">
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
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 min-w-[2rem] h-8 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">IA analisa e gera</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nossa IA cria planos, casos e execuções de teste personalizados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 min-w-[2rem] h-8 flex items-center justify-center">
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
