#!/usr/bin/env node
/**
 * Scheduler Daemon - Keep automation running 24/7
 * 
 * This can run:
 * - Locally during development: node scripts/scheduler-daemon.js
 * - On Vercel: as a cron function
 * - On VPS: as a systemd service
 */

import { getScheduler } from '../src/lib/job-scheduler';

console.log('🤖 Piata AI - Scheduler Daemon Starting...\n');

const scheduler = getScheduler();

async function start() {
  try {
    await scheduler.connect();
    scheduler.start();
    
    console.log('✅ Scheduler is now running');
    console.log('📊 Checking for jobs every minute');
    console.log('🛑 Press Ctrl+C to stop\n');
    
    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down scheduler...');
      scheduler.stop();
      await scheduler.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    process.exit(1);
  }
}

start();
