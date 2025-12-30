
import {
  Resend
} from 'resend';
import {
  createClient
} from '@supabase/supabase-js';
import {
  sendEmail,
  sendToTeam
} from './client';
import {
  generateAdConfirmationHTML,
  generateAdConfirmationText,
  generateAdminNotificationHTML,
  generateAccountCreationHTML
} from './templates';
import {
  randomBytes,
  createHash
} from 'node:crypto';

// Initialize Supabase client for token storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface AdConfirmationParams {
  email: string;
  adId: number;
  adTitle: string;
  price?: number;
  category?: string;
  location?: string;
  platform?: string; // Added for compatibility with email-automation.ts
}

export interface AdConfirmationResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Generate verification token
 */
export function generateVerificationToken(bytes: number = 32): string {
  return randomBytes(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Store confirmation token in database
 */
async function storeConfirmationToken(token: string, adId: number, email: string): Promise<boolean> {
  if (!supabase) {
    console.warn('[PAI Email] Supabase not configured, using in-memory storage (mock)');
    return false;
  }
  
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const {
      error
    } = await supabase
      .from('listing_confirmations')
      .insert({
        listing_id: adId,
        token,
        email,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });
    
    if (error) {
      console.error('[PAI Email] Failed to store token:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[PAI Email] Token storage error:', error);
    return false;
  }
}

/**
 * Send ad posting confirmation email
 */
export async function sendAdConfirmationEmail(params: AdConfirmationParams): Promise<AdConfirmationResult> {
  const {
    email,
    adId,
    adTitle
  } = params;
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Invalid email address'
    };
  }
  
  try {
    const token = generateVerificationToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${appUrl}/api/confirm-listing?token=${token}&id=${adId}`;
    
    // Store token
    await storeConfirmationToken(token, adId, email);
    
    // Generate content
    const html = generateAdConfirmationHTML(params, confirmLink);
    const text = generateAdConfirmationText(params, confirmLink);
    
    // Send
    const result = await sendEmail({
      to: email,
      subject: `✅ Confirmă anunțul: "${adTitle}" - Piata AI`,
      html,
      text
    });
    
    if (!result.success) {
      return {
        success: false,
        error: result.error as string
      };
    }
    
    return {
      success: true,
      emailId: result.data?.id
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Alias for compatibility with old email-automation.ts
export const sendAdPostingConfirmationEmail = async (
  email: string,
  adData: {
    title: string;
    platform?: string;
    category?: string;
    price?: number;
    location?: string;
  },
  token: string
) => {
    // This old function expected a token passed in, likely stored elsewhere.
    // We recreate the link using that token.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/api/verify-confirmation?token=${encodeURIComponent(token)}`;

    const html = generateAdConfirmationHTML({
        email,
        adId: 0, // Mock ID since it's not provided in this sig
        adTitle: adData.title,
        price: adData.price,
        category: adData.category,
        location: adData.location
    }, link);

    return sendEmail({
        to: email,
        subject: 'Confirmă postarea anunțului - Piata AI',
        html,
        text: `Confirmă postarea anunțului: ${link}`,
    });
};

/**
 * Verify ad confirmation token
 */
export async function verifyConfirmationToken(token: string, adId: number): Promise<boolean> {
  // TODO: Implement actual verification against Supabase if needed
  console.log(`[PAI Email] Verifying token for ad #${adId}`);
  return true;
}

/**
 * Send email to admin about new ad
 */
export async function sendAdminNotification(params: {
  adId: number;
  adTitle: string;
  userEmail: string;
  category: string;
}): Promise<AdConfirmationResult> {
  try {
    const html = generateAdminNotificationHTML(params);
    
    const result = await sendToTeam({
      subject: `[PIATA AI] Anunț nou: ${params.adTitle}`,
      html,
      text: `Anunț nou: ${params.adTitle} de la ${params.userEmail}`
    });
    
    if (!result.success) {
        return {
          success: false,
          error: result.error as string
        };
    }

    return {
      success: true,
      emailId: result.data?.id
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendAccountCreationEmail(email: string, token: string, name?: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/api/verify-confirmation?token=${encodeURIComponent(token)}`;
  
    const html = generateAccountCreationHTML(link, name);
  
    return sendEmail({
      to: email,
      subject: 'Confirmă crearea contului - Piata AI',
      html,
      text: `Confirmă crearea contului: ${link}`,
    });
}

export async function sendPermissionRequestEmail(
    adminEmail: string,
    data: {
      requesterName: string;
      requesterEmail: string;
      platform?: string;
      adTitle: string;
      reason: string;
      approvalLink: string;
      rejectionLink: string;
    }
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Cerere permisiune</h2>
        <p><strong>Solicitant:</strong> ${data.requesterName} (${data.requesterEmail})</p>
        <p><strong>Permisiune:</strong> ${data.adTitle}</p>
        <p><strong>Motiv:</strong> ${data.reason}</p>
        <p style="margin: 24px 0;">
          <a href="${data.approvalLink}" style="background:#22c55e;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;margin-right:10px;display:inline-block;">Aprobă</a>
          <a href="${data.rejectionLink}" style="background:#ef4444;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block;">Respinge</a>
        </p>
        <p style="color:#666;font-size:12px;">Dacă butoanele nu funcționează: ${data.approvalLink} / ${data.rejectionLink}</p>
      </div>
    `;
  
    return sendEmail({
      to: adminEmail,
      subject: 'Aprobare necesară - Piata AI',
      html,
      text: `Aprobă: ${data.approvalLink}\nRespinge: ${data.rejectionLink}`,
    });
}

export async function sendSuggestionEmail(data: {
    name: string;
    email: string;
    type: string;
    message: string;
    userAgent?: string;
    url?: string;
}) {
    // Re-implemented from client to keep types, but could use client's shared templates if we moved them
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00f0ff; border-bottom: 2px solid #ff00f0; padding-bottom: 10px;">
          📬 Nou Mesaj - Piata AI
        </h2>
  
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong style="color: #ff00f0;">Tip:</strong> ${data.type}</p>
          <p><strong style="color: #ff00f0;">Nume:</strong> ${data.name}</p>
          <p><strong style="color: #ff00f0;">Email:</strong> ${data.email}</p>
        </div>
  
        <div style="background: #fff; padding: 20px; border-left: 4px solid #00f0ff; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Mesaj:</h3>
          <p style="white-space: pre-wrap; color: #666;">${data.message}</p>
        </div>
  
        ${data.url ? `
          <div style="font-size: 12px; color: #999; margin-top: 20px;">
            <p><strong>URL:</strong> ${data.url}</p>
            ${data.userAgent ? `<p><strong>Browser:</strong> ${data.userAgent}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  
    return sendToTeam({
      subject: `[Piata AI] ${data.type} - ${data.name}`,
      html,
      text: `${data.type}\n\nDe la: ${data.name} (${data.email})\n\n${data.message}`,
    });
}

export async function sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00f0ff; border-bottom: 2px solid #ff00f0; padding-bottom: 10px;">
          📧 Contact Form - Piata AI
        </h2>
  
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong style="color: #ff00f0;">De la:</strong> ${data.name}</p>
          <p><strong style="color: #ff00f0;">Email:</strong> ${data.email}</p>
          <p><strong style="color: #ff00f0;">Subiect:</strong> ${data.subject}</p>
        </div>
  
        <div style="background: #fff; padding: 20px; border-left: 4px solid #00f0ff; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Mesaj:</h3>
          <p style="white-space: pre-wrap; color: #666;">${data.message}</p>
        </div>
      </div>
    `;
  
    return sendToTeam({
      subject: `[Contact] ${data.subject} - ${data.name}`,
      html,
      text: `De la: ${data.name} (${data.email})\nSubiect: ${data.subject}\n\n${data.message}`,
    });
}

export async function sendNewsletterWelcome(email: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #00f0ff, #ff00f0);">
          <h1 style="color: white; margin: 0; font-size: 32px;">Bun venit la Piata AI! 🎉</h1>
        </div>
  
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; color: #333;">Salut!</p>
  
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Mulțumim că te-ai abonat la newsletter-ul nostru! Vei primi:
          </p>
  
          <ul style="color: #666; line-height: 1.8;">
            <li>📰 Articole despre AI și tehnologie (în română)</li>
            <li>🚀 Noutăți despre Piata AI</li>
            <li>💡 Tips & tricks pentru marketplace</li>
            <li>🎁 Oferte exclusive pentru abonați</li>
          </ul>
  
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://piata.ro/blog"
               style="background: linear-gradient(135deg, #00f0ff, #ff00f0);
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 25px;
                      font-weight: bold;
                      display: inline-block;">
              Citește Blogul →
            </a>
          </div>
  
          <p style="color: #999; font-size: 14px; margin-top: 40px;">
            Dacă vrei să te dezabonezi, click
            <a href="https://piata.ro/unsubscribe?email=${encodeURIComponent(email)}" style="color: #00f0ff;">aici</a>
          </p>
        </div>
      </div>
    `;
  
    return sendEmail({
      to: email,
      subject: '🎉 Bun venit la Piata AI!',
      html,
      text: 'Bun venit la Piata AI! Mulțumim pentru abonare.',
    });
}

export async function sendListingConfirmationEmail(email: string, token: string, title: string) {
    const confirmationLink = `https://piata.ro/confirmare-anunt?token=${token}`;
  
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #00f0ff, #ff00f0);">
          <h1 style="color: white; margin: 0; font-size: 24px;">Confirmă anunțul tău</h1>
        </div>
  
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Salut,</p>
  
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px;">
            Ai postat recent un anunț pe Piata AI: <strong>"${title}"</strong>.
          </p>
  
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px;">
            Pentru a fi publicat, te rugăm să confirmi adresa de email apăsând pe butonul de mai jos:
          </p>
  
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${confirmationLink}"
               style="background: linear-gradient(135deg, #00f0ff, #ff00f0);
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 25px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Confirmă Anunțul ✅
            </a>
          </div>
  
          <p style="font-size: 14px; color: #777; margin-bottom: 10px;">
            Sau copiază acest link în browser:
          </p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">
            <a href="${confirmationLink}" style="color: #00f0ff;">${confirmationLink}</a>
          </p>
  
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
          <p style="color: #999; font-size: 12px; text-align: center;">
            Dacă nu ai postat acest anunț, poți ignora acest email.<br>
            Piata AI - Marketplace-ul Viitorului
          </p>
        </div>
      </div>
    `;
  
    return sendEmail({
      to: email,
      subject: '✅ Confirmă anunțul tău pe Piata AI',
      html,
      text: `Salut, te rugăm să confirmi anunțul "${title}" accesând: ${confirmationLink}`,
    });
}

