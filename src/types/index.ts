
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
  created_at: Date;
  updated_at: Date;
  user_id: string;
  generated_by_ai: boolean;
}

export interface TestCase {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  preconditions: string;
  steps: TestStep[];
  expected_result: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'functional' | 'integration' | 'performance' | 'security' | 'usability';
  created_at: Date;
  updated_at: Date;
  user_id: string;
  generated_by_ai: boolean;
}

export interface TestStep {
  id: string;
  action: string;
  expected_result: string;
  order: number;
}

export interface TestExecution {
  id: string;
  case_id: string;
  plan_id: string;
  status: 'passed' | 'failed' | 'blocked' | 'not_tested';
  actual_result: string;
  notes: string;
  executed_at: Date;
  executed_by: string;
  user_id: string;
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
