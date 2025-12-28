
import { EnhancedPiataAgent } from '@/lib/piata-agent-enhanced';
import { a2aSignalManager } from '@/lib/a2a/signal-manager';

const agentName = process.argv[2] || 'Gemini';

// Use mock mode if explicitly requested or if DATABASE_URL is missing
const USE_MOCK_MODE = process.env.USE_MOCK_MODE === 'true' || !process.env.DATABASE_URL;

async function main() {
  console.log(`\n🤖 Starting Autonomous Agent Loop: [${agentName}]`);
  console.log('---------------------------------------------------');

  if (USE_MOCK_MODE) {
    console.log('⚠️  DATABASE UNAVAILABLE or Mock Requested: Enabling Mock Mode for Verification');
    a2aSignalManager.setMockMode(true);
  }

  console.log('Press Ctrl+C to stop.');

  // Determine tools based on agent name
  const tools: string[] = [];
  if (agentName.toLowerCase().includes('kate') || agentName.toLowerCase().includes('coder')) {
      tools.push('git_ops');
  }

  // Create an enhanced agent instance
  const agent = new EnhancedPiataAgent(agentName, undefined, tools);

  // Start the loop (poll every 5 seconds)
  agent.start(5000);

  // If in mock mode, simulate traffic to show it working
  if (USE_MOCK_MODE) {
    setTimeout(async () => {
        console.log('\n⚡ Sending test broadcast signal (Simulation)...');
        await a2aSignalManager.broadcastEnhanced(
            'TEST_SIGNAL',
            { message: `Hello from ${agentName} (self-test)` },
            'TestRunner'
        );
    }, 2000);
  }

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\nStopping agent...');
    agent.stop();
    process.exit(0);
  });
}

main().catch(console.error);
