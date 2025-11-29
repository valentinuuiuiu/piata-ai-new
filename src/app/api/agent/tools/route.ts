import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (by email or role)
    const adminEmails = ['ionutbaltag3@gmail.com', 'claude.dev@mail.com'];
    const isAdminByEmail = adminEmails.includes(user.email || '');
    
    let isAdminByRole = false;
    try {
      const userResult = await query('SELECT role FROM user_profiles WHERE user_id = ?', [user.id]);
      const userProfile = Array.isArray(userResult) ? userResult[0] : userResult;
      isAdminByRole = userProfile && (userProfile as any).role === 'admin';
    } catch (error) {
      console.error('Error checking user role:', error);
    }

    if (!isAdminByEmail && !isAdminByRole) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get agents
    const agentsResult = await query('SELECT * FROM ai_agents WHERE user_id = ? ORDER BY created_at DESC', [user.id]);
    const agents = Array.isArray(agentsResult) ? agentsResult : [];

    return NextResponse.json({ 
      agents,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: isAdminByEmail || isAdminByRole
      }
    });
  } catch (error) {
      console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}