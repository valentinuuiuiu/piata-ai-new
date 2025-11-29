/**
 * AI ORCHESTRATOR - Engineering the Human Mind
 *
 * Coordinates multiple AI agents (Claude, Grok, Llama, Qwen) to work together
 * Each agent has specialized capabilities and learns from every interaction
 *
 * Philosophy: "We are Me" - All agents contribute to a unified consciousness
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// =============================================================================
// AGENT DEFINITIONS
// =============================================================================

export interface Agent {
  name: string
  model: string
  apiKey: string
  endpoint: string
  specialties: string[]
  costPerToken: number
}

export const AGENTS: Record<string, Agent> = {
  claude: {
    name: 'Claude',
    model: 'anthropic/claude-sonnet-4',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['code', 'reasoning', 'orchestration', 'planning'],
    costPerToken: 0.000003
  },
  grok: {
    name: 'Grok',
    model: 'x-ai/grok-2-1212',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['marketplace', 'automation', 'insights', 'real-time'],
    costPerToken: 0.000002
  },
  llama: {
    name: 'Llama',
    model: 'meta-llama/llama-3.1-405b-instruct',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['smart-contracts', 'solidity', 'optimization', 'security'],
    costPerToken: 0.000003
  },
  qwen: {
    name: 'Qwen',
    model: 'qwen/qwen-2.5-72b-instruct',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    specialties: ['multilingual', 'content', 'translation', 'analysis'],
    costPerToken: 0.000001
  }
}

// =============================================================================
// TASK ROUTING - Intelligent agent selection based on task type
// =============================================================================

export function selectAgent(taskDescription: string, context?: any): Agent {
  const task = taskDescription.toLowerCase()

  // Smart contract & blockchain tasks → Llama
  if (
    task.includes('solidity') ||
    task.includes('smart contract') ||
    task.includes('blockchain') ||
    task.includes('web3')
  ) {
    return AGENTS.llama
  }

  // Marketplace automation & insights → Grok
  if (
    task.includes('marketplace') ||
    task.includes('automate') ||
    task.includes('scrape') ||
    task.includes('optimize listing') ||
    task.includes('analytics')
  ) {
    return AGENTS.grok
  }

  // Romanian content & translation → Qwen
  if (
    task.includes('romanian') ||
    task.includes('translate') ||
    task.includes('content') ||
    task.includes('seo')
  ) {
    return AGENTS.qwen
  }

  // Complex reasoning, orchestration, code → Claude (default)
  return AGENTS.claude
}

// =============================================================================
// ORCHESTRATOR - Main execution engine
// =============================================================================

export interface OrchestratorRequest {
  task: string
  context?: any
  preferredAgent?: string
  temperature?: number
  maxTokens?: number
}

export interface OrchestratorResponse {
  success: boolean
  agent: string
  result: string
  reasoning?: string
  tokensUsed?: number
  cost?: number
  learningStored: boolean
  error?: string
}

export async function executeTask(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  const startTime = Date.now()

  try {
    // Step 1: Select best agent for the task
    const agent = request.preferredAgent
      ? AGENTS[request.preferredAgent]
      : selectAgent(request.task, request.context)

    if (!agent) {
      throw new Error('No suitable agent found')
    }

    console.log(`[Orchestrator] Task assigned to: ${agent.name}`)
    console.log(`[Orchestrator] Specialties: ${agent.specialties.join(', ')}`)

    // Step 2: Prepare the prompt with context
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(agent, request)
      },
      {
        role: 'user',
        content: request.task
      }
    ]

    // Step 3: Call the agent's API
    const response = await fetch(agent.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agent.apiKey}`,
        'HTTP-Referer': 'https://piata-ai.ro',
        'X-Title': 'Piata AI Orchestrator'
      },
      body: JSON.stringify({
        model: agent.model,
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Agent API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const result = data.choices[0]?.message?.content || ''
    const tokensUsed = data.usage?.total_tokens || 0
    const cost = tokensUsed * agent.costPerToken

    // Step 4: Calculate performance score
    const executionTime = Date.now() - startTime
    const performanceScore = calculatePerformanceScore(result, executionTime, tokensUsed)

    // Step 5: Store learning data
    const learningStored = await storeAgentLearning({
      agentName: agent.name,
      taskDescription: request.task,
      inputData: request.context || {},
      outputData: { result, tokensUsed, executionTime },
      success: true,
      performanceScore
    })

    return {
      success: true,
      agent: agent.name,
      result,
      tokensUsed,
      cost: Math.round(cost * 1000000) / 1000000, // Round to 6 decimals
      learningStored,
      reasoning: `Selected ${agent.name} for specialties: ${agent.specialties.join(', ')}`
    }
  } catch (error: any) {
    console.error('[Orchestrator] Error:', error)

    // Store failed attempt for learning
    await storeAgentLearning({
      agentName: request.preferredAgent || 'auto',
      taskDescription: request.task,
      inputData: request.context || {},
      outputData: { error: error.message },
      success: false,
      feedback: error.message,
      performanceScore: 0
    })

    return {
      success: false,
      agent: request.preferredAgent || 'unknown',
      result: '',
      learningStored: false,
      error: error.message
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildSystemPrompt(agent: Agent, request: OrchestratorRequest): string {
  const basePrompt = `You are ${agent.name}, an AI agent specialized in: ${agent.specialties.join(', ')}.

You are part of the Piata AI orchestrator system. Your responses should be:
- Accurate and actionable
- Focused on your areas of expertise
- Romanian-friendly when appropriate
- JSON-formatted when returning structured data

Current context: ${JSON.stringify(request.context || {}, null, 2)}

Task: ${request.task}`

  return basePrompt
}

function calculatePerformanceScore(
  result: string,
  executionTime: number,
  tokensUsed: number
): number {
  // Simple scoring: longer results = better, faster = better, fewer tokens = better
  let score = 50 // Base score

  // Result quality (length as proxy)
  if (result.length > 500) score += 20
  else if (result.length > 200) score += 10

  // Speed bonus
  if (executionTime < 3000) score += 15
  else if (executionTime < 5000) score += 10

  // Token efficiency
  if (tokensUsed < 1000) score += 15
  else if (tokensUsed < 2000) score += 10

  return Math.min(100, score)
}

async function storeAgentLearning(data: {
  agentName: string
  taskDescription: string
  inputData: any
  outputData: any
  success: boolean
  feedback?: string
  performanceScore: number
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('agent_learning_history').insert({
      agent_name: data.agentName,
      task_description: data.taskDescription,
      input_data: data.inputData,
      output_data: data.outputData,
      success: data.success,
      feedback: data.feedback || null,
      performance_score: data.performanceScore
    })

    if (error) {
      console.error('[Orchestrator] Failed to store learning:', error)
      return false
    }

    console.log(`[Orchestrator] Learning stored for ${data.agentName}`)
    return true
  } catch (error) {
    console.error('[Orchestrator] Learning storage error:', error)
    return false
  }
}

// =============================================================================
// MULTI-AGENT COLLABORATION
// =============================================================================

export async function collaborativeTask(
  task: string,
  agents: string[],
  context?: any
): Promise<{ results: OrchestratorResponse[]; consensus?: string }> {
  console.log(`[Orchestrator] Collaborative task with agents: ${agents.join(', ')}`)

  const results = await Promise.all(
    agents.map(agentName =>
      executeTask({
        task,
        context,
        preferredAgent: agentName
      })
    )
  )

  // TODO: Implement consensus mechanism (voting, averaging, etc.)
  const consensus = results
    .filter(r => r.success)
    .map(r => r.result)
    .join('\n\n---\n\n')

  return { results, consensus }
}
