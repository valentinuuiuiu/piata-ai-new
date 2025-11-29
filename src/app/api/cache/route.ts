import { NextResponse } from 'next/server';
import redisCache from '@/lib/redis-cache';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Check authentication (admin only)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, pattern } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    await redisCache.connect();

    switch (action) {
      case 'clear_listings':
        await redisCache.invalidatePattern('listings:*');
        return NextResponse.json({
          success: true,
          message: 'Listings cache cleared',
          pattern: 'listings:*'
        });

      case 'clear_analytics':
        await redisCache.invalidatePattern('analytics:*');
        return NextResponse.json({
          success: true,
          message: 'Analytics cache cleared',
          pattern: 'analytics:*'
        });

      case 'clear_all':
        await redisCache.clear('*');
        return NextResponse.json({
          success: true,
          message: 'All cache cleared'
        });

      case 'clear_pattern':
        if (!pattern) {
          return NextResponse.json({ error: 'Pattern is required for clear_pattern action' }, { status: 400 });
        }
        await redisCache.invalidatePattern(pattern);
        return NextResponse.json({
          success: true,
          message: `Cache cleared for pattern: ${pattern}`,
          pattern
        });

      case 'stats':
        const stats = await redisCache.getStats();
        return NextResponse.json({
          success: true,
          stats
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Cache management error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await redisCache.connect();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    if (action === 'stats') {
      const stats = await redisCache.getStats();
      return NextResponse.json({
        success: true,
        stats
      });
    }

    return NextResponse.json({ error: 'Invalid action for GET' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Cache stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}