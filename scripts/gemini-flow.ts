import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

async function getDockerStatus() {
  try {
    const output = execSync('docker ps --format "{{.Names}}: {{.Status}}"').toString();
    console.log('--- Docker Containers ---');
    console.log(output || 'No containers running.');
  } catch (error) {
    console.log('Docker not available or error running command.');
  }
}

async function getVercelStatus() {
  try {
    const output = execSync('vercel list --limit 5').toString();
    console.log('--- Vercel Deployments ---');
    console.log(output);
  } catch (error) {
    console.log('Vercel CLI error.');
  }
}

async function listAutomationTasks() {
  console.log('--- Automation Engine Tasks ---');
  const { data, error } = await supabase.from('automation_tasks').select('*');
  if (error) {
    console.error('Error fetching tasks:', error.message);
    return;
  }
  data.forEach(task => {
    console.log(`[${task.id}] ${task.name} - Status: ${task.status} - Enabled: ${task.enabled}`);
  });
}

async function listSignals() {
  console.log('--- Recent A2A Signals ---');
  const { data, error } = await supabase
    .from('a2a_signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error fetching signals:', error.message);
    return;
  }
  data.forEach(signal => {
    console.log(`${signal.created_at} | ${signal.from_agent} -> ${signal.to_agent || 'ALL'}: ${signal.signal_type}`);
  });
}

async function triggerJulesTask(taskName: string) {
  console.log(`Triggering Jules Task: ${taskName}...`);
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/jules-orchestrator?task=${taskName}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error triggering task:', error);
  }
}

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
  switch (command) {
    case 'status':
      await getDockerStatus();
      await getVercelStatus();
      await listAutomationTasks();
      await listSignals();
      break;
    case 'run-task':
      if (!arg) {
        console.log('Usage: run-task <task_name>');
        process.exit(1);
      }
      await triggerJulesTask(arg);
      break;
    case 'list-tasks':
      await listAutomationTasks();
      break;
    case 'signals':
      await listSignals();
      break;
    default:
      console.log('Gemini Flow CLI');
      console.log('Commands: status, run-task <id>, list-tasks, signals');
      break;
  }
}

main().catch(console.error);
