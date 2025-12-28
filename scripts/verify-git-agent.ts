
import { a2aSignalManager } from '@/lib/a2a/signal-manager';
import { EnhancedPiataAgent } from '@/lib/piata-agent-enhanced';

// Use mock mode if explicitly requested or if DATABASE_URL is missing
const USE_MOCK_MODE = process.env.USE_MOCK_MODE === 'true' || !process.env.DATABASE_URL;

async function runVerification() {
    console.log("🚀 Starting Agent 'Kate' to verify Git Tools...");

    if (USE_MOCK_MODE) {
        console.log('⚠️  DATABASE UNAVAILABLE: Enabling Mock Mode');
        a2aSignalManager.setMockMode(true);
    }

    const kate = new EnhancedPiataAgent('Kate', `You are Kate.
    Your task:
    1. Check git status using 'git_status'.
    2. Check the last 5 commits using 'git_log'.
    3. List files in the root directory using 'list_files'.
    4. Report your findings.

    You have these tools available. Use them.`, ['git_ops']);

    kate.start(1000); // Poll every 1s for test

    // Inject a signal to trigger Kate
    console.log("⚡ Sending 'ANALYZE_REPO' signal to Kate...");
    await a2aSignalManager.callAgentEnhanced(
        'Kate',
        {
            goal: 'Analyze repository status and history',
            instruction: 'Use your git tools to inspect the current state of the repo.'
        },
        'SystemTest'
    );

    // Run for 15 seconds then stop
    setTimeout(() => {
        console.log("🛑 Stopping verification...");
        kate.stop();
        process.exit(0);
    }, 15000);
}

runVerification().catch(console.error);
