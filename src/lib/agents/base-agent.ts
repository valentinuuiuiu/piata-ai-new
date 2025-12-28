import { Agent, AgentCapability, AgentResult, AgentTask, AgentType } from './types';
import { withSpan, setAttribute, recordEvent } from '../tracing';

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
    return withSpan(`agent.${this.name}.execute`, async (span) => {
      console.log(`[Agent: ${this.name}] Starting task: ${task.id} - ${task.goal}`);
      
      // Set agent attributes
      setAttribute('agent.name', this.name);
      setAttribute('agent.type', this.type);
      setAttribute('agent.task.id', task.id);
      setAttribute('agent.task.goal', task.goal);
      setAttribute('agent.capabilities', this.capabilities.map(c => c));

      recordEvent('agent.task.started', { 
        agent: this.name, 
        taskId: task.id 
      });

      try {
        const result = await this.execute(task);
        
        setAttribute('agent.result.status', result.status);
        setAttribute('agent.result.success', result.status === 'success');
        
        recordEvent('agent.task.completed', { 
          agent: this.name, 
          taskId: task.id,
          status: result.status 
        });
        
        console.log(`[Agent: ${this.name}] Task completed: ${task.id}`);
        return result;
      } catch (error: any) {
        setAttribute('agent.error.message', error.message);
        
        recordEvent('agent.task.failed', { 
          agent: this.name, 
          taskId: task.id,
          error: error.message 
        });
        
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
    });
  }
}
