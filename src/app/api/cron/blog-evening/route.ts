import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Re-enable after Vercel deployment (Turbopack build issue with child_process)
  // Temporarily disabled for production deployment

  return NextResponse.json({
    success: true,
    message: 'Blog automation temporarily disabled - will be re-enabled post-deployment',
    time: new Date().toISOString()
  });
}
