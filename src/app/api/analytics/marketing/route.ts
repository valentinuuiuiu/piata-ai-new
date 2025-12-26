import { NextResponse } from 'next/server';
import { analyticsSystem } from '@/lib/analytics-system';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    
    const data = await analyticsSystem.getDashboardData(timeframe);
    
    if (!data) {
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ...data
    });
  } catch (error: any) {
    console.error('❌ [API ANALYTICS] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, channel, campaignId, userId, metadata } = body;

    if (!eventType || !channel) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await analyticsSystem.trackEvent({
      eventType,
      channel,
      campaignId,
      userId,
      metadata
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ [API ANALYTICS] Error tracking event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
