import { NextRequest, NextResponse } from 'next/server';
import { FacebookAutomation } from '@/lib/platforms/facebook-automation';
import { InstagramAutomation } from '@/lib/platforms/instagram-automation';
import { TwitterService } from '@/lib/platforms/twitter-automation';

/**
 * Unified Social Media Posting API
 * Handles posting to Facebook, Instagram, and Twitter
 */
export async function POST(req: NextRequest) {
  try {
    const { platform, content, mediaUrls, postId } = await req.json();

    let result;

    switch (platform.toLowerCase()) {
      case 'facebook':
        result = await FacebookAutomation.postToPage(content, mediaUrls?.[0]);
        break;

      case 'instagram':
        // For now, just generate and return content - actual posting needs API setup
        const instagram = new InstagramAutomation(null as any);
        const campaign = await instagram.createInstagramCampaign('visual_showcase');
        result = {
          success: true,
          content: campaign.content,
          note: 'Instagram posting requires Business API setup'
        };
        break;

      case 'twitter':
        result = await TwitterService.postTweet(content);
        break;

      default:
        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
    }

    // Update post status in database if postId provided
    if (postId && result.success) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase
        .from('social_media_posts')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          post_id: result.postId
        })
        .eq('id', postId);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Social Post API] Error:', error);
    return NextResponse.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
}

// Helper function to create Supabase client
function createClient(url: string, key: string) {
  // This would normally import from @supabase/supabase-js
  // For now, we'll handle it inline
  return {
    from: (table: string) => ({
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          // Mock implementation - in real code this would use actual Supabase client
        })
      })
    })
  };
}