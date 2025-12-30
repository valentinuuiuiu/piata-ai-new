import { NextRequest, NextResponse } from 'next/server';
import { runReEngagementEmailCampaign } from '@/lib/automation-tasks/emailCampaigns';

export async function GET(req: NextRequest) {
  const authToken = (req.headers.get('authorization') || '').split('Bearer ').at(1);
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runReEngagementEmailCampaign();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error || 'Campaign failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, results: result.results });
}

// Allow POST for manual triggers as well
export async function POST(req: NextRequest) {
  return GET(req);
}
