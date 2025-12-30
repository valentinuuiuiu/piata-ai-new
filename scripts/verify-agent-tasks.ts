
import { kael } from '@/lib/agents/unified-orchestrator';
import { mcpHub } from '@/lib/mcp-hub';

// Set env vars BEFORE imports that use them might initialize
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'mock-key';
process.env.USE_MOCK_MODE = 'true';

async function verifyAgentTasks() {
  console.log('🧪 Starting Agent Task Verification...');
  console.log('-------------------------------------');

  // Verify MCP Hub initialization
  console.log('1. Verifying MCP Hub...');
  const tools = mcpHub.getTools();
  console.log(`✅ MCP Hub initialized with ${tools.length} local tools:`);
  tools.forEach(t => console.log(`   - ${t.name}: ${t.description}`));

  // Task 1: Check Database Health (Supabase MCP)
  console.log('\n2. Testing Task Routing (Database)...');
  try {
    const result = kael.routeTask({
        id: 'test-db-1',
        goal: 'Check the health of the database connection',
        type: 'data',
        priority: 'normal'
    });
    console.log(`✅ Routing Result: ${result.agent} (Confidence: ${result.confidence})`);
    console.log(`   Reasoning: ${result.reasoning}`);
  } catch (error: any) {
    console.error('❌ Routing Failed:', error.message);
  }

  // Task 2: Reasoning (Antigravity)
  console.log('\n3. Testing Task Routing (Reasoning)...');
  try {
    const result = kael.routeTask({
        id: 'test-reasoning-1',
        goal: 'Analyze the potential impact of a new "Vintage Electronics" category on the marketplace',
        type: 'analysis',
        priority: 'high'
    });
    console.log(`✅ Routing Result: ${result.agent} (Confidence: ${result.confidence})`);
    console.log(`   Reasoning: ${result.reasoning}`);
  } catch (error: any) {
    console.error('❌ Routing Failed:', error.message);
  }

  // Task 3: Coding (Kate)
  console.log('\n4. Testing Task Routing (Coding)...');
  try {
    const result = kael.routeTask({
        id: 'test-code-1',
        goal: 'Write a TypeScript function to validate Romanian phone numbers',
        type: 'coding',
        priority: 'normal'
    });
    console.log(`✅ Routing Result: ${result.agent} (Confidence: ${result.confidence})`);
    console.log(`   Reasoning: ${result.reasoning}`);
  } catch (error: any) {
    console.error('❌ Routing Failed:', error.message);
  }

  // Task 4: Fast/General (Grok)
  console.log('\n5. Testing Task Routing (Fast/General)...');
  try {
    const result = kael.routeTask({
        id: 'test-general-1',
        goal: 'Quickly summarize the benefits of AI in e-commerce',
        type: 'automation',
        priority: 'normal'
    });
    console.log(`✅ Routing Result: ${result.agent} (Confidence: ${result.confidence})`);
    console.log(`   Reasoning: ${result.reasoning}`);
  } catch (error: any) {
    console.error('❌ Routing Failed:', error.message);
  }

  console.log('\n-------------------------------------');
  console.log('✅ Verification Complete');
  process.exit(0);
}

verifyAgentTasks().catch((err) => {
  console.error(err);
  process.exit(1);
});
