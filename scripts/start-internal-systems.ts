/**
 * Internal Systems Startup Script
 * 
 * Initializes all internal systems before starting Next.js:
 * - Tracing
 * - Internal Agent Manager (Jules, Kate, Grok)
 * - Internal Workflow Registry
 * - Internal Workflow Executor
 * 
 * Everything is internal - we own it completely!
 * 
 * IMPORTANT: Before running this script, execute the VSCode command:
 * `ai-mlstudio.tracing.open` to start the trace collector
 * 
 * Usage:
 *   npm run dev:internal
 *   or
 *   ts-node scripts/start-internal-systems.ts
 */

import { spawn } from 'child_process';
import { initializeInternalSystems } from '../src/lib/internal-systems-init';

// Initialize all internal systems BEFORE starting Next.js
console.log('🔧 Initializing Internal Systems...\n');

initializeInternalSystems()
  .then(() => {
    console.log('🚀 Starting Next.js development server with internal systems...\n');

    // Start Next.js dev server
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle process termination
    devServer.on('close', (code: number | null) => {
      console.log(`\n📊 Next.js dev server exited with code ${code}`);
      console.log('💡 Check the AI Toolkit trace viewer to see collected traces');
      process.exit(code || 0);
    });

    // Forward signals
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      devServer.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down...');
      devServer.kill('SIGTERM');
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize internal systems:', error);
    process.exit(1);
  });
