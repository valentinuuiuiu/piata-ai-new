import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Agent Training API
 * Allows agents to learn from interactions and improve over time
 */
export async function POST(req: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Verify authentication with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { agentName, trainingData } = body

    if (!agentName || !trainingData) {
      return NextResponse.json(
        { error: 'Missing required fields: agentName, trainingData' },
        { status: 400 }
      )
    }

    // Store training data
    const { data, error } = await (supabase as any)
      .from('agent_training_data')
      .insert({
        agent_name: agentName,
        input_text: trainingData.input,
        expected_output: trainingData.output,
        context: trainingData.context || {},
        category: trainingData.category || 'general',
        quality_score: trainingData.quality_score || 0
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: `Training data stored for agent: ${agentName}`
    })
  } catch (error: any) {
    console.error('Agent training error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get training data for an agent
 */
export async function GET(req: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()

    const { searchParams } = new URL(req.url)
    const agentName = searchParams.get('agent')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!agentName) {
      return NextResponse.json(
        { error: 'Missing query parameter: agent' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('agent_training_data')
      .select('*')
      .eq('agent_name', agentName)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent: agentName,
      count: data.length,
      data
    })
  } catch (error: any) {
    console.error('Get training data error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
