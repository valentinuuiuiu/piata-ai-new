/**
 * Internal Workflow Registry
 * 
 * Stores and manages workflows internally in the backend
 * No external file dependencies - everything is self-contained
 * 
 * This is our internal workflow system - no paid tiers, no external dependencies
 * We own this completely!
 */

import { withSpan, setAttribute, recordEvent } from '@/lib/tracing';
import { MULTI_CHANNEL_WORKFLOWS } from './multi-channel-workflows';
import { MultiChannelExecutor } from './multi-channel-executor';
import type { Workflow, WorkflowStep, WorkflowExecution } from '@/types/workflow';





// =============================================================================
// INTERNAL WORKFLOW REGISTRY
// =============================================================================

class InternalWorkflowRegistry {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the registry with default workflows
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    await withSpan('workflow.registry.initialize', async (span) => {
      console.log('🔧 Initializing Internal Workflow Registry...');

      // Load default workflows
      await this.loadDefaultWorkflows();

      this.initialized = true;
      setAttribute('workflow.registry.workflows_count', this.workflows.size);
      recordEvent('workflow.registry.initialized', { 
        workflowsCount: this.workflows.size 
      });

      console.log(`✅ Internal Workflow Registry initialized with ${this.workflows.size} workflows`);
    });
  }

  /**
   * Load default internal workflows
   */
  private async loadDefaultWorkflows() {
    const defaultWorkflows: Workflow[] = [
      {
        id: 'marketplace-listing-optimizer',
        name: 'Marketplace Listing Optimizer',
        description: 'Automatically optimizes all active listings for better visibility and engagement',
        category: 'marketplace',
        enabled: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['automation', 'seo', 'optimization'],
        agents: {
          'grok': 'Grok-4.1-fast - Rapid marketplace insights',
          'qwen': 'Qwen Coder - Content generation',
          'claude': 'Claude Code - Database operations'
        },
        steps: [
          {
            id: 'fetch-listings',
            name: 'Fetch Active Listings',
            type: 'agent_task',
            description: 'Fetch all active listings from database that need optimization',
            agent: 'grok',
            requires_llm: true,
            timeout: 30000
          },
          {
            id: 'analyze-performance',
            name: 'Analyze Performance',
            type: 'agent_task',
            description: 'Analyze which listings have low views/engagement',
            agent: 'grok',
            requires_llm: true,
            depends_on: ['fetch-listings'],
            timeout: 30000
          },
          {
            id: 'generate-improvements',
            name: 'Generate SEO Improvements',
            type: 'agent_task',
            description: 'Generate improved Romanian titles and descriptions for low-performing listings',
            agent: 'qwen',
            requires_llm: true,
            depends_on: ['analyze-performance'],
            timeout: 60000
          },
          {
            id: 'apply-updates',
            name: 'Apply Updates',
            type: 'api_call',
            description: 'Update listings in database with improved content',
            agent: 'claude',
            depends_on: ['generate-improvements'],
            timeout: 30000
          }
        ]
      },

      {
        id: 'chainlink-price-monitor',
        name: 'ChainLink Price Monitor',
        description: 'Monitor ChainLink oracle prices and record on blockchain',
        category: 'blockchain',
        enabled: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['chainlink', 'oracle', 'blockchain'],
        agents: {
          'chainlink_cre': 'ChainLink CRE specialist - Oracle integration',
          'kael': 'KAEL-3025 - Smart contract specialist'
        },
        steps: [
          {
            id: 'fetch-price',
            name: 'Fetch Price from Oracle',
            type: 'agent_task',
            description: 'Get current price from ChainLink oracle',
            agent: 'chainlink_cre',
            requires_llm: false,
            timeout: 15000
          },
          {
            id: 'record-on-chain',
            name: 'Record on Blockchain',
            type: 'agent_task',
            description: 'Record price data on Sacred Nodes blockchain',
            agent: 'kael',
            requires_llm: true,
            depends_on: ['fetch-price'],
            timeout: 30000
          }
        ],
        record_on_chain: true
      },

      {
        id: 'daily-content-generator',
        name: 'Daily Content Generator',
        description: 'Generate and publish daily content for the marketplace',
        category: 'content',
        enabled: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['content', 'automation', 'blog'],
        agents: {
          'grok': 'Grok-4.1-fast - Content ideation',
          'qwen': 'Qwen Coder - Content writing',
          'claude': 'Claude Code - Publishing'
        },
        steps: [
          {
            id: 'generate-ideas',
            name: 'Generate Content Ideas',
            type: 'agent_task',
            description: 'Generate 5 content ideas based on marketplace trends',
            agent: 'grok',
            requires_llm: true,
            timeout: 30000
          },
          {
            id: 'write-content',
            name: 'Write Content',
            type: 'agent_task',
            description: 'Write full blog post in Romanian',
            agent: 'qwen',
            requires_llm: true,
            depends_on: ['generate-ideas'],
            timeout: 60000
          },
          {
            id: 'publish-content',
            name: 'Publish Content',
            type: 'api_call',
            description: 'Publish content to the marketplace blog',
            agent: 'claude',
            depends_on: ['write-content'],
            timeout: 30000
          }
        ]
      },

      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Perform security audit and vulnerability scan',
        category: 'security',
        enabled: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['security', 'audit', 'automation'],
        agents: {
          'claude': 'Claude Code - Security analysis',
          'kael': 'KAEL-3025 - Smart contract audit'
        },
        steps: [
          {
            id: 'scan-vulnerabilities',
            name: 'Scan for Vulnerabilities',
            type: 'agent_task',
            description: 'Scan codebase for security vulnerabilities',
            agent: 'claude',
            requires_llm: true,
            timeout: 60000
          },
          {
            id: 'audit-contracts',
            name: 'Audit Smart Contracts',
            type: 'agent_task',
            description: 'Audit smart contracts for security issues',
            agent: 'kael',
            requires_llm: true,
            depends_on: ['scan-vulnerabilities'],
            timeout: 60000
          },
          {
            id: 'generate-report',
            name: 'Generate Security Report',
            type: 'agent_task',
            description: 'Generate comprehensive security report',
            agent: 'claude',
            requires_llm: true,
            depends_on: ['audit-contracts'],
            timeout: 30000
          }
        ]
      },
      ...MULTI_CHANNEL_WORKFLOWS
    ];

    // Register all default workflows
    for (const workflow of defaultWorkflows) {
      this.workflows.set(workflow.id, workflow);
      console.log(`  ✅ Registered workflow: ${workflow.name}`);
    }
  }

  /**
   * Register a new workflow
   */
  async registerWorkflow(workflow: Workflow): Promise<Workflow> {
    return withSpan('workflow.registry.register', async (span) => {
      // Generate ID if not provided
      if (!workflow.id) {
        workflow.id = workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      // Set timestamps
      workflow.created_at = workflow.created_at || new Date().toISOString();
      workflow.updated_at = new Date().toISOString();

      // Store workflow
      this.workflows.set(workflow.id, workflow);

      setAttribute('workflow.id', workflow.id);
      setAttribute('workflow.name', workflow.name);
      recordEvent('workflow.registered', { 
        workflowId: workflow.id,
        workflowName: workflow.name 
      });

      console.log(`✅ Workflow registered: ${workflow.name} (${workflow.id})`);
      return workflow;
    });
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by category
   */
  getWorkflowsByCategory(category: string): Workflow[] {
    return this.getAllWorkflows().filter(w => w.category === category);
  }

  /**
   * Get enabled workflows
   */
  getEnabledWorkflows(): Workflow[] {
    return this.getAllWorkflows().filter(w => w.enabled);
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    return withSpan('workflow.registry.update', async (span) => {
      const workflow = this.workflows.get(id);
      if (!workflow) {
        return null;
      }

      // Apply updates
      const updated = { ...workflow, ...updates, updated_at: new Date().toISOString() };
      this.workflows.set(id, updated);

      setAttribute('workflow.id', id);
      recordEvent('workflow.updated', { workflowId: id });

      console.log(`✅ Workflow updated: ${updated.name}`);
      return updated;
    });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    return withSpan('workflow.registry.delete', async (span) => {
      const deleted = this.workflows.delete(id);
      
      if (deleted) {
        setAttribute('workflow.id', id);
        recordEvent('workflow.deleted', { workflowId: id });
        console.log(`✅ Workflow deleted: ${id}`);
      }

      return deleted;
    });
  }

  /**
   * Create a workflow execution record
   */
  async createExecution(workflowId: string): Promise<WorkflowExecution> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflow_id: workflowId,
      status: 'pending',
      started_at: new Date().toISOString(),
      steps_completed: 0,
      steps_total: workflow.steps.length,
      results: {},
      errors: {}
    };

    this.executions.set(execution.id, execution);
    return execution;
  }

  /**
   * Update execution status
   */
  async updateExecution(
    executionId: string,
    updates: Partial<WorkflowExecution>
  ): Promise<WorkflowExecution | null> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      return null;
    }

    const updated = { ...execution, ...updates };
    this.executions.set(executionId, updated);
    return updated;
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all executions for a workflow
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.workflow_id === workflowId);
  }

  /**
   * Get recent executions
   */
  getRecentExecutions(limit: number = 10): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const workflowRegistry = new InternalWorkflowRegistry();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Initialize the workflow registry (call this at app startup)
 */
