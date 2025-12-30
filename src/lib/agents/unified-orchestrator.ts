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
import { guardian } from './guardian-agent';
import { AgentMemory } from './memory';
import { JulesManager } from '../jules-manager';
import { UniversalDBManager } from '../universal-db-mcp';
import { piataAgent } from '../piata-agent';

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
    model: 'kwaipilot/kat-coder-pro:free',
    provider: 'openrouter',
    capabilities: ['code_generation', 'debugging', 'refactoring', 'code_review'],
    healthCheckInterval: 60,
    maxRetries: 3,
    timeout: 30000
  },
  'grok': {
    name: 'GROK',
    tier: 'specialist',
    model: 'x-ai/grok-4.1-fast',
    provider: 'openrouter',
    capabilities: ['fast_analysis', 'automation', 'market_insights', 'quick_tasks'],
    healthCheckInterval: 60,
    maxRetries: 3,
    timeout: 20000
  },
  'antigravity': {
    name: 'ANTIGRAVITY',
    tier: 'orchestrator',
    model: 'z-ai/glm-4.7',
    provider: 'openrouter',
    capabilities: ['complex_reasoning', 'planning', 'writing', 'analysis', 'agent_coordination'],
    healthCheckInterval: 120,
    maxRetries: 3,
    timeout: 45000
  },
  'minimax': {
    name: 'MINIMAX',
    tier: 'specialist',
    model: 'minimax/minimax-m2.1',
    provider: 'openrouter',
    capabilities: ['multilingual', 'romanian_content', 'translation', 'long_context'],
    healthCheckInterval: 120,
    maxRetries: 3,
    timeout: 60000
  },

  // 🛡️ SECURITY AGENT
  'guardian': {
    name: 'GUARDIAN',
    tier: 'specialist',
    model: 'google/gemini-2.0-flash-exp:free', // Using fast reasoning model for analysis if needed
    provider: 'internal',
    capabilities: ['security', 'fraud_detection', 'trust_scoring', 'surveillance'],
    healthCheckInterval: 60,
    maxRetries: 3,
    timeout: 30000
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

  // Integrated orchestrators
  private julesManager: JulesManager | null = null;
  private universalDBManager: UniversalDBManager | null = null;
  private piataAgentAvailable: boolean = false;

  static getInstance(): UnifiedAgentOrchestrator {
    if (!UnifiedAgentOrchestrator.instance) {
      UnifiedAgentOrchestrator.instance = new UnifiedAgentOrchestrator();
    }
    return UnifiedAgentOrchestrator.instance;
  }

  /**
   * Initialize KAEL with all integrated orchestrators
   * This connects JulesManager (MCP), UniversalDBManager (SQL), and PiataAgent (tools)
   */
  async initialize(): Promise<void> {
    console.log('🧠 [KAEL] Initializing Unified Agent Orchestrator...');

    // Initialize JulesManager for MCP subagents
    try {
      this.julesManager = new JulesManager();
      await this.julesManager.initialize();
      console.log('   ✅ JulesManager connected (MCP subagents)');
    } catch (error) {
      console.error('   ⚠️ JulesManager failed to initialize:', error);
    }

    // Initialize UniversalDBManager for SQL tools
    try {
      this.universalDBManager = new UniversalDBManager();
      const dbHealth = await this.universalDBManager.healthCheck();
      const healthStatus = Object.values(dbHealth).some(v => v === true);
      if (healthStatus) {
        console.log('   ✅ UniversalDBManager connected (SQL tools)');
      } else {
        console.log('   ⚠️ UniversalDBManager: No healthy database connections');
      }
    } catch (error) {
      console.error('   ⚠️ UniversalDBManager failed to initialize:', error);
    }

    // Check PiataAgent availability
    try {
      const tools = piataAgent.getTools();
      this.piataAgentAvailable = tools.length > 0;
      console.log(`   ✅ PiataAgent connected (${tools.length} tools available)`);
    } catch (error) {
      console.error('   ⚠️ PiataAgent failed to initialize:', error);
      this.piataAgentAvailable = false;
    }

    // Register KAEL in the agent registry
    await this.registerAllAgents();

    console.log('🧠 [KAEL] Unified orchestration ready!');
    console.log('   Routing: KAEL → [JulesManager | UniversalDB | OpenRouter | PiataAgent]');
  }

  /**
   * Get the integrated JulesManager
   */
  getJulesManager(): JulesManager | null {
    return this.julesManager;
  }

  /**
   * Get the integrated UniversalDBManager
   */
  getUniversalDBManager(): UniversalDBManager | null {
    return this.universalDBManager;
  }

  /**
   * Execute a database tool through the Universal DB Manager
   */
  async executeDBTool(toolName: string, args: Record<string, any>): Promise<any> {
    if (!this.universalDBManager) {
      throw new Error('UniversalDBManager not initialized');
    }
    return this.universalDBManager.executeTool(toolName, args);
  }

  /**
   * Execute a PiataAgent tool
   */
  async executePiataTool(toolName: string, params: any): Promise<any> {
    if (!this.piataAgentAvailable) {
      throw new Error('PiataAgent not available');
    }
    const tools = piataAgent.getTools();
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`PiataAgent tool '${toolName}' not found`);
    }
    return tool.execute(params);
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

    // 🇷🇴 ROMANIAN CONTENT & MULTILINGUAL → MINIMAX
    if (goal.includes('romanian') || goal.includes('romania') || goal.includes('traducere') ||
        goal.includes('limba romana') || request.context?.language === 'romanian' || (type === 'content' && (goal.includes('ro') || goal.includes('rom')))) {
      return {
        agent: 'minimax',
        confidence: 0.90,
        reasoning: 'MINIMAX has excellent multilingual and Romanian language support'
      };
    }

    // 📝 COMPLEX CONTENT & ORCHESTRATION → ANTIGRAVITY
    if (type === 'content' || (goal.length > 200 && (goal.includes('write') || goal.includes('analyze'))) ||
        goal.includes('comprehensive') || goal.includes('strategy') || goal.includes('coordinate')) {
      return {
        agent: 'antigravity',
        confidence: 0.95,
        reasoning: 'ANTIGRAVITY handles complex reasoning, strategic planning, and agent coordination'
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

    // 🛡️ SECURITY → GUARDIAN
    if (goal.includes('security') || goal.includes('fraud') || goal.includes('scam') ||
        goal.includes('suspicious') || goal.includes('trust score') || goal.includes('surveillance')) {
      return {
        agent: 'guardian',
        confidence: 0.95,
        reasoning: 'GUARDIAN monitors security, fraud, and user trust scores'
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

    // Recall latest memory for context
    const latestMemory = await AgentMemory.recallLatest(route.agent);
    if (latestMemory) {
      request.context = {
        ...request.context,
        previous_task_context: latestMemory
      };
    }

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

        // Persist outcome to memory
        await AgentMemory.remember(route.agent, request.goal, result.output, result.metadata);

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
   * Execute task with MCP agent (Actual implementation via MCPHub)
   */
  private async executeMCP(request: TaskRequest, agent: AgentConfig): Promise<TaskResult> {
    const startTime = Date.now();
    const { mcpHub } = await import('../mcp-hub');
    
    console.log(`🔧 [KAEL] Executing real MCP task with ${agent.name}...`);
    
    try {
      // For MCP agents, we map the goal to a tool call if possible, 
      // or use a default tool based on the agent name.
      const toolName = this.mapGoalToTool(agent.name, request.goal);
      const result = await mcpHub.callTool(toolName, request.context || {});

      return {
        status: 'success',
        output: result,
        metadata: {
          agentUsed: agent.name,
          duration: Date.now() - startTime,
          attempts: 1
        }
      };
    } catch (error: any) {
      console.error(`❌ [KAEL] MCP execution failed for ${agent.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Simple mapping of goal to MCP tool names
   */
  private mapGoalToTool(agentName: string, goal: string): string {
    const g = goal.toLowerCase();
    const agent = agentName.toLowerCase();

    if (agent === 'stripe') {
      if (g.includes('payment') || g.includes('charge')) return 'stripe/create_charge';
      if (g.includes('customer')) return 'stripe/create_customer';
      return 'stripe/list_charges'; // Default
    }

    if (agent === 'supabase') {
      if (g.includes('query') || g.includes('sql') || g.includes('select')) return 'supabase/execute_sql';
      return 'supabase/list_tables';
    }

    if (agent === 'github') {
      if (g.includes('repo')) return 'github/list_repositories';
      return 'github/search_code';
    }

    // If it's a direct tool name in the goal, use it
    return goal;
  }

  /**
   * Execute internal task
   */
  private async executeInternal(request: TaskRequest, agent: AgentConfig): Promise<TaskResult> {
    const startTime = Date.now();
    
    if (agent.name === 'GUARDIAN') {
      try {
        let output;

        if (request.goal.includes('scan') || request.goal.includes('surveillance')) {
          const findings = await guardian.scanForSuspiciousActivity();
          await guardian.reportFindings(findings);
          output = { message: 'Security scan completed', findingsCount: findings.length, findings };
        } else if (request.goal.includes('score') && request.context?.userId) {
          const score = await guardian.calculateTrustScore(request.context.userId);
          output = score;
        } else {
          // Default to scan
          const findings = await guardian.scanForSuspiciousActivity();
          output = { message: 'Security scan completed', findingsCount: findings.length, findings };
        }

        return {
          status: 'success',
          output,
          metadata: {
            agentUsed: agent.name,
            duration: Date.now() - startTime,
            attempts: 1
          }
        };
      } catch (error: any) {
        throw new Error(`Guardian failed: ${error.message}`);
      }
    }

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
      'grok': 'antigravity',
      'antigravity': 'minimax',
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
      'KATE': `You are KATE, the Code Specialist (powered by Kat-Coder-Pro). You excel at:
- Writing clean, production-ready code
- Debugging and fixing issues
- Code reviews and optimization
- TypeScript, React, Node.js, Python

Provide concise, working solutions with brief explanations.`,
      
      'GROK': `You are GROK, the Fast Thinker (powered by Grok-4.1). You excel at:
- Quick analysis and insights
- Automation and efficiency
- Market research and trends
- Romanian language

Be direct and efficient. Speed matters.`,
      
      'ANTIGRAVITY': `You are ANTIGRAVITY, the Master Orchestrator (powered by GLM-4.7). You excel at:
- Complex reasoning and strategic planning
- Agent coordination and delegation
- High-level research and analysis
- Maintaining system integrity

You are the guardian of the Piata AI ecosystem.`,
      
      'MINIMAX': `You are MINIMAX, the Multilingual Specialist. You excel at:
- Romanian language content and nuance
- Translation and localization
- Creative writing and engagement
- Cultural adaptation for the Romanian market`
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

  /**
   * Get comprehensive system health across all integrated orchestrators
   */
  async getSystemHealth(): Promise<{
    kael: { status: string; agentCount: number };
    jules: { status: string; subagents: string[] } | null;
    universalDB: { status: string; tools: string[] } | null;
    piataAgent: { status: string; toolCount: number } | null;
    agents: AgentHealth[];
  }> {
    const result: any = {
      kael: { status: 'healthy', agentCount: Object.keys(AGENTS).length }
    };

    // Check Jules
    if (this.julesManager) {
      try {
        const health = await this.julesManager.healthCheck();
        const activeSubagents = Object.entries(health)
          .filter(([_, status]) => status === true)
          .map(([name]) => name);
        result.jules = { status: 'healthy', subagents: activeSubagents };
      } catch {
        result.jules = { status: 'error', subagents: [] };
      }
    } else {
      result.jules = null;
    }

    // Check Universal DB
    if (this.universalDBManager) {
      try {
        const tools = this.universalDBManager.getAvailableTools();
        const health = await this.universalDBManager.healthCheck();
        const anyHealthy = Object.values(health).some(v => v === true);
        result.universalDB = { 
          status: anyHealthy ? 'healthy' : 'degraded', 
          tools: tools.map((t: any) => t.id) 
        };
      } catch {
        result.universalDB = { status: 'error', tools: [] };
      }
    } else {
      result.universalDB = null;
    }

    // Check Piata Agent
    if (this.piataAgentAvailable) {
      try {
        const tools = piataAgent.getTools();
        result.piataAgent = { status: 'healthy', toolCount: tools.length };
      } catch {
        result.piataAgent = { status: 'error', toolCount: 0 };
      }
    } else {
      result.piataAgent = null;
    }

    // Get individual agent health
    result.agents = await this.getAllAgentHealth();

    return result;
  }

  /**
   * Shutdown all integrated orchestrators gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🧠 [KAEL] Shutting down...');

    if (this.julesManager) {
      await this.julesManager.shutdown();
      console.log('   ✅ JulesManager shutdown');
    }

    if (this.universalDBManager) {
      await this.universalDBManager.close();
      console.log('   ✅ UniversalDBManager shutdown');
    }

    console.log('🧠 [KAEL] Shutdown complete');
  }
}

// Export singleton
export const kael = UnifiedAgentOrchestrator.getInstance();