import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

interface CampaignResult {
  sent: number;
  failed: number;
  total: number;
}

/**
 * Finds inactive users and sends them a personalized re-engagement email.
 */
export async function runReEngagementEmailCampaign(): Promise<{ success: boolean; results: CampaignResult; error?: string }> {
  try {
    console.log('Starting re-engagement email campaign task...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name')
      .lt('last_login_at', sevenDaysAgo)
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      console.log('No inactive users found for this run.');
      return { success: true, results: { sent: 0, failed: 0, total: 0 } };
    }

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const { data: recentAds } = await supabase
          .from('anunturi')
          .select('id')
          .eq('user_id', user.user_id)
          .gte('created_at', fourteenDaysAgo)
          .limit(1);

        if (recentAds && recentAds.length > 0) {
          continue;
        }

        const { data: trendingCategories } = await supabase
          .from('anunturi')
          .select('categories!inner(name)')
          .gte('created_at', sevenDaysAgo)
          .limit(5);

        const categoryNames = trendingCategories?.map((c: any) => c.categories?.name).filter(Boolean) || [];
        const emailContent = generateReEngagementEmail(user, categoryNames);

        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        await supabase.from('email_campaigns').insert({
          user_id: user.user_id,
          campaign_type: 're-engagement',
          sent_at: new Date().toISOString(),
          status: 'sent'
        });

        sent++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
      } catch (innerError: any) {
        console.error(`Failed to send email to ${user.email}:`, innerError);
        failed++;
      }
    }

    console.log(`Re-engagement campaign complete. Sent: ${sent}, Failed: ${failed}`);
    return { success: true, results: { sent, failed, total: users.length } };

  } catch (error: any) {
    console.error('Re-engagement email campaign task failed:', error);
    return { success: false, results: { sent: 0, failed: 0, total: 0 }, error: error.message };
  }
}

function generateReEngagementEmail(user: any, trendingCategories: string[]) {
  const firstName = user.full_name?.split(' ')[0] || 'Utilizator';
  const categoriesText = trendingCategories.length > 0
    ? `Categoriile populare acum: ${trendingCategories.slice(0, 3).join(', ')}.`
    : '';

  return {
    subject: `${firstName}, ne-ai lipsit! 🎯 Oferte noi pe Piata AI`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .trending { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Bun venit înapoi, ${firstName}!</h1>
          </div>
          <div class="content">
            <p>Ne-ai lipsit pe Piata AI! În timp ce ai fost plecat, piața a fost foarte activă.</p>
            
            <div class="trending">
              <h3>🔥 Ce e nou:</h3>
              <p>${categoriesText}</p>
              <ul>
                <li>Peste 1000 de anunțuri noi în ultima săptămână</li>
                <li>Sistem AI îmbunătățit pentru validare instantanee</li>
                <li>Funcție nouă: Auto-repost pentru anunțurile tale</li>
              </ul>
            </div>

            <p><strong>Avantaje speciale pentru tine:</strong></p>
            <ul>
              <li>✅ Primul anunț gratuit când revii</li>
              <li>✅ Acces la agent AI de căutare inteligentă</li>
              <li>✅ Notificări instant pentru oferte potrivite</li>
            </ul>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta">
                Revino pe platformă →
              </a>
            </center>

            <p style="margin-top: 30px;">
              Dacă ai întrebări, echipa noastră AI și umană te așteaptă!
            </p>
          </div>
          <div class="footer">
            <p>Piata AI - Marketplace-ul inteligent al României</p>
            <p>Dacă nu mai dorești emailuri, <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">dezabonează-te aici</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Bun venit înapoi, ${firstName}!
      
      Ne-ai lipsit pe Piata AI! În timp ce ai fost plecat, piața a fost foarte activă.
      
      ${categoriesText}
      
      - Peste 1000 de anunțuri noi în ultima săptămână
      - Sistem AI îmbunătățit pentru validare instantanee
      - Funcție nouă: Auto-repost pentru anunțurile tale
      
      Avantaje speciale pentru tine:
      - Primul anunț gratuit când revii
      - Acces la agent AI de căutare inteligentă
      - Notificări instant pentru oferte potrivite
      
      Revino pe platformă: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
      
      Piata AI - Marketplace-ul inteligent al României
    `
  };
}
