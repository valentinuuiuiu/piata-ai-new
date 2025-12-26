import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    if (!token || !id) {
      return NextResponse.json({ error: 'Missing token or id' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const listingId = parseInt(id, 10);

    // 1. Verify token against listing_confirmations table (PAI internal system)
    const { data: confirmation, error: confirmError } = await supabase
      .from('listing_confirmations')
      .select('id, listing_id, token, email, expires_at, is_used')
      .eq('token', token)
      .eq('listing_id', listingId)
      .single();

    if (confirmError || !confirmation) {
      console.log('[Confirm] Token not found in database');
      return NextResponse.json({ error: 'Invalid or expired confirmation token' }, { status: 403 });
    }

    // Check if already used
    if (confirmation.is_used) {
      return NextResponse.json({ error: 'This confirmation link has already been used' }, { status: 400 });
    }

    // Check if expired
    if (new Date(confirmation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This confirmation link has expired' }, { status: 400 });
    }

    // 2. Verify listing exists
    const { data: listing, error: fetchError } = await supabase
      .from('anunturi')
      .select('id, status')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 3. Mark token as used and update listing status
    const { error: tokenUpdateError } = await supabase
      .from('listing_confirmations')
      .update({ is_used: true })
      .eq('id', confirmation.id);

    if (tokenUpdateError) {
      console.error('Token update error:', tokenUpdateError);
    }

    const { error: updateError } = await supabase
      .from('anunturi')
      .update({
        status: 'active',
        email_confirmed: true,
        user_confirmed_at: new Date().toISOString()
      })
      .eq('id', listingId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to activate listing' }, { status: 500 });
    }

    console.log(`[Confirm] ✅ Listing #${listingId} confirmed by ${confirmation.email}`);

    // 4. Redirect to success page
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'piata-ai.ro';
    const redirectUrl = `${protocol}://${host}/anunt/${listingId}?confirmed=true`;

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
