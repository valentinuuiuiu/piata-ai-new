#!/usr/bin/env ts-node
/**
 * Corrected MCP Tools Testing Script
 * Properly handles the MCP response format
 */

import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

interface ToolTest {
  name: string;
  description: string;
  testArgs: any;
  expectedKeys?: string[];
}

function parseMcpResponse(response: any): any {
  // Handle the MCP response format: { content: [{ type: "text", text: "..." }] }
  if (response && response.content && Array.isArray(response.content)) {
    const textObject = response.content.find((item: any) => item.type === 'text');
    if (textObject && textObject.text) {
      try {
        return JSON.parse(textObject.text);
      } catch (e) {
        console.warn('Failed to parse JSON from text field:', e);
        return textObject.text;
      }
    }
  }
  return response;
}

async function testMcpToolsCorrected() {
  console.log('🧪 Corrected MCP Tools Testing...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    const tools = await client.listTools();
    console.log(`📋 Available tools: ${tools.tools.length}\n`);

    const toolTests: ToolTest[] = [
      {
        name: 'retrieve_balance',
        description: 'Retrieve account balance',
        testArgs: {},
        expectedKeys: ['object', 'available', 'pending']
      },
      {
        name: 'list_customers',
        description: 'List customers with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      },
      {
        name: 'create_customer',
        description: 'Create a test customer',
        testArgs: {
          email: 'test@example.com',
          name: 'Test Customer'
        },
        expectedKeys: ['id', 'email', 'name', 'object']
      },
      {
        name: 'list_products',
        description: 'List products with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      },
      {
        name: 'create_product',
        description: 'Create a test product',
        testArgs: {
          name: 'Test Product MCP',
          description: 'Product created via MCP test'
        },
        expectedKeys: ['id', 'name', 'active', 'object']
      },
      {
        name: 'search_stripe_documentation',
        description: 'Search Stripe documentation',
        testArgs: { query: 'payment intents' },
        expectedKeys: ['results', 'query']
      },
      {
        name: 'list_payment_intents',
        description: 'List payment intents',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      },
      {
        name: 'list_invoices',
        description: 'List invoices with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      },
      {
        name: 'list_prices',
        description: 'List prices with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      },
      {
        name: 'list_subscriptions',
        description: 'List subscriptions',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more', 'object']
      }
    ];

    console.log('🧪 Running corrected tool tests...\n');

    let passedTests = 0;
    let failedTests = 0;
    const testResults: Array<{name: string, status: 'PASS' | 'FAIL', error?: string}> = [];

    for (const toolTest of toolTests) {
      try {
        console.log(`🔧 Testing: ${toolTest.name}`);
        console.log(`   Description: ${toolTest.description}`);

        const rawResponse = await client.callTool(toolTest.name, toolTest.testArgs);
        const parsedResponse = parseMcpResponse(rawResponse);
        
        console.log(`   📤 Response format: ${typeof parsedResponse}`);
        if (typeof parsedResponse === 'object') {
          console.log(`   📊 Keys: ${Object.keys(parsedResponse).join(', ')}`);
        }

        // Validate expected keys
        if (toolTest.expectedKeys && toolTest.expectedKeys.length > 0) {
          const hasExpectedKeys = toolTest.expectedKeys.every(key => 
            parsedResponse && typeof parsedResponse === 'object' && key in parsedResponse
          );

          if (!hasExpectedKeys) {
            throw new Error(`Missing expected keys: ${toolTest.expectedKeys.join(', ')}`);
          }
        }

        console.log(`   ✅ PASSED - Response structure validated`);
        testResults.push({ name: toolTest.name, status: 'PASS' });
        passedTests++;

      } catch (error: any) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
        testResults.push({ name: toolTest.name, status: 'FAIL', error: error.message });
        failedTests++;
      }
      
      console.log('');
    }

    await client.close();
    console.log('🔌 Disconnected from MCP server\n');

    // Summary report
    console.log('=' .repeat(60));
    console.log('📊 CORRECTED MCP TOOLS TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${toolTests.length}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / toolTests.length) * 100).toFixed(1)}%`);
    console.log('');

    if (failedTests > 0) {
      console.log('❌ FAILED TOOLS:');
      testResults
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`  - ${result.name}: ${result.error}`);
        });
    } else {
      console.log('🎉 All tested tools are working correctly!');
      console.log('   The MCP tools return data in wrapped format:');
      console.log('   { content: [{ type: "text", text: "JSON_STRING" }] }');
      console.log('   The actual data is inside the text field as JSON.');
    }

    console.log('\n' + '=' .repeat(60));

    return {
      total: toolTests.length,
      passed: passedTests,
      failed: failedTests,
      successRate: ((passedTests / toolTests.length) * 100).toFixed(1) + '%',
      results: testResults
    };

  } catch (error: any) {
    console.error('💥 Critical error during testing:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const results = await testMcpToolsCorrected();
    
    if (results.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check the results above for details.');
      process.exit(1);
    } else {
      console.log('\n✅ MCP tools testing completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

main();