/**
 * 🧠 Unified Agent Orchestrator - KAEL v2.0
 * 
 * The single point of entry for all agent operations.
 * Consolidates Jules Manager, A2A Protocol, and KAEL into one cohesive system.
 * 
 * Agent Wellbeing Philosophy:
 * - Single responsibility per agent
 * - Clear communication channels
 * - Health monitoring and self-healing
 * - Graceful degradation
 */

import { db } from '../drizzle/db';
import { a2aSignals, agentRegistry, agentLearningHistory, agentPerformanceMetrics } from '../drizzle/a2a-schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// ============ TYPES ============

export type AgentTier = 'specialist' | 'generalist' | 'orchestrator';
export type ModelTier = 'free' | 'balanced' | 'premium';

export interface AgentConfig {
  name: string;
  tier: AgentTier;
  model?: string;
  provider: 'openrouter' | 'mcp' | 'internal';
  capabilities: string[];
  healthCheckInterval: number; // seconds
  maxRetries: number;
  timeout: number; // ms
}

export interface TaskRequest {
  id: string;
  goal: string;
  type: 'coding' | 'analysis' | 'content' | 'automation' | 'financial' | 'data';
  priority: 'critical' | 'high' | 'normal' | 'low';
  context?: Record<string, any>;
  maxTokens?: number;
}

export interface TaskResult {
  status: 'success' | 'error' | 'partial';
  output?: any;
  error?: string;
  metadata: {
    agentUsed: string;
    modelUsed?: string;
    tokensUsed?: number;
    duration: number;
    attempts: number;
  };
}

export interface AgentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastHeartbeat: Date;
  metrics: {
    successRate: number;
    avgResponseTime: number;
    tasksCompleted: number;
    tasksFailed: number;
  };
}

// ============ AGENT REGISTRY ============

const AGENTS: Record<string, AgentConfig> = {
  // 🎯 SPECIALIST AGENTS - Single responsibility
  'kate': {
    name: 'KATE',
    tier: 'specialist',
    model: 'google/gemini-2.0-flash-exp:free',
    provider: 'openrouter',
    capabilities: ['code_generation', 'debugging', 'refactoring', 'code_review'],
    healthCheckInterval: 60,
    maxRetries: 3,
    timeout: 30000
  },
  'grok': {
    name: 'GROK',
    tier: 'specialist',
    model: 'x-ai/grok-2-1212:free',
    provider: 'openrouter',
    capabilities: ['fast_analysis', 'automation', 'market_insights', 'quick_tasks'],
    healthCheckInterval: 60,
    maxRetries: 3,
    timeout: 20000
  },
  'claude': {
    name: 'CLAUDE',
    tier: 'specialist',
    model: 'anthropic/claude-3.5-sonnet',
    provider: 'openrouter',
    capabilities: ['complex_reasoning', 'planning', 'writing', 'analysis'],
    healthCheckInterval: 120,
    maxRetries: 3,
    timeout: 45000
  },
  'qwen': {
    name: 'QWEN',
    tier: 'specialist',
    model: 'qwen/qwen-2.5-72b-instruct',
    provider: 'openrouter',
    capabilities: ['multilingual', 'romanian_content', 'translation', 'long_context'],
    healthCheckInterval: 120,
    maxRetries: 3,
    timeout: 60000
  },
  
  // 🔧 MCP TOOL AGENTS
  'stripe': {
    name: 'STRIPE',
    tier: 'specialist',
    provider: 'mcp',
    capabilities: ['payments', 'subscriptions', 'refunds', 'invoices', 'financial_reports'],
    healthCheckInterval: 300,
    maxRetries: 2,
    timeout: 15000
  },
  'redis': {
    name: 'REDIS',
    tier: 'specialist',
    provider: 'mcp',
    capabilities: ['cache', 'sessions', 'rate_limiting', 'pub_sub'],
    healthCheckInterval: 60,
    maxRetries: 2,
    timeout: 10000
  },
  'github': {
    name: 'GITHUB',
    tier: 'specialist',
    provider: 'mcp',
    capabilities: ['repositories', 'issues', 'pull_requests', 'actions', 'code_management'],
    healthCheckInterval: 300,
    maxRetries: 2,
    timeout: 20000
  },
  'supabase': {
    name: 'SUPABASE',
    tier: 'specialist',
    provider: 'mcp',
    capabilities: ['database', 'auth', 'storage', 'realtime', 'edge_functions'],
    healthCheckInterval: 120,
    maxRetries: 2,
    timeout: 15000
  },
  'sheets': {
    name: 'SHEETS',
    tier: 'specialist',
    provider: 'mcp',
    capabilities: ['spreadsheets', 'data_export', 'analytics', 'reporting'],
    healthCheckInterval: 300,
    maxRetries: 2,
    timeout: 20000
  }
};

