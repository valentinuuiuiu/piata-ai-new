import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get matches for an agent
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // Verify agent belongs to user
    const { data: agent } = await supabase
      .from('shopping_agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get matches with listing details
    const { data: matches, error } = await supabase
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
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Error in GET /api/agents/matches:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
