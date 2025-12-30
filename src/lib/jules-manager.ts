import { MCPClient } from './mcp-client';
import { OpenRouterAgent, KATE_CODER_AGENT, JULES_REASONING_AGENT, GROK_AGENT } from './openrouter-agent';
import { a2aSignalManager, a2aSignalFilter, a2aPerformanceDashboard } from './a2a';
import { UniversalDBManager } from './universal-db-mcp';
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
  private universalDBManager: UniversalDBManager | null = null;
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

    // Initialize Universal DB Manager
    try {
      this.universalDBManager = new UniversalDBManager();
    } catch (error) {
      console.error('[Jules] Failed to initialize UniversalDBManager:', error);
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
        name: 'GoogleSheets',
        type: 'mcp',
        scriptPath: path.join(this.baseDir, 'subagents/stripe-sheets-mcp-agent.sh'),
        enabled: true,
        description: 'The Data Organizer - manages Stripe payments and Google Sheets analytics'
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
        name: 'Kate-Coder',
        type: 'openrouter',
        model: 'mistralai/devstral-2512',
        enabled: this.openRouterConfig !== null,
        description: 'The Code Architect - expert elite coding from inside to outside'
      },
      {
        name: 'JULES',
        type: 'openrouter',
        model: 'mistralai/devstral-2512',
        enabled: this.openRouterConfig !== null,
        description: 'The Master Orchestrator - primary reasoning and strategy agent'
      },
      {
        name: 'Grok',
        type: 'openrouter',
        model: 'x-ai/grok-2-1212:free',
        enabled: this.openRouterConfig !== null,
        description: 'The Fast Thinker - rapid marketplace insights'
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

          // Register agent in A2A protocol
          await a2aSignalManager.updateAgentRegistry(subagent.name.toLowerCase(), {
            agentType: 'mcp_subagent',
            status: 'initialized',
            capabilities: ['task_execution', 'tool_calling'],
            metadata: { description: subagent.description, scriptPath: subagent.scriptPath }
          });
        } else if (subagent.type === 'openrouter') {
          // Register OpenRouter agents
          if (subagent.name === 'Kate-Coder') {
            this.openRouterAgents.set('kate-coder', KATE_CODER_AGENT);
          } else if (subagent.name === 'JULES') {
            this.openRouterAgents.set('jules', JULES_REASONING_AGENT);
          } else if (subagent.name === 'Grok') {
            this.openRouterAgents.set('grok', GROK_AGENT);
          }
          console.log(`[Jules] ✅ ${subagent.name} registered (OpenRouter: ${subagent.model})`);

          // Register OpenRouter agent in A2A protocol
          await a2aSignalManager.updateAgentRegistry(subagent.name.toLowerCase(), {
            agentType: 'llm_agent',
            status: 'initialized',
            capabilities: ['ai_reasoning', 'natural_language_processing'],
            metadata: { model: subagent.model, description: subagent.description }
          });
        }
      } catch (error) {
        console.error(`[Jules] ❌ Failed to register ${subagent.name}:`, error);
      }
    }

    // Initialize Universal DB Manager if available
    if (this.universalDBManager) {
      console.log('[Jules] ✅ Universal DB Manager initialized');
      try {
        // Register in A2A protocol
        await a2aSignalManager.updateAgentRegistry('universal_db', {
          agentType: 'db_mcp_agent',
          status: 'initialized',
          capabilities: ['database_query', 'sql_execution', 'parameterized_tools'],
          metadata: { description: 'Universal Database MCP Manager with dynamic SQL tools' }
        });
      } catch (error) {
        console.error('[Jules] Failed to register Universal DB in A2A:', error);
      }
    }

    // Log Jules Manager initialization as A2A broadcast
    await a2aSignalManager.broadcastEnhanced('JULES_INITIALIZED', {
      totalAgents: subagents.filter(s => s.enabled).length,
      agents: [...subagents.filter(s => s.enabled).map(s => s.name.toLowerCase()), 'universal_db'],
      timestamp: new Date()
    }, 'jules-manager', 'high');
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

    const startTime = Date.now();
    
    // Log A2A signal for tool call
    const signalContext = await a2aSignalManager.callAgentEnhanced(
      agentName.toLowerCase(),
      { tool: toolName, arguments: args },
      'jules-manager',
      'normal'
    );

    try {
      const result = await client.callTool(toolName, args);
      const duration = Date.now() - startTime;
      
      console.log(`[Jules] ${agentName}.${toolName} executed successfully`);
      
      // Complete A2A signal logging
      await signalContext.complete('success', result, undefined);
      
      // Record performance metrics
      await a2aSignalManager.recordPerformanceMetrics({
        agentName: agentName.toLowerCase(),
        metricType: 'tool_execution_time',
        value: duration,
        timeWindow: '5m'
      });
      
      // Log successful execution
      await a2aSignalManager.broadcastEnhanced('TOOL_EXECUTED', {
        agent: agentName.toLowerCase(),
        tool: toolName,
        duration,
        success: true,
        args: args
      }, 'jules-manager', 'normal');

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`[Jules] Error calling ${agentName}.${toolName}:`, error);
      
      // Complete A2A signal logging with failure
      await signalContext.complete('failure', undefined, errorMessage);
      
      // Record error metrics
      await a2aSignalManager.recordPerformanceMetrics({
        agentName: agentName.toLowerCase(),
        metricType: 'tool_execution_errors',
        value: 1,
        timeWindow: '5m'
      });
      
      // Log failure
      await a2aSignalManager.broadcastEnhanced('TOOL_FAILED', {
        agent: agentName.toLowerCase(),
        tool: toolName,
        duration,
        success: false,
        error: errorMessage,
        args: args
      }, 'jules-manager', 'high');

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
   * Execute a database tool using the Universal DB Manager
   */
  async executeDBTool(toolName: string, args: Record<string, any>): Promise<any> {
    if (!this.universalDBManager) {
      throw new Error('Universal DB Manager not initialized');
    }

    const startTime = Date.now();

    // Log the database tool execution attempt
    await a2aSignalManager.broadcastEnhanced('DB_TOOL_EXECUTION_ATTEMPT', {
      toolName,
      args,
      timestamp: new Date()
    }, 'jules-manager', 'normal');

    try {
      const result = await this.universalDBManager.executeTool(toolName, args);
      const duration = Date.now() - startTime;

      console.log(`[Jules] Database tool ${toolName} executed successfully`);

      // Log successful execution
      await a2aSignalManager.broadcastEnhanced('DB_TOOL_EXECUTED', {
        tool: toolName,
        duration,
        success: result.success,
        rowCount: result.rowCount,
        timestamp: new Date()
      }, 'jules-manager', 'normal');

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`[Jules] Error executing database tool ${toolName}:`, error);

      // Log failure
      await a2aSignalManager.broadcastEnhanced('DB_TOOL_FAILED', {
        tool: toolName,
        duration,
        success: false,
        error: errorMessage,
        timestamp: new Date()
      }, 'jules-manager', 'high');

      throw error;
    }
  }

  /**
   * Smart routing: automatically select the right subagent for a task
   */
  async executeTask(taskDescription: string, toolName?: string, args?: any): Promise<any> {
    const task = taskDescription.toLowerCase();

    // Log task routing attempt
    await a2aSignalManager.broadcastEnhanced('TASK_ROUTING_ATTEMPT', {
      task: taskDescription,
      toolName,
      args,
      timestamp: new Date()
    }, 'jules-manager', 'normal');

    // Route to KATE-CODER for coding tasks (TOON Optimized)
    if (task.includes('code') || task.includes('debug') || task.includes('function') ||
        task.includes('class') || task.includes('bug') || task.includes('optimize code')) {

      // TOON: Compact signal
      await a2aSignalManager.broadcastEnhanced('T_RTD', { t: 'kate-coder', r: 'code' }, 'jules-manager');

      return this.callOpenRouterAgent('kate-coder', taskDescription);
    }

    // Route to Grok for fast insights and automation (TOON Optimized)
    if (task.includes('analyze') || task.includes('insight') || task.includes('automate') ||
        task.includes('optimize listing') || task.includes('marketplace')) {

      await a2aSignalManager.broadcastEnhanced('T_RTD', { t: 'grok', r: 'auto' }, 'jules-manager');

      return this.callOpenRouterAgent('grok', taskDescription);
    }

    // Route to database for data-related tasks
    if (task.includes('database') || task.includes('db') || task.includes('query') ||
        task.includes('search') || task.includes('find') || task.includes('list') ||
        task.includes('get') || task.includes('select') || task.includes('user') ||
        task.includes('listing') || task.includes('product') || task.includes('data')) {
      console.log('[Jules] Routing to Universal DB Manager...');

      await a2aSignalManager.broadcastEnhanced('TASK_ROUTED', {
        task: taskDescription,
        routedTo: 'universal_db',
        reason: 'database_query',
        timestamp: new Date()
      }, 'jules-manager', 'normal');

      // If no specific tool is provided, use JULES to determine the best database tool
      if (!toolName) {
        console.log('[Jules] Using JULES to plan database query...');
        const planPrompt = `You are JULES, the orchestrator. The user wants to perform a database operation: "${taskDescription}".
        Available database tools:
        - search_users(query) - Search for users by name or email
        - get_active_listings(limit) - Get active marketplace listings
        - check_db_version() - Check the database version

        Respond ONLY with a JSON object in this format:
        {
          "toolName": "name_of_tool",
          "args": { "arg1": "value1", ... }
        }`;

        const planResult = await this.callOpenRouterAgent('jules', planPrompt);
        if (planResult.success) {
          try {
            const plan = JSON.parse(planResult.content.replace(/```json|```/g, '').trim());
            toolName = plan.toolName;
            args = plan.args;
            console.log(`[Jules] JULES planned database tool: ${toolName} with args:`, args);
          } catch (e) {
            console.error('[Jules] Failed to parse JULES database plan:', e);
            // Default to a search_users if we can't parse the plan
            toolName = 'search_users';
            args = { query: taskDescription };
          }
        } else {
          // Default to a search_users if JULES fails
          toolName = 'search_users';
          args = { query: taskDescription };
        }
      }

      await a2aSignalManager.logAgentInteraction({
        fromAgent: 'jules-manager',
        toAgent: 'universal_db',
        interactionType: 'task_execution',
        taskDescription,
        outcome: 'success',
        context: { toolName, args, reason: 'database_query' }
      });

      return this.executeDBTool(toolName, args);
    }

    // Route to Stripe for payment-related tasks
    if (task.includes('payment') || task.includes('stripe') || task.includes('charge') || task.includes('refund') || task.includes('invoice')) {
      console.log('[Jules] Routing to Stripe Agent...');

      await a2aSignalManager.broadcastEnhanced('TASK_ROUTED', {
        task: taskDescription,
        routedTo: 'stripe',
        reason: 'payment_operations',
        timestamp: new Date()
      }, 'jules-manager', 'normal');

      // If no specific tool is provided, use JULES to determine the best tool and arguments
      if (!toolName) {
        console.log('[Jules] Using JULES to plan Stripe task...');
        const planPrompt = `You are JULES, the orchestrator. The user wants to perform a Stripe operation: "${taskDescription}".
        Available Stripe tools:
        - create_customer(name, email)
        - list_customers(limit, email)
        - create_product(name, description)
        - list_products(limit)
        - create_price(product, unit_amount, currency)
        - list_prices(product, limit)
        - create_payment_link(price, quantity, redirect_url)
        - create_invoice(customer, days_until_due)
        - list_invoices(customer, limit)
        - create_invoice_item(customer, price, invoice)
        - finalize_invoice(invoice)
        - retrieve_balance()
        - create_refund(payment_intent, amount, reason)
        - list_payment_intents(customer, limit)
        - list_subscriptions(customer, price, status, limit)
        - cancel_subscription(subscription)
        - update_subscription(subscription, items, proration_behavior)
        - search_stripe_documentation(question, language)

        Respond ONLY with a JSON object in this format:
        {
          "toolName": "name_of_tool",
          "args": { "arg1": "value1", ... }
        }`;

        const planResult = await this.callOpenRouterAgent('jules', planPrompt);
        if (planResult.success) {
          try {
            const plan = JSON.parse(planResult.content.replace(/```json|```/g, '').trim());
            toolName = plan.toolName;
            args = plan.args;
            console.log(`[Jules] JULES planned tool: ${toolName} with args:`, args);
          } catch (e) {
            console.error('[Jules] Failed to parse JULES plan:', e);
          }
        }
      }

      await a2aSignalManager.logAgentInteraction({
        fromAgent: 'jules-manager',
        toAgent: 'stripe',
        interactionType: 'task_execution',
        taskDescription,
        outcome: 'success',
        context: { toolName: toolName || 'list_products', args, reason: 'payment_operations' }
      });

      return this.callTool('stripe', toolName || 'list_products', args || {});
    }

    // Route to Redis for cache/session tasks
    if (task.includes('cache') || task.includes('redis') || task.includes('session') || task.includes('store')) {
      console.log('[Jules] Routing to Redis Agent...');

      await a2aSignalManager.broadcastEnhanced('TASK_ROUTED', {
        task: taskDescription,
        routedTo: 'redis',
        reason: 'cache_management',
        timestamp: new Date()
      }, 'jules-manager', 'normal');

      await a2aSignalManager.logAgentInteraction({
        fromAgent: 'jules-manager',
        toAgent: 'redis',
        interactionType: 'task_execution',
        taskDescription,
        outcome: 'success',
        context: { toolName: toolName || 'get', args, reason: 'cache_management' }
      });

      return this.callTool('redis', toolName || 'get', args || {});
    }

    // Route to GitHub for repo tasks
    if (task.includes('github') || task.includes('repo') || task.includes('repository') || task.includes('commit')) {
      console.log('[Jules] Routing to GitHub Agent...');

      await a2aSignalManager.broadcastEnhanced('TASK_ROUTED', {
        task: taskDescription,
        routedTo: 'github',
        reason: 'repository_operations',
        timestamp: new Date()
      }, 'jules-manager', 'normal');

      await a2aSignalManager.logAgentInteraction({
        fromAgent: 'jules-manager',
        toAgent: 'github',
        interactionType: 'task_execution',
        taskDescription,
        outcome: 'success',
        context: { toolName: toolName || 'search_repositories', args, reason: 'repository_operations' }
      });

      return this.callTool('github', toolName || 'search_repositories', args || {});
    }

    // Log routing failure
    await a2aSignalManager.broadcastEnhanced('TASK_ROUTING_FAILED', {
      task: taskDescription,
      reason: 'no_suitable_agent',
      timestamp: new Date()
    }, 'jules-manager', 'high');

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

    // Check Universal DB Manager
    if (this.universalDBManager) {
      try {
        const dbStatus = await this.universalDBManager.healthCheck();
        status['universal_db'] = Object.values(dbStatus).every(s => s === true);
      } catch (error) {
        status['universal_db'] = false;
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

    // Close Universal DB Manager connections
    if (this.universalDBManager) {
      try {
        await this.universalDBManager.close();
        console.log('[Jules] ✅ Universal DB Manager connections closed');
      } catch (error) {
        console.error('[Jules] Failed to close Universal DB Manager:', error);
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