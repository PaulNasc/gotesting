import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to get API key from Model Control Service
const getGeminiApiKey = (): string => {
  // Try to get from Model Control Service
  try {
    const config = localStorage.getItem('mcp_config');
    if (config) {
      const parsedConfig = JSON.parse(config);
      const geminiModel = parsedConfig.models?.find((m: any) => m.provider === 'gemini');
      if (geminiModel?.apiKey) {
        return geminiModel.apiKey;
      }
    }
  } catch (error) {
    console.warn('Failed to load API key from Model Control Service:', error);
  }
  
  // Fallback to hardcoded key (for compatibility)
  return "AIzaSyD5BczH-kaiDNGOPEDz1_VGTTNxyJIngCs";
};

// Initialize the Gemini API with dynamic key loading
const getGeminiAI = () => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada. Configure uma chave API válida no Model Control Panel.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Get active model for a specific task from Model Control Service
const getActiveModelForTask = (task?: string): string => {
  try {
    const config = localStorage.getItem('mcp_config');
    if (config) {
      const parsedConfig = JSON.parse(config);
      
      // If task is specified, get the model assigned to that task
      if (task && parsedConfig.tasks && parsedConfig.tasks[task]) {
        const taskModelId = parsedConfig.tasks[task];
        const taskModel = parsedConfig.models?.find((m: any) => m.id === taskModelId && m.active);
        if (taskModel) {
          return taskModel.id;
        }
      }
      
      // Otherwise, get the default active model
      const activeModels = parsedConfig.models?.filter((m: any) => m.provider === 'gemini' && m.active);
      if (activeModels && activeModels.length > 0) {
        return activeModels[0].id;
      }
    }
  } catch (error) {
    console.warn('Failed to load active model from Model Control Service:', error);
  }
  
  // Fallback to default
  return 'gemini-1.5-flash';
};

// Helper function to get a model instance
export const getGeminiModel = (modelName?: string, task?: string) => {
  const genAI = getGeminiAI();
  const actualModelName = modelName || getActiveModelForTask(task);
  return genAI.getGenerativeModel({ model: actualModelName });
};

// Generate text content
export const generateText = async (prompt: string, modelName?: string, task?: string): Promise<string> => {
  try {
    const model = getGeminiModel(modelName, task);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Chave API do Gemini inválida. Verifique sua configuração no Model Control Panel.');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Cota da API do Gemini excedida. Verifique seu plano de uso.');
    } else if (error.message?.includes('BLOCKED')) {
      throw new Error('Conteúdo bloqueado pela API do Gemini devido às políticas de segurança.');
    } else if (error.status === 403) {
      throw new Error('Acesso negado. Verifique se sua chave API do Gemini tem as permissões necessárias.');
    } else if (error.status === 429) {
      throw new Error('Muitas requisições. Aguarde um momento antes de tentar novamente.');
    } else {
      throw new Error(`Erro na API do Gemini: ${error.message || 'Erro desconhecido'}`);
    }
  }
};

// Generate structured content (e.g., JSON)
export const generateStructuredContent = async <T>(
  prompt: string, 
  modelName?: string,
  task?: string
): Promise<T> => {
  try {
    const textResponse = await generateText(prompt, modelName, task);
    // Try to extract JSON from the response
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                      textResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim()) as T;
    }
    
    // If no JSON format is found, try to parse the entire response
    return JSON.parse(textResponse) as T;
  } catch (error: any) {
    console.error('Error generating structured content with Gemini:', error);
    
    // If it's a parsing error, provide more specific message
    if (error instanceof SyntaxError) {
      throw new Error(`Erro ao analisar resposta JSON da IA. A resposta pode estar malformada: ${error.message}`);
    }
    
    // Re-throw API errors from generateText
    throw error;
  }
};

// Function to generate test plans
export const generateTestPlan = async (
  appDescription: string,
  requirements: string,
  additionalContext?: string,
  modelName?: string
): Promise<any> => {
  const prompt = `
  Generate a detailed test plan for the following application:
  
  Application Description:
  ${appDescription}
  
  Requirements:
  ${requirements}
  
  ${additionalContext ? `Additional Context:\n${additionalContext}\n` : ''}
  
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
  `;
  
  return generateStructuredContent(prompt, modelName, 'test-plan-generation');
};

// Function to generate test cases
export const generateTestCases = async (
  testPlan: any,
  numCases: number = 5,
  modelName?: string
): Promise<any[]> => {
  const prompt = `
  Generate ${numCases} detailed test cases based on the following test plan:
  
  Test Plan Title: ${testPlan.title}
  Test Plan Description: ${testPlan.description}
  Test Plan Objective: ${testPlan.objective}
  Test Plan Scope: ${testPlan.scope}
  
  For each test case, provide the following in JSON format:
  - title: Title of the test case
  - description: Brief description of what the test case verifies
  - preconditions: Conditions that must be met before executing the test
  - steps: Array of steps, each with 'action' and 'expected_result'
  - expected_result: Overall expected result of the test
  - priority: One of: 'low', 'medium', 'high', 'critical'
  - type: One of: 'functional', 'integration', 'performance', 'security', 'usability'
  
  Return an array of ${numCases} test case objects in JSON format.
  `;
  
  return generateStructuredContent<any[]>(prompt, modelName, 'test-case-generation');
}; 