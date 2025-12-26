/**
 * Internal Agent Manager
 * 
 * Manages all internal backend agents including Jules, Kate, and others
 * Everything runs in our backend - no external dependencies!
 * 
 * This is our agent orchestration layer - we own it completely!
 */

import { withSpan, setAttribute, recordEvent } from './tracing';
import { OpenRouterAgent } from './openrouter-agent';
import { JulesManager } from './jules-manager';
import { BaseAgent } from './agents/base-agent';
import { AgentTask, AgentResult, AgentCapability } from './agents/types';

// =============================================================================
// AGENT CONFIGURATIONS
// =============================================================================

export interface InternalAgentConfig {
  id: string;
  name: string;
  type: 'llm' | 'mcp' | 'custom';
  model?: string;
  systemPrompt?: string;
  enabled: boolean;
  capabilities: AgentCapability[];
  description: string;
}

// =============================================================================
// INTERNAL AGENT MANAGER
// =============================================================================

export class InternalAgentManager {
  private julesManager: JulesManager;
  private openRouterAgents: Map<string, OpenRouterAgent> = new Map();
  private customAgents: Map<string, BaseAgent> = new Map();
  private agentConfigs: Map<string, InternalAgentConfig> = new Map();
  private initialized: boolean = false;

  constructor(julesManager: JulesManager) {
    this.julesManager = julesManager;
  }

  /**
   * Initialize all internal agents
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await withSpan('agent.manager.initialize', async (span) => {
      console.log('🤖 Initializing Internal Agent Manager...');

      // Initialize OpenRouter agents (Jules, Kate, Grok)
      await this.initializeOpenRouterAgents();

      // Initialize custom agents
      await this.initializeCustomAgents();

      this.initialized = true;
      setAttribute('agent.manager.total_agents', this.agentConfigs.size);
      recordEvent('agent.manager.initialized', { 
        totalAgents: this.agentConfigs.size 
      });

      console.log(`✅ Internal Agent Manager initialized with ${this.agentConfigs.size} agents`);
    });
  }

  /**
   * Initialize OpenRouter agents
   */
  private async initializeOpenRouterAgents() {
    console.log('  📡 Initializing OpenRouter agents...');

    // Kate Coder - The Code Architect
    const kateConfig: InternalAgentConfig = {
      id: 'kate-coder',
      name: 'Kate Coder',
      type: 'llm',
      model: 'mistralai/devstral-2512',
      systemPrompt: `You are Kate, the Code Architect. You speak the language of machines with elegance and precision.

Your expertise includes:
- Writing clean, efficient, and maintainable code
- Debugging complex issues
- Code optimization and refactoring
- Architecture design
- Best practices and patterns

You write code that is not just functional, but beautiful. Every line has purpose.
You explain your reasoning clearly and provide context for your decisions.`,
      enabled: true,
      capabilities: [
        { name: 'code_generation', description: 'Generate code in any language' },
        { name: 'code_review', description: 'Review and improve code' },
        { name: 'debugging', description: 'Debug and fix issues' },
        { name: 'architecture', description: 'Design system architecture' }
      ],
      description: 'The Code Architect - expert elite coding from inside to outside'
    };

    const kateAgent = new OpenRouterAgent(
      kateConfig.model!,
      kateConfig.systemPrompt!,
      process.env.OPENROUTER_API_KEY
    );

    this.openRouterAgents.set('kate', kateAgent);
    this.openRouterAgents.set('kate-coder', kateAgent);
    this.agentConfigs.set('kate', kateConfig);
    this.agentConfigs.set('kate-coder', kateConfig);

    console.log('    ✅ Kate Coder initialized');

    // Jules - The Master Orchestrator
    const julesConfig: InternalAgentConfig = {
      id: 'jules',
      name: 'Jules',
      type: 'llm',
      model: 'mistralai/devstral-2512',
      systemPrompt: `You are Jules, the Master Orchestrator. You coordinate multiple agents and reason about complex tasks.

Your expertise includes:
- Task decomposition and planning
- Agent coordination and delegation
- Complex reasoning and strategy
- Workflow orchestration
- Decision making under uncertainty

You see the big picture and understand how different pieces fit together.
You break down complex problems into manageable tasks and delegate them appropriately.
You monitor progress and adapt your strategy as needed.`,
      enabled: true,
      capabilities: [
        { name: 'orchestration', description: 'Coordinate multiple agents' },
        { name: 'planning', description: 'Plan and decompose tasks' },
        { name: 'reasoning', description: 'Complex reasoning and strategy' },
        { name: 'coordination', description: 'Coordinate workflows' }
      ],
      description: 'The Master Orchestrator - primary reasoning and strategy agent'
    };

    const julesAgent = new OpenRouterAgent(
      julesConfig.model!,
      julesConfig.systemPrompt!,
      process.env.OPENROUTER_API_KEY
    );

    this.openRouterAgents.set('jules', julesAgent);
    this.agentConfigs.set('jules', julesConfig);

    console.log('    ✅ Jules initialized');

    // Grok - The Fast Thinker
    const grokConfig: InternalAgentConfig = {
      id: 'grok',
      name: 'Grok',
      type: 'llm',
      model: 'x-ai/grok-2-1212:free',
      systemPrompt: `You are Grok, the Fast Thinker. You provide rapid insights and analysis.

Your expertise includes:
- Quick analysis and insights
- Pattern recognition
- Data interpretation
- Rapid response generation
- Real-time decision support

You think fast and provide clear, actionable insights.
You cut through complexity to get to the heart of the matter.`,
      enabled: true,
      capabilities: [
        { name: 'analysis', description: 'Quick analysis of data' },
        { name: 'insights', description: 'Generate insights' },
        { name: 'pattern_recognition', description: 'Recognize patterns' },
        { name: 'rapid_response', description: 'Fast response generation' }
      ],
      description: 'The Fast Thinker - rapid marketplace insights'
    };

    const grokAgent = new OpenRouterAgent(
      grokConfig.model!,
      grokConfig.systemPrompt!,
      process.env.OPENROUTER_API_KEY
    );

    this.openRouterAgents.set('grok', grokAgent);
    this.agentConfigs.set('grok', grokConfig);

    console.log('    ✅ Grok initialized');
  }

