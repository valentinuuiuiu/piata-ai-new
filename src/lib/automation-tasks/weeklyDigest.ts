import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

interface DigestStats {
  newListings: number;
  activeUsers: number;
  topCategories: string[];
  topListings: any[];
}

interface DigestResult {
  sent: number;
  failed: number;
}

/**
 * Generates and sends a weekly marketplace summary email to all active users.
 */
export async function sendWeeklyDigest(): Promise<{ success: boolean; results: DigestResult; stats: Partial<DigestStats>; error?: string }> {
  try {
    console.log('Starting weekly digest task...');

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: newListingsCount } = await supabase.from('anunturi').select('id', { count: 'exact' }).gte('created_at', oneWeekAgo);
    const { count: activeUsersCount } = await supabase.from('user_profiles').select('user_id', { count: 'exact' }).gte('last_login_at', oneWeekAgo);

    const { data: trendingCategoriesData } = await supabase.from('anunturi').select('categories!inner(name)').gte('created_at', oneWeekAgo).limit(100);
    const categoryCounts: Record<string, number> = {};
    trendingCategoriesData?.forEach((item: any) => {
      const catName = item.categories?.name;
      if (catName) categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name]) => name);

    const { data: topListings } = await supabase.from('anunturi').select('*').gte('created_at', oneWeekAgo).order('views', { ascending: false }).limit(5);

    const stats: DigestStats = {
      newListings: newListingsCount || 0,
      activeUsers: activeUsersCount || 0,
      topCategories,
      topListings: topListings || []
    };

    const { data: users } = await supabase.from('user_profiles').select('user_id, email, full_name').eq('email_notifications', true).limit(1000); // Batch size

    if (!users || users.length === 0) {
      console.log('No users subscribed to the weekly digest.');
      return { success: true, results: { sent: 0, failed: 0 }, stats };
    }

    let sent = 0;
    let failed = 0;
    for (const user of users) {
      try {
        const emailContent = generateDigestEmail(user, stats);
        await sendEmail({ to: user.email, subject: emailContent.subject, html: emailContent.html });
        sent++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
      } catch (innerError: any) {
        console.error(`Failed to send digest to ${user.email}:`, innerError);
        failed++;
      }
    }

    console.log(`Weekly digest task complete. Sent: ${sent}, Failed: ${failed}`);
    return { success: true, results: { sent, failed }, stats };
  } catch (error: any) {
    console.error('Weekly digest task failed:', error);
    return { success: false, results: { sent: 0, failed: 0 }, stats: {}, error: error.message };
  }
}

function generateDigestEmail(user: any, stats: any) {
  const firstName = user.full_name?.split(' ')[0] || 'Utilizator';

  const listingsHtml = stats.topListings.slice(0, 5).map((listing: any) => `
    <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
      <h4 style="margin: 0 0 5px 0;">${listing.title}</h4>
      <p style="margin: 5px 0; color: #667eea; font-weight: bold;">${listing.price} RON</p>
      <p style="margin: 5px 0; color: #666;">📍 ${listing.location} • 👀 ${listing.views} vizualizări</p>
    </div>
  `).join('');

  return {
    subject: `📊 Săptămâna pe Piata AI: ${stats.newListings} anunțuri noi`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .stats { display: flex; justify-content: space-around; padding: 20px; background: #f9f9f9; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
          .content { padding: 20px; }
          .categories { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Rezumatul Săptămânii</h1>
            <p>Piata AI - Ce s-a întâmplat în ultimele 7 zile</p>
          </div>
          
          <div class="content">
            <p>Bună ${firstName}! 👋</p>
            <p>Iată ce s-a întâmplat pe Piata AI în ultima săptămână:</p>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${stats.newListings}</div>
                <div>Anunțuri noi</div>
              </div>
              <div class="stat">
                <div class="stat-number">${stats.activeUsers}</div>
                <div>Utilizatori activi</div>
              </div>
            </div>

            <div class="categories">
              <h3>🔥 Cele mai populare categorii:</h3>
              <ul>
                ${stats.topCategories.map((cat: string) => `<li>${cat}</li>`).join('')}
              </ul>
            </div>

            <h3>⭐ Top anunțuri săptămâna aceasta:</h3>
            ${listingsHtml}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/anunturi" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Vezi toate anunțurile →
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>Piata AI - Marketplace-ul inteligent al României</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Dezabonează-te</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}
