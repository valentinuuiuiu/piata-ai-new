#!/usr/bin/env ts-node
/**
 * Simple MCP Tools Debug Script
 */

import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

async function debugMcpTools() {
  console.log('🔍 MCP Tools Debug Analysis...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    // Test a single tool to see the raw response
    console.log('🧪 Testing retrieve_balance tool...\n');

    const result = await client.callTool('retrieve_balance', {});
    
    console.log('📤 Raw Response:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Response Analysis:');
    console.log(`Type: ${typeof result}`);
    
    if (typeof result === 'object' && result !== null) {
      console.log(`Keys: ${Object.keys(result as any).join(', ')}`);
      
      const resultObj = result as any;
      if (resultObj.error) {
        console.log('❌ Error detected:');
        console.log(`  Code: ${resultObj.error.code || 'N/A'}`);
        console.log(`  Message: ${resultObj.error.message || 'N/A'}`);
      }
      
      if ('success' in resultObj) {
        console.log(`Success flag: ${resultObj.success}`);
      }
    }

    await client.close();
    console.log('\n🔌 Disconnected from MCP server');

  } catch (error: any) {
    console.error('💥 Error during debug:', error.message);
  }
}

debugMcpTools();