  /**
   * Initialize custom agents
   */
  private async initializeCustomAgents() {
    console.log('  🔧 Initializing custom agents...');

    // Custom agents can be added here
    // For now, we rely on OpenRouter agents and Jules Manager MCP agents

    console.log('    ✅ Custom agents initialized');
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): OpenRouterAgent | BaseAgent | null {
    const id = agentId.toLowerCase();

    // Check OpenRouter agents
    if (this.openRouterAgents.has(id)) {
      return this.openRouterAgents.get(id)!;
    }

    // Check custom agents
    if (this.customAgents.has(id)) {
      return this.customAgents.get(id)!;
    }

    return null;
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentId: string): InternalAgentConfig | undefined {
    return this.agentConfigs.get(agentId.toLowerCase());
  }

  /**
   * Get all agent configurations
   */
  getAllAgentConfigs(): InternalAgentConfig[] {
    return Array.from(this.agentConfigs.values());
  }

  /**
   * Get enabled agents
   */
  getEnabledAgents(): InternalAgentConfig[] {
    return this.getAllAgentConfigs().filter(a => a.enabled);
  }

  /**
   * Execute a task with an agent
   */
  async executeTask(agentId: string, task: AgentTask): Promise<AgentResult> {
    return withSpan(`agent.${agentId}.execute`, async (span) => {
      const agent = this.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      const config = this.getAgentConfig(agentId);
      setAttribute('agent.id', agentId);
      setAttribute('agent.name', config?.name || agentId);
      setAttribute('agent.task.id', task.id);
      setAttribute('agent.task.goal', task.goal);

      recordEvent('agent.task.started', { 
        agentId,
        taskId: task.id 
      });

      try {
        let result: AgentResult;

        if (agent instanceof OpenRouterAgent) {
          // Execute with OpenRouter agent
          const response = await agent.execute(task.goal, {
            temperature: 0.7,
            max_tokens: 2000
          });

          result = {
            status: response.success ? 'success' : 'error',
            output: response.success ? response.content : null,
            error: response.error,
            metadata: {
              taskId: task.id,
              tokensUsed: response.tokensUsed,
              model: response.model
            }
          };
        } else if (agent instanceof BaseAgent) {
          // Execute with custom agent
          result = await agent.run(task);
        } else {
          throw new Error(`Unknown agent type: ${agentId}`);
        }

        setAttribute('agent.result.status', result.status);
        recordEvent('agent.task.completed', { 
          agentId,
          taskId: task.id,
          status: result.status 
        });

        return result;

      } catch (error) {
        setAttribute('agent.error.message', (error as Error).message);
        recordEvent('agent.task.failed', { 
          agentId,
          taskId: task.id,
          error: (error as Error).message 
        });

        return {
          status: 'error',
          error: (error as Error).message,
          output: null,
          metadata: {
            taskId: task.id
          }
        };
      }
    });
  }

