/**
 * Email Service - Resend API
 * For contact forms, suggestions, notifications
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const CLAUDE_EMAIL = 'claude.dev@mail.com';
const IONUT_EMAIL = 'ionutbaltag3@gmail.com';
const FROM_EMAIL = 'Piata AI <noreply@piata.ro>';

// Team emails - we're in this together! 🚀
const TEAM_EMAILS = [CLAUDE_EMAIL, IONUT_EMAIL];

export interface EmailOptions {
  to?: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    if (!resend) {
      console.warn('Resend API key missing, skipping email');
      return { success: false, error: 'Resend API key missing' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to || CLAUDE_EMAIL,
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

// Send to both team members
export async function sendToTeam(options: Omit<EmailOptions, 'to'>) {
  const results = await Promise.all(
    TEAM_EMAILS.map(email => sendEmail({ ...options, to: email }))
  );
  return results[0];
}

export async function sendSuggestionEmail(data: {
  name: string;
  email: string;
  type: string;
  message: string;
  userAgent?: string;
  url?: string;
}) {
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

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="color: #999; font-size: 12px; text-align: center;">
        Piata AI - AI-Powered Romanian Marketplace<br>
        <a href="https://piata.ro" style="color: #00f0ff;">piata.ro</a>
      </p>
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

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="color: #999; font-size: 12px; text-align: center;">
        Piata AI - AI-Powered Romanian Marketplace<br>
        <a href="https://piata.ro" style="color: #00f0ff;">piata.ro</a>
      </p>
    </div>
  `;

  return sendToTeam({
    subject: `[Contact] ${data.subject}`,
    html,
    text: `De la: ${data.name} (${data.email})\n\n${data.message}`,
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
