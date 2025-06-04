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

// Model Control Panel types
export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'other';
  description: string;
  version: string;
  capabilities: string[];
  defaultForTask?: AIModelTask;
  apiKey?: string;
  active: boolean;
  settings: Record<string, any>;
}

export type AIModelTask = 
  | 'test-plan-generation'
  | 'test-case-generation' 
  | 'bug-detection'
  | 'code-analysis'
  | 'general-completion';

export interface AIPromptTemplate {
  id: string;
  name: string;
  task: AIModelTask;
  template: string;
  description: string;
  parameters: string[];
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface AIModelConfig {
  models: AIModel[];
  promptTemplates: AIPromptTemplate[];
  defaultModel: string;
  tasks: Record<AIModelTask, string>; // maps task to default model id
}