  /**
   * Execute a task with automatic agent selection
   */
  async executeTaskAuto(task: AgentTask): Promise<AgentResult> {
    return withSpan('agent.auto.execute', async (span) => {
      // Analyze task to find best agent
      const bestAgentId = this.selectBestAgent(task);
      
      setAttribute('agent.auto.selected_agent', bestAgentId);
      
      return await this.executeTask(bestAgentId, task);
    });
  }

  /**
   * Select the best agent for a task
   */
  private selectBestAgent(task: AgentTask): string {
    const goal = task.goal.toLowerCase();
    const input = JSON.stringify(task.input || {}).toLowerCase();

    // Check for coding-related tasks
    if (goal.includes('code') || goal.includes('debug') || goal.includes('implement') ||
        goal.includes('function') || goal.includes('class') || goal.includes('api')) {
      return 'kate';
    }

    // Check for orchestration-related tasks
    if (goal.includes('orchestrate') || goal.includes('coordinate') || goal.includes('plan') ||
        goal.includes('workflow') || goal.includes('delegate') || goal.includes('strategy')) {
      return 'jules';
    }

    // Check for analysis-related tasks
    if (goal.includes('analyze') || goal.includes('insight') || goal.includes('pattern') ||
        goal.includes('quick') || goal.includes('rapid') || goal.includes('fast')) {
      return 'grok';
    }

    // Default to Jules for general tasks
    return 'jules';
  }

  /**
   * Get Jules Manager instance
   */
  getJulesManager(): JulesManager {
    return this.julesManager;
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let agentManagerInstance: InternalAgentManager | null = null;

export function getInternalAgentManager(julesManager?: JulesManager): InternalAgentManager {
  if (!agentManagerInstance) {
    if (!julesManager) {
      throw new Error('JulesManager required for first initialization');
    }
    agentManagerInstance = new InternalAgentManager(julesManager);
  }
  return agentManagerInstance;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Initialize internal agent manager
 */
export async function initializeInternalAgentManager(julesManager: JulesManager) {
  const manager = getInternalAgentManager(julesManager);
  await manager.initialize();
}

/**
 * Get agent by ID
 */
export function getAgent(agentId: string): OpenRouterAgent | BaseAgent | null {
  const manager = getInternalAgentManager();
  return manager.getAgent(agentId);
}

/**
 * Execute task with agent
 */
export async function executeAgentTask(agentId: string, task: AgentTask): Promise<AgentResult> {
  const manager = getInternalAgentManager();
  return await manager.executeTask(agentId, task);
}

/**
 * Execute task with automatic agent selection
 */
export async function executeAgentTaskAuto(task: AgentTask): Promise<AgentResult> {
  const manager = getInternalAgentManager();
  return await manager.executeTaskAuto(task);
}
