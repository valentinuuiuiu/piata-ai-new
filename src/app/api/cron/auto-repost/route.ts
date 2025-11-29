import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const AUTO_REPOST_PRICE = 0.5;

// Interval to hours mapping
const INTERVAL_TO_HOURS: Record<string, number> = {
  '15m': 0.25,
  '30m': 0.5,
  '1h': 1,
  '2h': 2,
  '6h': 6,
  '12h': 12,
  '24h': 24
};

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all ads eligible for auto-repost
    const { data: ads, error: adsError } = await supabase
      .from('anunturi')
      .select(`
        id,
        user_id,
        title,
        auto_repost_enabled,
        auto_repost_interval,
        last_reposted_at,
        first_published_at,
        repost_count
      `)
      .eq('status', 'active')
      .eq('auto_repost_enabled', true);

    if (adsError) {
      console.error('Error fetching ads:', adsError);
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({ message: 'No ads to repost', processed: 0 });
    }

    const results = [];
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const ad of ads) {
      try {
        // Check if enough time has passed since last repost
        const interval = ad.auto_repost_interval || '24h';
        const requiredHours = INTERVAL_TO_HOURS[interval] || 24;
        const lastRepost = ad.last_reposted_at ? new Date(ad.last_reposted_at) : new Date(ad.first_published_at);
        const hoursSinceLastRepost = (Date.now() - lastRepost.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastRepost < requiredHours) {
          skipped++;
          continue;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('credits_balance')
          .eq('user_id', ad.user_id)
          .single();

        if (!profile || profile.credits_balance < AUTO_REPOST_PRICE) {
          // Disable auto-repost if insufficient credits
          await supabase
            .from('anunturi')
            .update({ auto_repost_enabled: false })
            .eq('id', ad.id);

          results.push({
            ad_id: ad.id,
            status: 'disabled',
            reason: 'Insufficient credits'
          });
          skipped++;
          continue;
        }

        // Deduct credits
        await supabase
          .from('user_profiles')
          .update({
            credits_balance: profile.credits_balance - AUTO_REPOST_PRICE,
            total_credits_spent: (profile as any).total_credits_spent + AUTO_REPOST_PRICE
          })
          .eq('user_id', ad.user_id);

        // Update ad
        await supabase
          .from('anunturi')
          .update({
            last_reposted_at: new Date().toISOString(),
            repost_count: ad.repost_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', ad.id);

        // Log the repost
        const daysActive = Math.floor((Date.now() - new Date(ad.first_published_at).getTime()) / (1000 * 60 * 60 * 24));

        await supabase.from('ad_repostings').insert({
          ad_id: ad.id,
          user_id: ad.user_id,
          credits_used: AUTO_REPOST_PRICE,
          repost_type: 'auto',
          days_since_publish: daysActive
        });

        // Log transaction
        await supabase.from('credits_transactions').insert({
          user_id: ad.user_id,
          credits_amount: -AUTO_REPOST_PRICE,
          transaction_type: 'repost',
          ad_id: ad.id,
          status: 'completed',
          notes: `Auto-repost (${interval})`
        });

        results.push({
          ad_id: ad.id,
          status: 'reposted',
          credits_used: AUTO_REPOST_PRICE
        });
        processed++;

      } catch (error) {
        console.error(`Error processing ad ${ad.id}:`, error);
        results.push({
          ad_id: ad.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      failed,
      total: ads.length,
      results
    });

  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
