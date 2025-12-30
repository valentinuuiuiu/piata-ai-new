import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Import all refactored automation tasks
import { generateDailyBlogPost } from '@/lib/automation-tasks/blog';
import { checkAgentHealth } from '@/lib/automation-tasks/agentHealth';
import { autoRepostListings } from '@/lib/automation-tasks/repost';
import { runReEngagementEmailCampaign } from '@/lib/automation-tasks/emailCampaigns';
import { runShoppingAgents } from '@/lib/automation-tasks/shoppingAgents';
import { generateSocialMediaContent } from '@/lib/automation-tasks/socialMedia';
import { sendWeeklyDigest } from '@/lib/automation-tasks/weeklyDigest';
import { kael } from '@/lib/agents/unified-orchestrator';
import { AgentCapability } from '@/lib/agents/types';
import { v4 as uuidv4 } from 'uuid';

const TASKS: { [key: string]: () => Promise<any> } = {
  'blog-daily': generateDailyBlogPost,
  'check-agents': checkAgentHealth,
  'auto-repost': autoRepostListings,
  'marketing-email-campaign': runReEngagementEmailCampaign,
  'shopping-agents-runner': runShoppingAgents,
  'social-media-generator': generateSocialMediaContent,
  'weekly-digest': sendWeeklyDigest,
};

async function getTasksForCurrentHour(directive: string): Promise<string[]> {
  const currentHour = new Date().getUTCHours();
  const lines = directive.split('\n');
  const tasksForHour: string[] = [];
  const taskMappings: { [key: string]: string } = {
    'system-wide health check': 'check-agents',
    'Execute the `auto-repost` logic': 'auto-repost',
    'Generate and publish a high-quality, SEO-optimized blog post': 'blog-daily',
    'Initiate the `marketing-email-campaign`': 'marketing-email-campaign',
    'Generate 3 social media posts': 'social-media-generator',
    'Execute the `shopping-agents-runner` logic': 'shopping-agents-runner',
    'Send the `weekly-digest` email': 'weekly-digest',
  };

  for (const line of lines) {
    const match = line.match(/^\*\s*(\d{2}):\d{2}\s*\|/);
    if (match) {
      const hour = parseInt(match[1], 10);
      if (hour === currentHour) {
        for (const keyword in taskMappings) {
          if (line.includes(keyword)) {
            tasksForHour.push(taskMappings[keyword]);
            break;
          }
        }
      }
    }
  }
  return tasksForHour;
}

// Wrapper function to execute and log a task
async function runAndLogTask(taskName: string, supabase: any) {
  const startTime = Date.now();
  let result: any;
  let status: 'success' | 'failure' = 'failure';

  try {
    if (!TASKS[taskName]) {
      throw new Error(`Task not found: ${taskName}`);
    }

    // Wrap in KAEL execution for unified logging, metrics, and memory
    const kaelResult = await kael.execute({
      id: uuidv4(),
      goal: `Execute scheduled task: ${taskName}`,
      type: taskName.includes('blog') || taskName.includes('social') ? 'content' : 'automation',
      priority: 'normal'
    });

    if (kaelResult.status === 'error') {
      throw new Error(kaelResult.error);
    }

    // Run the actual task implementation
    result = await TASKS[taskName]();
    status = result.success ? 'success' : 'failure';
  } catch (error: any) {
    result = { success: false, error: error.message };
  } finally {
    const durationMs = Date.now() - startTime;
    await supabase.from('automation_logs').insert({
      automation_name: taskName,
      status: status,
      execution_duration_ms: durationMs,
      results: {
        summary: result.error ? result.error.substring(0, 250) : (result.results || result),
        details: result.error ? result.error : undefined
      },
    });
  }
  return result;
}

export async function GET(request: NextRequest) {
  const authToken = (request.headers.get('authorization') || '').split('Bearer ').at(1);
  if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { searchParams } = new URL(request.url);
  const specificTask = searchParams.get('task');

  try {
    if (specificTask) {
      console.log(`[ORCHESTRATOR] Running specific task: ${specificTask}`);
      const result = await runAndLogTask(specificTask, supabase);
      return NextResponse.json({ success: result.success, task: specificTask, result });
    }

    console.log('[ORCHESTRATOR] Running scheduled tasks');
    
    let dailyDirective = '';
    try {
      const { data: directiveData, error: directiveError } = await supabase
        .from('automation_directives')
        .select('content')
        .eq('directive_name', 'jules_daily_directive')
        .eq('is_active', true)
        .single();
      
      if (directiveError || !directiveData) {
        console.warn('[ORCHESTRATOR] Could not fetch directive from DB, falling back to file:', directiveError?.message);
        const directivePath = path.join(process.cwd(), 'JULES_DAILY_DIRECTIVE.md');
        dailyDirective = await fs.readFile(directivePath, 'utf-8');
      } else {
        dailyDirective = directiveData.content;
        console.log('[ORCHESTRATOR] Using daily directive from Database');
      }
    } catch (err) {
      console.warn('[ORCHESTRATOR] Error fetching directive from DB, falling back to file:', err);
      const directivePath = path.join(process.cwd(), 'JULES_DAILY_DIRECTIVE.md');
      dailyDirective = await fs.readFile(directivePath, 'utf-8');
    }

    const tasksToRun = await getTasksForCurrentHour(dailyDirective);

    if (tasksToRun.length === 0) {
      return NextResponse.json({ success: true, message: 'No tasks scheduled for the current hour.' });
    }

    const results = [];
    for (const taskName of tasksToRun) {
      const result = await runAndLogTask(taskName, supabase);
      results.push({ task: taskName, result });
    }

    return NextResponse.json({
      success: true,
      message: `Executed ${tasksToRun.length} scheduled task(s).`,
      results,
    });
  } catch (error: any) {
    console.error('[ORCHESTRATOR] Critical error:', error);
    // Log the top-level error as well
    await supabase.from('automation_logs').insert({
      automation_name: 'orchestrator-critical-failure',
      status: 'failure',
      results: {
        summary: 'A top-level error occurred in the orchestrator.',
        details: error.message,
      },
    });
    return NextResponse.json(
      { success: false, error: 'An error occurred during orchestration.', details: error.message },
      { status: 500 }
    );
  }
}
