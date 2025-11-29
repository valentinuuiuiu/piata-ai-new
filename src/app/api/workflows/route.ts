import { NextRequest, NextResponse } from 'next/server'
import {
  executeWorkflow,
  listWorkflows,
  getWorkflowStatus,
  WORKFLOWS
} from '@/lib/workflow-engine'

/**
 * GET /api/workflows
 *
 * List all available workflows
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('id')
    const action = searchParams.get('action')

    // Get specific workflow status
    if (workflowId && action === 'status') {
      const status = await getWorkflowStatus(workflowId)
      return NextResponse.json(status)
    }

    // Get specific workflow details
    if (workflowId) {
      const workflow = WORKFLOWS[workflowId]
      if (!workflow) {
        return NextResponse.json(
          { error: `Workflow not found: ${workflowId}` },
          { status: 404 }
        )
      }
      return NextResponse.json(workflow)
    }

    // List all workflows
    const workflows = await listWorkflows()
    return NextResponse.json({
      success: true,
      count: workflows.length,
      workflows,
      message: 'Ori suntem golani ori nu mai suntem - All workflows ready for autonomous execution'
    })
  } catch (error: any) {
    console.error('Workflows GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
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

    return NextResponse.json({
      success: execution.status === 'completed',
      workflowId: execution.workflowId,
      status: execution.status,
      completedSteps: execution.completedSteps.length,
      failedSteps: execution.failedSteps.length,
      executionTime: Date.now() - execution.startTime,
      results: execution.results,
      message:
        execution.status === 'completed'
          ? `Workflow completed successfully: ${WORKFLOWS[workflowId]?.name}`
          : `Workflow failed: ${execution.failedSteps.length} steps failed`
    })
  } catch (error: any) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      { error: 'Workflow execution failed', details: error.message },
      { status: 500 }
    )
  }
}
