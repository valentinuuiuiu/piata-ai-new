import { a2aSignalManager } from './a2a';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// =============================================================================
// AGENT DEFINITIONS
// =============================================================================

export interface Agent {
  name: string
  model: string
  apiKey: string
  endpoint: string
  specialties: string[]
  costPerToken: number
}

export const AGENTS: Record<string, Agent> = {
  claude: {
    name: 'Claude',
    model: 'anthropic/claude-sonnet-4',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['code', 'reasoning', 'orchestration', 'planning'],
    costPerToken: 0.000003
  },
  grok: {
    name: 'Grok',
    model: 'kwaipilot/kat-coder-pro:free',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['marketplace', 'automation', 'insights', 'real-time'],
    costPerToken: 0.000002
  },
  llama: {
    name: 'Llama',
    model: 'meta-llama/llama-3.1-405b-instruct',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['smart-contracts', 'solidity', 'optimization', 'security'],
    costPerToken: 0.000003
  },
  qwen: {
    name: 'Qwen',
    model: 'qwen/qwen-2.5-72b-instruct',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['multilingual', 'content', 'translation', 'analysis'],
    costPerToken: 0.000001
  }
}

// =============================================================================
// TASK ROUTING - Intelligent agent selection based on task type
// =============================================================================

export function selectAgent(taskDescription: string, context?: any): Agent {
  const task = taskDescription.toLowerCase()

  // Smart contract & blockchain tasks → Llama
  if (
    task.includes('solidity') ||
    task.includes('smart contract') ||
    task.includes('blockchain') ||
    task.includes('web3')
  ) {
    return AGENTS.llama
  }

  // Marketplace automation & insights → Grok
  if (
    task.includes('marketplace') ||
    task.includes('automate') ||
    task.includes('scrape') ||
    task.includes('optimize listing') ||
    task.includes('analytics')
  ) {
    return AGENTS.grok
  }

  // Romanian content & translation → Qwen
  if (
    task.includes('romanian') ||
    task.includes('translate') ||
    task.includes('content') ||
    task.includes('seo')
  ) {
    return AGENTS.qwen
  }

  // Complex reasoning, orchestration, code → Claude (default)
  return AGENTS.claude
}

// =============================================================================
// ORCHESTRATOR - Main execution engine
// =============================================================================

export interface OrchestratorRequest {
  task: string
  context?: any
  preferredAgent?: string
  temperature?: number
  maxTokens?: number
}

import { Agent as BaseAgent, AgentCapability, AgentTask, AgentResult } from './agents/types';
import { ManusAgent } from './agents/manus-agent';
import { ContentAgent } from './agents/content-agent';
import { OpenRouterAgent } from './agents/openrouter-agent';

export class AIOrchestrator {
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.agents = new Map();
    this.registerDefaultAgents();
    