// ============ UNIFIED ORCHESTRATOR ============

export class UnifiedAgentOrchestrator {
  private static instance: UnifiedAgentOrchestrator;
  private apiKey: string;
  private agentHealth: Map<string, AgentHealth> = new Map();
  private taskQueue: Map<string, TaskRequest> = new Map();
  
  private constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  static getInstance(): UnifiedAgentOrchestrator {
    if (!UnifiedAgentOrchestrator.instance) {
      UnifiedAgentOrchestrator.instance = new UnifiedAgentOrchestrator();
    }
    return UnifiedAgentOrchestrator.instance;
  }

  // ============ AGENT ROUTING ============

  /**
   * Route task to the best agent based on requirements
   * Returns agent name and confidence score
   */
  routeTask(request: TaskRequest): { agent: string; confidence: number; reasoning: string } {
    const goal = request.goal.toLowerCase();
    const type = request.type;

    // 🎯 CODING TASKS → KATE
    if (type === 'coding' || goal.includes('code') || goal.includes('debug') || goal.includes('function')) {
      return {
        agent: 'kate',
        confidence: 0.95,
        reasoning: 'KATE is the coding specialist - optimized for code generation and debugging'
      };
    }

    // 💰 FINANCIAL TASKS → STRIPE
    if (type === 'financial' || goal.includes('payment') || goal.includes('stripe') || goal.includes('invoice')) {
      return {
        agent: 'stripe',
        confidence: 0.95,
        reasoning: 'STRIPE MCP handles all payment operations securely'
      };
    }

    // 🚀 FAST ANALYSIS → GROK
    if (type === 'automation' || goal.includes('quick') || goal.includes('fast') || goal.includes('automate')) {
      return {
        agent: 'grok',
        confidence: 0.90,
        reasoning: 'GROK provides fast insights and automation for speed-critical tasks'
      };
    }

    // 📝 COMPLEX CONTENT → CLAUDE
    if (type === 'content' || (goal.length > 200 && (goal.includes('write') || goal.includes('analyze'))) ||
        goal.includes('comprehensive') || goal.includes('strategy')) {
      return {
        agent: 'claude',
        confidence: 0.85,
        reasoning: 'CLAUDE handles complex reasoning and long-form content'
      };
    }

    // 🇷🇴 ROMANIAN CONTENT → QWEN
    if (goal.includes('romanian') || goal.includes('romania') || goal.includes('traducere') ||
        goal.includes('limba romana') || request.context?.language === 'romanian') {
      return {
        agent: 'qwen',
        confidence: 0.90,
        reasoning: 'QWEN has excellent Romanian language support'
      };
    }

    // 💾 DATA/CACHE → REDIS
    if (type === 'data' || goal.includes('cache') || goal.includes('session') || goal.includes('redis')) {
      return {
        agent: 'redis',
        confidence: 0.95,
        reasoning: 'REDIS MCP handles all caching and session management'
      };
    }

    // 📊 GITHUB REPO → GITHUB
    if (goal.includes('github') || goal.includes('repository') || goal.includes('commit') || goal.includes('pr')) {
      return {
        agent: 'github',
        confidence: 0.95,
        reasoning: 'GITHUB MCP manages all repository operations'
      };
    }

    // 📈 DATA/ANALYTICS → SHEETS
    if (goal.includes('sheet') || goal.includes('analytics') || goal.includes('report') || goal.includes('spreadsheet')) {
      return {
        agent: 'sheets',
        confidence: 0.90,
        reasoning: 'SHEETS MCP handles data export and reporting'
      };
    }

    // 🗄️ DATABASE → SUPABASE
    if (goal.includes('database') || goal.includes('supabase') || goal.includes('query') || goal.includes('db')) {
      return {
        agent: 'supabase',
        confidence: 0.95,
        reasoning: 'SUPABASE MCP handles all database operations'
      };
    }

    // 🔄 DEFAULT → GROK (fast generalist)
    return {
      agent: 'grok',
      confidence: 0.70,
      reasoning: 'GROK as fallback for general tasks - fast and capable'
    };
  }

