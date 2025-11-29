import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Listmonk internal URL (docker network)
    const LISTMONK_URL = 'http://listmonk:9000/api/public/subscription';
    
    // In dev mode on host, we might need localhost if not running in docker
    // But this route runs on the Next.js server. 
    // If Next.js is in Docker, 'listmonk' host works.
    // If Next.js is local, 'localhost' works.
    const url = process.env.NODE_ENV === 'production' 
      ? LISTMONK_URL 
      : 'http://localhost:9000/api/public/subscription';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || email.split('@')[0],
        list_uuids: ['default'], // You might need to check your list UUIDs in Listmonk
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Listmonk error:', errorData);
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
