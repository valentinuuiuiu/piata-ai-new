/**
 * Facebook Graph API Service
 * Handles posting to Piata AI Facebook Page
 */

export class FacebookService {
  private static ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_API_TOKEN;
  private static API_VERSION = 'v19.0';
  private static BASE_URL = `https://graph.facebook.com/${this.API_VERSION}`;

  /**
   * Post a message to the Facebook Page
   */
  static async postToPage(message: string, link?: string) {
    if (!this.ACCESS_TOKEN) {
      console.error('[FacebookService] No Access Token configured');
      return { success: false, error: 'No token' };
    }

    try {
      // 1. Get Page ID (if we don't have it)
      const pageData = await this.getPiataAIPage();
      if (!pageData) {
        return { success: false, error: 'Could not find Piata AI page' };
      }

      const { id: pageId, access_token: pageAccessToken } = pageData;

      // 2. Post to Page
      const url = `${this.BASE_URL}/${pageId}/feed`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          link,
          access_token: pageAccessToken || this.ACCESS_TOKEN
        })
      });

      const result = await response.json();
      
      if (result.error) {
        console.error('[FacebookService] Error posting:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('[FacebookService] Successfully posted to Facebook:', result.id);
      return { success: true, postId: result.id };

    } catch (error: any) {
      console.error('[FacebookService] Fatal error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find the "Piata AI" page in the user's accounts
   */
  private static async getPiataAIPage() {
    try {
      const response = await fetch(`${this.BASE_URL}/me/accounts?access_token=${this.ACCESS_TOKEN}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // Look for Piata AI page
      const page = data.data?.find((p: any) => 
        p.name.toLowerCase().includes('piata ai') || 
        p.id === process.env.FACEBOOK_PAGE_ID
      );

      return page || data.data?.[0]; // Fallback to first page if only one
    } catch (error) {
      console.error('[FacebookService] Error fetching accounts:', error);
      return null;
    }
  }
}