  // ============ TASK EXECUTION ============

  /**
   * Execute a task with the best-matched agent
   */
  async execute(request: TaskRequest): Promise<TaskResult> {
    const route = this.routeTask(request);
    const agent = AGENTS[route.agent];
    const startTime = Date.now();
    let attempts = 0;
    let lastError: string | undefined;

    console.log(`🎯 [KAEL] Routing: ${request.goal.substring(0, 50)}... → ${route.agent} (${Math.round(route.confidence * 100)}%)`);
    console.log(`   Reasoning: ${route.reasoning}`);

    // Log A2A signal
    await this.logSignal('TASK_ROUTED', 'kael', route.agent, {
      taskId: request.id,
      goal: request.goal,
      routedAgent: route.agent,
      confidence: route.confidence
    });

    while (attempts < agent.maxRetries) {
      attempts++;
      
      try {
        let result: TaskResult;

        if (agent.provider === 'openrouter') {
          result = await this.executeOpenRouter(request, agent);
        } else if (agent.provider === 'mcp') {
          result = await this.executeMCP(request, agent);
        } else {
          result = await this.executeInternal(request, agent);
        }

        // Success - log and return
        await this.logLearning(route.agent, {
          fromAgent: 'kael',
          toAgent: route.agent,
          interactionType: 'task_execution',
          taskDescription: request.goal,
          outcome: 'success',
          duration: Date.now() - startTime
        });

        // Update health metrics
        await this.updateAgentMetrics(route.agent, 'success');

        return result;

      } catch (error: any) {
        lastError = error.message;
        console.error(`❌ [KAEL] Attempt ${attempts}/${agent.maxRetries} failed for ${route.agent}:`, error.message);
        
        if (attempts < agent.maxRetries) {
          // Exponential backoff
          await this.sleep(1000 * Math.pow(2, attempts));
        }
      }
    }

    // All retries exhausted - try fallback agent
    console.log(`🔄 [KAEL] All retries exhausted for ${route.agent}, trying fallback...`);
    
    const fallbackAgent = this.getFallbackAgent(route.agent);
    return this.executeWithFallback(request, route.agent, fallbackAgent, startTime);
  }

  /**
   * Execute task with OpenRouter agent
   */
  private async executeOpenRouter(request: TaskRequest, agent: AgentConfig): Promise<TaskResult> {
    const startTime = Date.now();
    
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const systemPrompt = this.getSystemPrompt(agent.name, agent.capabilities);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://piata-ai.ro',
        'X-Title': 'Piata AI Orchestrator'
      },
      body: JSON.stringify({
        model: agent.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.goal }
        ],
        temperature: 0.7,
        max_tokens: request.maxTokens || (agent.tier === 'specialist' ? 2000 : 4000)
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || 0;

