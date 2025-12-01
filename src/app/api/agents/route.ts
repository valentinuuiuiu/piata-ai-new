import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List user's agents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: agents, error } = await supabase
      .from('shopping_agents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error('Error in GET /api/agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new agent
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, filters } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Check agent limit (max 5 per user)
    const { count } = await supabase
      .from('shopping_agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 agents allowed per user' },
        { status: 400 }
      );
    }

    const { data: agent, error } = await supabase
      .from('shopping_agents')
      .insert({
        user_id: user.id,
        name,
        description,
        filters: filters || {},
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update agent
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, filters, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (filters !== undefined) updateData.filters = filters;
    if (is_active !== undefined) updateData.is_active = is_active;

    // @ts-ignore - Type definition issue with shopping_agents table
    const { data: agent, error } = await supabase
      .from('shopping_agents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error('Error in PATCH /api/agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete agent
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('shopping_agents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting agent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/agents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
