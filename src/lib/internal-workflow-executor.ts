/**
 * Internal Workflow Executor
 * 
 * Executes workflows using internal backend agents
 * No external dependencies - everything runs in our backend
 * 
 * This is our autonomous execution engine - we control everything!
 */

import { 
  workflowRegistry 
} from './internal-workflow-registry';
import type { Workflow, WorkflowStep, WorkflowExecution } from '@/types/workflow';
import { withSpan, withWorkflowSpan, setAttribute, recordEvent } from './tracing';
import { JulesManager } from './jules-manager';
import { OpenRouterAgent } from './openrouter-agent';

// =============================================================================
// EXECUTION CONTEXT
// =============================================================================

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  input: Record<string, any>;
  results: Record<string, any>;
  errors: Record<string, string>;
  metadata: Record<string, any>;
}

export interface StepResult {
  stepId: string;
  success: boolean;
  output?: any;
  error?: string;
  duration: number;
  startedAt: string;
  completedAt: string;
}

// =============================================================================
// INTERNAL WORKFLOW EXECUTOR
// =============================================================================

export class InternalWorkflowExecutor {
  private julesManager: JulesManager;
  private openRouterAgents: Map<string, OpenRouterAgent> = new Map();

  constructor(julesManager: JulesManager) {
    this.julesManager = julesManager;
  }

  /**
   * Initialize the executor
   */
  async initialize() {
    await withSpan('workflow.executor.initialize', async (span) => {
      console.log('🚀 Initializing Internal Workflow Executor...');

      // Initialize OpenRouter agents
      await this.initializeOpenRouterAgents();

      console.log('✅ Internal Workflow Executor initialized');
    });
  }

