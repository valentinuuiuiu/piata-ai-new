import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/drizzle/db';
import { referrals, referralRewards } from '@/lib/drizzle/schema';
import { eq, count, sum } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total referrals
    const [referralCount] = await db
      .select({ value: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, user.id));

    // Get total rewards earned
    const [totalRewards] = await db
      .select({ value: sum(referralRewards.amount) })
      .from(referralRewards)
      .where(eq(referralRewards.userId, user.id));

    // Get recent referrals
    const recentReferrals = await db.query.referrals.findMany({
      where: eq(referrals.referrerId, user.id),
      orderBy: (referrals, { desc }) => [desc(referrals.createdAt)],
      limit: 5,
    });

    return NextResponse.json({
      totalReferrals: referralCount.value,
      totalEarned: totalRewards.value || 0,
      recentReferrals,
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
