import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyD5BczH-kaiDNGOPEDz1_VGTTNxyJIngCs";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to get a model instance
export const getGeminiModel = (modelName = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Generate text content
export const generateText = async (prompt: string, modelName = 'gemini-pro'): Promise<string> => {
  try {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
};

// Generate structured content (e.g., JSON)
export const generateStructuredContent = async <T>(
  prompt: string, 
  modelName = 'gemini-pro'
): Promise<T> => {
  try {
    const textResponse = await generateText(prompt, modelName);
    // Try to extract JSON from the response
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                      textResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim()) as T;
    }
    
    // If no JSON format is found, try to parse the entire response
    return JSON.parse(textResponse) as T;
  } catch (error) {
    console.error('Error generating structured content with Gemini:', error);
    throw new Error(`Failed to parse structured content: ${error}`);
  }
};

// Function to generate test plans
export const generateTestPlan = async (
  appDescription: string,
  requirements: string,
  additionalContext?: string
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
  
  return generateStructuredContent(prompt);
};

// Function to generate test cases
export const generateTestCases = async (
  testPlan: any,
  numCases: number = 5
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
  
  return generateStructuredContent<any[]>(prompt);
}; 