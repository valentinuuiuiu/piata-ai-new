import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const { anunt_id, duration_hours } = await request.json();

  if (!anunt_id || !duration_hours) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const PROMOTE_COST = 0.5; // 0.5 credits per repost

  try {
    // Check ownership
    const { data: listing, error: listingError } = await supabase
      .from('anunturi')
      .select('user_id')
      .eq('id', anunt_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if ((listing as any).user_id !== userId) {
      return NextResponse.json({ error: 'Not your listing' }, { status: 403 });
    }

    // Check balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();

    const balance = (profile as any)?.credits_balance || 0;

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    if (balance < PROMOTE_COST) {
      return NextResponse.json({ error: `Insufficient credits. Need ${PROMOTE_COST}, have ${balance}` }, { status: 402 });
    }

    // Calculate promotion end time
    const promotedUntil = new Date();
    promotedUntil.setHours(promotedUntil.getHours() + duration_hours);

    // Use service client for transactions
    const serviceClient = createServiceClient();

    // Deduct credits
    const { error: updateError } = await serviceClient
      .from('user_profiles')
      .update({ credits_balance: balance - PROMOTE_COST })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error deducting credits:', updateError);
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    // Update listing promotion
    const { error: promoteError } = await serviceClient
      .from('anunturi')
      .update({ promoted_until: promotedUntil.toISOString() })
      .eq('id', anunt_id);

    if (promoteError) {
      console.error('Error updating promotion:', promoteError);
      // Rollback: add credits back
      await serviceClient
        .from('user_profiles')
        .update({ credits_balance: balance })
        .eq('user_id', userId);
      return NextResponse.json({ error: 'Failed to promote listing' }, { status: 500 });
    }

    // Log transaction
    const { error: transactionError } = await serviceClient
      .from('credits_transactions')
      .insert({
        user_id: userId,
        credits_amount: -PROMOTE_COST,
        stripe_payment_id: `promote-${anunt_id}`,
        transaction_type: 'promotion',
        status: 'completed'
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Don't fail the request, promotion was already applied
    }

    return NextResponse.json({
      success: true,
      message: `Listing promoted for ${duration_hours} hours`,
      promoted_until: promotedUntil
    });

  } catch (error) {
    console.error('Promotion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}