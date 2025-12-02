import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

interface CreditsPackageRow {
  id: number;
  name: string;
  credits: number;
  price: number;
  stripe_price_id?: string;
  is_active?: boolean;
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })
  : null;

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  try {
    // Get user credits balance from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();

    const creditsBalance = (profile as any)?.credits_balance || 0;

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is okay (user just hasn't bought credits yet)
      console.error('Error fetching user profile:', profileError);
    }

    // Get credit packages from Supabase
    const { data: packages, error: packagesError } = await supabase
      .from('credit_packages')
      .select('id, name, credits, price, stripe_price_id')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (packagesError) {
      console.error('Error fetching credit packages:', packagesError);
      return NextResponse.json({
        error: 'Failed to load credit packages',
        details: packagesError.message
      }, { status: 500 });
    }

    // Get transaction history from Supabase
    const { data: transactions, error: transactionsError } = await supabase
      .from('credits_transactions')
      .select('id, credits_amount, status, stripe_payment_id, transaction_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError && transactionsError.code !== 'PGRST116') {
      console.error('Error fetching transactions:', transactionsError);
    }

    const formattedTransactions = (transactions || []).map((tx: any) => ({
      id: tx.id,
      amount: tx.credits_amount,
      type: tx.transaction_type,
      description: tx.transaction_type === 'purchase' ? 'Achiziție credite' : 'Utilizare credite',
      created_at: tx.created_at
    }));

    return NextResponse.json({
      balance: creditsBalance,
      packages: packages || [],
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Unexpected error in credits API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { packageId } = await request.json();
  if (!packageId) {
    return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
  }

  // Get package from Supabase
  const { data: pkgData, error: packageError } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (packageError || !pkgData) {
    console.error('Error fetching package:', packageError);
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  const pkg = pkgData as any;

  // If no Stripe price ID, create a direct Stripe session
  if (!pkg.stripe_price_id) {
    try {
      if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'ron',
            product_data: {
              name: `${pkg.credits} Credite Piata AI`,
              description: `Pachet: ${pkg.name}`,
            },
            unit_amount: Math.round(pkg.price * 100), // Convert to bani (RON cents)
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${request.headers.get('origin') || 'https://piata-ai.ro'}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get('origin') || 'https://piata-ai.ro'}/credits?cancelled=true`,
        metadata: {
          user_id: user.id,
          package_id: packageId.toString(),
          credits: pkg.credits.toString(),
          price: pkg.price.toString(),
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (error: unknown) {
      console.error('Stripe error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  // Legacy path for packages with Stripe price IDs
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: pkg.stripe_price_id,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/credits?cancelled=true`,
      metadata: {
        user_id: user.id,
        package_id: packageId.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error('Stripe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}