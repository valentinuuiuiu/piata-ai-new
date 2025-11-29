import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendNewsletterWelcome } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalid' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await query(
      'SELECT id FROM newsletter_subscribers WHERE email = ?',
      [email]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Acest email este deja abonat' },
        { status: 400 }
      );
    }

    // Add subscriber
    await query(
      `INSERT INTO newsletter_subscribers (email, subscribed_at, status)
       VALUES (?, NOW(), 'active')`,
      [email]
    );

    // Send welcome email
    await sendNewsletterWelcome(email);

    return NextResponse.json({
      success: true,
      message: 'Te-ai abonat cu succes! Verifică inbox-ul pentru confirmarea.',
    });
  } catch (error: any) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { error: 'Eroare la abonare. Te rog încearcă din nou.' },
      { status: 500 }
    );
  }
}
