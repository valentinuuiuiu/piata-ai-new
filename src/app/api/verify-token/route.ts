import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token missing' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Find listing by confirmation token
    const { data: listing, error: findError } = await supabase
      .from('anunturi')
      .select('id, status, email_confirmed')
      .eq('confirmation_token', token)
      .single();

    if (findError || !listing) {
      return NextResponse.json({ success: false, message: 'Token invalid sau expirat.' }, { status: 404 });
    }

    if (listing.email_confirmed) {
      return NextResponse.json({ success: true, message: 'Anunțul este deja confirmat.' });
    }

    // 2. Update listing status
    // If it was 'pending_verification', we move it to 'active' (or 'published' depending on schema)
    // The schema in POST showed 'pending_verification'.
    // Let's assume 'active' is the live state.
    const { error: updateError } = await supabase
      .from('anunturi')
      .update({
        email_confirmed: true,
        status: 'active', // Make it live immediately after email confirmation
        published_at: new Date().toISOString()
      })
      .eq('id', listing.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Listing confirmed' });

  } catch (error: any) {
    console.error('Verify token error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
