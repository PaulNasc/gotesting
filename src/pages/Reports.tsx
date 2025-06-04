import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  FileText, 
  TestTube, 
  PlayCircle, 
  Calendar, 
  Download, 
  Filter, 
  Eye, 
  PieChart,
  LineChart,
  Sparkles,
  Check,
  X as XIcon,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestPlans, getTestCases, getTestExecutions } from '@/services/supabaseService';
import { TestPlan, TestCase, TestExecution } from '@/types';
import { StandardButton } from '@/components/StandardButton';

// Definição dos tipos de relatório
const reportTypes = [
  {
    id: 'execution-status',
    title: 'Status de Execuções',
    description: 'Visão geral dos status de todas as execuções de teste',
    icon: PlayCircle,
    color: 'text-purple-600'
  },
  {
    id: 'test-priority',
    title: 'Distribuição por Prioridade',
    description: 'Análise da distribuição de casos de teste por prioridade',
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  {
    id: 'ai-generation',
    title: 'Geração por IA',
    description: 'Comparativo entre itens gerados por IA e manualmente',
    icon: Sparkles,
    color: 'text-blue-600'
  },
  {
    id: 'test-coverage',
    title: 'Cobertura de Testes',
    description: 'Análise da cobertura de testes por áreas do sistema',
    icon: Check,
    color: 'text-green-600'
  },
  {
    id: 'trend-analysis',
    title: 'Análise de Tendências',
    description: 'Evolução dos testes ao longo do tempo',
    icon: LineChart,
    color: 'text-teal-600'
  },
  {
    id: 'performance-metrics',
    title: 'Métricas de Performance',
    description: 'Análise detalhada de tempo de execução e performance',
    icon: BarChart3,
    color: 'text-indigo-600'
  },
  {
    id: 'quality-metrics',
    title: 'Métricas de Qualidade',
    description: 'Indicadores de qualidade e eficiência dos testes',
    icon: PieChart,
    color: 'text-emerald-600'
  },
  {
    id: 'raw-data-export',
    title: 'Dados Brutos',
    description: 'Exportação completa de todos os dados para análise externa',
    icon: FileText,
    color: 'text-gray-600'
  },
  {
    id: 'execution-details',
    title: 'Detalhamento de Execuções',
    description: 'Relatório detalhado com histórico completo de execuções',
    icon: Clock,
    color: 'text-amber-600'
  },
  {
    id: 'failure-analysis',
    title: 'Análise de Falhas',
    description: 'Investigação profunda de casos que falharam',
    icon: XIcon,
    color: 'text-red-600'
  }
];

export const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'plans' | 'cases' | 'executions'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'passed' | 'failed' | 'blocked' | 'not_tested'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      const [plansData, casesData, executionsData] = await Promise.all([
        getTestPlans(user!.id),
        getTestCases(user!.id),
        getTestExecutions(user!.id)
      ]);
      
      setPlans(plansData);
      setCases(casesData);
      setExecutions(executionsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Métricas gerais
  const totalPlans = plans.length;
  const totalCases = cases.length;
  const totalExecutions = executions.length;
  const aiGeneratedPlans = plans.filter(p => p.generated_by_ai).length;
  const aiGeneratedCases = cases.filter(c => c.generated_by_ai).length;

  // Métricas de execução
  const passedExecutions = executions.filter(e => e.status === 'passed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const blockedExecutions = executions.filter(e => e.status === 'blocked').length;
  const notTestedExecutions = executions.filter(e => e.status === 'not_tested').length;

  // Métricas de prioridade
  const criticalCases = cases.filter(c => c.priority === 'critical').length;
  const highCases = cases.filter(c => c.priority === 'high').length;
  const mediumCases = cases.filter(c => c.priority === 'medium').length;
  const lowCases = cases.filter(c => c.priority === 'low').length;

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementar exportação de relatório
    console.log(`Exportando relatório em formato ${format} para: ${selectedReport}`);
  };

  // Renderiza os filtros específicos para cada tipo de relatório
  const renderFilters = () => {
    switch (selectedReport) {
      case 'execution-status':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="passed">Aprovado</SelectItem>
                  <SelectItem value="failed">Reprovado</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                  <SelectItem value="not_tested">Não Testado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'test-priority':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'ai-generation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="plans">Planos</SelectItem>
                  <SelectItem value="cases">Casos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      // Filtros para novos tipos de relatório
      case 'performance-metrics':
      case 'quality-metrics':
      case 'execution-details':
      case 'failure-analysis':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="plans">Planos</SelectItem>
                  <SelectItem value="cases">Casos</SelectItem>
                  <SelectItem value="executions">Execuções</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="passed">Aprovado</SelectItem>
                  <SelectItem value="failed">Reprovado</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                  <SelectItem value="not_tested">Não Testado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'raw-data-export':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Dados</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de dados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Dados</SelectItem>
                  <SelectItem value="plans">Apenas Planos</SelectItem>
                  <SelectItem value="cases">Apenas Casos</SelectItem>
                  <SelectItem value="executions">Apenas Execuções</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato de Exportação</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      // Adicione filtros para outros tipos de relatório conforme necessário
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        );
    }
  };

  // Renderiza o conteúdo específico para cada tipo de relatório
  const renderReportContent = () => {
    switch (selectedReport) {
      case 'execution-status':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-green-600">{passedExecutions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-800">Aprovadas</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-red-600">{failedExecutions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-red-100 text-red-800">Reprovadas</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalExecutions > 0 ? Math.round((failedExecutions / totalExecutions) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-yellow-600">{blockedExecutions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-yellow-100 text-yellow-800">Bloqueadas</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalExecutions > 0 ? Math.round((blockedExecutions / totalExecutions) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-gray-600">{notTestedExecutions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-gray-100 text-gray-800">Não Testadas</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalExecutions > 0 ? Math.round((notTestedExecutions / totalExecutions) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Execuções por Status</CardTitle>
                <CardDescription>Detalhamento das execuções de teste</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {executions
                    .filter(execution => selectedStatus === 'all' || execution.status === selectedStatus)
                    .filter(execution => {
                      if (!dateFrom && !dateTo) return true;
                      const execDate = new Date(execution.executed_at);
                      const fromDate = dateFrom ? new Date(dateFrom) : null;
                      const toDate = dateTo ? new Date(dateTo) : null;
                      
                      if (fromDate && toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return execDate >= fromDate && execDate <= toDate;
                      }
                      if (fromDate) return execDate >= fromDate;
                      if (toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return execDate <= toDate;
                      }
                      return true;
                    })
                    .map(execution => (
                      <div key={execution.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Execução #{execution.id.slice(0, 8)}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              execution.status === 'passed' ? 'bg-green-100 text-green-800' :
                              execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                              execution.status === 'blocked' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {execution.status === 'passed' ? 'Aprovado' :
                               execution.status === 'failed' ? 'Reprovado' :
                               execution.status === 'blocked' ? 'Bloqueado' : 'Não Testado'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(execution.executed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {execution.notes || 'Sem notas adicionais'}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'test-priority':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-red-600">{criticalCases}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-red-100 text-red-800">Crítica</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalCases > 0 ? Math.round((criticalCases / totalCases) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-orange-600">{highCases}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalCases > 0 ? Math.round((highCases / totalCases) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-yellow-600">{mediumCases}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalCases > 0 ? Math.round((mediumCases / totalCases) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-green-600">{lowCases}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-800">Baixa</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {totalCases > 0 ? Math.round((lowCases / totalCases) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Casos por Prioridade</CardTitle>
                <CardDescription>Detalhamento dos casos de teste</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {cases
                    .filter(testCase => selectedPriority === 'all' || testCase.priority === selectedPriority)
                    .filter(testCase => {
                      if (!dateFrom && !dateTo) return true;
                      const caseDate = new Date(testCase.updated_at);
                      const fromDate = dateFrom ? new Date(dateFrom) : null;
                      const toDate = dateTo ? new Date(dateTo) : null;
                      
                      if (fromDate && toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate >= fromDate && caseDate <= toDate;
                      }
                      if (fromDate) return caseDate >= fromDate;
                      if (toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate <= toDate;
                      }
                      return true;
                    })
                    .map(testCase => (
                      <div key={testCase.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{testCase.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              testCase.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              testCase.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {testCase.priority}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(testCase.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {testCase.description}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'ai-generation':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Gerados por IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Planos de Teste</span>
                      <Badge className="bg-purple-100 text-purple-800">{aiGeneratedPlans} de {totalPlans}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Casos de Teste</span>
                      <Badge className="bg-purple-100 text-purple-800">{aiGeneratedCases} de {totalCases}</Badge>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full" 
                        style={{ width: `${totalPlans + totalCases > 0 ? ((aiGeneratedPlans + aiGeneratedCases) / (totalPlans + totalCases)) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      {totalPlans + totalCases > 0 
                        ? Math.round(((aiGeneratedPlans + aiGeneratedCases) / (totalPlans + totalCases)) * 100) 
                        : 0}% gerados por IA
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-blue-600" />
                    Gerados Manualmente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Planos de Teste</span>
                      <Badge>{totalPlans - aiGeneratedPlans} de {totalPlans}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Casos de Teste</span>
                      <Badge>{totalCases - aiGeneratedCases} de {totalCases}</Badge>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${totalPlans + totalCases > 0 ? ((totalPlans + totalCases - aiGeneratedPlans - aiGeneratedCases) / (totalPlans + totalCases)) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      {totalPlans + totalCases > 0 
                        ? Math.round(((totalPlans + totalCases - aiGeneratedPlans - aiGeneratedCases) / (totalPlans + totalCases)) * 100) 
                        : 0}% gerados manualmente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Itens Gerados por IA</CardTitle>
                <CardDescription>Lista de planos e casos de teste gerados com IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {selectedType !== 'cases' && plans
                    .filter(plan => plan.generated_by_ai)
                    .filter(plan => {
                      if (!dateFrom && !dateTo) return true;
                      const planDate = new Date(plan.updated_at);
                      const fromDate = dateFrom ? new Date(dateFrom) : null;
                      const toDate = dateTo ? new Date(dateTo) : null;
                      
                      if (fromDate && toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return planDate >= fromDate && planDate <= toDate;
                      }
                      if (fromDate) return planDate >= fromDate;
                      if (toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return planDate <= toDate;
                      }
                      return true;
                    })
                    .map(plan => (
                      <div key={plan.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {plan.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(plan.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {plan.description}
                        </p>
                        <Badge className="mt-1 bg-purple-100 text-purple-800">Plano</Badge>
                      </div>
                    ))}
                    
                  {selectedType !== 'plans' && cases
                    .filter(testCase => testCase.generated_by_ai)
                    .filter(testCase => {
                      if (!dateFrom && !dateTo) return true;
                      const caseDate = new Date(testCase.updated_at);
                      const fromDate = dateFrom ? new Date(dateFrom) : null;
                      const toDate = dateTo ? new Date(dateTo) : null;
                      
                      if (fromDate && toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate >= fromDate && caseDate <= toDate;
                      }
                      if (fromDate) return caseDate >= fromDate;
                      if (toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate <= toDate;
                      }
                      return true;
                    })
                    .map(testCase => (
                      <div key={testCase.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-green-600" />
                            {testCase.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(testCase.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {testCase.description}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-purple-100 text-purple-800">Caso</Badge>
                          <Badge className={
                            testCase.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            testCase.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {testCase.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'test-coverage':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Cobertura por Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.slice(0, 5).map(plan => {
                      // Calcular número de casos associados a este plano
                      const planCases = cases.filter(c => c.plan_id === plan.id);
                      const planExecutions = executions.filter(e => 
                        planCases.some(c => c.id === e.case_id)
                      );
                      const passedForPlan = planExecutions.filter(e => e.status === 'passed').length;
                      const coveragePercent = planCases.length > 0 
                        ? Math.round((planExecutions.length / planCases.length) * 100) 
                        : 0;
                      const successPercent = planExecutions.length > 0 
                        ? Math.round((passedForPlan / planExecutions.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={plan.id} className="border p-3 rounded-lg">
                          <h4 className="font-medium">{plan.title}</h4>
                          <div className="flex justify-between text-sm mt-1">
                            <span>Casos: {planCases.length}</span>
                            <span>Executados: {planExecutions.length}</span>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex justify-between text-xs">
                              <span>Cobertura</span>
                              <span>{coveragePercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${coveragePercent}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex justify-between text-xs">
                              <span>Sucesso</span>
                              <span>{successPercent}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                              <div 
                                className={`h-full rounded-full ${
                                  successPercent > 75 ? 'bg-green-600' : 
                                  successPercent > 50 ? 'bg-yellow-600' : 
                                  'bg-red-600'
                                }`}
                                style={{ width: `${successPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Estatísticas de Cobertura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Casos x Execuções</h4>
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-24 rounded-full border-8 border-blue-500 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {totalCases > 0 ? Math.round((totalExecutions / totalCases) * 100) : 0}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total de Casos</span>
                            <span className="font-medium">{totalCases}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total de Execuções</span>
                            <span className="font-medium">{totalExecutions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Casos sem Execução</span>
                            <span className="font-medium">{totalCases - cases.filter(c => 
                              executions.some(e => e.case_id === c.id)
                            ).length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Prioridades Testadas</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Crítica</span>
                            <span>
                              {criticalCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'critical' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / criticalCases) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-red-600 rounded-full" 
                              style={{ width: `${criticalCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'critical' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / criticalCases) * 100) 
                                : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Alta</span>
                            <span>
                              {highCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'high' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / highCases) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-orange-600 rounded-full" 
                              style={{ width: `${highCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'high' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / highCases) * 100) 
                                : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Média</span>
                            <span>
                              {mediumCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'medium' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / mediumCases) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-yellow-600 rounded-full" 
                              style={{ width: `${mediumCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'medium' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / mediumCases) * 100) 
                                : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Baixa</span>
                            <span>
                              {lowCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'low' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / lowCases) * 100) 
                                : 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-green-600 rounded-full" 
                              style={{ width: `${lowCases > 0 
                                ? Math.round((cases.filter(c => 
                                    c.priority === 'low' && 
                                    executions.some(e => e.case_id === c.id)
                                  ).length / lowCases) * 100) 
                                : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Casos sem Execução</CardTitle>
                <CardDescription>Casos de teste que ainda não foram executados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg divide-y">
                  {cases
                    .filter(c => !executions.some(e => e.case_id === c.id))
                    .filter(testCase => {
                      if (!dateFrom && !dateTo) return true;
                      const caseDate = new Date(testCase.updated_at);
                      const fromDate = dateFrom ? new Date(dateFrom) : null;
                      const toDate = dateTo ? new Date(dateTo) : null;
                      
                      if (fromDate && toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate >= fromDate && caseDate <= toDate;
                      }
                      if (fromDate) return caseDate >= fromDate;
                      if (toDate) {
                        toDate.setHours(23, 59, 59, 999);
                        return caseDate <= toDate;
                      }
                      return true;
                    })
                    .map(testCase => (
                      <div key={testCase.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-green-600" />
                            {testCase.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              testCase.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              testCase.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {testCase.priority}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(testCase.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {testCase.description}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'trend-analysis':
        // Agrupar execuções por mês
        const getMonthData = () => {
          const months: Record<string, any> = {};
          
          executions.forEach(execution => {
            const date = new Date(execution.executed_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!months[monthKey]) {
              months[monthKey] = {
                label: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                total: 0,
                passed: 0,
                failed: 0,
                blocked: 0,
                not_tested: 0
              };
            }
            
            months[monthKey].total++;
            months[monthKey][execution.status]++;
          });
          
          // Ordenar por data
          return Object.values(months).sort((a: any, b: any) => {
            const dateA = new Date(a.label);
            const dateB = new Date(b.label);
            return dateA.getTime() - dateB.getTime();
          });
        };
        
        const monthlyData = getMonthData();
        
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-teal-600" />
                  Evolução das Execuções
                </CardTitle>
                <CardDescription>Tendência de execuções de teste ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Aprovado</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm">Reprovado</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">Bloqueado</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-64 relative">
                      {/* Renderizar barras do gráfico */}
                      <div className="flex items-end justify-between h-full gap-1">
                        {monthlyData.map((month, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col-reverse h-[85%]">
                              {month.total > 0 && (
                                <>
                                  <div 
                                    className="w-full bg-green-500" 
                                    style={{ height: `${(month.passed / month.total) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="w-full bg-red-500" 
                                    style={{ height: `${(month.failed / month.total) * 100}%` }}
                                  ></div>
                                  <div 
                                    className="w-full bg-yellow-500" 
                                    style={{ height: `${(month.blocked / month.total) * 100}%` }}
                                  ></div>
                                </>
                              )}
                            </div>
                            <div className="text-xs mt-2 text-center">{month.label}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Linhas de grade */}
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none">
                        <div className="border-t border-gray-200 w-full"></div>
                        <div className="border-t border-gray-200 w-full"></div>
                        <div className="border-t border-gray-200 w-full"></div>
                        <div className="border-t border-gray-200 w-full"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Sem dados suficientes para análise de tendências.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 && monthlyData[monthlyData.length - 1].total > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {Math.round((monthlyData[monthlyData.length - 1].passed / monthlyData[monthlyData.length - 1].total) * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs {monthlyData.length > 1 && monthlyData[monthlyData.length - 2].total > 0 ? 
                          `${Math.round((monthlyData[monthlyData.length - 2].passed / monthlyData[monthlyData.length - 2].total) * 100)}% no período anterior` :
                          'sem dados anteriores'}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">N/A</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Volume de Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {monthlyData[monthlyData.length - 1].total}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs {monthlyData.length > 1 ? 
                          `${monthlyData[monthlyData.length - 2].total} no período anterior` :
                          'sem dados anteriores'}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">0</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Falhas</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {monthlyData[monthlyData.length - 1].failed}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        vs {monthlyData.length > 1 ? 
                          `${monthlyData[monthlyData.length - 2].failed} no período anterior` :
                          'sem dados anteriores'}
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-bold">0</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Período</CardTitle>
                <CardDescription>Evolução dos números ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left">Período</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Aprovados</th>
                        <th className="px-4 py-2 text-right">Reprovados</th>
                        <th className="px-4 py-2 text-right">Bloqueados</th>
                        <th className="px-4 py-2 text-right">Taxa de Aprovação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {monthlyData.map((month, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">{month.label}</td>
                          <td className="px-4 py-3 text-right">{month.total}</td>
                          <td className="px-4 py-3 text-right text-green-600">{month.passed}</td>
                          <td className="px-4 py-3 text-right text-red-600">{month.failed}</td>
                          <td className="px-4 py-3 text-right text-yellow-600">{month.blocked}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {month.total > 0 ? `${Math.round((month.passed / month.total) * 100)}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'performance-metrics':
        // Como não temos execution_time no tipo TestExecution, vamos focar em outras métricas de performance
        const recentExecutions = executions.filter(e => {
          const daysDiff = Math.floor((new Date().getTime() - new Date(e.executed_at).getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 30; // Últimos 30 dias
        });
        
        const avgExecutionsPerDay = recentExecutions.length / 30;
        const successRate = totalExecutions > 0 ? (passedExecutions / totalExecutions * 100) : 0;
        const fastFailures = executions.filter(e => e.status === 'failed' && e.notes?.toLowerCase().includes('timeout')).length;
        
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-indigo-600">
                    {avgExecutionsPerDay.toFixed(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-indigo-100 text-indigo-800">Execuções/Dia</Badge>
                  <p className="mt-2 text-sm text-gray-500">Média dos últimos 30 dias</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {successRate.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-800">Taxa de Sucesso</Badge>
                  <p className="mt-2 text-sm text-gray-500">Execuções aprovadas</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {fastFailures}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-orange-100 text-orange-800">Falhas Rápidas</Badge>
                  <p className="mt-2 text-sm text-gray-500">Timeouts detectados</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    {recentExecutions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-blue-100 text-blue-800">Atividade Recente</Badge>
                  <p className="mt-2 text-sm text-gray-500">Últimos 30 dias</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Execuções Recentes por Status</CardTitle>
                <CardDescription>Análise detalhada das execuções mais recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left">Caso de Teste</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-center">Prioridade</th>
                        <th className="px-4 py-2 text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {executions
                        .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
                        .slice(0, 20)
                        .map(execution => {
                          const testCase = cases.find(c => c.id === execution.case_id);
                          return (
                            <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">{testCase?.title || 'N/A'}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={
                                  execution.status === 'passed' ? 'bg-green-100 text-green-800' :
                                  execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  execution.status === 'blocked' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {execution.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {new Date(execution.executed_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'quality-metrics':
        const qualityScore = totalExecutions > 0 ? 
          ((passedExecutions / totalExecutions) * 100) : 0;
        const coverageScore = totalCases > 0 ? 
          ((executions.filter((e, i, arr) => arr.findIndex(ex => ex.case_id === e.case_id) === i).length / totalCases) * 100) : 0;
        const automationScore = totalCases > 0 ? 
          ((cases.filter(c => c.generated_by_ai).length / totalCases) * 100) : 0;
        
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-emerald-600">
                    {qualityScore.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-emerald-100 text-emerald-800">Score de Qualidade</Badge>
                  <p className="mt-2 text-sm text-gray-500">Taxa de aprovação geral</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-blue-600">
                    {coverageScore.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-blue-100 text-blue-800">Cobertura de Testes</Badge>
                  <p className="mt-2 text-sm text-gray-500">Casos executados</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-purple-600">
                    {automationScore.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-purple-100 text-purple-800">Automação IA</Badge>
                  <p className="mt-2 text-sm text-gray-500">Gerados por IA</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Eficiência</CardTitle>
                  <CardDescription>Indicadores de produtividade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Casos por Plano</span>
                    <Badge variant="outline">
                      {totalPlans > 0 ? (totalCases / totalPlans).toFixed(1) : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Execuções por Caso</span>
                    <Badge variant="outline">
                      {totalCases > 0 ? (totalExecutions / totalCases).toFixed(1) : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Reexecução</span>
                    <Badge variant="outline">
                      {totalExecutions > totalCases ? 
                        ((totalExecutions - totalCases) / totalCases * 100).toFixed(1) + '%' : '0%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Prioridades</CardTitle>
                  <CardDescription>Balanceamento dos casos de teste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Crítica
                    </span>
                    <Badge variant="outline">{criticalCases}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Alta
                    </span>
                    <Badge variant="outline">{highCases}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Média
                    </span>
                    <Badge variant="outline">{mediumCases}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Baixa
                    </span>
                    <Badge variant="outline">{lowCases}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'execution-details':
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Detalhado de Execuções</CardTitle>
                <CardDescription>Lista completa com todos os detalhes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left">Caso de Teste</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-center">Prioridade</th>
                        <th className="px-4 py-2 text-right">Tempo</th>
                        <th className="px-4 py-2 text-right">Data</th>
                        <th className="px-4 py-2 text-center">Observações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {executions
                        .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
                        .map(execution => {
                          const testCase = cases.find(c => c.id === execution.case_id);
                          return (
                            <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{testCase?.title || 'N/A'}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {testCase?.description || 'Sem descrição'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={
                                  execution.status === 'passed' ? 'bg-green-100 text-green-800' :
                                  execution.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  execution.status === 'blocked' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {execution.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={
                                  testCase?.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                  testCase?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  testCase?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }>
                                  {testCase?.priority || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {execution.notes ? 'Com observações' : 'Sem observações'}
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {new Date(execution.executed_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {execution.notes ? (
                                  <div className="truncate max-w-32" title={execution.notes}>
                                    {execution.notes}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'failure-analysis':
        const failedExecutionsList = executions.filter(e => e.status === 'failed');
        const failuresByCase = failedExecutionsList.reduce((acc, exec) => {
          const caseId = exec.case_id;
          if (!acc[caseId]) {
            acc[caseId] = { count: 0, executions: [] };
          }
          acc[caseId].count++;
          acc[caseId].executions.push(exec);
          return acc;
        }, {} as Record<string, { count: number; executions: any[] }>);
        
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-red-600">
                    {failedExecutionsList.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-red-100 text-red-800">Total de Falhas</Badge>
                  <p className="mt-2 text-sm text-gray-500">Execuções falharam</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-orange-600">
                    {Object.keys(failuresByCase).length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-orange-100 text-orange-800">Casos Problemáticos</Badge>
                  <p className="mt-2 text-sm text-gray-500">Casos com falhas</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-3xl font-bold text-yellow-600">
                    {totalExecutions > 0 ? ((failedExecutionsList.length / totalExecutions) * 100).toFixed(1) : 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-yellow-100 text-yellow-800">Taxa de Falha</Badge>
                  <p className="mt-2 text-sm text-gray-500">Do total de execuções</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Casos com Mais Falhas</CardTitle>
                <CardDescription>Análise dos casos que mais falharam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left">Caso de Teste</th>
                        <th className="px-4 py-2 text-center">Falhas</th>
                        <th className="px-4 py-2 text-center">Prioridade</th>
                        <th className="px-4 py-2 text-right">Última Falha</th>
                        <th className="px-4 py-2 text-center">Padrão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(failuresByCase)
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 10)
                        .map(([caseId, data]) => {
                          const testCase = cases.find(c => c.id === caseId);
                          const lastFailure = data.executions.sort((a, b) => 
                            new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
                          )[0];
                          
                          return (
                            <tr key={caseId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{testCase?.title || 'N/A'}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {testCase?.description || 'Sem descrição'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="outline" className="text-red-600">
                                  {data.count}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge className={
                                  testCase?.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                  testCase?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  testCase?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }>
                                  {testCase?.priority || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {new Date(lastFailure.executed_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant="outline" className={
                                  data.count >= 5 ? 'text-red-600' :
                                  data.count >= 3 ? 'text-orange-600' : 'text-yellow-600'
                                }>
                                  {data.count >= 5 ? 'Crítico' : 
                                   data.count >= 3 ? 'Recorrente' : 'Esporádico'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'raw-data-export':
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Exportação de Dados Brutos</CardTitle>
                <CardDescription>Baixe todos os dados para análise externa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold text-blue-600">
                        {totalPlans}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-blue-100 text-blue-800">Planos de Teste</Badge>
                      <p className="mt-2 text-sm text-gray-500">Registros disponíveis</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold text-green-600">
                        {totalCases}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-green-100 text-green-800">Casos de Teste</Badge>
                      <p className="mt-2 text-sm text-gray-500">Registros disponíveis</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold text-purple-600">
                        {totalExecutions}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-purple-100 text-purple-800">Execuções</Badge>
                      <p className="mt-2 text-sm text-gray-500">Registros disponíveis</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <h4 className="font-medium">Opções de Exportação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => exportReport('csv')} 
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar CSV Completo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => exportReport('excel')} 
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Excel com Abas
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => exportReport('json')} 
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar JSON
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const data = { plans, cases, executions };
                        console.log('Dados brutos:', data);
                      }} 
                      className="flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar JSON
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Estrutura dos Dados</h5>
                  <div className="text-sm space-y-1">
                    <p><strong>Planos:</strong> id, title, description, created_at, updated_at, generated_by_ai</p>
                    <p><strong>Casos:</strong> id, title, description, steps, expected_result, priority, plan_id, created_at, updated_at, generated_by_ai</p>
                    <p><strong>Execuções:</strong> id, case_id, status, executed_at, notes, executed_by</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      // Adicione outros relatórios conforme necessário
      default:
        return (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Selecione um relatório</h3>
              <p className="text-gray-500 mt-2">Escolha um dos modelos de relatório para visualizar.</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="text-gray-600 dark:text-gray-400">Análise detalhada dos seus dados de teste</p>
        </div>
        
        {selectedReport && (
          <div className="flex gap-2">
            <StandardButton 
              variant="outline" 
              icon={Download} 
              onClick={() => exportReport('pdf')}
            >
              Exportar PDF
            </StandardButton>
            <StandardButton 
              variant="outline" 
              icon={Download} 
              onClick={() => exportReport('excel')}
            >
              Exportar Excel
            </StandardButton>
          </div>
        )}
      </div>

      {!selectedReport ? (
        // Visualização de seleção de relatório
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map(report => (
            <Card 
              key={report.id} 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <report.icon className={`h-5 w-5 ${report.color}`} />
                  {report.title}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <div className={`rounded-full p-4 ${report.color.replace('text-', 'bg-').replace('600', '100')}`}>
                  <report.icon className={`h-8 w-8 ${report.color}`} />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-3">
                <Button variant="ghost" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Relatório
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Visualização do relatório selecionado
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium flex items-center gap-2">
              {reportTypes.find(r => r.id === selectedReport)?.title}
              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                Voltar à Lista
              </Button>
            </h3>
          </div>
          
          {/* Filtros específicos para o relatório */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFilters()}
            </CardContent>
          </Card>
          
          {/* Conteúdo do relatório */}
          {renderReportContent()}
        </div>
      )}
    </div>
  );
};
