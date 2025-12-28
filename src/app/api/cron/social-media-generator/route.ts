import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Social Media Content Generator
 * Generates social media posts from trending listings
 * Runs every 6 hours
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('[SOCIAL] Unauthorized cron request');
    }

    console.log('[SOCIAL] Generating social media content...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get trending listings (most viewed in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: listings, error } = await supabase
      .from('anunturi')
      .select(`
        id,
        title,
        price,
        location,
        images,
        views,
        category_id,
        categories!inner(name)
      `)
      .eq('status', 'active')
      .gte('created_at', oneDayAgo)
      .order('views', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[SOCIAL] Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    const posts = [];

    for (const listing of listings || []) {
      // Facebook Post
      const facebookPost = {
        platform: 'facebook',
        content: `🔥 OFERTĂ POPULARĂ pe Piata AI!\n\n${listing.title}\n💰 Preț: ${listing.price} RON\n📍 Locație: ${listing.location}\n\n👀 ${listing.views} persoane au văzut deja această ofertă!\n\n🔗 Vezi detalii: ${process.env.NEXT_PUBLIC_APP_URL}/anunt/${listing.id}\n\n#PiataAI #Marketplace #${(listing.categories as any)?.name?.replace(/\s+/g, '')} #Romania`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      };

      // Instagram Caption
      const instagramPost = {
        platform: 'instagram',
        content: `🎯 ${listing.title}\n\n💰 ${listing.price} RON | 📍 ${listing.location}\n\n✨ Găsește cele mai bune oferte pe Piata AI - marketplace-ul inteligent al României!\n\n🔗 Link în bio\n\n#piataai #marketplace #shopping #romania #${(listing.categories as any)?.name?.toLowerCase().replace(/\s+/g, '')} #deals #ofertedevis`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      };

      // Twitter/X Thread
      const twitterPost = {
        platform: 'twitter',
        content: `🔥 Trending pe @PiataAI:\n\n"${listing.title}"\n\n💰 ${listing.price} RON\n📍 ${listing.location}\n\n👀 ${listing.views} views în 24h!\n\n🤖 Validat instant de AI\n\n🔗 ${process.env.NEXT_PUBLIC_APP_URL}/anunt/${listing.id}\n\n#PiataAI #AIMarketplace #Romania`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      };

      posts.push(facebookPost, instagramPost, twitterPost);
    }

    // Save posts to database for manual publishing or API integration
    const { data: savedPosts, error: saveError } = await supabase
      .from('social_media_posts')
      .insert(posts)
      .select();

    if (saveError) {
      console.error('[SOCIAL] Error saving posts:', saveError);
      // Continue even if save fails
    }

    console.log(`[SOCIAL] Generated ${posts.length} social media posts`);

    return NextResponse.json({
      success: true,
      postsGenerated: posts.length,
      posts: posts.map(p => ({ platform: p.platform, preview: p.content.substring(0, 100) }))
    });

  } catch (error) {
    console.error('[SOCIAL] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
