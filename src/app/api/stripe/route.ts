import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })
  : null;

const CREDIT_PRICE_RON = 5.0; // 1 credit = 5 RON

export async function POST(request: NextRequest) {
  try {
    const { credits, userId, userEmail } = await request.json();

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: {
            name: `${credits} Credite Piata AI`,
            description: `Achiziționează ${credits} credite pentru platforma Piata AI`,
          },
          unit_amount: Math.round(CREDIT_PRICE_RON * credits * 100), // Convert to bani (RON cents)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard`,
      metadata: {
        userId,
        userEmail,
        credits: credits.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
