import { createClient } from '@supabase/supabase-js';

interface SocialMediaPost {
  platform: 'facebook' | 'instagram' | 'twitter';
  content: string;
  listing_id: string;
  scheduled_for: string;
}

interface SocialMediaResult {
  postsGenerated: number;
}

/**
 * Generates social media posts from the top 5 trending listings in the last 24 hours.
 */
export async function generateSocialMediaContent(): Promise<{ success: boolean; results: SocialMediaResult; error?: string }> {
  try {
    console.log('Starting social media content generation task...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: listings, error } = await supabase
      .from('anunturi')
      .select('id, title, price, location, views, categories!inner(name)')
      .eq('status', 'active')
      .gte('created_at', oneDayAgo)
      .order('views', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }

    if (!listings || listings.length === 0) {
      console.log('No trending listings found to generate content from.');
      return { success: true, results: { postsGenerated: 0 } };
    }

    const posts: SocialMediaPost[] = [];

    for (const listing of listings) {
      const categoryName = (listing.categories as any)?.name?.replace(/\s+/g, '') || 'oferta';
      const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/anunt/${listing.id}`;

      posts.push({
        platform: 'facebook',
        content: `🔥 OFERTĂ POPULARĂ pe Piata AI!\n\n${listing.title}\n💰 Preț: ${listing.price} RON\n📍 Locație: ${listing.location}\n\n👀 ${listing.views} vizualizări!\n\n🔗 Vezi detalii: ${listingUrl}\n\n#PiataAI #${categoryName}`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      });

      posts.push({
        platform: 'instagram',
        content: `🎯 ${listing.title}\n\n💰 ${listing.price} RON | 📍 ${listing.location}\n\n✨ Găsește cele mai bune oferte pe Piata AI!\n\n🔗 Link în bio\n\n#piataai #marketplace #${categoryName}`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      });

      posts.push({
        platform: 'twitter',
        content: `🔥 Trending pe @PiataAI:\n\n"${listing.title}"\n\n💰 ${listing.price} RON\n📍 ${listing.location}\n\n👀 ${listing.views} views!\n\n🔗 ${listingUrl}\n\n#PiataAI`,
        listing_id: listing.id,
        scheduled_for: new Date().toISOString()
      });
    }

    await supabase.from('social_media_posts').insert(posts);

    console.log(`Social media task complete. Generated ${posts.length} posts.`);
    return { success: true, results: { postsGenerated: posts.length } };

  } catch (error: any) {
    console.error('Social media content generation task failed:', error);
    return { success: false, results: { postsGenerated: 0 }, error: error.message };
  }
}
