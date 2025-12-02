import { Agent, AgentCapability, AgentResult, AgentTask, AgentType } from './types';

export abstract class BaseAgent implements Agent {
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];

  constructor(name: string, type: AgentType, capabilities: AgentCapability[]) {
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
  }

  abstract execute(task: AgentTask): Promise<AgentResult>;

  async run(task: AgentTask): Promise<AgentResult> {
    console.log(`[Agent: ${this.name}] Starting task: ${task.id} - ${task.goal}`);
    try {
      const result = await this.execute(task);
      console.log(`[Agent: ${this.name}] Task completed: ${task.id}`);
      return result;
    } catch (error: any) {
      console.error(`[Agent: ${this.name}] Task failed: ${task.id}`, error);
      return {
        status: 'error',
        error: error.message || String(error),
        output: null,
        metadata: {
          taskId: task.id
        }
      };
    }
  }
}
