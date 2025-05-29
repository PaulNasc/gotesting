
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon, Calendar, FileText, TestTube, PlayCircle } from 'lucide-react';

export const History = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Histórico</h2>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe o histórico de atividades</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Plano de teste criado</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema de Login - Testes de autenticação
                  </p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hoje
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-2">
                  <TestTube className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Caso de teste adicionado</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TC001 - Validar login com credenciais válidas
                  </p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hoje
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2">
                  <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Execução de teste realizada</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TC001 - Status: Aprovado
                  </p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Ontem
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Planos Criados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Casos Criados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Execuções</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">75%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
