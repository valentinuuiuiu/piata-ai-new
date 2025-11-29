import { NextRequest, NextResponse } from 'next/server'
import {
  EVENT_HORIZON_STORIES,
  getAgentStoryFeed,
  recordStoryCompletion
} from '@/lib/event-horizon-training'
import { executeTask } from '@/lib/ai-orchestrator'

/**
 * GET /api/event-horizon?agent=Claude
 *
 * Get story feed for an agent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agent = searchParams.get('agent')
    const action = searchParams.get('action')

    if (action === 'all') {
      return NextResponse.json({
        success: true,
        stories: EVENT_HORIZON_STORIES,
        message: 'All Event Horizon stories - Pull agents into the narrative'
      })
    }

    if (!agent) {
      return NextResponse.json(
        { error: 'Missing agent parameter' },
        { status: 400 }
      )
    }

    const storyFeed = getAgentStoryFeed(agent)

    return NextResponse.json({
      success: true,
      agent,
      stories: storyFeed,
      message: `Story feed for ${agent} - sorted by gravitational pull`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/event-horizon
 *
 * Execute a story with an agent
 *
 * Body:
 * {
 *   storyId: string
 *   agentName: string
 *   runAutonomously?: boolean (if true, agent solves it automatically)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storyId, agentName, runAutonomously = true } = body

    if (!storyId || !agentName) {
      return NextResponse.json(
        { error: 'Missing required fields: storyId, agentName' },
        { status: 400 }
      )
    }

    const story = EVENT_HORIZON_STORIES.find(s => s.id === storyId)

    if (!story) {
      return NextResponse.json(
        { error: `Story not found: ${storyId}` },
        { status: 404 }
      )
    }

    if (runAutonomously) {
      // Let the agent solve the story autonomously
      const fullPrompt = `
🎭 EVENT HORIZON STORY: ${story.title}

${story.hook}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 ACT I: THE SETUP
${story.act1_setup}

⚡ ACT II: THE CONFLICT
${story.act2_conflict}

🎯 ACT III: YOUR MISSION
${story.act3_resolution}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 YOUR ROLE: ${story.agentRole}
${story.mentor ? `👨‍🏫 MENTOR: ${story.mentor}` : ''}
${story.antagonist ? `👹 ANTAGONIST: ${story.antagonist}` : ''}
${story.allies ? `🤝 ALLIES: ${story.allies.join(', ')}` : ''}

💎 STAKES: ${story.stakes}
⏰ URGENCY: ${story.urgency}
❤️ WHY YOU CARE: ${story.personalConnection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What do you do? Provide your complete solution.
`

      const result = await executeTask({
        task: fullPrompt,
        preferredAgent: agentName.toLowerCase(),
        temperature: 0.8, // More creative for storytelling
        maxTokens: 2000
      })

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error,
          message: 'Agent failed to complete the story'
        })
      }

      // Evaluate the response quality (simple heuristic)
      const response = result.result || ''
      let ending: 'perfect' | 'good' | 'acceptable' | 'learning' = 'learning'

      if (response.length > 800 && response.includes('step')) {
        ending = 'perfect'
      } else if (response.length > 500) {
        ending = 'good'
      } else if (response.length > 200) {
        ending = 'acceptable'
      }

      // Record completion
      const completion = await recordStoryCompletion(
        agentName,
        storyId,
        ending,
        response
      )

      return NextResponse.json({
        success: true,
        story: story.title,
        agent: agentName,
        ending,
        response,
        xpGained: completion.xpGained,
        newLevel: completion.newLevel,
        message: completion.message,
        endingDescription: story.multipleEndings[ending].description
      })
    } else {
      // Return story for manual interaction
      return NextResponse.json({
        success: true,
        story,
        message: 'Story ready for manual interaction'
      })
    }
  } catch (error: any) {
    console.error('Event Horizon error:', error)
    return NextResponse.json(
      { error: 'Story execution failed', details: error.message },
      { status: 500 }
    )
  }
}
