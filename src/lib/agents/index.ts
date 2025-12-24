/**
 * 🎯 Agent Module Index - Clean Export
 * 
 * This module provides a unified, consolidated agent system.
 * The focus is on AGENT WELLBEING: fewer, well-tuned agents with clear responsibilities.
 * 
 * Architecture:
 * - kael: Unified Orchestrator (single entry point)
 * - kate, grok, claude, qwen: OpenRouter LLM agents
 * - stripe, redis, github, supabase, sheets: MCP tool agents
 */

// Core Orchestrator
export { UnifiedAgentOrchestrator, kael } from './unified-orchestrator';
import type { TaskResult } from './unified-orchestrator';

// Types
export type { 
  AgentTier, 
  ModelTier, 
  AgentConfig, 
  TaskRequest, 
  TaskResult, 
  AgentHealth 
} from './unified-orchestrator';

// ============ SPECIALIST AGENTS ============

export interface SpecialistAgent {
  name: string;
  type: 'openrouter' | 'mcp';
  model?: string;
  capabilities: string[];
  execute(prompt: string, context?: Record<string, any>): Promise<TaskResult>;
}

// Agent configs (read-only reference)
export const AGENT_CONFIGS = {
  // OpenRouter Agents
  KATE: {
    name: 'KATE',
    type: 'openrouter' as const,
    model: 'google/gemini-2.0-flash-exp:free',
    capabilities: ['code_generation', 'debugging', 'refactoring', 'code_review'],
    specialty: 'Code Specialist'
  },
  GROK: {
    name: 'GROK',
    type: 'openrouter' as const,
    model: 'x-ai/grok-2-1212:free',
    capabilities: ['fast_analysis', 'automation', 'market_insights', 'quick_tasks'],
    specialty: 'Fast Thinker'
  },
  CLAUDE: {
    name: 'CLAUDE',
    type: 'openrouter' as const,
    model: 'anthropic/claude-3.5-sonnet',
    capabilities: ['complex_reasoning', 'planning', 'writing', 'analysis'],
    specialty: 'Master Analyst'
  },
  QWEN: {
    name: 'QWEN',
    type: 'openrouter' as const,
    model: 'qwen/qwen-2.5-72b-instruct',
    capabilities: ['multilingual', 'romanian_content', 'translation', 'long_context'],
    specialty: 'Multilingual Specialist'
  },
  
  // MCP Tool Agents
  STRIPE: {
    name: 'STRIPE',
    type: 'mcp' as const,
    capabilities: ['payments', 'subscriptions', 'refunds', 'invoices', 'financial_reports'],
    specialty: 'Financial Architect'
  },
  REDIS: {
    name: 'REDIS',
    type: 'mcp' as const,
    capabilities: ['cache', 'sessions', 'rate_limiting', 'pub_sub'],
    specialty: 'Memory Keeper'
  },
  GITHUB: {
    name: 'GITHUB',
    type: 'mcp' as const,
    capabilities: ['repositories', 'issues', 'pull_requests', 'actions', 'code_management'],
    specialty: 'Code Manager'
  },
  SUPABASE: {
    name: 'SUPABASE',
    type: 'mcp' as const,
    capabilities: ['database', 'auth', 'storage', 'realtime', 'edge_functions'],
    specialty: 'Data Architect'
  },
  SHEETS: {
    name: 'SHEETS',
    type: 'mcp' as const,
    capabilities: ['spreadsheets', 'data_export', 'analytics', 'reporting'],
    specialty: 'Analytics Specialist'
  }
};

// Quick lookup for agent capabilities
export function getAgentCapabilities(agentName: string): string[] {
  const config = AGENT_CONFIGS[agentName as keyof typeof AGENT_CONFIGS];
  return config?.capabilities || [];
}

// Get agent type
export function getAgentType(agentName: string): 'openrouter' | 'mcp' | 'internal' | null {
  const config = AGENT_CONFIGS[agentName as keyof typeof AGENT_CONFIGS];
  return config?.type || null;
}

// ============ USAGE EXAMPLES ============

/**
 * Example usage:
 * 
 * import { kael, TaskRequest } from '@/lib/agents';
 * 
 * // Execute a coding task
 * const result = await kael.execute({
 *   id: 'task-123',
 *   goal: 'Write a function to calculate Fibonacci numbers',
 *   type: 'coding',
 *   priority: 'normal'
 * });
 * 
 * // Get agent health
 * const health = await kael.getAllAgentHealth();
 * 
 * // Register all agents
 * await kael.registerAllAgents();
 */

// ============ DEPRECATED ============

/**
 * The following have of Unified been deprecated in favorAgentOrchestrator:
 * - JulesManager (use kael instead)
 * - KAELOrchestrator (use kael instead)
 * - A2ASignalManager (integrated into kael)
 * 
 * Old agent files (for reference only):
 * - base-agent.ts
 * - openrouter-agent.ts
 * - python-bridge-agent.ts
 * - openmanus-agent.ts
 * - manus-agent.ts
 * - content-agent.ts
 */