import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { ad_id, enable_auto_repost } = await req.json();
    
    if (!ad_id) {
      return NextResponse.json({ error: 'ad_id required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ad info
    const { data: ad, error: adError } = await supabase
      .from('anunturi')
      .select('user_id, created_at, first_published_at, last_reposted_at, repost_count')
      .eq('id', ad_id)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Check ownership
    // Use type assertion to avoid TS errors since types might not be generated yet
    if ((ad as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to repost this ad' }, { status: 403 });
    }

    // Calculate days since first publish
    const firstPublish = new Date((ad as any).first_published_at || (ad as any).created_at);
    const daysSincePublish = Math.floor((Date.now() - firstPublish.getTime()) / (1000 * 60 * 60 * 24));

    // Determine credits needed based on days active
    const creditsNeeded = daysSincePublish <= 7 ? 0.5 : 1.5;

    // Get user's current credits balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    // Check if user has enough credits
    if ((profile as any).credits_balance < creditsNeeded) {
      return NextResponse.json({
        error: 'Insufficient credits',
        needed: creditsNeeded,
        balance: (profile as any).credits_balance,
        days_active: daysSincePublish
      }, { status: 402 }); // 402 Payment Required
    }

    // If only enabling auto-repost (no immediate repost)
    if (enable_auto_repost !== undefined) {
      const { auto_repost_interval } = await req.json().catch(() => ({}));
      
      const updateData: any = { auto_repost_enabled: enable_auto_repost };
      if (auto_repost_interval) {
        updateData.auto_repost_interval = auto_repost_interval;
      }

      const { error: updateError } = await supabase
        .from('anunturi')
        // @ts-expect-error - Supabase types don't support dynamic update objects
        .update(updateData)
        .eq('id', ad_id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update auto-repost setting' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        auto_repost_enabled: enable_auto_repost,
        auto_repost_interval: auto_repost_interval || '24 hours',
        message: enable_auto_repost 
          ? `Auto-repost enabled. Interval: ${auto_repost_interval || '24 hours'}. Cost: 0.5 credits/repost.`
          : 'Auto-repost disabled.'
      });
    }

    // Execute manual repost
    try {
      // Deduct credits
      const { error: deductError } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: creditsNeeded,
        p_ad_id: ad_id,
        p_transaction_type: 'manual_repost'
      } as any);

      if (deductError) {
        console.error('Deduct credits error:', deductError);
        return NextResponse.json({ 
          error: 'Failed to deduct credits',
          details: deductError.message 
        }, { status: 500 });
      }

      // Update ad (bump to top)
      const { error: updateError } = await supabase
        .from('anunturi')
        // @ts-expect-error - Supabase types don't include all our custom columns
        .update({
          last_reposted_at: new Date().toISOString(),
          repost_count: ((ad as any).repost_count || 0) + 1,
          updated_at: new Date().toISOString() // Bumps to top of listings
        })
        .eq('id', ad_id);

      if (updateError) {
        console.error('Update ad error:', updateError);
        // Try to refund credits if update fails
        await supabase.rpc('add_credits', {
          p_user_id: user.id,
          p_amount: creditsNeeded
        } as any);
        return NextResponse.json({ error: 'Failed to repost ad' }, { status: 500 });
      }

      // Log reposting
      await supabase
        .from('ad_repostings')
        .insert({
          ad_id,
          user_id: user.id,
          credits_used: creditsNeeded,
          repost_type: 'manual',
          days_since_publish: daysSincePublish
        } as any);

      return NextResponse.json({
        success: true,
        credits_used: creditsNeeded,
        new_balance: (profile as any).credits_balance - creditsNeeded,
        days_active: daysSincePublish,
        repost_count: ((ad as any).repost_count || 0) + 1,
        message: `Ad reposted successfully! Used ${creditsNeeded} credits.`
      });

    } catch (error) {
      console.error('Repost error:', error);
      return NextResponse.json({ 
        error: 'Failed to process repost',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check repost eligibility and cost
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ad_id = searchParams.get('ad_id');

    if (!ad_id) {
      return NextResponse.json({ error: 'ad_id required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ad info
    const { data: ad, error } = await supabase
      .from('anunturi')
      .select('user_id, created_at, first_published_at, last_reposted_at, repost_count, auto_repost_enabled, auto_repost_interval')
      .eq('id', ad_id)
      .single();

    if (error || !ad || (ad as any).user_id !== user.id) {
      return NextResponse.json({ error: 'Ad not found or unauthorized' }, { status: 404 });
    }

    // Calculate cost
    const firstPublish = new Date((ad as any).first_published_at || (ad as any).created_at);
    const daysSincePublish = Math.floor((Date.now() - firstPublish.getTime()) / (1000 * 60 * 60 * 24));
    const creditsNeeded = daysSincePublish <= 7 ? 0.5 : 1.5;

    // Get balance
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', user.id)
      .single();

    // Check last repost time
    const hoursSinceRepost = (ad as any).last_reposted_at 
      ? (Date.now() - new Date((ad as any).last_reposted_at).getTime()) / (1000 * 60 * 60)
      : 999;

    return NextResponse.json({
      ad_id: parseInt(ad_id),
      days_active: daysSincePublish,
      credits_needed: creditsNeeded,
      user_balance: (profile as any)?.credits_balance || 0,
      can_repost: ((profile as any)?.credits_balance || 0) >= creditsNeeded,
      repost_count: (ad as any).repost_count || 0,
      last_reposted: (ad as any).last_reposted_at,
      hours_since_repost: Math.round(hoursSinceRepost),
      auto_repost_enabled: (ad as any).auto_repost_enabled || false,
      auto_repost_interval: (ad as any).auto_repost_interval || '24 hours',
      pricing_info: {
        first_7_days: 0.5,
        after_7_days: 1.5,
        current_rate: creditsNeeded
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