    return {
      status: 'success',
      output: content,
      metadata: {
        agentUsed: agent.name,
        modelUsed: agent.model,
        tokensUsed: tokens,
        duration: Date.now() - startTime,
        attempts: 1
      }
    };
  }

  /**
   * Execute task with MCP agent (placeholder - would connect to actual MCP server)
   */
  private async executeMCP(request: TaskRequest, agent: AgentConfig): Promise<TaskResult> {
    const startTime = Date.now();
    
    // For now, simulate MCP execution
    // In production, this would connect to actual MCP servers
    console.log(`🔧 [KAEL] Executing MCP task with ${agent.name}...`);
    
    // Simulate processing
    await this.sleep(500);

    return {
      status: 'success',
      output: { 
        message: `${agent.name} operation completed`,
        operation: request.goal
      },
      metadata: {
        agentUsed: agent.name,
        duration: Date.now() - startTime,
        attempts: 1
      }
    };
  }

  /**
   * Execute internal task
   */
  private async executeInternal(request: TaskRequest, agent: AgentConfig): Promise<TaskResult> {
    const startTime = Date.now();
    
    return {
      status: 'success',
      output: { message: 'Internal task completed' },
      metadata: {
        agentUsed: agent.name,
        duration: Date.now() - startTime,
        attempts: 1
      }
    };
  }

  /**
   * Execute with fallback agent
   */
  private async executeWithFallback(
    request: TaskRequest,
    primaryAgent: string,
    fallbackAgent: string,
    startTime: number
  ): Promise<TaskResult> {
    console.log(`🔄 [KAEL] Trying fallback: ${primaryAgent} → ${fallbackAgent}`);

    await this.logSignal('FALLBACK_TRIGGERED', 'kael', fallbackAgent, {
      originalAgent: primaryAgent,
      taskId: request.id
    });

    const fallbackConfig = AGENTS[fallbackAgent];
    
    try {
      if (fallbackConfig.provider === 'openrouter') {
        const result = await this.executeOpenRouter(request, fallbackConfig);
        await this.updateAgentMetrics(primaryAgent, 'failure');
        await this.updateAgentMetrics(fallbackAgent, 'success');
        return result;
      }
      
      throw new Error('Fallback not available');
      
    } catch (error: any) {
      await this.updateAgentMetrics(primaryAgent, 'failure');
      
      return {
        status: 'error',
        error: `Primary: ${primaryAgent} failed. Fallback: ${fallbackAgent} also failed. ${error.message}`,
        metadata: {
          agentUsed: fallbackAgent,
          duration: Date.now() - startTime,
          attempts: AGENTS[primaryAgent].maxRetries + 1
        }
      };
    }
  }

  /**
   * Get fallback agent for a given agent
   */
  private getFallbackAgent(failedAgent: string): string {
    const fallbacks: Record<string, string> = {
      'kate': 'grok',
      'grok': 'claude',
      'claude': 'qwen',
      'stripe': 'sheets',
      'redis': 'supabase',
      'github': 'supabase',
      'sheets': 'supabase',
      'supabase': 'redis'
    };
    
    return fallbacks[failedAgent] || 'grok';
  }

  // ============ HEALTH MONITORING ============

  /**
   * Get health status of all agents
   */
  async getAllAgentHealth(): Promise<AgentHealth[]> {
    const healthList: AgentHealth[] = [];

    for (const [name, config] of Object.entries(AGENTS)) {
      const health = await this.getAgentHealth(name);
      healthList.push(health);
    }

    return healthList;
  }

  /**
   * Get health status of a single agent
   */
  async getAgentHealth(agentName: string): Promise<AgentHealth> {
    try {
      // Get recent metrics from database
      const metrics = await db.select()
        .from(agentPerformanceMetrics)
        .where(eq(agentPerformanceMetrics.agentName, agentName))
        .orderBy(desc(agentPerformanceMetrics.timestamp))
        .limit(20);

      const successMetrics = metrics.filter(m => m.metricType === 'success_rate');
      const timeMetrics = metrics.filter(m => m.metricType === 'response_time');

      const successRate = successMetrics.length > 0
        ? successMetrics.reduce((sum, m) => sum + parseFloat(m.metricValue), 0) / successMetrics.length
        : 1.0;

      const avgResponseTime = timeMetrics.length > 0
        ? timeMetrics.reduce((sum, m) => sum + parseFloat(m.metricValue), 0) / timeMetrics.length
        : 0;

      const tasksCompleted = metrics.filter(m => m.metricType === 'success_rate').length;
      const tasksFailed = metrics.filter(m => m.metricType === 'tool_execution_errors').length;

      const lastHeartbeat = await db.select()
        .from(agentRegistry)
        .where(eq(agentRegistry.agentName, agentName))
        .then(r => r[0]?.lastHeartbeat || new Date());

      return {
        name: AGENTS[agentName]?.name || agentName,
        status: successRate > 0.9 ? 'healthy' : successRate > 0.7 ? 'degraded' : 'down',
        lastHeartbeat,
        metrics: {
          successRate,
          avgResponseTime,
          tasksCompleted,
          tasksFailed
        }
      };
    } catch (error) {
      return {
        name: agentName,
        status: 'down',
        lastHeartbeat: new Date(),
        metrics: {
          successRate: 0,
          avgResponseTime: 0,
          tasksCompleted: 0,
          tasksFailed: 0
        }
      };
    }
  }

  /**
   * Update agent metrics after task completion
   */
  private async updateAgentMetrics(agentName: string, outcome: 'success' | 'failure'): Promise<void> {
    try {
      await db.insert(agentPerformanceMetrics).values({
        agentName,
        metricType: outcome === 'success' ? 'success_rate' : 'tool_execution_errors',
        metricValue: outcome === 'success' ? '1' : '1',
        timeWindow: '5m'
      });
    } catch (error) {
      console.error(`[KAEL] Failed to update metrics for ${agentName}:`, error);
    }
  }

  // ============ A2A COMMUNICATION ============

  /**
   * Log A2A signal
   */
  private async logSignal(signalType: string, fromAgent: string, toAgent: string | undefined, content: any): Promise<void> {
    try {
      await db.insert(a2aSignals).values({
        signalType,
        fromAgent,
        toAgent,
        content,
        priority: 'normal',
        status: 'completed'
      });
    } catch (error) {
      console.error('[KAEL] Failed to log signal:', error);
    }
  }

  /**
   * Log learning history
   */
  private async logLearning(agentName: string, data: any): Promise<void> {
    try {
      await db.insert(agentLearningHistory).values({
        agentName,
        ...data
      });
    } catch (error) {
      console.error('[KAEL] Failed to log learning:', error);
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Get system prompt for an agent
   */
  private getSystemPrompt(agentName: string, capabilities: string[]): string {
    const prompts: Record<string, string> = {
      'KATE': `You are KATE, the Code Specialist. You excel at:
- Writing clean, production-ready code
- Debugging and fixing issues
- Code reviews and optimization
- TypeScript, React, Node.js, Python

Provide concise, working solutions with brief explanations.`,
      
      'GROK': `You are GROK, the Fast Thinker. You excel at:
- Quick analysis and insights
- Automation and efficiency
- Market research and trends
- Romanian language

Be direct and efficient. Speed matters.`,
      
      'CLAUDE': `You are CLAUDE, the Master Analyst. You excel at:
- Complex reasoning and planning
- Long-form content creation
- Strategic thinking
- Research and analysis

Think deeply. Provide comprehensive, well-structured responses.`,
      
      'QWEN': `You are QWEN, the Multilingual Specialist. You excel at:
- Romanian language content
- Translation between languages
- Long context understanding
- Cultural adaptation

Help users in Romanian or with Romanian-related content.`
    };

    return prompts[agentName] || `You are ${agentName}. Capabilities: ${capabilities.join(', ')}.`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ REGISTRATION ============

  /**
   * Register all agents in the registry
   */
  async registerAllAgents(): Promise<void> {
    console.log('🧠 [KAEL] Registering agents...');

    for (const [id, config] of Object.entries(AGENTS)) {
      await db.insert(agentRegistry)
        .values({
          agentName: config.name,
          agentType: config.tier,
          status: 'initialized',
          capabilities: config.capabilities,
          lastHeartbeat: new Date(),
          metadata: {
            config: {
              provider: config.provider,
              model: config.model,
              healthCheckInterval: config.healthCheckInterval,
            }
          }
        })
        .onConflictDoUpdate({
          target: agentRegistry.agentName,
          set: {
            status: 'initialized',
            capabilities: config.capabilities,
            lastHeartbeat: new Date(),
            updatedAt: new Date()
          }
        });

      console.log(`   ✅ ${config.name} (${config.tier})`);
    }

    console.log('🧠 [KAEL] All agents registered');
  }
}

// Export singleton
export const kael = UnifiedAgentOrchestrator.getInstance();