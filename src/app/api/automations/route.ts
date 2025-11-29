import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { query } from '@/lib/db';
import { automationEngine, DEFAULT_AUTOMATION_TASKS } from '@/lib/automation-engine';

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

    const tasks = automationEngine.getTasks();

    return NextResponse.json({
      success: true,
      tasks: tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        enabled: task.enabled,
        status: task.status,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
        results: task.results
      }))
    });

  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
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

    const { action, taskId, enabled } = await request.json();

    if (action === 'toggle') {
      await automationEngine.toggleTask(taskId, enabled);
      return NextResponse.json({ success: true, message: `Task ${enabled ? 'enabled' : 'disabled'}` });
    }

    if (action === 'run') {
      // Manually trigger a task
      const tasks = automationEngine.getTasks();
      const task = tasks.find(t => t.id === taskId);

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      // Run task asynchronously
      automationEngine.executeTask(task).catch(console.error);

      return NextResponse.json({ success: true, message: 'Task execution started' });
    }

    if (action === 'initialize') {
      // Initialize default tasks
      for (const task of DEFAULT_AUTOMATION_TASKS) {
        try {
          await automationEngine.addTask(task);
        } catch (error) {
          console.log(`Task ${task.id} already exists`);
        }
      }

      return NextResponse.json({ success: true, message: 'Default tasks initialized' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing automations:', error);
    return NextResponse.json({ error: 'Failed to manage automations' }, { status: 500 });
  }
}