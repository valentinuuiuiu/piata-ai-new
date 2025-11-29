import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Test Supabase database connection
    const supabase = await createClient();
    const startTime = Date.now();

    // Test basic connectivity
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    const mainDbHealth = {
      success: !error,
      response_time_ms: responseTime,
      error: error?.message,
      tables_available: !error
    };
    
    // Overall system health
    const overallHealth = {
      status: mainDbHealth.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      database: {
        main: mainDbHealth,
        type: 'Supabase PostgreSQL',
        details: {
          host: 'supabase.co',
          provider: 'Supabase',
          response_time_ms: mainDbHealth.response_time_ms
        }
      },
      checks: {
        database_connection: mainDbHealth.success,
        tables_available: mainDbHealth.tables_available,
        overall: mainDbHealth.success
      }
    };

    // Return 503 if any critical check fails
    if (!overallHealth.checks.overall) {
      return NextResponse.json(overallHealth, { 
        status: 503,
        statusText: 'Service Unavailable'
      });
    }

    return NextResponse.json(overallHealth, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Supabase connection failed',
      database: {
        main: { success: false, error: error instanceof Error ? error.message : 'Connection failed' },
        type: 'Supabase PostgreSQL'
      },
      checks: {
        database_connection: false,
        tables_available: false,
        overall: false
      }
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}