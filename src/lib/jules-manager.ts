import { MCPClient } from './mcp-client';
import { OpenRouterAgent, KATE_AGENT, GROK_AGENT } from './openrouter-agent';
import path from 'path';

/**
 * Jules Manager - Centralized Subagent Orchestration
 * 
 * Manages all MCP-based subagents (Stripe, Redis, GitHub)
 * and provides a unified interface for the AI Orchestrator.
 */

export interface SubagentConfig {
  name: string;
  scriptPath?: string;
  enabled: boolean;
  description: string;
  type: 'mcp' | 'openrouter';
  model?: string;
  apiEndpoint?: string;
}

export interface OpenRouterConfig {
  apiKey: string;
  endpoint: string;
}

export class JulesManager {
  private clients: Map<string, MCPClient> = new Map();
  private openRouterAgents: Map<string, OpenRouterAgent> = new Map();
  private openRouterConfig: OpenRouterConfig | null = null;
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.cwd();
    
    // Load OpenRouter configuration from environment
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    if (apiKey) {
      this.openRouterConfig = {
        apiKey,
        endpoint: 'https://openrouter.ai/api/v1/chat/completions'
      };
    }
  }

  /**
   * Initialize all subagents
   */
  async initialize() {
    const subagents: SubagentConfig[] = [
      // MCP-based tool agents
      {
        name: 'Stripe',
        type: 'mcp',
        scriptPath: path.join(this.baseDir, 'subagents/stripe-agent.sh'),
        enabled: true,
        description: 'The Financial Architect - handles payment operations'
      },
      {
        name: 'Redis',
        type: 'mcp',
        scriptPath: path.join(this.baseDir, 'subagents/redis-agent.sh'),
        enabled: true,
        description: 'The Memory Keeper - manages cache and sessions'
      },
      {
        name: 'GitHub',
        type: 'mcp',
        scriptPath: path.join(this.baseDir, 'subagents/github-agent.sh'),
        enabled: true,
        description: 'The Builder - handles repository operations'
      },
      // OpenRouter-based LLM agents
      {
        name: 'KATE',
        type: 'openrouter',
        model: 'kat-coder-pro:free',
        enabled: this.openRouterConfig !== null,
        description: 'The Code Specialist - expert coding assistant (Free via OpenRouter)'
      },
      {
        name: 'Grok',
        type: 'openrouter',
        model: 'x-ai/grok-2-1212:free',
        enabled: this.openRouterConfig !== null,
        description: 'The Fast Thinker - rapid insights and automation (Free via OpenRouter)'
      }
    ];

    console.log('[Jules] Initializing subagents...');

    for (const subagent of subagents) {
      if (!subagent.enabled) {
        console.log(`[Jules] Skipping ${subagent.name} (disabled)`);
        continue;
      }

      try {
        if (subagent.type === 'mcp' && subagent.scriptPath) {
          const client = new MCPClient(subagent.name, subagent.scriptPath, []);
          this.clients.set(subagent.name.toLowerCase(), client);
          console.log(`[Jules] ✅ ${subagent.name} registered (MCP)`);
        } else if (subagent.type === 'openrouter') {
          // Register OpenRouter agents
          if (subagent.name === 'KATE') {
            this.openRouterAgents.set('kate', KATE_AGENT);
          } else if (subagent.name === 'Grok') {
            this.openRouterAgents.set('grok', GROK_AGENT);
          }
          console.log(`[Jules] ✅ ${subagent.name} registered (OpenRouter: ${subagent.model})`);
        }
      } catch (error) {
        console.error(`[Jules] ❌ Failed to register ${subagent.name}:`, error);
      }
    }
  }

  /**
   * Connect to a specific subagent
   */
  async connect(agentName: string): Promise<boolean> {
    const client = this.clients.get(agentName.toLowerCase());
    if (!client) {
      console.error(`[Jules] Agent "${agentName}" not found`);
      return false;
    }

    try {
      await client.connect();
      return true;
    } catch (error) {
      console.error(`[Jules] Failed to connect to ${agentName}:`, error);
      return false;
    }
  }

  /**
   * Call a tool on a specific subagent
   */
  async callTool(agentName: string, toolName: string, args: any): Promise<any> {
    const client = this.clients.get(agentName.toLowerCase());
    if (!client) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    try {
      const result = await client.callTool(toolName, args);
      console.log(`[Jules] ${agentName}.${toolName} executed successfully`);
      return result;
    } catch (error) {
      console.error(`[Jules] Error calling ${agentName}.${toolName}:`, error);
      throw error;
    }
  }

  /**
   * List all available tools from a subagent
   */
  async listTools(agentName: string): Promise<any> {
    const client = this.clients.get(agentName.toLowerCase());
    if (!client) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    return await client.listTools();
  }

  /**
   * Call an OpenRouter agent directly
   */
  async callOpenRouterAgent(agentName: string, prompt: string, options?: any): Promise<any> {
    const agent = this.openRouterAgents.get(agentName.toLowerCase());
    if (!agent) {
      throw new Error(`OpenRouter agent "${agentName}" not found`);
    }

    return await agent.execute(prompt, options);
  }

  /**
   * Smart routing: automatically select the right subagent for a task
   */
  async executeTask(taskDescription: string, toolName?: string, args?: any): Promise<any> {
    const task = taskDescription.toLowerCase();

    // Route to KATE for coding tasks
    if (task.includes('code') || task.includes('debug') || task.includes('function') || 
        task.includes('class') || task.includes('bug') || task.includes('optimize code')) {
      console.log('[Jules] Routing to KATE (Code Specialist)...');
      return this.callOpenRouterAgent('kate', taskDescription);
    }

    // Route to Grok for fast insights and automation
    if (task.includes('analyze') || task.includes('insight') || task.includes('automate') ||
        task.includes('optimize listing') || task.includes('marketplace')) {
      console.log('[Jules] Routing to Grok (Fast Thinker)...');
      return this.callOpenRouterAgent('grok', taskDescription);
    }

    // Route to Stripe for payment-related tasks
    if (task.includes('payment') || task.includes('stripe') || task.includes('charge') || task.includes('refund')) {
      console.log('[Jules] Routing to Stripe Agent...');
      return this.callTool('stripe', toolName || 'list_products', args || {});
    }

    // Route to Redis for cache/session tasks
    if (task.includes('cache') || task.includes('redis') || task.includes('session') || task.includes('store')) {
      console.log('[Jules] Routing to Redis Agent...');
      return this.callTool('redis', toolName || 'get', args || {});
    }

    // Route to GitHub for repo tasks
    if (task.includes('github') || task.includes('repo') || task.includes('repository') || task.includes('commit')) {
      console.log('[Jules] Routing to GitHub Agent...');
      return this.callTool('github', toolName || 'search_repositories', args || {});
    }

    throw new Error('No suitable subagent found for this task');
  }

  /**
   * Health check: verify all agents are responsive
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    // Check MCP agents
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.connect();
        status[name] = true;
      } catch (error) {
        status[name] = false;
      }
    }

    // Check OpenRouter agents
    for (const [name, agent] of this.openRouterAgents.entries()) {
      try {
        const result = await agent.execute('ping', { max_tokens: 10 });
        status[name] = result.success;
      } catch (error) {
        status[name] = false;
      }
    }

    return status;
  }

  /**
   * Close all connections
   */
  async shutdown() {
    console.log('[Jules] Shutting down all subagents...');
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.close();
        console.log(`[Jules] ✅ ${name} disconnected`);
      } catch (error) {
        console.error(`[Jules] Failed to disconnect ${name}:`, error);
      }
    }
  }
}

// Singleton instance
let julesInstance: JulesManager | null = null;

export function getJulesManager(): JulesManager {
  if (!julesInstance) {
    julesInstance = new JulesManager();
  }
  return julesInstance;
}
