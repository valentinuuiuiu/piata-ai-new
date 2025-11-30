import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');

    const supabase = createServiceClient();

    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (error) {
      console.error('Supabase test error:', error);
      return NextResponse.json({
        status: 'ERROR',
        error: error.message,
        details: 'Database connection failed'
      }, { status: 500 });
    }

    console.log('Supabase connection successful:', data);

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Supabase connection working',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}