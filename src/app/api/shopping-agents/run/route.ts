import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { runShoppingAgent } from '@/lib/shopping-agent-runner';

export const dynamic = 'force-dynamic';

// POST /api/shopping-agents/run - Run a specific shopping agent
export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    
    const { agentId, forceRun = false } = body;
    
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Get the agent from database
    const { data: agent, error: agentError } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.is_active && !forceRun) {
      return NextResponse.json({ error: 'Agent is not active' }, { status: 400 });
    }

    // Run the shopping agent
    const result = await runShoppingAgent(agent);

    return NextResponse.json({ 
      success: true, 
      result,
      agentId,
      matchesFound: result.matches?.length || 0
    });
  } catch (error) {
    console.error('Error running shopping agent:', error);
    return NextResponse.json({ 
      error: 'Failed to run shopping agent',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}