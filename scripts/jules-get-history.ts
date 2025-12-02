#!/usr/bin/env npx tsx
import { supabase } from '../src/lib/supabase/script-client';

async function getUserTransactionHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('credits_transactions')
      .select('id, credits_amount, status, stripe_payment_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10); // Limit to 10 recent transactions

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log(`No transactions found for user: ${userId}`);
      } else {
        throw error;
      }
    } else {
      if (data && data.length > 0) {
        console.log(`Recent transactions for user: ${userId}`);
        data.forEach(transaction => {
          console.log(`  ID: ${transaction.id}`);
          console.log(`  Amount: ${transaction.credits_amount} credits`);
          console.log(`  Status: ${transaction.status}`);
          console.log(`  Stripe ID: ${transaction.stripe_payment_id}`);
          console.log(`  Date: ${new Date(transaction.created_at).toLocaleString()}`);
          console.log('---');
        });
      } else {
        console.log(`No transactions found for user: ${userId}`);
      }
    }
  } catch (error: any) {
    console.error("Error fetching user transaction history:", error.message);
    process.exit(1);
  }
}

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npx tsx scripts/jules-get-history.ts <userId>");
  process.exit(1);
}

getUserTransactionHistory(userId);
