import { BaseAgent } from './base-agent';
import { AgentCapability, AgentResult, AgentTask, AgentType } from './types';

export class ContentAgent extends BaseAgent {
  private apiKey: string;
  private model: string;

  constructor() {
    super('ContentOptimizer', AgentType.CONTENT, [AgentCapability.CONTENT, AgentCapability.CODING]);
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = 'qwen/qwen-2.5-72b-instruct'; // Good for multilingual content
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const input = task.input || {};
    const goal = task.goal || '';
    const context = task.context || {};
    
    if (!goal) {
      throw new Error('No goal or text provided for content generation');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert Content Optimizer and Generator for an AI-powered Romanian marketplace called Piaa AI. Your goal is to create compelling, SEO-friendly, and engaging content in Romanian. Professional yet accessible tone.'
        },
        {
          role: 'user',
          content: `Task: ${goal}\n\nContext: ${JSON.stringify(context)}`
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://piata-ai.ro',
          'X-Title': 'Piata AI Content Agent'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const optimizedText = data.choices[0]?.message?.content || '';

      return {
        status: 'success',
        output: {
          original: goal,
          optimized: optimizedText,
          model: this.model,
          usage: data.usage
        }
      };
    } catch (error: any) {
      console.error('[ContentAgent] Error:', error);
      return {
        status: 'error',
        error: error.message,
        output: null
      };
    }
  }
}