import { BaseAgent } from './base-agent';
import { AgentCapability, AgentResult, AgentTask } from './types';

interface OpenRouterAgentConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
  systemPrompt?: string;
}

export class OpenRouterAgent extends BaseAgent {
  private config: OpenRouterAgentConfig;

  constructor(name: string, capabilities: AgentCapability[], config: OpenRouterAgentConfig) {
    super(name, capabilities);
    this.config = {
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      ...config
    };
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      const messages = [
        {
          role: 'system',
          content: this.config.systemPrompt || `You are ${this.name}. Capabilities: ${this.capabilities.join(', ')}.`
        },
        {
          role: 'user',
          content: task.goal
        }
      ];

      if (task.context) {
        messages.push({
          role: 'system',
          content: `Context: ${JSON.stringify(task.context)}`
        });
      }

      const response = await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://piata-ai.ro',
          'X-Title': 'Piata AI Orchestrator'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const resultText = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;

      return {
        status: 'success',
        output: resultText,
        metadata: {
          tokensUsed,
          model: this.config.model
        }
      };

    } catch (error: any) {
      return {
        status: 'error',
        error: error.message,
        output: null
      };
    }
  }
}
