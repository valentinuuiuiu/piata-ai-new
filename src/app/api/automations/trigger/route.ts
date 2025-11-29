import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { automationEngine } from '@/lib/automation-engine';

export async function POST(request: NextRequest) {
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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const tasks = automationEngine.getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Execute task asynchronously
    automationEngine.executeTask(task).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Task ${taskId} execution started`
    });

  } catch (error) {
    console.error('Error triggering automation:', error);
    return NextResponse.json({ error: 'Failed to trigger automation' }, { status: 500 });
  }
}