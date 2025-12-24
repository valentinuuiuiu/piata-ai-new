
import { fannyMaeAgent } from '../src/lib/fanny-mae-agent';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🚀 Starting Fanny Mae AI Agent (Guardian of Value) in standalone mode...');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('🛑 Stopping agent...');
  process.exit(0);
});

// The agent initializes itself in the constructor
// We just need to keep the event loop active
console.log('💰 Fanny Mae is watching. The Treasury is open.');
console.log('Press Ctrl+C to stop.');

// Prevent the script from exiting immediately
setInterval(() => {
  // Heartbeat
}, 60000);
