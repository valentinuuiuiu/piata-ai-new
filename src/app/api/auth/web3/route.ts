
import { NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const { address, signature, message } = await req.json();

    if (!address || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Message Content & Timestamp
    // Message format: `Sign this message to authenticate with Piata AI.\n\nWallet: ${address}\nTimestamp: ${timestamp}`
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    const timestamp = parseInt(timestampMatch[1], 10);
    const now = Date.now();
    // Allow 5 minutes window
    if (now - timestamp > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'Message expired' }, { status: 400 });
    }

    // 2. Verify Signature
    // Ethers v6 verifyMessage returns the address that signed the message
    let recoveredAddress;
    try {
        recoveredAddress = verifyMessage(message, signature);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // 3. Authenticate with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = `${address.toLowerCase()}@web3.piata-ai.ro`;
    const password = randomUUID() + randomUUID(); // Secure random password

    let userId: string | null = null;

    // Try creating the user first
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { wallet_address: address }
    });

    if (createError) {
        // If user already exists, we need to find them and update password.
        // Robust way to find ID by email: Use generateLink which returns the user object.
        if (createError.message.includes('already registered') || createError.status === 422 || createError.code === 'user_already_exists') {

             // generateLink with type 'magiclink' returns the user data
             const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                 type: 'magiclink',
                 email: email
             });

             if (linkError || !linkData.user) {
                 console.error('Failed to retrieve existing user via generateLink:', linkError);
                 return NextResponse.json({ error: 'User exists but cannot be retrieved' }, { status: 500 });
             }

             userId = linkData.user.id;

             // Update password
             const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                 password: password
             });

             if (updateError) {
                 return NextResponse.json({ error: 'Failed to update user credentials' }, { status: 500 });
             }

        } else {
             return NextResponse.json({ error: createError.message }, { status: 500 });
        }
    } else {
        userId = createData.user.id;
    }

    // 4. Sign in to get session
    // We use the `password` we just set.
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
    });

    if (sessionError) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
        session: sessionData.session,
        user: sessionData.user
    });

  } catch (error: any) {
    console.error('Web3 Auth Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
