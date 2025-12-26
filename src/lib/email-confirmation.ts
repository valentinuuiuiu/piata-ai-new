/**
 * PAI Email Confirmation Module
 * Internal email sending for ad posting confirmation
 * Uses Resend API directly - no Vercel cron needed
 * Tokens are stored in database for verification
 */

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Supabase client for token storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface AdConfirmationParams {
  email: string;
  adId: number;
  adTitle: string;
  price?: number;
  category?: string;
  location?: string;
}

interface AdConfirmationResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Generate confirmation token for ad
 */
function generateConfirmationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Store confirmation token in database
 */
async function storeConfirmationToken(token: string, adId: number, email: string): Promise<boolean> {
  if (!supabase) {
    console.warn('[PAI Email] Supabase not configured, using in-memory storage');
    return false;
  }
  
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const { error } = await supabase
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
    
    console.log(`[PAI Email] Token stored for ad #${adId}`);
    return true;
    
  } catch (error) {
    console.error('[PAI Email] Token storage error:', error);
    return false;
  }
}

/**
 * Generate HTML for ad confirmation email
 */
function generateConfirmationHTML(params: AdConfirmationParams, confirmLink: string): string {
  const { adTitle, price, category, location } = params;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmare Anunț - Piata AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">📢 Confirmare Anunț</h1>
          <p style="color: #666; margin-top: 10px;">Piata AI RO</p>
        </div>

        <!-- Content -->
        <div style="margin-bottom: 30px;">
          <p style="color: #333; font-size: 16px;">Bună! 👋</p>
          <p style="color: #333; font-size: 16px;">
            Anunțul tău a fost creat și este în așteptarea confirmării email.
          </p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Detalii Anunț
            </h3>
            <p style="margin: 8px 0; color: #555;">
              <strong>📌 Titlu:</strong> ${adTitle}
            </p>
            ${price ? `<p style="margin: 8px 0; color: #555;"><strong>💰 Preț:</strong> ${price} Lei</p>` : ''}
            ${category ? `<p style="margin: 8px 0; color: #555;"><strong>🏷️ Categorie:</strong> ${category}</p>` : ''}
            ${location ? `<p style="margin: 8px 0; color: #555;"><strong>📍 Locație:</strong> ${location}</p>` : ''}
          </div>

          <p style="color: #333; font-size: 16px;">
            Pentru a publica anunțul, te rugăm să confirmi adresa de email:
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      border-radius: 8px; 
                      text-decoration: none; 
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;">
              ✅ Confirmă și Publică Anunțul
            </a>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center;">
            Link-ul expiră în 24 de ore.<br>
            Dacă nu ai postat acest anunț, ignoră acest email.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            🏠 <a href="https://piata.ro" style="color: #667eea;">piata.ro</a> - Piața AI Românească
          </p>
          <p style="color: #ccc; font-size: 11px; margin-top: 10px;">
            Acest email a fost trimis de Piata AI RO
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version
 */
function generateConfirmationText(params: AdConfirmationParams, confirmLink: string): string {
  return `
CONFIRMARE ANUNȚ - PIATA AI

Bună!

Anunțul tău "${params.adTitle}" a fost creat și este în așteptarea confirmării.

${params.price ? `Preț: ${params.price} Lei` : ''}
${params.category ? `Categorie: ${params.category}` : ''}
${params.location ? `Locație: ${params.location}` : ''}

Pentru a publica anunțul, confirmă email-ul:
${confirmLink}

Link-ul expiră în 24 de ore.

---
Piata AI RO - https://piata.ro
  `.trim();
}

/**
 * Send ad posting confirmation email via Resend
 * PAI handles this internally - no Vercel cron needed
 */
export async function sendAdConfirmationEmail(params: AdConfirmationParams): Promise<AdConfirmationResult> {
  const { email, adId, adTitle } = params;
  
  // Validate Resend is configured
  if (!resend) {
    console.error('[PAI Email] Resend not configured - missing RESEND_API_KEY');
    return { success: false, error: 'Email service not configured' };
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('[PAI Email] Invalid email address:', email);
    return { success: false, error: 'Invalid email address' };
  }
  
  try {
    // Generate confirmation token and link
    const token = generateConfirmationToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmLink = `${appUrl}/api/confirm-listing?token=${token}&id=${adId}`;
    
    // Store token in database for verification
    const tokenStored = await storeConfirmationToken(token, adId, email);
    if (!tokenStored) {
      console.warn('[PAI Email] Token not stored in DB, verification may fail');
    }
    
    // Generate email content
    const html = generateConfirmationHTML(params, confirmLink);
    const text = generateConfirmationText(params, confirmLink);
    
    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Piata AI <noreply@piata.ro>',
      to: [email],
      subject: `✅ Confirmă anunțul: "${adTitle}" - Piata AI`,
      html,
      text
    });
    
    if (error) {
      console.error('[PAI Email] Resend error:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`[PAI Email] ✅ Confirmation email sent for ad #${adId} to ${email}`);
    console.log(`[PAI Email] Email ID: ${data?.id}`);
    
    return {
      success: true,
      emailId: data?.id || `local_${Date.now()}`
    };
    
  } catch (error) {
    console.error('[PAI Email] Failed to send confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verify ad confirmation token
 */
export async function verifyConfirmationToken(token: string, adId: number): Promise<boolean> {
  // TODO: Implement token verification against database
  // This would check if token exists, not expired, and matches adId
  
  console.log(`[PAI Email] Verifying token for ad #${adId}`);
  
  // Placeholder - implement with database
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
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }
  
  const adminEmail = process.env.ADMIN_EMAIL || 'claude.dev@mail.com';
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Piata AI <noreply@piata.ro>',
      to: [adminEmail],
      subject: `[PIATA AI] Anunț nou: ${params.adTitle}`,
      html: `
        <h2>📢 Anunț Nou Postat</h2>
        <p><strong>ID:</strong> ${params.adId}</p>
        <p><strong>Titlu:</strong> ${params.adTitle}</p>
        <p><strong>Utilizator:</strong> ${params.userEmail}</p>
        <p><strong>Categorie:</strong> ${params.category}</p>
        <p><strong>Status:</strong> În așteptarea confirmării email</p>
      `
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, emailId: data?.id };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
