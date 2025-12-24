#!/usr/bin/env ts-node
/**
 * Detailed MCP Tools Analysis Script
 * Shows exactly what each tool returns to identify the problem
 */

import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

async function analyzeMcpTools() {
  console.log('🔍 Detailed MCP Tools Analysis...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    // Connect to the MCP server
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    // Get list of all available tools
    const tools = await client.listTools();
    console.log(`📋 Available tools: ${tools.tools.length}\n`);

    // Test a few key tools with detailed response analysis
    const testTools = [
      'retrieve_balance',
      'list_customers', 
      'create_customer',
      'list_products',
      'search_stripe_documentation'
    ];

    console.log('🧪 Running detailed response analysis...\n');

    for (const toolName of testTools) {
      try {
        console.log(`🔧 Tool: ${toolName}`);
        console.log('=' .repeat(50));

        // Call the tool
        const result = await client.callTool(toolName, toolName === 'search_stripe_documentation' ? { query: 'test' } : {});
        
        // Analyze the response
        console.log('📤 Raw Response:');
        console.log(JSON.stringify(result, null, 2));
        
        console.log('\n📊 Response Analysis:');
        console.log(`Type: ${typeof result}`);
        console.log(`Is object: ${typeof result === 'object' && result !== null}`);
        
        if (typeof result === 'object' && result !== null) {
          const resultObj = result as Record<string, unknown>;
          console.log(`Keys: ${Object.keys(resultObj).join(', ')}`);

          // Check for error patterns
          const err = resultObj.error;
          if (err && typeof err === 'object') {
            const errObj = err as Record<string, unknown>;
            console.log('❌ Contains error object');
            console.log(`Error code: ${(errObj.code as string) || 'N/A'}`);
            console.log(`Error message: ${(errObj.message as string) || 'N/A'}`);
          }

          if (resultObj.success === false) {
            console.log('❌ Success flag is false');
          }

          if (typeof resultObj.message === 'string' && resultObj.message) {
            console.log(`Message: ${resultObj.message}`);
          }
        }

        console.log('\n');

      } catch (error: any) {
        console.log(`❌ Tool ${toolName} threw exception:`);
        console.log(`Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
        console.log('\n');
      }
    }

    // Also check the environment
    console.log('🔧 Environment Check:');
    console.log('=' .repeat(50));
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0);
    console.log('STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'N/A');

    // Close the connection
    await client.close();
    console.log('\n🔌 Disconnected from MCP server');

  } catch (error: any) {
    console.error('💥 Critical error during analysis:', error.message);
    throw error;
  }
}

// Run the detailed analysis
async function main() {
  try {
    await analyzeMcpTools();
  } catch (error) {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  }
}

main();