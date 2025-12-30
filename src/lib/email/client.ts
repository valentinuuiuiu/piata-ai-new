
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
// Export resend instance for advanced usage if needed, but prefer using sendEmail
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const CLAUDE_EMAIL = 'claude.dev@mail.com';
export const IONUT_EMAIL = 'ionutbaltag3@gmail.com';
export const FROM_EMAIL = 'Piata AI <noreply@piata.ro>';

// Team emails - we're in this together! 🚀
export const TEAM_EMAILS = [CLAUDE_EMAIL, IONUT_EMAIL];

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