export async function initializeWorkflowRegistry() {
  await workflowRegistry.initialize();
}

/**
 * Get workflow by ID
 */
export function getWorkflow(id: string): Workflow | undefined {
  return workflowRegistry.getWorkflow(id);
}

/**
 * Get all workflows
 */
export function getAllWorkflows(): Workflow[] {
  return workflowRegistry.getAllWorkflows();
}

/**
 * Register a new workflow
 */
export async function registerWorkflow(workflow: Workflow): Promise<Workflow> {
  return await workflowRegistry.registerWorkflow(workflow);
}

/**
 * Create a workflow execution
 */
export async function createWorkflowExecution(workflowId: string): Promise<WorkflowExecution> {
  return await workflowRegistry.createExecution(workflowId);
}

/**
 * Update workflow execution
 */
export async function updateWorkflowExecution(
  executionId: string,
  updates: Partial<WorkflowExecution>
): Promise<WorkflowExecution | null> {
  return await workflowRegistry.updateExecution(executionId, updates);
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: string): Workflow[] {
  return workflowRegistry.getWorkflowsByCategory(category);
}

/**
 * Get enabled workflows
 */
export function getEnabledWorkflows(): Workflow[] {
  return workflowRegistry.getEnabledWorkflows();
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(workflowId: string, input?: any): Promise<WorkflowExecution> {
  // Get the workflow
  const workflow = workflowRegistry.getWorkflow(workflowId);
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  // Create execution record
  let execution = await workflowRegistry.createExecution(workflowId);

  try {
    // Update execution status to running
    execution = await workflowRegistry.updateExecution(execution.id, {
      status: 'running'
    })!;

    // Execute workflow steps (simplified implementation)
    // In a real implementation, you would run each step according to the workflow definition
    console.log(`Executing workflow: ${workflow.name} (${workflowId})`);

    // For now, we'll just mark it as completed after "running" the steps
    // In a real implementation, each step would be executed according to its definition
    const results: Record<string, any> = { input };
    
    for (const step of workflow.steps) {
      console.log(`Executing step: ${step.name} (${step.id})`);
      
      // Execute step using MultiChannelExecutor
      const stepResult = await MultiChannelExecutor.executeStep(step, workflowId, input);
      results[step.id] = stepResult;
      
      // Update execution progress
      execution = await workflowRegistry.updateExecution(execution.id, {
        steps_completed: execution.steps_completed + 1
      })!;
    }

    // Update execution status to completed
    execution = await workflowRegistry.updateExecution(execution.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      steps_completed: workflow.steps.length,
      results
    })!;

    return execution;
  } catch (error) {
    // Update execution status to failed
    execution = await workflowRegistry.updateExecution(execution.id, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: (error as Error).message,
      results: { input, error: (error as Error).message }
    })!;

    throw error;
  }
}

/**
 * Get workflow executions
 */
export function getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
  return workflowRegistry.getWorkflowExecutions(workflowId);
}

/**
 * Get recent executions
 */
export function getRecentExecutions(limit: number = 10): WorkflowExecution[] {
  return workflowRegistry.getRecentExecutions(limit);
}

// Re-export types for convenience
export { Workflow, WorkflowStep, WorkflowExecution };
