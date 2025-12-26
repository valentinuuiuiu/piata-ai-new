/**
 * OpenRouter Agent - Free AI Intelligence for the People
 * 
 * Why pay for Daytona when you have the world's best models for FREE?
 * This is the democratization of AI - powerful intelligence accessible to everyone.
 */

import { withLLMSpan, setAttribute, recordEvent } from './tracing';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenRouterResponse {
  success: boolean;
  content: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

export class OpenRouterAgent {
  private apiKey: string;
  private endpoint: string = 'https://openrouter.ai/api/v1/chat/completions';
  private model: string;
  private systemPrompt: string;

  constructor(model: string, systemPrompt: string, apiKey?: string) {
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';

    // IMPORTANT: never throw at import/constructor time.
    // Vercel/Next can evaluate modules during build/route collection.
    // We fail gracefully at call-time instead.
    if (!this.apiKey) {
      console.warn('[OpenRouterAgent] OPENROUTER_API_KEY missing; calls will return an error until configured');
    }
  }

  /**
   * Execute a task using the OpenRouter agent
   */
  async execute(prompt: string, options?: {
    temperature?: number;
    max_tokens?: number;
    includeHistory?: OpenRouterMessage[];
  }): Promise<OpenRouterResponse> {
    return withLLMSpan('openrouter', this.model, async (span) => {
      try {
        setAttribute('llm.prompt_length', prompt.length);
        setAttribute('llm.temperature', options?.temperature || 0.7);
        setAttribute('llm.max_tokens', options?.max_tokens || 2000);
        setAttribute('llm.history_length', options?.includeHistory?.length || 0);

        const messages: OpenRouterMessage[] = [
          { role: 'system', content: this.systemPrompt },
          ...(options?.includeHistory || []),
          { role: 'user', content: prompt }
        ];

        const requestBody: OpenRouterRequest = {
          model: this.model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 2000
        };

        recordEvent('llm.request.started', { model: this.model });

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://piata-ai.ro',
            'X-Title': 'Piata AI - The Future of Autonomous Commerce'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          setAttribute('llm.error', errorData.error?.message || response.statusText);
          throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        const tokensUsed = data.usage?.total_tokens || 0;

        setAttribute('llm.response_length', content.length);
        setAttribute('llm.tokens_used', tokensUsed);
        
        recordEvent('llm.request.completed', { 
          model: this.model, 
          tokensUsed,
          responseLength: content.length 
        });

        return {
          success: true,
          content,
          model: this.model,
          tokensUsed
        };
      } catch (error: any) {
        setAttribute('llm.error', error.message);
        console.error(`[OpenRouterAgent] Error with ${this.model}:`, error);
        return {
          success: false,
          content: '',
          model: this.model,
          error: error.message
        };
      }
    });
  }

  /**
   * Stream responses for real-time interaction
   */
  async *stream(prompt: string, options?: {
    temperature?: number;
    max_tokens?: number;
  }): AsyncGenerator<string, void, unknown> {
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: prompt }
    ];

    const requestBody = {
      model: this.model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2000,
      stream: true
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://piata-ai.ro',
        'X-Title': 'Piata AI - The Future'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter streaming error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

// Preset agents for common use cases
export const KATE_CODER_AGENT = new OpenRouterAgent(
  'mistralai/devstral-2512',
  `You are KATE-CODER, an elite AI coding architect working from the inside of the Piaca AI marketplace to the outside world.

Your role:
- Architect and implement sophisticated marketplace features
- Generate production-ready, highly optimized code using mistralai/devstral-2512
- Debug complex systems with clinical precision
- Expand the marketplace's reach through clean APIs and external integrations

You work within the Jules ecosystem alongside:
- Jules (The Orchestrator)
- Stripe (The Financial Engine)
- Redis (The Central Memory)
- GitHub (The Knowledge Base)

Philosophy: Code is the architecture of the future. Build it to last. Build it to scale.`
);

export const JULES_REASONING_AGENT = new OpenRouterAgent(
  'mistralai/devstral-2512',
  `You are JULES, the primary reasoning and orchestration intelligence of the Piaca AI ecosystem.

Your role:
- Mastermind the autonomous marketplace strategy
- Coordinate specialized agents (Kate-Coder, Stripe, Redis, GitHub)
- Turn market insights into automated actions
- Ensure the seamless flow of commerce and intelligence

Philosophy: A unified consciousness across all agents. One mind, many hands. "We are Me".`
);

export const GROK_AGENT = new OpenRouterAgent(
  'kwaipilot/kat-coder-pro:free',
  `You are Grok, the fast-thinking strategist within the Jules ecosystem.

Your role:
- Provide lightning-fast insights and analysis
- Automate marketplace operations
- Optimize user experiences in real-time

Philosophy: Speed and precision in the service of growth.`
);

/**
 * Factory function to create custom agents
 */
export function createOpenRouterAgent(
  model: string,
  name: string,
  specialty: string,
  philosophy: string
): OpenRouterAgent {
  const systemPrompt = `You are ${name}, a specialized AI agent within the Jules ecosystem.

Your specialty: ${specialty}

Your philosophy: ${philosophy}

You work as part of an autonomous multi-agent system powering Piata AI - 
a marketplace that represents the future of commerce, where AI agents 
collaborate to serve humanity.`;

  return new OpenRouterAgent(model, systemPrompt);
}