import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/shopping-agents/matches?agentId=123 - Get matches for a specific agent
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Get agent to verify ownership
    const { data: agent, error: agentError } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', session.user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found or access denied' }, { status: 404 });
    }

    // Get matches for this agent
    const { data: matches, error: matchesError } = await supabase
      .from('agent_matches')
      .select(`
        *,
        anunturi (
          id,
          title,
          description,
          price,
          location,
          images,
          created_at
        )
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (matchesError) {
      console.error('Error fetching agent matches:', matchesError);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    return NextResponse.json(matches || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shopping-agents/matches/mark-notified - Mark matches as notified
export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    
    const { matchIds } = body;
    
    if (!matchIds || !Array.isArray(matchIds)) {
      return NextResponse.json({ error: 'Match IDs array is required' }, { status: 400 });
    }

    // Mark matches as notified
    const { data, error } = await supabase
      .from('agent_matches')
      .update({ notified_at: new Date().toISOString() })
      .in('id', matchIds);

    if (error) {
      console.error('Error updating match notifications:', error);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data?.length || matchIds.length });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}