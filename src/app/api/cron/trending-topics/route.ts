import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[TRENDS] Identifying trending topics and generating content...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: agents, error } = await supabase
      .from('shopping_agents')
      .select('filters')
      .gte('created_at', twentyFourHoursAgo);

    if (error) {
      console.error('[TRENDS] Error fetching shopping agents:', error);
      return NextResponse.json({ error: 'Failed to fetch shopping agents' }, { status: 500 });
    }

    let promotionalMessage = 'Check out the latest deals on piata-ai.ro!';

    if (agents && agents.length > 0) {
      const keywordCounts: { [key: string]: number } = {};
      const locationCounts: { [key: string]: number } = {};

      for (const agent of agents) {
        const filters = agent.filters as any;
        if (filters.keywords && Array.isArray(filters.keywords)) {
          for (const keyword of filters.keywords) {
            const lowerKeyword = keyword.toLowerCase();
            keywordCounts[lowerKeyword] = (keywordCounts[lowerKeyword] || 0) + 1;
          }
        }
        if (filters.location) {
          const lowerLocation = filters.location.toLowerCase();
          locationCounts[lowerLocation] = (locationCounts[lowerLocation] || 0) + 1;
        }
      }

      const sortedKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]);
      const sortedLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);

      const topKeywords = sortedKeywords.slice(0, 3).map(item => item[0]);
      const topLocations = sortedLocations.slice(0, 3).map(item => item[0]);

      if (topKeywords.length > 0) {
        let message = `Trending now on piata-ai.ro: ${topKeywords.join(', ')}`;
        if (topLocations.length > 0) {
          message += ` in ${topLocations.join(', ')}`;
        }
        message += '! Find the best deals today.';
        promotionalMessage = message;
      }
    }

    // In a real application, this message would be sent to a social media service,
    // an email marketing platform, or a push notification service.
    // For now, we'll just log it and return it in the response.
    console.log(`[TRENDS] Generated promotional message: "${promotionalMessage}"`);

    return NextResponse.json({
      promotionalMessage,
    });

  } catch (error) {
    console.error('[TRENDS] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
