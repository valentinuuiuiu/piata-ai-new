import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid top-level errors if env var is missing
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20' as any,
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, credits, userId } = body;

    if (!amount || !credits || !userId) {
      console.error('Missing required fields:', { amount, credits, userId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `${credits} Credite Piața AI RO`,
              description: `Achiziționează ${credits} credite pentru anunțuri premium`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&credits=${credits}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/credits?canceled=true`,
      metadata: {
        userId: userId.toString(),
        credits: credits.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment failed' }, 
      { status: 500 }
    );
  }
}