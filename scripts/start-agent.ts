
import { piataAgent } from '../src/lib/piata-agent';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Starting Piata AI Agent (Taita) in standalone mode...');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('🛑 Stopping agent...');
  process.exit(0);
});

// The agent initializes itself in the constructor
// We just need to keep the event loop active
console.log('🔮 Taita is watching. The No-Mind State is active.');
console.log('Press Ctrl+C to stop.');

// Optional: Trigger a startup event
piataAgent.triggerEvent('system_startup', { timestamp: new Date() });

// Prevent the script from exiting immediately
setInterval(() => {
  // Heartbeat
}, 60000);
