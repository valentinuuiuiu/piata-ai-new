/**
 * Tracing Startup Script (TypeScript)
 * 
 * This script initializes OpenTelemetry tracing before starting the Next.js dev server.
 * It ensures that tracing is set up at the very beginning of the application lifecycle.
 * 
 * IMPORTANT: Before running this script, execute the VSCode command:
 * `ai-mlstudio.tracing.open` to start the trace collector
 * 
 * Usage:
 *   npm run dev:with-tracing
 *   or
 *   ts-node scripts/start-with-tracing.ts
 */

import { spawn } from 'child_process';
import { initializeTracing } from '../src/lib/tracing';

// Initialize tracing BEFORE importing any other modules
console.log('🔍 Initializing OpenTelemetry tracing...');
initializeTracing();

// Now start the Next.js dev server
console.log('🚀 Starting Next.js development server with tracing enabled...\n');

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
