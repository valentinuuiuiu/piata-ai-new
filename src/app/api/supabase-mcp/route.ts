import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supabase MCP Server for OpenCode - Protected Routes
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (authorized administrators: ionutbaltag3@gmail.com, claude.dev@mail.com)
    const isAdmin = user.email === 'ionutbaltag3@gmail.com' || user.email === 'claude.dev@mail.com';

    if (!isAdmin) {
      return NextResponse.json({
        error: 'Admin access required for MCP operations. Only authorized administrators can perform database operations.',
        code: 'INSUFFICIENT_PERMISSIONS'
      }, { status: 403 });
    }

    const { method, params } = await request.json();

    console.log(`[Supabase MCP] ${method}:`, params);

    switch (method) {
      case 'list_tables': {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .eq('table_schema', 'public')
          .order('table_name');

        if (tablesError) {
          return NextResponse.json({ error: tablesError.message }, { status: 500 });
        }

        return NextResponse.json({
          tables: tables?.map((t: any) => t.table_name) || []
        });
      }

      case 'describe_table': {
        const { table } = params;
        if (!table) {
          return NextResponse.json({ error: 'Table name required' }, { status: 400 });
        }

        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table)
          .order('ordinal_position');

        if (columnsError) {
          return NextResponse.json({ error: columnsError.message }, { status: 500 });
        }

        return NextResponse.json({
          table,
          columns: columns?.map((c: any) => ({
            name: c.column_name,
            type: c.data_type,
            nullable: c.is_nullable,
            default: c.column_default
          })) || []
        });
      }

      case 'query_anunturi': {
        const { limit = 10, status = 'active' } = params;

        const { data: listings, error: queryError } = await supabase
          .from('anunturi')
          .select('*')
          .eq('status', status)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (queryError) {
          return NextResponse.json({ error: queryError.message }, { status: 500 });
        }

        return NextResponse.json({
          listings: listings?.length || 0,
          data: listings
        });
      }

      case 'update_listing': {
        const { id, updates } = params;
        if (!id || !updates) {
          return NextResponse.json({ error: 'ID and updates required' }, { status: 400 });
        }

        const { data: listing, error: updateError } = await (supabase as any)
          .from('anunturi')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
          message: 'Listing updated successfully',
          listing
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown method' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Supabase MCP] Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for MCP server info
export async function GET(request: Request) {
  return NextResponse.json({
    name: 'supabase-mcp-server',
    version: '1.0.0',
    capabilities: [
      'list_tables',
      'describe_table', 
      'query',
      'create_table'
    ],
    description: 'Supabase MCP server for OpenCode integration',
    endpoints: {
      'POST': '/api/supabase-mcp'
    }
  });
}