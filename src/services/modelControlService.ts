import { supabase } from '@/integrations/supabase/client';
import { 
  AIModel, 
  AIPromptTemplate, 
  AIModelConfig,
  AIModelTask
} from '@/types';
import { generateText, generateStructuredContent } from '@/integrations/gemini/client';

// Local storage keys
const MCP_CONFIG_KEY = 'mcp_config';
const API_KEYS_KEY = 'mcp_api_keys';

// Default configuration
const defaultConfig: AIModelConfig = {
  models: [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'gemini',
      description: 'Google Gemini Pro - Model de linguagem para geração de texto',
      version: '1.0',
      capabilities: ['test-plan-generation', 'test-case-generation', 'general-completion'],
      defaultForTask: 'test-plan-generation',
      apiKey: 'AIzaSyD5BczH-kaiDNGOPEDz1_VGTTNxyJIngCs',
      active: true,
      settings: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topK: 40,
        topP: 0.95,
      }
    }
  ],
  promptTemplates: [
    {
      id: 'test-plan-template-1',
      name: 'Template Padrão para Planos de Teste',
      task: 'test-plan-generation',
      template: `
        Generate a detailed test plan for the following application:
        
        Application Description:
        {{appDescription}}
        
        Requirements:
        {{requirements}}
        
        {{#if additionalContext}}
        Additional Context:
        {{additionalContext}}
        {{/if}}
        
        Please provide a structured test plan in JSON format with the following fields:
        - title: Title of the test plan
        - description: Brief description of the test plan
        - objective: The main objective of testing
        - scope: What is included and excluded from testing
        - approach: The testing approach to be used
        - criteria: Entry and exit criteria for testing
        - resources: Required resources for testing
        - schedule: Proposed testing schedule
        - risks: Potential risks and mitigation strategies
        
        Format the response as a JSON object.
      `,
      description: 'Template padrão para gerar planos de teste detalhados',
      parameters: ['appDescription', 'requirements', 'additionalContext'],
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    },
    {
      id: 'test-case-template-1',
      name: 'Template Padrão para Casos de Teste',
      task: 'test-case-generation',
      template: `
        Generate {{numCases}} detailed test cases based on the following test plan:
        
        Test Plan Title: {{testPlan.title}}
        Test Plan Description: {{testPlan.description}}
        Test Plan Objective: {{testPlan.objective}}
        Test Plan Scope: {{testPlan.scope}}
        
        For each test case, provide the following in JSON format:
        - title: Title of the test case
        - description: Brief description of what the test case verifies
        - preconditions: Conditions that must be met before executing the test
        - steps: Array of steps, each with 'action' and 'expected_result'
        - expected_result: Overall expected result of the test
        - priority: One of: 'low', 'medium', 'high', 'critical'
        - type: One of: 'functional', 'integration', 'performance', 'security', 'usability'
        
        Return an array of {{numCases}} test case objects in JSON format.
      `,
      description: 'Template padrão para gerar casos de teste baseados em um plano',
      parameters: ['testPlan', 'numCases'],
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    }
  ],
  defaultModel: 'gemini-pro',
  tasks: {
    'test-plan-generation': 'gemini-pro',
    'test-case-generation': 'gemini-pro',
    'bug-detection': 'gemini-pro',
    'code-analysis': 'gemini-pro',
    'general-completion': 'gemini-pro'
  }
};

// Load configuration from local storage or use default
export const loadConfig = (): AIModelConfig => {
  const storedConfig = localStorage.getItem(MCP_CONFIG_KEY);
  return storedConfig ? JSON.parse(storedConfig) : defaultConfig;
};

// Save configuration to local storage
export const saveConfig = (config: AIModelConfig): void => {
  localStorage.setItem(MCP_CONFIG_KEY, JSON.stringify(config));
};

// Reset configuration to default
export const resetConfig = (): AIModelConfig => {
  localStorage.setItem(MCP_CONFIG_KEY, JSON.stringify(defaultConfig));
  return defaultConfig;
};

// Get model by ID
export const getModelById = (modelId: string): AIModel | undefined => {
  const config = loadConfig();
  return config.models.find(model => model.id === modelId);
};

// Get default model for a task
export const getDefaultModelForTask = (task: AIModelTask): AIModel | undefined => {
  const config = loadConfig();
  const modelId = config.tasks[task];
  return config.models.find(model => model.id === modelId);
};

// Set default model for a task
export const setDefaultModelForTask = (task: AIModelTask, modelId: string): void => {
  const config = loadConfig();
  config.tasks[task] = modelId;
  saveConfig(config);
};

// Add a new model
export const addModel = (model: Omit<AIModel, 'id'>): AIModel => {
  const config = loadConfig();
  const newModel: AIModel = {
    ...model,
    id: `model-${Date.now()}`
  };
  config.models.push(newModel);
  saveConfig(config);
  return newModel;
};

// Update an existing model
export const updateModel = (modelId: string, updates: Partial<AIModel>): AIModel | undefined => {
  const config = loadConfig();
  const modelIndex = config.models.findIndex(model => model.id === modelId);
  
  if (modelIndex !== -1) {
    config.models[modelIndex] = {
      ...config.models[modelIndex],
      ...updates
    };
    saveConfig(config);
    return config.models[modelIndex];
  }
  
  return undefined;
};

