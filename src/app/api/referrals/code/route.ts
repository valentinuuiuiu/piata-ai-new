import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateReferralCode } from '@/lib/referral-system';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = await getOrCreateReferralCode(user.id);
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Referral code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
