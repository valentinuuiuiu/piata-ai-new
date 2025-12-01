/**
 * Email Verification API - RooCode Integration
 * Handles email verification for ad posting without Supabase auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = 'Piata AI <noreply@piata.ro>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://piata.ro';

// In-memory token storage (use Redis in production)
const verificationTokens = new Map<string, {
  email: string;
  token: string;
  expiresAt: Date;
  verified: boolean;
}>();

// Generate secure random token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Clean up expired tokens (run periodically)
function cleanupExpiredTokens() {
  const now = new Date();
  for (const [email, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(email);
    }
  }
}

// Send verification email
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${BASE_URL}/api/verify-email/confirm?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifică email-ul - Piata AI</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e);">

        <!-- Header -->
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #00f0ff, #ff00f0);">
          <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🔐 Piata AI
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Verificare Email pentru Postare Anunțuri
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px; color: #ffffff;">
          <h2 style="color: #00f0ff; margin-bottom: 20px;">Verifică adresa de email</h2>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Pentru a putea posta anunțuri pe Piata AI, trebuie să verificăm adresa ta de email.
            Acest lucru ne asigură că ești o persoană reală și protejează platforma contra spam-ului.
          </p>

          <div style="background: rgba(0, 240, 255, 0.1); border: 1px solid #00f0ff; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #ff00f0; margin-top: 0; margin-bottom: 15px;">🔒 Securitate și Confidențialitate</h3>
            <p style="margin: 0; font-size: 14px; color: #cccccc;">
              Adresa ta de email nu va fi folosită pentru marketing și va fi ștearsă automat după verificare.
              Procesul durează doar câteva secunde.
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
              ✅ Verifică Email-ul
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

          <!-- Benefits -->
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
            <h3 style="color: #00f0ff; margin-bottom: 20px;">Ce poți face după verificare:</h3>
            <ul style="color: #cccccc; line-height: 1.8; padding-left: 20px;">
              <li>📢 Postează anunțuri gratuite pe multiple platforme</li>
              <li>🤖 Beneficiezi de AI pentru optimizarea anunțurilor</li>
              <li>📊 Accesezi analytics și statistici detaliate</li>
              <li>🔄 Sincronizezi automat anunțurile între platforme</li>
              <li>🛡️ Protecție contra fraudelor și spam-ului</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #333;">
          <p style="color: #666; font-size: 12px; margin: 0 0 10px 0;">
            Acest link expiră în 10 minute. Dacă nu ai solicitat verificare, ignoră acest email.
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
Verifică email-ul pentru Piata AI

Pentru a putea posta anunțuri, trebuie să verificăm adresa ta de email.

Click pe link-ul următor pentru verificare:
${verificationUrl}

Acest link expiră în 10 minute.
Dacă nu ai solicitat verificare, ignoră acest email.

Piata AI - AI-Powered Romanian Marketplace
  `;

  try {
    if (!resend) {
      console.warn('Resend API key missing, skipping email');
      return { success: false, error: 'Resend API key missing' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Verifică email-ul pentru Piata AI',
      html,
      text,
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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    // Clean up expired tokens
    cleanupExpiredTokens();

    // Check if email is already verified
    const existingToken = verificationTokens.get(email);
    if (existingToken && existingToken.verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
        verified: true,
      });
    }

    // Generate new token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store token
    verificationTokens.set(email, {
      email,
      token,
      expiresAt,
      verified: false,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      expiresIn: '10 minutes',
    });

  } catch (error) {
    console.error('❌ Email verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Clean up expired tokens
    cleanupExpiredTokens();

    const tokenData = verificationTokens.get(email);

    if (!tokenData) {
      return NextResponse.json({
        verified: false,
        message: 'No verification request found for this email',
      });
    }

    if (tokenData.verified) {
      return NextResponse.json({
        verified: true,
        message: 'Email verified successfully',
      });
    }

    if (tokenData.expiresAt < new Date()) {
      verificationTokens.delete(email);
      return NextResponse.json({
        verified: false,
        message: 'Verification token expired',
        expired: true,
      });
    }

    return NextResponse.json({
      verified: false,
      message: 'Verification pending',
      expiresAt: tokenData.expiresAt,
    });

  } catch (error) {
    console.error('❌ Email verification status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export token store for use in confirmation endpoint
export { verificationTokens };