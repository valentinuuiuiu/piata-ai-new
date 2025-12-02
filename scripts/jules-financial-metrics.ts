#!/usr/bin/env npx tsx
import { supabase } from '../src/lib/supabase/script-client';

async function getFinancialMetrics() {
  let metrics = {
    activeUsers: 0,
    totalCredits: 0,
    recentTransactions: 0,
    paymentVolumeEUR: 0,
    failedTransactions: 0,
  };

  try {
    // Get active users count
    const { count: activeUsersCount, error: activeUsersError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (activeUsersError) throw activeUsersError;
    metrics.activeUsers = activeUsersCount || 0;

    // Get total credits
    const { data: totalCreditsData, error: totalCreditsError } = await supabase
      .from('user_profiles')
      .select('credits_balance');

    if (totalCreditsError) throw totalCreditsError;
    metrics.totalCredits = totalCreditsData.reduce((sum, user) => sum + (user.credits_balance || 0), 0);

    // Get recent transactions (e.g., last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: transactions, error: transactionsError } = await supabase
      .from('credits_transactions')
      .select('amount_eur, status')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (transactionsError) throw transactionsError;

    metrics.recentTransactions = transactions.length;
    metrics.paymentVolumeEUR = transactions.reduce((sum, t) => sum + (t.amount_eur || 0), 0);
    metrics.failedTransactions = transactions.filter(t => t.status === 'failed').length;

    console.log(JSON.stringify(metrics, null, 2));

  } catch (error: any) {
    console.error("Error fetching financial metrics:", error.message);
    process.exit(1);
  }
}

getFinancialMetrics();
