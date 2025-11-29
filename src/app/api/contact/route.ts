import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { validateAndSanitizeContact, apiRateLimiter } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Rate limiting
    if (!apiRateLimiter.isAllowed(body.email || 'anonymous')) {
      return NextResponse.json(
        { error: 'Prea multe cereri. Încercați mai târziu.' },
        { status: 429 }
      );
    }

    // Validate and sanitize input
    let validatedData;
    try {
      validatedData = validateAndSanitizeContact(body);
    } catch (error: any) {
      const errorMessage = error.errors?.map((e: any) => e.message).join(', ') || error.message || 'Date invalide';
      return NextResponse.json({
        error: 'Date invalide: ' + errorMessage
      }, { status: 400 });
    }

    // Send email to claude.dev@mail.com
    const result = await sendContactEmail(validatedData);

    if (!result.success) {
      console.error('Failed to send contact email:', result.error);
      return NextResponse.json(
        { error: 'Eroare la trimiterea mesajului. Te rog încearcă din nou.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajul a fost trimis cu succes! Îți vom răspunde în curând.',
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Eroare server. Te rog încearcă mai târziu.' },
      { status: 500 }
    );
  }
}
