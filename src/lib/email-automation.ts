/**
 * Email Automation System - Piata AI
 * Complete email service with Resend + Listmonk integration
 * Account creation, ad posting confirmations, verification tokens
 */

import { Resend } from 'resend';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = 'Piata AI <noreply@piata.ro>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://piata.ro';

// Token management
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateConfirmationToken(): string {
  return uuidv4();
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Database interfaces (would integrate with existing DB)
export interface EmailVerification {
  id: string;
  email: string;
  token: string;
  tokenHash: string;
  type: 'account_creation' | 'ad_posting' | 'permission_request';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Core email sending function
export async function sendEmail(options: EmailTemplate) {
  try {
    if (!resend) {
      console.warn('Resend API key missing, skipping email');
      return { success: false, error: 'Resend API key missing' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
}

// Account Creation Confirmation Email
export async function sendAccountCreationEmail(email: string, verificationToken: string, userName?: string) {
  const verificationUrl = `${BASE_URL}/verify-account?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmă contul Piata AI</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e);">
        
        <!-- Header -->
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #00f0ff, #ff00f0);">
          <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🚀 Piata AI
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            AI-Powered Romanian Marketplace
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; color: #ffffff;">
          <h2 style="color: #00f0ff; margin-bottom: 20px;">Bun venit în viitor, ${userName || 'utilizator'}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Contul tău Piata AI a fost creat cu succes! Pentru a activa contul și a începe să vinzi inteligent, 
            te rugăm să confirmi adresa de email.
          </p>

          <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #ff00f0; margin-top: 0; margin-bottom: 15px;">🔐 Securitate Cont</h3>
            <p style="margin: 0; font-size: 14px; color: #cccccc;">
              Această confirmare ne asigură că tu ești proprietarul real al adresei de email 
              și protejează contul tău contra accesului neautorizat.
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #00f0ff, #ff00f0);
                      color: white;
                      padding: 18px 45px;
                      text-decoration: none;
                      border-radius: 30px;
                      font-weight: bold;
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
                      transition: all 0.3s ease;">
              ✅ Confirmă Contul
            </a>
          </div>

          <!-- Alternative link -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Sau copiază acest link în browser:
            </p>
            <p style="word-break: break-all; color: #666; font-size: 12px; margin: 5px 0;">
              ${verificationUrl}
            </p>
          </div>

          <!-- Features -->
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
            <h3 style="color: #00f0ff; margin-bottom: 20px;">Ce primești cu contul Piata AI:</h3>
            <ul style="color: #cccccc; line-height: 1.8; padding-left: 20px;">
              <li>🤖 <strong>AI-Powered Listings:</strong> Generare automată a descrierilor</li>
              <li>📊 <strong>Analytics Intelligence:</strong> Insights despre piață în timp real</li>
              <li>🔗 <strong>Multi-Platform Sync:</strong> Postare pe multiple site-uri simultan</li>
              <li>💰 <strong>Smart Pricing:</strong> Prețuri optimizate cu AI</li>
              <li>🛡️ <strong>Fraud Detection:</strong> Protecție avansată contra escrocheriilor</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
            Acest email expiră în 24 de ore. Dacă nu ai creat un cont, ignoră acest mesaj.
          </p>
          <p style="color: #999; font-size: 12px; margin: 0;">
            Piata AI • Strada AI Nr. 1, București • 
            <a href="${BASE_URL}/privacy" style="color: #00f0ff;">Privacy Policy</a> • 
            <a href="${BASE_URL}/terms" style="color: #00f0ff;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bun venit la Piata AI!

Contul tău a fost creat. Pentru a-l activa, vizitează:
${verificationUrl}

Această confirmare expiră în 24 de ore.
Dacă nu ai creat un cont, ignoră acest email.

Piata AI - AI-Powered Romanian Marketplace
  `;

  return sendEmail({
    to: email,
    subject: '🚀 Confirmă contul tău Piata AI',
    html,
    text,
  });
}

// Ad Posting Confirmation Email
export async function sendAdPostingConfirmationEmail(
  email: string, 
  adData: {
    title: string;
    platform: string;
    category: string;
    price?: number;
    location?: string;
    confirmationLink?: string;
  },
  verificationToken: string
) {
  const confirmationUrl = `${BASE_URL}/confirm-ad-posting?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmare postare anunț Piata AI</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e);">
        
        <!-- Header -->
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #00f0ff, #ff00f0);">
          <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            📢 Piata AI
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            AI-Powered Romanian Marketplace
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; color: #ffffff;">
          <h2 style="color: #00f0ff; margin-bottom: 20px;">🎯 Anunțul tău este gata de postare!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            AI-ul Piata a pregătit anunțul tău pentru postare pe <strong>${adData.platform}</strong>. 
            Te rugăm să confirmi pentru a-l publica.
          </p>

          <!-- Ad Details -->
          <div style="background: rgba(255, 0, 240, 0.1); border: 1px solid #ff00f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #ff00f0; margin-top: 0; margin-bottom: 15px;">📋 Detalii Anunț</h3>
            <div style="color: #cccccc; font-size: 14px; line-height: 1.8;">
              <p><strong>Titlu:</strong> ${adData.title}</p>
              <p><strong>Platformă:</strong> ${adData.platform}</p>
              <p><strong>Categorie:</strong> ${adData.category}</p>
              ${adData.price ? `<p><strong>Preț:</strong> ${adData.price} RON</p>` : ''}
              ${adData.location ? `<p><strong>Locație:</strong> ${adData.location}</p>` : ''}
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmationUrl}"
               style="background: linear-gradient(135deg, #00f0ff, #ff00f0);
                      color: white;
                      padding: 18px 45px;
                      text-decoration: none;
                      border-radius: 30px;
                      font-weight: bold;
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
                      transition: all 0.3s ease;">
              ✅ Postează Anunțul
            </a>
          </div>

          <!-- Alternative link -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Sau copiază acest link în browser:
            </p>
            <p style="word-break: break-all; color: #666; font-size: 12px; margin: 5px 0;">
              ${confirmationUrl}
            </p>
          </div>

          <!-- AI Features -->
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
            <h3 style="color: #00f0ff; margin-bottom: 20px;">🤖 Optimizări AI aplicate:</h3>
            <ul style="color: #cccccc; line-height: 1.8; padding-left: 20px;">
              <li>✨ Titlu optimizat pentru căutare</li>
              <li>📝 Descriere îmbunătățită cu keywords relevante</li>
              <li>📸 Sugestii de imagini atractive</li>
              <li>💰 Preț recomandat bazat pe piață</li>
              <li>🎯 Categorizare automată optimă</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
            Această confirmare expiră în 2 ore. Anunțul nu va fi postat fără confirmare.
          </p>
          <p style="color: #999; font-size: 12px; margin: 0;">
            Piata AI • Strada AI Nr. 1, București • 
            <a href="${BASE_URL}/privacy" style="color: #00f0ff;">Privacy Policy</a> • 
            <a href="${BASE_URL}/terms" style="color: #00f0ff;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Anunțul tău este gata pentru postare pe ${adData.platform}!

Detalii:
Titlu: ${adData.title}
Categorie: ${adData.category}
${adData.price ? `Preț: ${adData.price} RON` : ''}
${adData.location ? `Locație: ${adData.location}` : ''}

Confirmă postarea aici:
${confirmationUrl}

Această confirmare expiră în 2 ore.

Piata AI - AI-Powered Romanian Marketplace
  `;

  return sendEmail({
    to: email,
    subject: `📢 Confirmă postarea anunțului: ${adData.title}`,
    html,
    text,
  });
}

// Permission Request Email
export async function sendPermissionRequestEmail(
  adminEmail: string,
  requestData: {
    requesterName: string;
    requesterEmail: string;
    platform: string;
    adTitle: string;
    reason: string;
    approvalLink: string;
    rejectionLink: string;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cerere permisiune postare - Piata AI</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e);">
        
        <!-- Header -->
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #ff6b6b, #ff8e53);">
          <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ⚠️ Piata AI Admin
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Cerere permisiune postare
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; color: #ffffff;">
          <h2 style="color: #ff6b6b; margin-bottom: 20px;">🔐 Cerere aprobare necesară</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            O cerere de postare necesită aprobarea administratorului pentru platforma <strong>${requestData.platform}</strong>.
          </p>

          <!-- Request Details -->
          <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid #ff6b6b; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #ff8e53; margin-top: 0; margin-bottom: 15px;">📋 Detalii Cerere</h3>
            <div style="color: #cccccc; font-size: 14px; line-height: 1.8;">
              <p><strong>Solicitant:</strong> ${requestData.requesterName} (${requestData.requesterEmail})</p>
              <p><strong>Platformă:</strong> ${requestData.platform}</p>
              <p><strong>Titlu Anunț:</strong> ${requestData.adTitle}</p>
              <p><strong>Motiv:</strong> ${requestData.reason}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 40px 0;">
            <div style="margin-bottom: 20px;">
              <a href="${requestData.approvalLink}"
                 style="background: linear-gradient(135deg, #00f0ff, #00d4aa);
                        color: white;
                        padding: 15px 35px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: bold;
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
                        margin-right: 10px;">
                ✅ Aprobă
              </a>
              <a href="${requestData.rejectionLink}"
                 style="background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                        color: white;
                        padding: 15px 35px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: bold;
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                        margin-left: 10px;">
                ❌ Respinge
              </a>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
              🔒 Această cerere expiră în 24 de ore. Acțiunile sunt logate pentru audit.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Piata AI Admin Panel • 
            <a href="${BASE_URL}/admin" style="color: #00f0ff;">Admin Dashboard</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CERERE PERMISIUNE POSTARE

Solicitant: ${requestData.requesterName} (${requestData.requesterEmail})
Platformă: ${requestData.platform}
Titlu Anunț: ${requestData.adTitle}
Motiv: ${requestData.reason}

Aprobă: ${requestData.approvalLink}
Respinge: ${requestData.rejectionLink}

Această cerere expiră în 24 de ore.

Piata AI Admin System
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🔐 Cerere permisiune: ${requestData.adTitle} - ${requestData.platform}`,
    html,
    text,
  });
}

// Listmonk Integration
export class ListmonkService {
  private baseUrl = 'http://localhost:9000/api';
  private username = 'admin';
  private password = process.env.LISTMONK_PASSWORD || '';

  private async getAuthHeader(): Promise<string> {
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async createList(name: string, description?: string) {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/lists`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || `List for ${name}`,
          type: 'private',
          optin: 'single',
        }),
      });

      if (!response.ok) {
        throw new Error(`Listmonk API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Listmonk create list error:', error);
      return { success: false, error };
    }
  }

  async subscribeToList(listId: number, email: string, name?: string, attributes?: any) {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || '',
          lists: [listId],
          attributes: attributes || {},
          status: 'enabled',
          preconfirm_subscriptions: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Listmonk API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Listmonk subscribe error:', error);
      return { success: false, error };
    }
  }

  async createCampaign(
    listId: number,
    subject: string,
    content: string,
    fromEmail?: string
  ) {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: subject,
          subject,
          lists: [listId],
          from_email: fromEmail || FROM_EMAIL,
          content_type: 'html',
          body: content,
          template_id: 1, // Default template
        }),
      });

      if (!response.ok) {
        throw new Error(`Listmonk API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Listmonk create campaign error:', error);
      return { success: false, error };
    }
  }

  async getCampaignStats(campaignId: number) {
    try {
      const authHeader = await this.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/campaigns/${campaignId}/stats`, {
        headers: {
          'Authorization': authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`Listmonk API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Listmonk campaign stats error:', error);
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const listmonkService = new ListmonkService();

// Email Testing Service
export class EmailTestService {
  static async testAllEmailServices() {
    const results = {
      resend: false,
      listmonk: false,
      templates: {
        accountCreation: false,
        adPosting: false,
        permissionRequest: false,
      },
      timestamp: new Date().toISOString(),
    };

    // Test Resend
    try {
      const testEmail = await sendEmail({
        to: 'ionutbaltag3@gmail.com',
        subject: '🧪 Piata AI Email System Test',
        html: '<h1>✅ Email System Working</h1><p>Resend API is functional.</p>',
        text: 'Email System Test - Resend API is functional.',
      });
      results.resend = testEmail.success;
    } catch (error) {
      console.error('Resend test failed:', error);
    }

    // Test Listmonk
    try {
      const listmonkTest = await listmonkService.createList(
        'Test List ' + Date.now(),
        'Automated test list'
      );
      results.listmonk = !listmonkTest.error;
    } catch (error) {
      console.error('Listmonk test failed:', error);
    }

    // Test Templates
    const testToken = generateVerificationToken();
    
    try {
      const accountTest = await sendAccountCreationEmail(
        'ionutbaltag3@gmail.com',
        testToken,
        'Test User'
      );
      results.templates.accountCreation = accountTest.success;
    } catch (error) {
      console.error('Account creation template test failed:', error);
    }

    try {
      const adTest = await sendAdPostingConfirmationEmail(
        'ionutbaltag3@gmail.com',
        {
          title: 'Test Anunț',
          platform: 'Publi24',
          category: 'Electronice',
          price: 100,
          location: 'București',
        },
        testToken
      );
      results.templates.adPosting = adTest.success;
    } catch (error) {
      console.error('Ad posting template test failed:', error);
    }

    try {
      const permissionTest = await sendPermissionRequestEmail(
        'ionutbaltag3@gmail.com',
        {
          requesterName: 'Test User',
          requesterEmail: 'test@example.com',
          platform: 'OLX',
          adTitle: 'Test Anunț',
          reason: 'Platform requires admin approval',
          approvalLink: `${BASE_URL}/approve?token=${testToken}`,
          rejectionLink: `${BASE_URL}/reject?token=${testToken}`,
        }
      );
      results.templates.permissionRequest = permissionTest.success;
    } catch (error) {
      console.error('Permission request template test failed:', error);
    }

    return results;
  }
}

export default {
  sendEmail,
  sendAccountCreationEmail,
  sendAdPostingConfirmationEmail,
  sendPermissionRequestEmail,
  generateVerificationToken,
  generateConfirmationToken,
  hashToken,
  listmonkService,
  EmailTestService,
};