import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.user_id; // This is a UUID string from Supabase
    const packageIdStr = session.metadata?.package_id;
    const creditsStr = session.metadata?.credits;

    if (userId && (packageIdStr || creditsStr)) {
      const supabase = createServiceClient(); // Use service client to bypass RLS

      try {
        // Handle both legacy package-based and new direct-credit purchases
        let creditsToAdd = 0;

        if (packageIdStr) {
          // Legacy package-based purchase
          const packageId = parseInt(packageIdStr);
          const { data: pkg, error: packageError } = await supabase
            .from('credit_packages')
            .select('credits')
            .eq('id', packageId)
            .single();

          if (packageError) {
            console.error('Error fetching package:', packageError);
            return NextResponse.json({ error: 'Package not found' }, { status: 400 });
          }

          creditsToAdd = pkg?.credits || 0;
        } else if (creditsStr) {
          // Direct credit purchase (from new API)
          creditsToAdd = parseFloat(creditsStr);
        }

        if (creditsToAdd > 0) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking user profile:', profileError);
          }

          if (profile) {
            // Update existing profile
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                credits_balance: (profile.credits_balance || 0) + creditsToAdd
              })
              .eq('user_id', userId);

            if (updateError) {
              console.error('Error updating credits:', updateError);
              return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
            }
          } else {
            // Create new profile
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: userId,
                credits_balance: creditsToAdd,
                role: 'user'
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
            }
          }

          // Log transaction
          const { error: transactionError } = await supabase
            .from('credits_transactions')
            .insert({
              user_id: userId,
              credits_amount: creditsToAdd,
              stripe_payment_id: session.payment_intent as string,
              transaction_type: 'purchase',
              status: 'completed'
            });

          if (transactionError) {
            console.error('Error logging transaction:', transactionError);
            // Don't fail the webhook, credits were already added
          }

          console.log(`✅ Added ${creditsToAdd} credits to user ${userId}`);
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
