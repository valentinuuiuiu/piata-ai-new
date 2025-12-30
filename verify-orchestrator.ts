import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log('DEBUG: API KEY LOADED:', process.env.OPENROUTER_API_KEY ? 'YES (starts with ' + process.env.OPENROUTER_API_KEY.substring(0, 10) + ')' : 'NO');
import { kael } from './src/lib/agents';

async function verifyOrchestrator() {
  console.log('--- Agent Orchestrator Verification ---');
  
  // Test 1: Coding Task (KATE)
  console.log('\nTask 1: Coding...');
  const res1 = await kael.execute({
    id: 'test-code',
    goal: 'Write a TypeScript function to check if a string is a valid email.',
    type: 'coding',
    priority: 'normal'
  });
  console.log('Agent used:', res1.metadata.agentUsed);
  console.log('Output preview:', res1.output?.toString().substring(0, 100));

  // Test 2: Romanian Content (MINIMAX)
  console.log('\nTask 2: Romanian Content...');
  const res2 = await kael.execute({
    id: 'test-ro',
    goal: 'Scrie un titlu de anunț atractiv pentru o mașină Tesla.',
    type: 'content',
    priority: 'normal'
  });
  console.log('Agent used:', res2.metadata.agentUsed);
  console.log('Output:', res2.output);

  // Test 3: MCP Task (Stripe)
  console.log('\nTask 3: MCP Stripe...');
  try {
    const res3 = await kael.execute({
      id: 'test-mcp',
      goal: 'List recent Stripe charges',
      type: 'financial',
      priority: 'low'
    });
    console.log('Agent used:', res3.metadata.agentUsed);
    console.log('Output:', res3.output);
  } catch (e: any) {
    console.log('MCP Task Failed (Expected if bridge not running or keys missing):', e.message);
  }

  process.exit(0);
}

verifyOrchestrator().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
