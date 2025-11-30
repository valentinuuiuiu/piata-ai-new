import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
// Create Supabase client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Agent Learning History API
 * Track agent performance and learning over time
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      agentName,
      taskDescription,
      inputData,
      outputData,
      success,
      feedback,
      performanceScore
    } = body

    if (!agentName || !taskDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: agentName, taskDescription' },
        { status: 400 }
      )
    }

    // Store learning history
    if (!supabase) {
      console.warn('Supabase client not initialized (missing keys)');
      return NextResponse.json({ success: true, message: 'Learning history skipped (no DB)' });
    }

    const { data, error } = await supabase
      .from('agent_learning_history')
      .insert({
        agent_name: agentName,
        task_description: taskDescription,
        input_data: inputData || {},
        output_data: outputData || {},
        success: success !== undefined ? success : true,
        feedback: feedback || null,
        performance_score: performanceScore || null
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Update agent capabilities based on success
    if (success && performanceScore && performanceScore > 70) {
      await updateAgentCapabilities(agentName, taskDescription, performanceScore)
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `Learning history recorded for agent: ${agentName}`
    })
  } catch (error: any) {
    console.error('Agent learning error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get learning history for an agent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentName = searchParams.get('agent')
    const limit = parseInt(searchParams.get('limit') || '100')
    const successOnly = searchParams.get('success') === 'true'

    if (!agentName) {
      return NextResponse.json(
        { error: 'Missing query parameter: agent' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('agent_learning_history')
      .select('*')
      .eq('agent_name', agentName)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (successOnly) {
      query = query.eq('success', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = calculateAgentStats(data)

    return NextResponse.json({
      success: true,
      agent: agentName,
      count: data.length,
      stats,
      data
    })
  } catch (error: any) {
    console.error('Get learning history error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Update agent capabilities based on performance
 */
async function updateAgentCapabilities(
  agentName: string,
  taskDescription: string,
  performanceScore: number
) {
  try {
    // Extract capability from task description (simple keyword extraction)
    const capability = extractCapability(taskDescription)

    // Check if capability exists
    const { data: existing } = await supabase
      .from('agent_capabilities')
      .select('*')
      .eq('agent_name', agentName)
      .eq('capability_name', capability)
      .single()

    if (existing) {
      // Update proficiency level
      const newProficiency = Math.min(
        100,
        existing.proficiency_level + Math.floor(performanceScore / 10)
      )

      await supabase
        .from('agent_capabilities')
        .update({ proficiency_level: newProficiency })
        .eq('id', existing.id)
    } else {
      // Create new capability
      await supabase
        .from('agent_capabilities')
        .insert({
          agent_name: agentName,
          capability_name: capability,
          capability_description: taskDescription,
          proficiency_level: Math.floor(performanceScore / 10),
          is_active: true
        })
    }
  } catch (error) {
    console.error('Error updating capabilities:', error)
  }
}

/**
 * Extract capability from task description
 */
function extractCapability(taskDescription: string): string {
  // Simple keyword extraction - can be enhanced with NLP
  const keywords = taskDescription.toLowerCase().split(' ')
  const actionWords = ['create', 'generate', 'analyze', 'process', 'optimize', 'train']

  for (const word of actionWords) {
    if (keywords.includes(word)) {
      return `${word}_${keywords[keywords.indexOf(word) + 1] || 'general'}`
    }
  }

  return 'general_task'
}

/**
 * Calculate agent performance statistics
 */
function calculateAgentStats(data: any[]) {
  if (!data || data.length === 0) {
    return {
      totalTasks: 0,
      successRate: 0,
      averageScore: 0
    }
  }

  const totalTasks = data.length
  const successfulTasks = data.filter(d => d.success).length
  const scoresWithValues = data.filter(d => d.performance_score !== null)
  const averageScore = scoresWithValues.length > 0
    ? scoresWithValues.reduce((sum, d) => sum + parseFloat(d.performance_score), 0) / scoresWithValues.length
    : 0

  return {
    totalTasks,
    successfulTasks,
    successRate: (successfulTasks / totalTasks) * 100,
    averageScore: Math.round(averageScore * 100) / 100
  }
}
