import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const BOOST_COSTS = {
  premium: { credits: 100, duration: 30 },
  featured: { credits: 200, duration: 7 }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const userId = user.id; // Supabase user ID is a string UUID
  const listingId = parseInt(resolvedParams.id);

  const formData = await request.json();
  const boostType = formData.boostType as 'premium' | 'featured';

  if (!BOOST_COSTS[boostType]) {
    return NextResponse.json({ error: 'Invalid boost type' }, { status: 400 });
  }

  const cost = BOOST_COSTS[boostType].credits;
  const duration = BOOST_COSTS[boostType].duration;

  // Check ownership
  const { data: listing, error: listingError } = await supabase
    .from('anunturi')
    .select('user_id')
    .eq('id', listingId)
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

  if (balance < cost) {
    return NextResponse.json({ error: `Insufficient credits. Need ${cost}, have ${balance}` }, { status: 402 });
  }

  // Use service client for transactions to ensure they complete
  const serviceClient = createServiceClient();

  try {
    // Deduct credits
    const { error: updateError } = await serviceClient
      .from('user_profiles')
      .update({ credits_balance: balance - cost })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error deducting credits:', updateError);
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    // Create boost
    const { error: boostError } = await serviceClient
      .from('listing_boosts')
      .insert({
        listing_id: listingId,
        boost_type: boostType,
        duration_days: duration
      });

    if (boostError) {
      console.error('Error creating boost:', boostError);
      // Rollback: add credits back
      await serviceClient
        .from('user_profiles')
        .update({ credits_balance: balance })
        .eq('user_id', userId);
      return NextResponse.json({ error: 'Failed to create boost' }, { status: 500 });
    }

    // Log transaction
    const { error: transactionError } = await serviceClient
      .from('credits_transactions')
      .insert({
        user_id: userId,
        credits_amount: -cost,
        stripe_payment_id: `boost-${listingId}-${boostType}`,
        transaction_type: 'boost',
        status: 'completed'
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Don't fail the request, boost was already created
    }

    return NextResponse.json({ success: true, remaining: balance - cost });
  } catch (error: any) {
    console.error('Boost error:', error);
    return NextResponse.json({ error: 'Failed to boost listing' }, { status: 500 });
  }
}