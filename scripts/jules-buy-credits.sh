#!/bin/bash

# SECURITY WARNING: This line should be removed before committing!
# export STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
export STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-sk_live_your_stripe_secret_key_here}

# Usage: ./scripts/jules-buy-credits.sh [packageId] <userId>

packageId=$1
userId=$2

if [ -z "$packageId" ] && [ -z "$userId" ]; then
  echo "Listing available credit packages..."
  npx tsx scripts/jules-create-checkout.ts
  exit 0
fi

if [ -z "$packageId" ] || [ -z "$userId" ]; then
  echo "Usage: ./scripts/jules-buy-credits.sh [packageId] <userId>"
  echo "       To list packages: ./scripts/jules-buy-credits.sh"
  exit 1
fi

echo "Initiating Stripe checkout for package ID: $packageId for user: $userId"
echo "You will be provided with a URL to complete the purchase."
echo ""

# Ensure STRIPE_SECRET_KEY is set in the environment before running
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is not set."
  echo "Please set it before running this script, e.g.:"
  echo "export STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE"
  exit 1
fi

npx tsx scripts/jules-create-checkout.ts "$packageId" "$userId"
