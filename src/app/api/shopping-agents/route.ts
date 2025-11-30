import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/shopping-agents - List all shopping agents for current user
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shopping agents:', error);
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shopping-agents - Create a new shopping agent
export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    
    const { name, description, filters } = body;
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('shopping_agents')
      .insert({
        name,
        description,
        filters: filters || {},
        user_id: body.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shopping agent:', error);
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
    }

    return NextResponse.json({ success: true, agent: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}