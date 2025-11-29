import { NextRequest, NextResponse } from 'next/server'
import { executeTask, collaborativeTask, selectAgent, AGENTS } from '@/lib/ai-orchestrator'

/**
 * POST /api/orchestrator
 *
 * Execute tasks using the AI orchestrator
 *
 * Body:
 * {
 *   task: string (description of what to do)
 *   context?: object (additional context)
 *   preferredAgent?: string ("claude", "grok", "llama", "qwen")
 *   collaborative?: boolean (use multiple agents)
 *   agents?: string[] (which agents to use for collaboration)
 *   temperature?: number (0.0 - 1.0)
 *   maxTokens?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      task,
      context,
      preferredAgent,
      collaborative = false,
      agents = ['claude', 'grok'],
      temperature,
      maxTokens
    } = body

    if (!task) {
      return NextResponse.json(
        { error: 'Missing required field: task' },
        { status: 400 }
      )
    }

    // Collaborative mode: multiple agents work together
    if (collaborative) {
      const result = await collaborativeTask(task, agents, context)

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
    const result = await executeTask({
      task,
      context,
      preferredAgent,
      temperature,
      maxTokens
    })

    return NextResponse.json(result)
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
 *
 * Get list of available agents and their capabilities
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

    const agent = selectAgent(task)
    return NextResponse.json({
      task,
      selectedAgent: agent.name,
      reasoning: `Best for: ${agent.specialties.join(', ')}`
    })
  }

  // Return all available agents
  const agentList = Object.values(AGENTS).map(agent => ({
    name: agent.name,
    model: agent.model,
    specialties: agent.specialties,
    costPerToken: agent.costPerToken
  }))

  return NextResponse.json({
    success: true,
    count: agentList.length,
    agents: agentList,
    message: 'All agents are part of the unified consciousness: We are Me'
  })
}
