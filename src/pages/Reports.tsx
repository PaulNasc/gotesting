
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, FileText, TestTube, PlayCircle, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTestPlans, getTestCases, getTestExecutions } from '@/services/supabaseService';
import { TestPlan, TestCase, TestExecution } from '@/types';
import { StandardButton } from '@/components/StandardButton';

export const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [cases, setCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  
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
    console.log(`Exportando relatório em formato ${format}`);
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
        <div className="flex gap-2">
          <StandardButton variant="outline" icon={Download} onClick={() => exportReport('pdf')}>
            Exportar PDF
          </StandardButton>
          <StandardButton variant="outline" icon={Download} onClick={() => exportReport('excel')}>
            Exportar Excel
          </StandardButton>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
        </CardContent>
      </Card>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {aiGeneratedPlans} gerados por IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
            <TestTube className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {aiGeneratedCases} gerados por IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <PlayCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              {passedExecutions} aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Execuções aprovadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Execuções */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedExecutions}</div>
              <Badge className="bg-green-100 text-green-800">Aprovadas</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedExecutions}</div>
              <Badge className="bg-red-100 text-red-800">Reprovadas</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{blockedExecutions}</div>
              <Badge className="bg-yellow-100 text-yellow-800">Bloqueadas</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{notTestedExecutions}</div>
              <Badge className="bg-gray-100 text-gray-800">Não Testadas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prioridade dos Casos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Prioridade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalCases}</div>
              <Badge className="bg-red-100 text-red-800">Crítica</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{highCases}</div>
              <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mediumCases}</div>
              <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lowCases}</div>
              <Badge className="bg-green-100 text-green-800">Baixa</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
