import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { referrals } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { completeReferral } from '@/lib/referral-system';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all pending referrals
    // In a production system, you would filter for users who have completed 
    // specific milestones (e.g., email verified, first listing posted)
    const pendingReferrals = await db.query.referrals.findMany({
      where: eq(referrals.status, 'pending'),
    });

    let processed = 0;
    for (const referral of pendingReferrals) {
      // For this implementation, we'll auto-complete them if they are Tier 1
      // and the user has been active for more than 24 hours, or immediately for demo
      await completeReferral(referral.referredId);
      processed++;
    }

    return NextResponse.json({ 
      success: true, 
      processed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Referral processor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