// Delete a model
export const deleteModel = (modelId: string): boolean => {
  const config = loadConfig();
  const initialLength = config.models.length;
  config.models = config.models.filter(model => model.id !== modelId);
  
  // If default model is deleted, set a new default
  if (config.defaultModel === modelId && config.models.length > 0) {
    config.defaultModel = config.models[0].id;
  }
  
  // Update task mappings if they point to the deleted model
  Object.keys(config.tasks).forEach(task => {
    if (config.tasks[task as AIModelTask] === modelId && config.models.length > 0) {
      config.tasks[task as AIModelTask] = config.models[0].id;
    }
  });
  
  saveConfig(config);
  return config.models.length < initialLength;
};

// Get prompt template by ID
export const getPromptTemplateById = (templateId: string): AIPromptTemplate | undefined => {
  const config = loadConfig();
  return config.promptTemplates.find(template => template.id === templateId);
};

// Get prompt templates for a task
export const getPromptTemplatesForTask = (task: AIModelTask): AIPromptTemplate[] => {
  const config = loadConfig();
  return config.promptTemplates.filter(template => template.task === task && template.active);
};

// Add a new prompt template
export const addPromptTemplate = (template: Omit<AIPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): AIPromptTemplate => {
  const config = loadConfig();
  const now = new Date();
  const newTemplate: AIPromptTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  config.promptTemplates.push(newTemplate);
  saveConfig(config);
  return newTemplate;
};

// Update an existing prompt template
export const updatePromptTemplate = (templateId: string, updates: Partial<AIPromptTemplate>): AIPromptTemplate | undefined => {
  const config = loadConfig();
  const templateIndex = config.promptTemplates.findIndex(template => template.id === templateId);
  
  if (templateIndex !== -1) {
    config.promptTemplates[templateIndex] = {
      ...config.promptTemplates[templateIndex],
      ...updates,
      updatedAt: new Date()
    };
    saveConfig(config);
    return config.promptTemplates[templateIndex];
  }
  
  return undefined;
};

// Delete a prompt template
export const deletePromptTemplate = (templateId: string): boolean => {
  const config = loadConfig();
  const initialLength = config.promptTemplates.length;
  config.promptTemplates = config.promptTemplates.filter(template => template.id !== templateId);
  saveConfig(config);
  return config.promptTemplates.length < initialLength;
};

// Process a template with variables
const processTemplate = (template: string, variables: Record<string, any>): string => {
  let processedTemplate = template;
  
  // Replace simple variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, variables[key]);
  });
  
  // Process conditional blocks
  const conditionalRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  processedTemplate = processedTemplate.replace(conditionalRegex, (match, condition, content) => {
    return variables[condition] ? content : '';
  });
  
  return processedTemplate;
};

// Execute a task with a specific model and template
export const executeTask = async (
  task: AIModelTask,
  variables: Record<string, any>,
  modelId?: string,
  templateId?: string
): Promise<any> => {
  const config = loadConfig();
  
  // Get model
  const model = modelId 
    ? config.models.find(m => m.id === modelId)
    : config.models.find(m => m.id === config.tasks[task]);
    
  if (!model || !model.active) {
    throw new Error(`No active model found for task: ${task}`);
  }
  
  // Get template
  const templates = config.promptTemplates.filter(t => t.task === task && t.active);
  const template = templateId
    ? templates.find(t => t.id === templateId)
    : templates[0];
    
  if (!template) {
    throw new Error(`No active template found for task: ${task}`);
  }
  
  // Process template with variables
  const prompt = processTemplate(template.template, variables);
  
  // Execute based on model provider
  switch (model.provider) {
    case 'gemini':
      return generateStructuredContent(prompt, model.id);
    default:
      throw new Error(`Unsupported model provider: ${model.provider}`);
  }
};

// Save MCP config to Supabase for the user
export const saveMCPConfigToSupabase = async (userId: string, config: AIModelConfig): Promise<void> => {
  try {
    // Remove sensitive API keys before saving to database
    const configForStorage = {
      ...config,
      models: config.models.map(model => ({
        ...model,
        apiKey: undefined
      }))
    };
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        key: 'mcp_config',
        value: configForStorage,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error saving MCP config to Supabase:', error);
    throw error;
  }
};

// Load MCP config from Supabase for the user
export const loadMCPConfigFromSupabase = async (userId: string): Promise<AIModelConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'mcp_config')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found, use default
        return defaultConfig;
      }
      throw error;
    }
    
    if (!data) return defaultConfig;
    
    // Restore API keys from local storage
    const storedApiKeys = JSON.parse(localStorage.getItem(API_KEYS_KEY) || '{}');
    const config = data.value as AIModelConfig;
    
    config.models = config.models.map(model => ({
      ...model,
      apiKey: storedApiKeys[model.id] || model.apiKey
    }));
    
    return config;
  } catch (error) {
    console.error('Error loading MCP config from Supabase:', error);
    return defaultConfig;
  }
};

// Save API keys to local storage
export const saveApiKeys = (config: AIModelConfig): void => {
  const apiKeys: Record<string, string> = {};
  
  config.models.forEach(model => {
    if (model.apiKey) {
      apiKeys[model.id] = model.apiKey;
    }
  });
  
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(apiKeys));
}; 