import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { piataAgent } from '@/lib/piata-agent';

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

    const tasks = piataAgent.getTasks();

    return NextResponse.json({
      success: true,
      tasks: tasks.map(task => ({
        id: task.id,
        description: task.description,
        priority: task.priority,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        result: task.result,
        error: task.error
      }))
    });

  } catch (error) {
    console.error('Error fetching agent tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { action, taskId, description, priority } = await request.json();

    if (action === 'create') {
      const taskId = await piataAgent.createTask(description, priority);
      return NextResponse.json({ success: true, taskId });
    }

    if (action === 'execute') {
      const tasks = piataAgent.getTasks();
      const task = tasks.find(t => t.id === taskId);

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      // Execute task asynchronously
      piataAgent.executeTask(task).catch(console.error);

      return NextResponse.json({ success: true, message: 'Task execution started' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing agent tasks:', error);
    return NextResponse.json({ error: 'Failed to manage tasks' }, { status: 500 });
  }
}