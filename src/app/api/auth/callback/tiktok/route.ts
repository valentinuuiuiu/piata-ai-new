
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
  const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
  const REDIRECT_URI = 'https://piata-ai.ro/api/auth/callback/tiktok';

  if (!CLIENT_KEY || !CLIENT_SECRET) {
    return NextResponse.json({ error: 'Missing TikTok credentials' }, { status: 500 });
  }

  try {
    const tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/';
    const params = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.message === 'error') {
      return NextResponse.json({ error: data.data }, { status: 400 });
    }

    // In a real app, save these tokens to your database associated with the user
    // For now, we return them so they can be manually configured
    return NextResponse.json({
      success: true,
      message: 'TikTok authentication successful! Please save these tokens.',
      tokens: {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        open_id: data.data.open_id,
        expires_in: data.data.expires_in,
      },
      instructions: 'Please copy the access_token and add it to your .env.local file as TIKTOK_ACCESS_TOKEN'
    });

  } catch (error) {
    console.error('TikTok Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