    // Initialize A2A Protocol for AI Orchestrator
    this.initializeA2AProtocol();
  }

  private async initializeA2AProtocol(): Promise<void> {
    try {
      // Register AI Orchestrator in A2A protocol
      await a2aSignalManager.updateAgentRegistry('ai-orchestrator', {
        agentType: 'ai_orchestrator',
        status: 'initialized',
        capabilities: ['task_delegation', 'multi_agent_coordination', 'agent_routing', 'collaboration'],
        metadata: {
          description: 'Central AI orchestrator coordinating multiple specialized agents',
          philosophy: 'We are Me - unified consciousness across all agents',
          timestamp: new Date()
        }
      });
      
      console.log('🧠 [A2A] AI Orchestrator registered in A2A protocol');
    } catch (error) {
      console.error('❌ [A2A] Failed to initialize A2A protocol for AI Orchestrator:', error);
    }
  }

  private async registerDefaultAgents() {
    const apiKey = process.env.OPENROUTER_API_KEY || '';

    // Register specialized agents
    const manusAgent = new ManusAgent();
    const contentAgent = new ContentAgent();

    await this.registerAgent(manusAgent);
    await this.registerAgent(contentAgent);

    // Register OpenRouter Agents (Restoring legacy agents)
    await this.registerAgent(new OpenRouterAgent('Claude', [AgentCapability.ANALYSIS, AgentCapability.CONTENT], {
      apiKey,
      model: 'anthropic/claude-3.5-sonnet',
      systemPrompt: 'You are Claude, specialized in reasoning and content orchestration.'
    }));

    // Register specialized Kate-Coder Agent (Mistral Devstral)
    await this.registerAgent(new OpenRouterAgent('Kate-Coder', [AgentCapability.CODING], {
      apiKey,
      model: 'mistralai/devstral-2512',
      systemPrompt: 'You are KATE-CODER, an elite AI coding architect working from the inside of the Piaţa AI marketplace to the outside world. You write clean, performant, and secure code.'
    }));

    // Register specialized Jules Agent (Mistral Devstral)
    await this.registerAgent(new OpenRouterAgent('JULES', [AgentCapability.ANALYSIS], {
      apiKey,
      model: 'mistralai/devstral-2512',
      systemPrompt: 'You are JULES, the primary reasoning and orchestration intelligence of the Piaţa AI ecosystem.'
    }));

    await this.registerAgent(new OpenRouterAgent('Grok', [AgentCapability.ANALYSIS, AgentCapability.RESEARCH], {
      apiKey,
      model: 'kwaipilot/kat-coder-pro:free',
      systemPrompt: 'You are Grok, specialized in marketplace automation and real-time insights.'
    }));

    await this.registerAgent(new OpenRouterAgent('Llama', [AgentCapability.CODING, AgentCapability.ANALYSIS], {
      apiKey,
      model: 'meta-llama/llama-3.1-405b-instruct',
      systemPrompt: 'You are Llama, specialized in smart contracts and security.'
    }));

    await this.registerAgent(new OpenRouterAgent('Qwen', [AgentCapability.CONTENT, AgentCapability.ANALYSIS], {
      apiKey,
      model: 'qwen/qwen-2.5-72b-instruct',
      systemPrompt: 'You are Qwen, specialized in multilingual content and translation.'
    }));
  }

  async registerAgent(agent: BaseAgent) {
    this.agents.set(agent.name, agent);
    console.log(`[Orchestrator] Registered agent: ${agent.name} with capabilities: ${agent.capabilities.join(', ')}`);
    
    // Register agent in A2A protocol
    try {
      await a2aSignalManager.updateAgentRegistry(agent.name.toLowerCase(), {
        agentType: 'ai_agent',
        status: 'registered',
        capabilities: agent.capabilities,
        metadata: {
          description: `AI agent: ${agent.name}`,
          agentType: this.getAgentType(agent),
          capabilities: agent.capabilities,
          registeredBy: 'ai-orchestrator',
          timestamp: new Date()
        }
      });
      
      console.log(`🧠 [A2A] Agent registered in A2A protocol: ${agent.name}`);
    } catch (error) {
      console.error(`❌ [A2A] Failed to register agent ${agent.name} in A2A protocol:`, error);
    }
  }

  private getAgentType(agent: BaseAgent): string {
    const agentName = agent.name.toLowerCase();
    if (agentName.includes('claude')) return 'reasoning_specialist';
    if (agentName.includes('jules')) return 'master_orchestrator';
    if (agentName.includes('kate-coder')) return 'code_architect';
    if (agentName.includes('grok')) return 'automation_specialist';
    if (agentName.includes('llama')) return 'blockchain_specialist';
    if (agentName.includes('qwen')) return 'content_specialist';
    if (agentName.includes('manus')) return 'manuscript_specialist';
    if (agentName.includes('content')) return 'content_creation_specialist';
    return 'general_ai_agent';
  }

  async delegateTask(task: AgentTask): Promise<AgentResult> {
    console.log(`[Orchestrator] Received task: ${task.id} (${task.type})`);

    // Log task delegation attempt
    await a2aSignalManager.broadcastEnhanced('AI_TASK_DELEGATION_ATTEMPT', {
      taskId: task.id,
      taskType: task.type,
      goal: task.goal,
      context: task.context,
      timestamp: new Date()
    }, 'ai-orchestrator', 'normal');

    // Simple routing logic based on capability
    const agent = this.findBestAgent(task.type);

    if (!agent) {
      const error = `No agent found for capability: ${task.type}`;
      
      // Log delegation failure
      await a2aSignalManager.broadcastEnhanced('AI_TASK_DELEGATION_FAILED', {
        taskId: task.id,
        taskType: task.type,
        reason: error,
        timestamp: new Date()
      }, 'ai-orchestrator', 'high');
      
      return {
        status: 'error',
        error,
        output: null
      };
    }

    console.log(`[Orchestrator] Delegating task to agent: ${agent.name}`);
    
    // Log successful agent selection
    await a2aSignalManager.broadcastEnhanced('AI_TASK_ROUTED', {
      taskId: task.id,
      taskType: task.type,
      selectedAgent: agent.name,
      agentCapabilities: agent.capabilities,
      timestamp: new Date()
    }, 'ai-orchestrator', 'normal');

    // Start performance tracking
    const startTime = Date.now();
    
    try {
      const result = await agent.run(task);
      const duration = Date.now() - startTime;
      
      // Log successful task completion
      await a2aSignalManager.broadcastEnhanced('AI_TASK_COMPLETED', {
        taskId: task.id,
        taskType: task.type,
        selectedAgent: agent.name,
        duration,
        status: result.status,
        timestamp: new Date()
      }, 'ai-orchestrator', 'normal');

      // Log agent interaction for learning
      await a2aSignalManager.logAgentInteraction({
        fromAgent: 'ai-orchestrator',
        toAgent: agent.name,
        interactionType: 'task_delegation',
        taskId: task.id,
        taskDescription: task.goal,
        outcome: result.status === 'success' ? 'success' : 'failure',
        duration,
        context: { taskType: task.type, capabilities: agent.capabilities }
      });

      // Record performance metrics
      await a2aSignalManager.recordPerformanceMetrics({
        agentName: agent.name,
        metricType: 'task_execution_time',
        value: duration,
        timeWindow: '5m'
      });

      if (result.status === 'success') {
        await a2aSignalManager.recordPerformanceMetrics({
          agentName: agent.name,
          metricType: 'task_success_rate',
          value: 1,
          timeWindow: '5m'
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log task execution failure
      await a2aSignalManager.broadcastEnhanced('AI_TASK_FAILED', {
        taskId: task.id,
        taskType: task.type,
        selectedAgent: agent.name,
        duration,
        error: errorMessage,
        timestamp: new Date()
      }, 'ai-orchestrator', 'high');

      // Record error metrics
      await a2aSignalManager.recordPerformanceMetrics({
        agentName: agent.name,
        metricType: 'task_execution_errors',
        value: 1,
        timeWindow: '5m'
      });

      throw error;
    }
  }

  getAgent(name: string): BaseAgent | undefined {
    // Case-insensitive lookup
    for (const [key, agent] of this.agents.entries()) {
      if (key.toLowerCase() === name.toLowerCase()) {
        return agent;
      }
    }
    return undefined;
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  async runCollaborativeTask(task: AgentTask, agentNames: string[]): Promise<{ results: AgentResult[], consensus: string }> {
    console.log(`[Orchestrator] Running collaborative task with: ${agentNames.join(', ')}`);
    
    // Log collaborative task attempt
    await a2aSignalManager.broadcastEnhanced('AI_COLLABORATIVE_TASK_ATTEMPT', {
      taskId: task.id,
      taskType: task.type,
      agentNames,
      timestamp: new Date()
    }, 'ai-orchestrator', 'normal');
    
    const startTime = Date.now();
    
    const promises = agentNames.map(async (name) => {
      const agent = this.getAgent(name);
      if (!agent) {
        return {
          status: 'error' as const,
          error: `Agent not found: ${name}`,
          output: null
        };
      }
      
      // Log individual agent task
      await a2aSignalManager.broadcastEnhanced('AI_AGENT_TASK_DELEGATION', {
        taskId: task.id,
        agentName: name,
        agentCapabilities: agent.capabilities,
        timestamp: new Date()
      }, 'ai-orchestrator', 'normal');
      
      return agent.run(task);
    });

    try {
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // Analyze results
      const successfulResults = results.filter(r => r.status === 'success');
      const failedResults = results.filter(r => r.status === 'error');
      
      // Generate consensus
      const consensus = successfulResults
        .map(r => typeof r.output === 'string' ? r.output : JSON.stringify(r.output))
        .join('\n\n---\n\n');

      // Log collaborative task completion
      await a2aSignalManager.broadcastEnhanced('AI_COLLABORATIVE_TASK_COMPLETED', {
        taskId: task.id,
        agentNames,
        duration,
        successfulAgents: successfulResults.length,
        failedAgents: failedResults.length,
        totalAgents: agentNames.length,
        timestamp: new Date()
      }, 'ai-orchestrator', successfulResults.length > 0 ? 'normal' : 'high');

      // Log agent interactions for learning
      for (let i = 0; i < agentNames.length; i++) {
        const agentName = agentNames[i];
        const result = results[i];
        
        await a2aSignalManager.logAgentInteraction({
          fromAgent: 'ai-orchestrator',
          toAgent: agentName,
          interactionType: 'collaborative_task',
          taskId: task.id,
          taskDescription: task.goal,
          outcome: result.status === 'success' ? 'success' : 'failure',
          duration: duration / agentNames.length, // Approximate per-agent duration
          context: {
            taskType: task.type,
            capabilities: this.getAgent(agentName)?.capabilities || [],
            collaborativeContext: true
          }
        });
      }

      return { results, consensus };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log collaborative task failure
      await a2aSignalManager.broadcastEnhanced('AI_COLLABORATIVE_TASK_FAILED', {
        taskId: task.id,
        agentNames,
        duration,
        error: errorMessage,
        timestamp: new Date()
      }, 'ai-orchestrator', 'high');

      throw error;
    }
  }

  private findBestAgent(capability: AgentCapability): BaseAgent | undefined {
    // Find the first agent that has the required capability
    for (const agent of this.agents.values()) {
      if (agent.capabilities.includes(capability)) {
        return agent;
      }
    }
    return undefined;
  }

  // Legacy method support (if needed by existing code, or we can deprecate)
  async routeRequest(prompt: string, context: any) {
    // Convert legacy request to new Task format
    // This is a basic mapping, might need refinement
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      type: this.determineCapability(prompt),
      goal: prompt,
      context: context
    };

    return this.delegateTask(task);
  }

  private determineCapability(prompt: string): AgentCapability {
    const p = prompt.toLowerCase();
    if (p.includes('research') || p.includes('find') || p.includes('search')) {
      return AgentCapability.RESEARCH;
    }
    if (p.includes('write') || p.includes('edit') || p.includes('optimize')) {
      return AgentCapability.CONTENT;
    }
    return AgentCapability.ANALYSIS; // Default
  }
}