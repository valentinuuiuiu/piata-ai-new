/**
 * Twitter/X Automation Service
 * Handles posting to Twitter for Piata AI marketplace
 */

export class TwitterService {
  private static API_KEY = process.env.TWITTER_API_KEY;
  private static API_SECRET = process.env.TWITTER_API_SECRET;
  private static ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
  private static ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  private static BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

  /**
   * Post a tweet to Twitter
   */
  static async postTweet(content: string): Promise<any> {
    if (!this.BEARER_TOKEN) {
      console.error('[TwitterService] No Bearer Token configured');
      return { success: false, error: 'No token configured' };
    }

    try {
      const url = 'https://api.twitter.com/2/tweets';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content
        })
      });

      const result = await response.json();

      if (result.errors) {
        console.error('[TwitterService] Error posting:', result.errors);
        return { success: false, error: result.errors[0].detail };
      }

      console.log('[TwitterService] Successfully posted tweet:', result.data.id);
      return { success: true, tweetId: result.data.id };

    } catch (error: any) {
      console.error('[TwitterService] Fatal error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate Twitter-optimized content for Romanian market
   */
  static generateTweetContent(listing: any): string {
    return `🔥 HOT pe @PiataAI: ${listing.title}

💰 ${listing.price} RON | 📍 ${listing.location}

👀 ${listing.views || 0} vizualizări în 24h!

🤖 Validat cu AI | 🔒 Escrow protejat

🔗 ${process.env.NEXT_PUBLIC_APP_URL}/anunt/${listing.id}

#PiataAI #MarketplaceRO #Vânzare #Romania`;
  }
}