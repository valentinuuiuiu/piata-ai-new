import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { listingId, action, userToken } = await request.json();
    
    if (!listingId || !action) {
      return NextResponse.json({ error: 'Listing ID and action required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Get listing with user info
    const { data: listing, error: listingError } = await supabase
      .from('anunturi')
      .select(`
        *,
        users!inner(
          email,
          name
        )
      `)
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Verify user token (simple verification)
    const expectedToken = generateUserToken(listing.user_id);
    if (userToken !== expectedToken) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    let updateData: any = {};
    let emailSubject = '';
    let emailMessage = '';

    switch (action) {
      case 'confirm_and_publish':
        updateData = {
          status: 'active',
          user_confirmed_at: new Date().toISOString(),
          ai_approved: true
        };
        emailSubject = '✅ Anunțul tău a fost publicat!';
        emailMessage = generateConfirmationEmail(listing, true);
        break;

      case 'request_fixes':
        updateData = {
          status: 'pending_fixes',
          user_requested_fixes: true,
          user_requested_at: new Date().toISOString()
        };
        emailSubject = '🔧 Solicitare corectare anunț';
        emailMessage = generateFixRequestEmail(listing);
        break;

      case 'reject_listing':
        updateData = {
          status: 'user_rejected',
          user_rejected_at: new Date().toISOString()
        };
        emailSubject = '📋 Anunț retras de utilizator';
        emailMessage = generateRejectionEmail(listing);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update listing
    await supabase
      .from('anunturi')
      .update(updateData)
      .eq('id', listingId);

    // Send confirmation email
    await resend.emails.send({
      from: 'Piata AI RO <noreply@piata-ai.ro>',
      to: [listing.users.email],
      subject: emailSubject,
      html: emailMessage
    });

    return NextResponse.json({
      success: true,
      action,
      listingId,
      newStatus: updateData.status
    });

  } catch (error) {
    console.error('❌ User action error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateUserToken(userId: string): string {
  // Simple token generation - in production, use JWT
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64').substring(0, 20);
}

function generateConfirmationEmail(listing: any, isApproved: boolean): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmare Anunț Piata AI RO</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; padding: 15px 30px; background: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .listing-info { background: #e5e7eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ${isApproved ? 'Anunț Publicat!' : 'Confirmare Anunț'}</h1>
          <p>${isApproved ? 'Anunțul tău este acum live pe Piata AI RO' : 'Mulțumim pentru confirmare'}</p>
        </div>
        <div class="content">
          <div class="listing-info">
            <h2>${listing.title}</h2>
            <p><strong>Preț:</strong> ${listing.price} lei</p>
            <p><strong>Locație:</strong> ${listing.location || 'Nespecificat'}</p>
            <p><strong>Categorie:</strong> ${listing.category_id}</p>
          </div>
          
          ${isApproved ? `
            <h3>🚀 Următorii pași:</h3>
            <ul>
              <li>Anunțul tău este vizibil pentru toți utilizatorii</li>
              <li>Vei primi notificări pentru interese</li>
              <li>Poți gestiona anunțul din dashboard</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/anunt/${listing.id}" class="btn">
                Vezi Anunțul Tău
              </a>
            </div>
          ` : `
            <h3>⏳ În așteptare:</h3>
            <p>Anunțul tău este în procesare și va fi publicat curând.</p>
          `}
          
          <div class="footer">
            <p>Timp de procesare: <30 secunde</p>
            <p>Pentru suport, vizitează <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Dashboard</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFixRequestEmail(listing: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Solicitare Corectare - Piata AI RO</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .issues { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .suggestions { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Solicitare Corectare Anunț</h1>
          <p>Vom corecta problemele identificate de AI</p>
        </div>
        <div class="content">
          <h2>${listing.title}</h2>
          
          <div class="issues">
            <h3>❌ Probleme de corectat:</h3>
            <p>${listing.ai_validation_issues?.join(', ') || 'Se analizează...'}</p>
          </div>
          
          <div class="suggestions">
            <h3>💡 Sugestii AI:</h3>
            <p>${listing.ai_validation_suggestions?.join(', ') || 'Se generează sugestii...'}</p>
          </div>
          
          <div class="footer">
            <p>Timp estimat de corectare: <24 ore</p>
            <p>Vei primi notificare când anunțul este gata</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateRejectionEmail(listing: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Anunț Retras - Piata AI RO</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Anunț Retras</h1>
          <p>Anunțul tău a fost retras conform solicitării</p>
        </div>
        <div class="content">
          <h2>${listing.title}</h2>
          <p>Anunțul tău a fost retras din platformă. Poți posta oricând un anunț nou.</p>
          
          <div class="footer">
            <p>Mulțumim că folosești Piata AI RO</p>
            <p>Pentru a posta un anunț nou, vizitează <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Dashboard</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}