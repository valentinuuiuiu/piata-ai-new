import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get all tables info
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }

    // Get sample data from key tables
    const tableData: any = {};

    const keyTables = ['users', 'anunturi', 'categories', 'subcategories', 'user_profiles'];
    
    for (const tableName of keyTables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(5);

        if (!error) {
          tableData[tableName] = {
            count,
            sample: data || [],
            columns: data && data.length > 0 ? Object.keys(data[0]) : []
          };
        } else {
          tableData[tableName] = { error: error.message };
        }
      } catch (err) {
        tableData[tableName] = { error: 'Table not accessible' };
      }
    }

    return NextResponse.json({
      tables: tables?.map(t => t.table_name) || [],
      tableData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Supabase check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}