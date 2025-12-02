import { AIOrchestrator } from '../src/lib/ai-orchestrator';
import { AgentCapability } from '../src/lib/agents/types';

async function main() {
  console.log('Starting Agent Orchestration Test...');
  
  const orchestrator = new AIOrchestrator();

  // Test 1: Content Optimization Task
  console.log('\n--- Test 1: Content Optimization ---');
  const contentResult = await orchestrator.routeRequest(
    'Please optimize this listing description for SEO: "Selling a used bike, good condition."',
    { userId: 'test-user' }
  );
  console.log('Result:', JSON.stringify(contentResult, null, 2));

  // Test 2: Research Task (Manus)
  // Note: This requires the python bridge to be working. If not, it might fail or timeout.
  console.log('\n--- Test 2: Research Task ---');
  try {
    const researchResult = await orchestrator.routeRequest(
      'Research the average price of a used mountain bike in Romania.',
      { userId: 'test-user' }
    );
    console.log('Result:', JSON.stringify(researchResult, null, 2));
  } catch (error) {
    console.error('Research task failed (expected if python env not ready):', error);
  }

  // Test 3: Unknown Capability
  console.log('\n--- Test 3: Unknown Capability ---');
  const unknownResult = await orchestrator.routeRequest(
    'Calculate the mass of the sun.', 
    { userId: 'test-user' }
  );
  console.log('Result:', JSON.stringify(unknownResult, null, 2));
}

main().catch(console.error);
