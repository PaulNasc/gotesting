
export interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface TestPlan {
  id: string;
  title: string;
  description: string;
  objective: string;
  scope: string;
  approach: string;
  criteria: string;
  resources: string;
  schedule: string;
  risks: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  generatedByAI: boolean;
}

export interface TestCase {
  id: string;
  planId: string;
  title: string;
  description: string;
  preconditions: string;
  steps: TestStep[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'functional' | 'integration' | 'performance' | 'security' | 'usability';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  generatedByAI: boolean;
}

export interface TestStep {
  id: string;
  action: string;
  expectedResult: string;
  order: number;
}

export interface TestExecution {
  id: string;
  caseId: string;
  planId: string;
  status: 'passed' | 'failed' | 'blocked' | 'not_tested';
  actualResult: string;
  notes: string;
  executedAt: Date;
  executedBy: string;
  userId: string;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}
