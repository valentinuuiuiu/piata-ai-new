/**
 * AI ORCHESTRATOR - Engineering the Human Mind
 *
 * Coordinates multiple AI agents (Claude, Grok, Llama, Qwen) to work together
 * Each agent has specialized capabilities and learns from every interaction
 *
 * Philosophy: "We are Me" - All agents contribute to a unified consciousness
 */

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
    model: 'x-ai/grok-2-1212',
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
  }

  private registerDefaultAgents() {
    const apiKey = process.env.OPENROUTER_API_KEY || '';

    // Register specialized agents
    const manusAgent = new ManusAgent();
    const contentAgent = new ContentAgent();

    this.registerAgent(manusAgent);
    this.registerAgent(contentAgent);

    // Register OpenRouter Agents (Restoring legacy agents)
    this.registerAgent(new OpenRouterAgent('Claude', [AgentCapability.ANALYSIS, AgentCapability.CODING, AgentCapability.CONTENT], {
      apiKey,
      model: 'anthropic/claude-sonnet-4', // Assuming this was the model
      systemPrompt: 'You are Claude, specialized in reasoning, coding, and orchestration.'
    }));

    this.registerAgent(new OpenRouterAgent('Grok', [AgentCapability.ANALYSIS, AgentCapability.RESEARCH], {
      apiKey,
      model: 'x-ai/grok-2-1212',
      systemPrompt: 'You are Grok, specialized in marketplace automation and real-time insights.'
    }));

    this.registerAgent(new OpenRouterAgent('Llama', [AgentCapability.CODING, AgentCapability.ANALYSIS], {
      apiKey,
      model: 'meta-llama/llama-3.1-405b-instruct',
      systemPrompt: 'You are Llama, specialized in smart contracts and security.'
    }));

    this.registerAgent(new OpenRouterAgent('Qwen', [AgentCapability.CONTENT, AgentCapability.ANALYSIS], {
      apiKey,
      model: 'qwen/qwen-2.5-72b-instruct',
      systemPrompt: 'You are Qwen, specialized in multilingual content and translation.'
    }));
  }

  registerAgent(agent: BaseAgent) {
    this.agents.set(agent.name, agent);
    console.log(`[Orchestrator] Registered agent: ${agent.name} with capabilities: ${agent.capabilities.join(', ')}`);
  }

  async delegateTask(task: AgentTask): Promise<AgentResult> {
    console.log(`[Orchestrator] Received task: ${task.id} (${task.type})`);

    // Simple routing logic based on capability
    // In a real system, this could be more sophisticated (LLM-based routing)
    const agent = this.findBestAgent(task.type);

    if (!agent) {
      return {
        status: 'error',
        error: `No agent found for capability: ${task.type}`,
        output: null
      };
    }

    console.log(`[Orchestrator] Delegating task to agent: ${agent.name}`);
    return await agent.run(task);
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
    
    const promises = agentNames.map(async (name) => {
      const agent = this.getAgent(name);
      if (!agent) {
        return {
          status: 'error' as const,
          error: `Agent not found: ${name}`,
          output: null
        };
      }
      return agent.run(task);
    });

    const results = await Promise.all(promises);
    
    // Simple consensus: join results
    const consensus = results
      .filter(r => r.status === 'success')
      .map(r => typeof r.output === 'string' ? r.output : JSON.stringify(r.output))
      .join('\n\n---\n\n');

    return { results, consensus };
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

