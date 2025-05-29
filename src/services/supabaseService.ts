

import { supabase } from '@/integrations/supabase/client';
import { TestPlan, TestCase, TestExecution, TestStep } from '@/types';

// Funções para Planos de Teste
export const getTestPlans = async (userId: string): Promise<TestPlan[]> => {
  const { data, error } = await supabase
    .from('test_plans')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar planos de teste:', error);
    throw error;
  }

  return data.map(plan => ({
    ...plan,
    created_at: new Date(plan.created_at),
    updated_at: new Date(plan.updated_at)
  }));
};

export const createTestPlan = async (plan: Omit<TestPlan, 'id' | 'created_at' | 'updated_at'>): Promise<TestPlan> => {
  const { data, error } = await supabase
    .from('test_plans')
    .insert([plan])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar plano de teste:', error);
    throw error;
  }

  return {
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  };
};

export const updateTestPlan = async (id: string, updates: Partial<TestPlan>): Promise<TestPlan> => {
  // Remove created_at and updated_at from updates, convert Date to string
  const { created_at, updated_at, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('test_plans')
    .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar plano de teste:', error);
    throw error;
  }

  return {
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  };
};

export const deleteTestPlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('test_plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar plano de teste:', error);
    throw error;
  }
};

// Funções para Casos de Teste
export const getTestCases = async (userId: string, planId?: string): Promise<TestCase[]> => {
  let query = supabase
    .from('test_cases')
    .select('*')
    .eq('user_id', userId);

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar casos de teste:', error);
    throw error;
  }

  return data.map(testCase => ({
    ...testCase,
    steps: Array.isArray(testCase.steps) ? (testCase.steps as unknown as TestStep[]) : [],
    priority: testCase.priority as 'low' | 'medium' | 'high' | 'critical',
    type: testCase.type as 'functional' | 'integration' | 'performance' | 'security' | 'usability',
    created_at: new Date(testCase.created_at),
    updated_at: new Date(testCase.updated_at)
  }));
};

export const createTestCase = async (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>): Promise<TestCase> => {
  const { data, error } = await supabase
    .from('test_cases')
    .insert([{
      ...testCase,
      steps: testCase.steps as any // Convert TestStep[] to Json
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar caso de teste:', error);
    throw error;
  }

  return {
    ...data,
    steps: Array.isArray(data.steps) ? (data.steps as unknown as TestStep[]) : [],
    priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
    type: data.type as 'functional' | 'integration' | 'performance' | 'security' | 'usability',
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  };
};

export const updateTestCase = async (id: string, updates: Partial<TestCase>): Promise<TestCase> => {
  // Remove created_at and updated_at from updates, convert Date to string and TestStep[] to Json
  const { created_at, updated_at, steps, ...cleanUpdates } = updates;
  
  const updateData: any = {
    ...cleanUpdates,
    updated_at: new Date().toISOString()
  };

  if (steps) {
    updateData.steps = steps; // Convert TestStep[] to Json
  }

  const { data, error } = await supabase
    .from('test_cases')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar caso de teste:', error);
    throw error;
  }

  return {
    ...data,
    steps: Array.isArray(data.steps) ? (data.steps as unknown as TestStep[]) : [],
    priority: data.priority as 'low' | 'medium' | 'high' | 'critical',
    type: data.type as 'functional' | 'integration' | 'performance' | 'security' | 'usability',
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  };
};

export const deleteTestCase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('test_cases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar caso de teste:', error);
    throw error;
  }
};

// Funções para Execuções de Teste
export const getTestExecutions = async (userId: string, planId?: string, caseId?: string): Promise<TestExecution[]> => {
  let query = supabase
    .from('test_executions')
    .select('*')
    .eq('user_id', userId);

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  if (caseId) {
    query = query.eq('case_id', caseId);
  }

  const { data, error } = await query.order('executed_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar execuções de teste:', error);
    throw error;
  }

  return data.map(execution => ({
    ...execution,
    status: execution.status as 'passed' | 'failed' | 'blocked' | 'not_tested',
    executed_at: new Date(execution.executed_at)
  }));
};

export const createTestExecution = async (execution: Omit<TestExecution, 'id' | 'executed_at'>): Promise<TestExecution> => {
  const { data, error } = await supabase
    .from('test_executions')
    .insert([execution])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar execução de teste:', error);
    throw error;
  }

  return {
    ...data,
    status: data.status as 'passed' | 'failed' | 'blocked' | 'not_tested',
    executed_at: new Date(data.executed_at)
  };
};

export const updateTestExecution = async (id: string, updates: Partial<TestExecution>): Promise<TestExecution> => {
  // Remove executed_at from updates, convert Date to string
  const { executed_at, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('test_executions')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar execução de teste:', error);
    throw error;
  }

  return {
    ...data,
    status: data.status as 'passed' | 'failed' | 'blocked' | 'not_tested',
    executed_at: new Date(data.executed_at)
  };
};

export const deleteTestExecution = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('test_executions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar execução de teste:', error);
    throw error;
  }
};