  /**
   * Initialize OpenRouter agents
   */
  private async initializeOpenRouterAgents() {
    // Kate Coder Agent
    const kateAgent = new OpenRouterAgent(
      'mistralai/devstral-2512',
      'You are Kate, the Code Architect. You write elegant, efficient code. You speak the language of machines with precision and elegance.',
      process.env.OPENROUTER_API_KEY
    );
    this.openRouterAgents.set('kate', kateAgent);
    this.openRouterAgents.set('kate-coder', kateAgent);

    // Jules Reasoning Agent
    const julesAgent = new OpenRouterAgent(
      'mistralai/devstral-2512',
      'You are Jules, the Master Orchestrator. You reason about complex tasks and coordinate multiple agents.',
      process.env.OPENROUTER_API_KEY
    );
    this.openRouterAgents.set('jules', julesAgent);

    // Grok Agent
    const grokAgent = new OpenRouterAgent(
      'x-ai/grok-2-1212:free',
      'You are Grok, the Fast Thinker. You provide rapid insights and analysis.',
      process.env.OPENROUTER_API_KEY
    );
    this.openRouterAgents.set('grok', grokAgent);

    console.log('  ✅ OpenRouter agents initialized');
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    input: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    return withWorkflowSpan(workflowId, async (span) => {
      console.log(`\n🎬 Executing workflow: ${workflowId}`);

      // Get workflow
      const workflow = workflowRegistry.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Create execution record
      const execution = await workflowRegistry.createExecution(workflowId);
      setAttribute('workflow.execution_id', execution.id);
      setAttribute('workflow.steps_total', workflow.steps.length);

      // Update execution status to running
      await workflowRegistry.updateExecution(execution.id, {
        status: 'running',
        results: { input }
      });

      recordEvent('workflow.execution.started', { 
        workflowId,
        executionId: execution.id 
      });

      try {
        // Execute steps in order
        const stepResults: StepResult[] = [];
        let completedSteps = 0;

        for (const step of workflow.steps) {
          // Check dependencies
          if (step.depends_on && step.depends_on.length > 0) {
            const dependenciesMet = step.depends_on.every(depId => {
              const depResult = stepResults.find(r => r.stepId === depId);
              return depResult && depResult.success;
            });

            if (!dependenciesMet) {
              throw new Error(`Dependencies not met for step: ${step.id}`);
            }
          }

          // Execute step
          const result = await this.executeStep(step, execution, stepResults);
          stepResults.push(result);

          if (result.success) {
            completedSteps++;
            execution.results[step.id] = result.output;
          } else {
            execution.errors[step.id] = result.error || 'Unknown error';
            
            // Check if we should continue or stop
            if (step.retries === 0) {
              throw new Error(`Step failed: ${step.id} - ${result.error}`);
            }
          }
        }

        // Update execution as completed
        await workflowRegistry.updateExecution(execution.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          steps_completed: completedSteps,
          results: execution.results
        });

        recordEvent('workflow.execution.completed', { 
          workflowId,
          executionId: execution.id,
          stepsCompleted: completedSteps 
        });

        console.log(`✅ Workflow completed: ${workflowId}`);
        console.log(`   Steps completed: ${completedSteps}/${workflow.steps.length}\n`);

        return execution;

      } catch (error) {
        // Update execution as failed
        await workflowRegistry.updateExecution(execution.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: (error as Error).message
        });

        setAttribute('workflow.error', (error as Error).message);
        recordEvent('workflow.execution.failed', { 
          workflowId,
          executionId: execution.id,
          error: (error as Error).message 
        });

        console.error(`❌ Workflow failed: ${workflowId}`);
        console.error(`   Error: ${(error as Error).message}\n`);

        throw error;
      }
    });
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    return withSpan(`workflow.step.${step.id}`, async (span) => {
      const startedAt = new Date();
      console.log(`   ⚙️  Executing step: ${step.name}`);

      setAttribute('workflow.step.id', step.id);
      setAttribute('workflow.step.type', step.type);
      setAttribute('workflow.step.agent', step.agent);

      try {
        let output: any;

        // Execute based on step type
        switch (step.type) {
          case 'agent_task':
            output = await this.executeAgentTask(step, execution, previousResults);
            break;

          case 'api_call':
            output = await this.executeApiCall(step, execution, previousResults);
            break;

          case 'command':
            output = await this.executeCommand(step, execution, previousResults);
            break;

          case 'fabric_pattern':
            output = await this.executeFabricPattern(step, execution, previousResults);
            break;

          case 'subworkflow':
            output = await this.executeSubworkflow(step, execution, previousResults);
            break;

          case 'manual':
            output = await this.executeManual(step, execution, previousResults);
            break;

          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        const completedAt = new Date();
        const duration = completedAt.getTime() - startedAt.getTime();

        recordEvent('workflow.step.completed', { 
          stepId: step.id,
          duration 
        });

        console.log(`   ✅ Step completed: ${step.name} (${duration}ms)`);

        return {
          stepId: step.id,
          success: true,
          output,
          duration,
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString()
        };

      } catch (error) {
        const completedAt = new Date();
        const duration = completedAt.getTime() - startedAt.getTime();

        setAttribute('workflow.step.error', (error as Error).message);
        recordEvent('workflow.step.failed', { 
          stepId: step.id,
          error: (error as Error).message 
        });

        console.error(`   ❌ Step failed: ${step.name}`);
        console.error(`      Error: ${(error as Error).message}`);

        return {
          stepId: step.id,
          success: false,
          error: (error as Error).message,
          duration,
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString()
        };
      }
    });
  }

  /**
   * Execute an agent task
   */
  private async executeAgentTask(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    const agentName = step.agent.toLowerCase();

    // Try OpenRouter agents first
    if (this.openRouterAgents.has(agentName)) {
      const agent = this.openRouterAgents.get(agentName)!;
      
      const response = await agent.execute(step.description, {
        temperature: 0.7,
        max_tokens: 2000
      });

      if (!response.success) {
        throw new Error(response.error || 'Agent execution failed');
      }

      return {
        agent: agentName,
        response: response.content,
        tokensUsed: response.tokensUsed
      };
    }

    // Try Jules Manager for MCP agents
    try {
      const result = await this.julesManager.callTool(agentName, 'execute_task', {
        task: step.description,
        context: execution.results
      });
      return result;
    } catch (error) {
      // If agent not found or tool call fails
      throw new Error(`Agent or tool not found: ${step.agent}`);
    }
  }

  /**
   * Execute an API call
   */
  private async executeApiCall(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    // This would make an internal API call
    // For now, return a mock response
    return {
      type: 'api_call',
      endpoint: step.description,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a command
   */
  private async executeCommand(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    // This would execute a shell command
    // For now, return a mock response
    return {
      type: 'command',
      command: step.command,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a fabric pattern
   */
  private async executeFabricPattern(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    // This would execute a fabric pattern
    // For now, return a mock response
    return {
      type: 'fabric_pattern',
      pattern: step.pattern,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Execute a subworkflow
   */
  private async executeSubworkflow(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    if (!step.workflow) {
      throw new Error('Subworkflow step must specify workflow ID');
    }

    const subExecution = await this.executeWorkflow(step.workflow, execution.results);

    return {
      type: 'subworkflow',
      workflowId: step.workflow,
      executionId: subExecution.id,
      status: subExecution.status,
      results: subExecution.results
    };
  }

  /**
   * Execute a manual step
   */
  private async executeManual(
    step: WorkflowStep,
    execution: WorkflowExecution,
    previousResults: StepResult[]
  ): Promise<any> {
    // Manual steps require human intervention
    // For now, return a pending status
    return {
      type: 'manual',
      description: step.description,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let executorInstance: InternalWorkflowExecutor | null = null;

export function getWorkflowExecutor(julesManager?: JulesManager): InternalWorkflowExecutor {
  if (!executorInstance) {
    if (!julesManager) {
      throw new Error('JulesManager required for first initialization');
    }
    executorInstance = new InternalWorkflowExecutor(julesManager);
  }
  return executorInstance;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Execute a workflow by ID
 */
export async function executeWorkflow(
  workflowId: string,
  input?: Record<string, any>
): Promise<WorkflowExecution> {
  const executor = getWorkflowExecutor();
  return await executor.executeWorkflow(workflowId, input);
}

/**
 * Initialize the workflow executor
 */
export async function initializeWorkflowExecutor(julesManager: JulesManager) {
  const executor = getWorkflowExecutor(julesManager);
  await executor.initialize();
}
