/**
 * Tracing Startup Script
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
 *   node scripts/start-with-tracing.js
 */

// Initialize tracing BEFORE importing any other modules
const { initializeTracing } = require('../src/lib/tracing');

console.log('🔍 Initializing OpenTelemetry tracing...');
initializeTracing();

// Now start the Next.js dev server
const { spawn } = require('child_process');

console.log('🚀 Starting Next.js development server with tracing enabled...\n');

const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
devServer.on('close', (code) => {
  console.log(`\n📊 Next.js dev server exited with code ${code}`);
  console.log('💡 Check the AI Toolkit trace viewer to see collected traces');
  process.exit(code);
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
