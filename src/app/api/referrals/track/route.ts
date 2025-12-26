import { NextResponse } from 'next/server';
import { trackReferral } from '@/lib/referral-system';

export async function POST(request: Request) {
  try {
    const { referrerCode, referredUserId, metadata } = await request.json();

    if (!referrerCode || !referredUserId) {
      return NextResponse.json({ error: 'Referrer code and referred user ID required' }, { status: 400 });
    }

    const referral = await trackReferral(referrerCode, referredUserId, metadata);
    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    console.error('Referral tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
