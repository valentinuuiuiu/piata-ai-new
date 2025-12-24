async function testMasterpiece() {
  console.log('🌟 Starting Masterpiece Workflow Test...');
  
  const response = await fetch('http://localhost:3000/api/mcp-hub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'run_workflow',
      name: 'listing_boost_masterpiece',
      args: {
        text: 'Vand BMW Seria 3, 2020, stare perfecta.',
        topic: 'BMW Series 3 2020 Romania market',
        context: { userId: 'admin-test' }
      }
    })
  });

  const result = await response.json();
  console.log('Result:', JSON.stringify(result, null, 2));
}

// Note: This requires the Next.js server to be running.
// Since we are in CLI, we'll call the mcpHub directly via tsx.
import { mcpHub } from '../src/lib/mcp-hub';

async function runDirect() {
  console.log('🌟 Starting Direct MCPHub Masterpiece Test...');
  try {
    const result = await mcpHub.runWorkflow('listing_boost_masterpiece', {
      text: 'Vand BMW Seria 3, 2020, stare perfecta, pret bun.',
      topic: 'BMW Series 3 2020 Romania market',
      context: { userId: 'admin-test' }
    });
    console.log('Final Workflow Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Workflow failed:', e);
  }
}

runDirect();