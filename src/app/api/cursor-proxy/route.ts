import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // do not hardcode
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piata-ro.vercel.app',
        'X-Title': 'Piata RO Cursor Proxy',
      },
      body: JSON.stringify({
        ...body,
        model: body.model || 'x-ai/grok-4.1-fast:free',
      }),
    });

    const data = await openrouterResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}