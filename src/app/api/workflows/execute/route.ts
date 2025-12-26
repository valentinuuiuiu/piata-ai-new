import { NextRequest, NextResponse } from 'next/server';
import { 
  getWorkflow, 
  getAllWorkflows, 
  executeWorkflow,
  getWorkflowExecutions,
  getRecentExecutions
} from '@/lib/internal-workflow-registry';
import { withAPISpan, setAttribute, recordEvent } from '@/lib/tracing';

/**
 * POST - Execute a workflow
 */
export async function POST(req: NextRequest) {
  return withAPISpan('/api/workflows/execute', async (span) => {
    try {
      const { workflowId, input } = await req.json();

      setAttribute('workflow.id', workflowId);
      setAttribute('workflow.input_keys', Object.keys(input || {}).length.toString());

      recordEvent('workflow.execution.requested', { workflowId });

      // Check if workflow exists
      const workflow = getWorkflow(workflowId);
      if (!workflow) {
        setAttribute('error.type', 'WorkflowNotFound');
        return NextResponse.json({
          error: `Workflow not found: ${workflowId}`,
          availableWorkflows: getAllWorkflows().map(w => w.id)
        }, { status: 404 });
      }

      // Check if workflow is enabled
      if (!workflow.enabled) {
        setAttribute('error.type', 'WorkflowDisabled');
        return NextResponse.json({
          error: `Workflow is disabled: ${workflowId}`
        }, { status: 400 });
      }

      // Execute workflow
      const execution = await executeWorkflow(workflowId, input);

      return NextResponse.json({
        success: true,
        execution,
        message: `✅ Workflow "${workflow.name}" executed successfully!`
      });

    } catch (error) {
      setAttribute('error.message', (error as Error).message);
      recordEvent('workflow.execution.failed', { 
        error: (error as Error).message 
      });

      return NextResponse.json({
        error: (error as Error).message,
        message: '❌ Workflow execution failed'
      }, { status: 500 });
    }
  });
}

/**
 * GET - List all workflows and recent executions
 */
export async function GET(req: NextRequest) {
  return withAPISpan('/api/workflows/execute', async (span) => {
    try {
      const { searchParams } = new URL(req.url);
      const workflowId = searchParams.get('workflowId');
      const limit = parseInt(searchParams.get('limit') || '10');

      if (workflowId) {
        // Get specific workflow executions
        const workflow = getWorkflow(workflowId);
        if (!workflow) {
          return NextResponse.json({
            error: `Workflow not found: ${workflowId}`
          }, { status: 404 });
        }

        const executions = getWorkflowExecutions(workflowId);

        setAttribute('workflow.id', workflowId);
        setAttribute('executions.count', executions.length);

        return NextResponse.json({
          workflow,
          executions: executions.slice(0, limit)
        });
      } else {
        // Get all workflows and recent executions
        const workflows = getAllWorkflows();
        const recentExecutions = getRecentExecutions(limit);

        setAttribute('workflows.count', workflows.length);
        setAttribute('executions.count', recentExecutions.length);

        return NextResponse.json({
          workflows: workflows.map(w => ({
            id: w.id,
            name: w.name,
            description: w.description,
            category: w.category,
            enabled: w.enabled,
            steps: w.steps.length
          })),
          recentExecutions
        });
      }
    } catch (error) {
      setAttribute('error.message', (error as Error).message);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  });
}
