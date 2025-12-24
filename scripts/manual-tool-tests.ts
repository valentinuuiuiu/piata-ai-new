#!/usr/bin/env ts-node
import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

async function testKeyTools() {
  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    await client.connect();
    console.log('✅ Connected\n');

    // Test critical tools
    const toolsToTest = [
      'retrieve_balance',
      'list_customers', 
      'list_products',
      'create_product',
      'list_payment_intents'
    ];

    for (const toolName of toolsToTest) {
      try {
        console.log(`🔧 ${toolName}:`);
        const args = toolName.includes('list') ? { limit: 1 } : {};
        const result = await client.callTool(toolName, args);
        
        if (result && result.content && result.content[0]?.text) {
          const text = result.content[0].text;
          if (text.includes('Invalid API Key') || text.includes('MCP error')) {
            console.log(`   ❌ API Error (Expected - no valid Stripe key)`);
          } else {
            try {
              const parsed = JSON.parse(text);
              console.log(`   ✅ SUCCESS - Returns valid Stripe data`);
              console.log(`      Keys: ${Object.keys(parsed).join(', ')}`);
            } catch {
              console.log(`   ⚠️ Text response: ${text.substring(0, 50)}...`);
            }
          }
        } else {
          console.log(`   ⚠️ Unexpected format`);
        }
      } catch (error: any) {
        console.log(`   💥 Exception: ${error.message}`);
      }
      console.log('');
    }

    await client.close();

  } catch (error) {
    console.error('Error:', error);
  }
}

testKeyTools();