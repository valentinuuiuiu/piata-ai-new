import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkflow,
  getAllWorkflows,
  getWorkflowsByCategory,
  getEnabledWorkflows,
  executeWorkflow
} from '@/lib/internal-workflow-registry';
import { withAPISpan, setAttribute, recordEvent } from '@/lib/tracing';

/**
 * GET /api/workflows
 *
 * List all available workflows (internal registry)
 */
export async function GET(req: NextRequest) {
  return withAPISpan('/api/workflows', async (span) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      const category = searchParams.get('category');
      const enabled = searchParams.get('enabled');

      // Get specific workflow
      if (id) {
        const workflow = getWorkflow(id);
        if (!workflow) {
          setAttribute('error.type', 'WorkflowNotFound');
          return NextResponse.json(
            { error: `Workflow not found: ${id}` },
            { status: 404 }
          );
        }
        return NextResponse.json(workflow);
      }

      let workflows;

      if (category) {
        workflows = getWorkflowsByCategory(category);
        setAttribute('workflow.category', category);
      } else if (enabled === 'true') {
        workflows = getEnabledWorkflows();
        setAttribute('workflow.filter', 'enabled_only');
      } else {
        workflows = getAllWorkflows();
      }

      setAttribute('workflows.count', workflows.length);

      recordEvent('workflows.listed', { 
        count: workflows.length,
        category,
        enabled
      });

      return NextResponse.json({
        success: true,
        count: workflows.length,
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          category: w.category,
          tags: w.tags,
          agents: w.agents,
          steps: w.steps.length,
          enabled: w.enabled,
          record_on_chain: w.record_on_chain,
          created_by: w.created_by,
          created_at: w.created_at,
          updated_at: w.updated_at
        })),
        message: '✅ All workflows ready for autonomous execution - Internal Registry!'
      });
    } catch (error) {
      setAttribute('error.message', (error as Error).message);
      console.error('Workflows GET error:', error);
      return NextResponse.json(
        { error: 'Internal server error', details: (error as Error).message },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/workflows
 *
 * Execute a workflow
 *
 * Body:
 * {
 *   workflowId: string (ID of workflow to execute)
 *   context?: object (additional context for execution)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { workflowId, context } = body

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Missing required field: workflowId' },
        { status: 400 }
      )
    }

    console.log(`[API] Starting workflow execution: ${workflowId}`)

    // Execute workflow asynchronously
    const execution = await executeWorkflow(workflowId, context)

    const workflow = getWorkflow(workflowId);

    return NextResponse.json({
      success: execution.status === 'completed',
      workflowId: execution.workflow_id || workflowId,
      status: execution.status,
      completedSteps: execution.steps_completed || 0,
      totalSteps: workflow?.steps.length || 0,
      executionTime: Date.now() - new Date(execution.started_at).getTime(),
      results: execution.results,
      message:
        execution.status === 'completed'
          ? `Workflow completed successfully: ${workflow?.name || workflowId}`
          : `Workflow failed: Execution status is ${execution.status}`
    })
  } catch (error: any) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      { error: 'Workflow execution failed', details: error.message },
      { status: 500 }
    )
  }
}
