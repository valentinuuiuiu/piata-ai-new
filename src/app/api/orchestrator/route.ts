import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai-orchestrator'
import { AgentCapability, AgentTask } from '@/lib/agents/types'

// Instantiate orchestrator (singleton-ish)
const orchestrator = new AIOrchestrator();

/**
 * POST /api/orchestrator
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      task: taskDescription,
      context,
      preferredAgent,
      collaborative = false,
      agents = ['claude', 'grok'],
      temperature,
      maxTokens
    } = body

    if (!taskDescription) {
      return NextResponse.json(
        { error: 'Missing required field: task' },
        { status: 400 }
      )
    }

    // Create base task
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      type: AgentCapability.ANALYSIS, // Default, will be overridden if agent selected
      goal: taskDescription,
      context: context,
      input: { temperature, maxTokens }
    };

    // Collaborative mode
    if (collaborative) {
      const result = await orchestrator.runCollaborativeTask(task, agents);
      return NextResponse.json({
        success: true,
        mode: 'collaborative',
        agents: agents,
        results: result.results,
        consensus: result.consensus,
        message: `Task completed by ${agents.length} agents collaboratively`
      })
    }

    // Single agent mode
    let agent = preferredAgent ? orchestrator.getAgent(preferredAgent) : undefined;
    
    // If no preferred agent, let orchestrator decide (via routeRequest logic or direct delegation)
    // For now, if no agent, we'll use routeRequest which determines capability
    let result;
    if (agent) {
      result = await agent.run(task);
    } else {
      result = await orchestrator.routeRequest(taskDescription, context);
    }

    return NextResponse.json({
      success: result.status === 'success',
      result: result.output,
      error: result.error,
      metadata: result.metadata
    })

  } catch (error: any) {
    console.error('Orchestrator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orchestrator/agents
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'select') {
    // Test agent selection for a given task
    const task = searchParams.get('task')
    if (!task) {
      return NextResponse.json({ error: 'Missing task parameter' }, { status: 400 })
    }

    // We don't have a public selectAgent method anymore that returns just the agent
    // But we can simulate it or expose findBestAgent if needed.
    // For now, let's just return a generic response or use routeRequest to see who picks it up
    // But routeRequest runs it.
    // Let's just return the list of all agents as "available"
    return NextResponse.json({
      task,
      message: "Agent selection is now dynamic based on capability."
    })
  }

  // Return all available agents
  const agentList = orchestrator.getAllAgents().map(agent => ({
    name: agent.name,
    capabilities: agent.capabilities
  }))

  return NextResponse.json({
    success: true,
    count: agentList.length,
    agents: agentList,
    message: 'All agents are part of the unified consciousness: We are Me'
  })
}
