#!/usr/bin/env npx tsx
import { supabase} from '../src/lib/supabase/script-client';
import Stripe from 'stripe';

async function createStripeCheckoutSession(packageId: number, userId: string) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("Error: STRIPE_SECRET_KEY is not set in environment variables.");
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20' as any,
  });

  try {
    // Fetch package details
    const { data: packageDetails, error: packageError } = await supabase
      .from('credit_packages')
      .select('id, name, credits, price')
      .eq('id', packageId)
      .single();

    if (packageError) {
      console.error(`Error fetching package details for ID ${packageId}:`, packageError.message);
      process.exit(1);
    }
    if (!packageDetails) {
      console.error(`Package with ID ${packageId} not found.`);
      process.exit(1);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: {
            name: `${packageDetails.credits} Credite Piața AI RO (${packageDetails.name})`,
            description: `Purchase ${packageDetails.credits} credits for ${packageDetails.price} RON`,
          },
          unit_amount: Math.round(packageDetails.price * 100), // Price in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/jules-payment-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&packageId=${packageId}`,
      cancel_url: `http://localhost:3000/jules-payment-cancelled?userId=${userId}&packageId=${packageId}`,
      metadata: {
        userId: userId,
        credits: packageDetails.credits.toString(),
        packageId: packageDetails.id.toString(),
      },
    });

    if (session.url) {
      console.log(session.url);
    } else {
      console.error("Error: Could not create Stripe checkout session URL.");
      process.exit(1);
    }

  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error.message);
    process.exit(1);
  }
}

async function listPackages() {
  try {
    const { data: packages, error } = await supabase
      .from('credit_packages')
      .select('id, name, credits, price')
      .order('price', { ascending: true });

    if (error) throw error;

    console.log("Available Credit Packages:");
    packages.forEach(p => {
      console.log(`  ID: ${p.id}, Name: ${p.name}, Credits: ${p.credits}, Price: ${p.price} RON`);
    });
    console.log("\nTo purchase, run with a package ID: npx tsx scripts/jules-create-checkout.ts <packageId> <userId>");

  } catch (error: any) {
    console.error("Error listing packages:", error.message);
    process.exit(1);
  }
}

const packageIdArg = process.argv[2];
const userIdArg = process.argv[3];

if (packageIdArg && userIdArg) {
  const packageId = parseInt(packageIdArg);
  if (isNaN(packageId)) {
    console.error("Error: packageId must be a number.");
    process.exit(1);
  }
  createStripeCheckoutSession(packageId, userIdArg);
} else if (!packageIdArg && !userIdArg) {
  listPackages();
} else {
  console.error("Usage: npx tsx scripts/jules-create-checkout.ts [packageId] [userId]");
  console.error("       To list packages: npx tsx scripts/jules-create-checkout.ts");
  process.exit(1);
}
