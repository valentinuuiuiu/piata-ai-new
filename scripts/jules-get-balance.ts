#!/usr/bin/env npx tsx
import { supabase } from '../src/lib/supabase/script-client';

async function getUserBalance(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('credits_balance, full_name')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        console.log(`User not found: ${userId}`);
      } else {
        throw error;
      }
    } else {
      console.log(`User: ${data.full_name || 'N/A'}`);
      console.log(`Current Credits: ${data.credits_balance || 0}`);
    }
  } catch (error: any) {
    console.error("Error fetching user balance:", error.message);
    process.exit(1);
  }
}

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npx tsx scripts/jules-get-balance.ts <userId>");
  process.exit(1);
}

getUserBalance(userId);
