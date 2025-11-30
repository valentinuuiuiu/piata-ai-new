import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createClient();

    // First check if user exists and get their role
    const serviceClient = createServiceClient();
    const { data: user, error: userError } = await serviceClient
      .from('users')
      .select('id, email, name, password, role, is_admin, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 401 });
    }

    // Verify password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await serviceClient
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Get or create user profile
    let { data: profile } = await serviceClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await serviceClient
        .from('user_profiles')
        .insert({
          user_id: user.id,
          credits_balance: user.is_admin ? 999999 : 100, // Admins get unlimited credits
          is_admin: user.is_admin
        })
        .select('*')
        .single();
      profile = newProfile;
    }

    console.log(`✅ User logged in: ${email} (Admin: ${user.is_admin})`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_admin: user.is_admin,
        credits_balance: profile?.credits_balance || 0
      },
      session: authData.session
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ authenticated: false });
    }

    // Get user details with admin status
    const serviceClient = createServiceClient();
    const { data: user } = await serviceClient
      .from('users')
      .select('id, email, name, role, is_admin')
      .eq('id', session.user.id)
      .single();

    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('credits_balance, is_admin')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
        is_admin: user?.is_admin || profile?.is_admin || false,
        credits_balance: profile?.credits_balance || 0
      }
    });

  } catch (error) {
    console.error('❌ Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}