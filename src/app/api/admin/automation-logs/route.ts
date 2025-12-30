import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // optional filter

    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching automation logs:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch automation logs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(logs || []);
  } catch (error: any) {
    console.error('Error in automation-logs API:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching automation logs.', details: error.message },
      { status: 500 }
    );
  }
}