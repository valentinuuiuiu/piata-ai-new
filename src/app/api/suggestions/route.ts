import { NextResponse } from 'next/server';
import { sendSuggestionEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, message } = body;

    // Validation
    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalid' },
        { status: 400 }
      );
    }

    // Get user context
    const userAgent = request.headers.get('user-agent') || undefined;
    const referer = request.headers.get('referer') || undefined;

    // Send email to claude.dev@mail.com
    const result = await sendSuggestionEmail({
      name,
      email,
      type,
      message,
      userAgent,
      url: referer,
    });

    if (!result.success) {
      console.error('Failed to send suggestion email:', result.error);
      return NextResponse.json(
        { error: 'Eroare la trimiterea sugestiei. Te rog încearcă din nou.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mulțumim pentru feedback! Am primit sugestia ta.',
    });
  } catch (error: any) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: 'Eroare server. Te rog încearcă mai târziu.' },
      { status: 500 }
    );
  }
}
