#!/usr/bin/env ts-node
/**
 * Comprehensive MCP Tools Testing Script
 * Tests all available MCP tools for the Stripe agent
 */

import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

interface ToolTest {
  name: string;
  description: string;
  testArgs: any;
  expectedKeys?: string[];
}

async function testMcpTools() {
  console.log('🧪 Starting comprehensive MCP tools testing...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    // Connect to the MCP server
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    // Get list of all available tools
    const tools = await client.listTools();
    console.log(`📋 Available tools: ${tools.tools.length}\n`);

    // Define comprehensive tests for each tool
    const toolTests: ToolTest[] = [
      {
        name: 'create_customer',
        description: 'Create a test customer',
        testArgs: {
          email: 'test@example.com',
          name: 'Test Customer',
          metadata: { test: true, source: 'mcp_test' }
        },
        expectedKeys: ['id', 'email', 'name']
      },
      {
        name: 'list_customers',
        description: 'List customers with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'create_product',
        description: 'Create a test product',
        testArgs: {
          name: 'Test Product MCP',
          description: 'Product created via MCP test',
          metadata: { test: true, created_by: 'mcp_automated_test' }
        },
        expectedKeys: ['id', 'name', 'active']
      },
      {
        name: 'list_products',
        description: 'List products with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'create_price',
        description: 'Create a test price',
        testArgs: {
          currency: 'usd',
          unit_amount: 1000,
          product_data: { name: 'Test Price Product' }
        },
        expectedKeys: ['id', 'currency', 'unit_amount']
      },
      {
        name: 'list_prices',
        description: 'List prices with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'create_payment_link',
        description: 'Create a payment link',
        testArgs: {
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: 'Test Item' },
                unit_amount: 1500
              },
              quantity: 1
            }
          ]
        },
        expectedKeys: ['id', 'url', 'created']
      },
      {
        name: 'create_invoice',
        description: 'Create a test invoice',
        testArgs: {
          customer: 'cus_test_customer',
          collection_method: 'send_invoice',
          days_until_due: 30
        },
        expectedKeys: ['id', 'customer', 'status']
      },
      {
        name: 'list_invoices',
        description: 'List invoices with limit',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'create_invoice_item',
        description: 'Add item to invoice',
        testArgs: {
          customer: 'cus_test_customer',
          invoice: 'in_test_invoice',
          amount: 2500,
          currency: 'usd',
          description: 'Test invoice item'
        },
        expectedKeys: ['id', 'amount', 'currency']
      },
      {
        name: 'finalize_invoice',
        description: 'Finalize a test invoice',
        testArgs: { invoice: 'in_test_invoice' },
        expectedKeys: ['id', 'status', 'finalized_at']
      },
      {
        name: 'retrieve_balance',
        description: 'Retrieve account balance',
        testArgs: {},
        expectedKeys: ['available', 'pending']
      },
      {
        name: 'create_refund',
        description: 'Create a test refund',
        testArgs: {
          charge: 'ch_test_charge',
          amount: 1000,
          reason: 'requested_by_customer'
        },
        expectedKeys: ['id', 'amount', 'status']
      },
      {
        name: 'list_payment_intents',
        description: 'List payment intents',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'list_subscriptions',
        description: 'List subscriptions',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'cancel_subscription',
        description: 'Cancel a subscription',
        testArgs: { 
          subscription: 'sub_test_subscription',
          prorate: true 
        },
        expectedKeys: ['id', 'status', 'canceled_at']
      },
      {
        name: 'update_subscription',
        description: 'Update subscription',
        testArgs: { 
          subscription: 'sub_test_subscription',
          items: []
        },
        expectedKeys: ['id', 'items', 'status']
      },
      {
        name: 'search_stripe_documentation',
        description: 'Search Stripe documentation',
        testArgs: { query: 'payment intents' },
        expectedKeys: ['results', 'query']
      },
      {
        name: 'list_coupons',
        description: 'List coupons',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      },
      {
        name: 'create_coupon',
        description: 'Create a test coupon',
        testArgs: {
          percent_off: 20,
          duration: 'once',
          currency: 'usd'
        },
        expectedKeys: ['id', 'percent_off', 'duration']
      },
      {
        name: 'update_dispute',
        description: 'Update dispute evidence',
        testArgs: {
          dispute: 'dp_test_dispute',
          evidence: { submission_type: 'other' }
        },
        expectedKeys: ['id', 'status', 'evidence']
      },
      {
        name: 'list_disputes',
        description: 'List disputes',
        testArgs: { limit: 5 },
        expectedKeys: ['data', 'has_more']
      }
    ];

    console.log('🧪 Running individual tool tests...\n');

    let passedTests = 0;
    let failedTests = 0;
    const testResults: Array<{name: string, status: 'PASS' | 'FAIL', error?: string}> = [];

    // Test each tool individually
    for (const toolTest of toolTests) {
      try {
        console.log(`🔧 Testing: ${toolTest.name}`);
        console.log(`   Description: ${toolTest.description}`);

        const result = await client.callTool(toolTest.name, toolTest.testArgs);
        
        // Validate response structure if expected keys are provided
        if (toolTest.expectedKeys && toolTest.expectedKeys.length > 0) {
          const hasExpectedKeys = toolTest.expectedKeys.every(key => 
            result && typeof result === 'object' && key in result
          );

          if (!hasExpectedKeys) {
            throw new Error(`Missing expected keys: ${toolTest.expectedKeys.join(', ')}`);
          }
        }

        console.log(`   ✅ PASSED - Response keys: ${Object.keys(result || {}).join(', ')}`);
        testResults.push({ name: toolTest.name, status: 'PASS' });
        passedTests++;

      } catch (error: any) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
        testResults.push({ name: toolTest.name, status: 'FAIL', error: error.message });
        failedTests++;
      }
      
      console.log(''); // Empty line for readability
    }

    // Close the connection
    await client.close();
    console.log('🔌 Disconnected from MCP server\n');

    // Summary report
    console.log('=' .repeat(60));
    console.log('📊 MCP TOOLS TEST SUMMARY');
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
      console.log('');
    }

    // Detailed results for debugging
    console.log('📋 DETAILED RESULTS:');
    testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`  ${status} ${result.name}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

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

// Run the comprehensive test
async function main() {
  try {
    const results = await testMcpTools();
    
    if (results.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check the results above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All MCP tools are working correctly!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

main();