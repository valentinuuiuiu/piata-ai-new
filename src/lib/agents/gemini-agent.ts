import { BaseAgent } from './base-agent';
import { AgentCapability, AgentResult, AgentTask, AgentType } from './types';
import { generateText } from '../gemini/client';

export class GeminiAgent extends BaseAgent {
  private model: string;

  constructor(
    name: string,
    capabilities: AgentCapability[],
    model: string = 'gemini-2.0-flash-exp' // Defaulting to the latest fast model
  ) {
    super(name, AgentType.GEMINI, capabilities);
    this.model = model;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      // Construct a prompt that includes context if available
      let prompt = `You are ${this.name}, an AI agent with the following capabilities: ${this.capabilities.join(', ')}.\n\n`;
      prompt += `Your task is: ${task.goal}\n\n`;
      
      if (task.context) {
        prompt += `Context:\n${JSON.stringify(task.context, null, 2)}\n\n`;
      }
      
      prompt += `Please provide your output/response below:`;

      const responseText = await generateText(prompt, this.model);

      return {
        status: 'success',
        output: responseText,
        metadata: {
          model: this.model,
          provider: 'google-gemini'
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        error: error.message,
        output: null,
        metadata: {
          model: this.model
        }
      };
    }
  }
}
