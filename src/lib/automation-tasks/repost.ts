import { createClient } from '@supabase/supabase-js';

const AUTO_REPOST_PRICE = 0.5;

const INTERVAL_TO_HOURS: Record<string, number> = {
  '15m': 0.25,
  '30m': 0.5,
  '1h': 1,
  '2h': 2,
  '6h': 6,
  '12h': 12,
  '24h': 24
};

interface AutoRepostResult {
  processed: number;
  skipped: number;
  failed: number;
  total: number;
}

/**
 * Automatically reposts eligible ads, deducts credits from the user,
 * and logs the transactions.
 */
export async function autoRepostListings(): Promise<{ success: boolean; results: AutoRepostResult; error?: string }> {
  try {
    console.log('Starting auto-repost task...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: ads, error: adsError } = await supabase
      .from('anunturi')
      .select('id, user_id, title, auto_repost_enabled, auto_repost_interval, last_reposted_at, first_published_at, repost_count')
      .eq('status', 'active')
      .eq('auto_repost_enabled', true);

    if (adsError) {
      throw new Error(`Failed to fetch ads: ${adsError.message}`);
    }

    if (!ads || ads.length === 0) {
      console.log('No ads to repost.');
      return { success: true, results: { processed: 0, skipped: 0, failed: 0, total: 0 } };
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const ad of ads) {
      try {
        const interval = ad.auto_repost_interval || '24h';
        const requiredHours = INTERVAL_TO_HOURS[interval] || 24;
        const lastRepost = ad.last_reposted_at ? new Date(ad.last_reposted_at) : new Date(ad.first_published_at);
        const hoursSinceLastRepost = (Date.now() - lastRepost.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastRepost < requiredHours) {
          skipped++;
          continue;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('credits_balance, total_credits_spent')
          .eq('user_id', ad.user_id)
          .single();

        if (!profile || profile.credits_balance < AUTO_REPOST_PRICE) {
          await supabase.from('anunturi').update({ auto_repost_enabled: false }).eq('id', ad.id);
          skipped++;
          continue;
        }

        const newBalance = profile.credits_balance - AUTO_REPOST_PRICE;
        const newTotalSpent = (profile.total_credits_spent || 0) + AUTO_REPOST_PRICE;

        await supabase.from('user_profiles').update({
          credits_balance: newBalance,
          total_credits_spent: newTotalSpent
        }).eq('user_id', ad.user_id);

        await supabase.from('anunturi').update({
          last_reposted_at: new Date().toISOString(),
          repost_count: (ad.repost_count || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('id', ad.id);

        const daysActive = Math.floor((Date.now() - new Date(ad.first_published_at).getTime()) / (1000 * 60 * 60 * 24));

        await supabase.from('ad_repostings').insert({
          ad_id: ad.id,
          user_id: ad.user_id,
          credits_used: AUTO_REPOST_PRICE,
          repost_type: 'auto',
          days_since_publish: daysActive
        });

        await supabase.from('credits_transactions').insert({
          user_id: ad.user_id,
          credits_amount: -AUTO_REPOST_PRICE,
          transaction_type: 'repost',
          ad_id: ad.id,
          status: 'completed',
          notes: `Auto-repost (${interval})`
        });

        processed++;
      } catch (innerError: any) {
        console.error(`Failed to process ad ${ad.id}:`, innerError);
        failed++;
      }
    }

    console.log(`Auto-repost task complete. Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);
    return { success: true, results: { processed, skipped, failed, total: ads.length } };

  } catch (error: any) {
    console.error('Auto-repost task failed:', error);
    return { success: false, results: { processed: 0, skipped: 0, failed: 0, total: 0 }, error: error.message };
  }
}
