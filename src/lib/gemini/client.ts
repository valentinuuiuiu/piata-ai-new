import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GOOGLE_API_KEY is not set. Gemini client will fail.');
}

// Initialize the client
const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export const geminiClient = genAI;

// Helper to get a model with standard configuration
export function getGeminiModel(modelName: string = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

// Unified function to generate text
export async function generateText(prompt: string, modelName: string = 'gemini-1.5-flash'): Promise<string> {
  try {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating text with Gemini:', error);
    // Fallback or re-throw
    throw error;
  }
}