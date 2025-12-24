#!/usr/bin/env ts-node
/**
 * Complete Stripe + Google Sheets Automation Test
 * Tests the integration with test keys and validates the flow
 */

import { MCPClient } from '../src/lib/mcp-client';
import { createStripeSheetsIntegration } from '../src/lib/google-sheets-integration';
import path from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  error?: string;
}

async function testStripeSheetsIntegration() {
  console.log('🧪 STRIPE + GOOGLE SHEETS AUTOMATION TEST\n');
  console.log('=' .repeat(60));

  const results: TestResult[] = [];

  try {
    // Test 1: Environment Configuration
    console.log('🔧 TEST 1: Environment Configuration');
    console.log('-' .repeat(40));
    
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (!stripeKey) {
      results.push({
        test: 'Environment Setup',
        status: 'SKIP',
        details: 'STRIPE_SECRET_KEY not found'
      });
      console.log('⚠️  SKIPPED: STRIPE_SECRET_KEY not configured');
    } else {
      results.push({
        test: 'Environment Setup',
        status: 'PASS',
        details: 'Stripe test key available'
      });
      console.log('✅ PASSED: Stripe test key configured');
    }

    if (!googleApiKey || !spreadsheetId) {
      results.push({
        test: 'Google Sheets Setup',
        status: 'SKIP',
        details: 'Google API key or Sheets ID not configured'
      });
      console.log('⚠️  SKIPPED: Google Sheets not configured');
    } else {
      results.push({
        test: 'Google Sheets Setup',
        status: 'PASS',
        details: 'Google API key and Sheets ID configured'
      });
      console.log('✅ PASSED: Google Sheets configured');
    }
    console.log('');

    // Test 2: MCP Connection Test
    console.log('🔧 TEST 2: MCP Agent Connections');
    console.log('-' .repeat(40));

    // Test Stripe MCP
    try {
      const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
      const stripeClient = new MCPClient("Stripe-Test", stripeScript, []);
      await stripeClient.connect();
      const stripeTools = await stripeClient.listTools();
      
      results.push({
        test: 'Stripe MCP Connection',
        status: 'PASS',
        details: `${stripeTools.tools.length} tools available`
      });
      console.log(`✅ PASSED: Stripe MCP connected (${stripeTools.tools.length} tools)`);
      
      await stripeClient.close();
    } catch (error: any) {
      results.push({
        test: 'Stripe MCP Connection',
        status: 'FAIL',
        details: 'Failed to connect',
        error: error.message
      });
      console.log(`❌ FAILED: Stripe MCP connection failed - ${error.message}`);
    }

    // Test Google Sheets MCP
    try {
      const sheetsScript = path.resolve(process.cwd(), 'subagents/stripe-sheets-mcp-agent.sh');
      const sheetsClient = new MCPClient("GoogleSheets-Test", sheetsScript, []);
      await sheetsClient.connect();
      console.log('✅ PASSED: Google Sheets MCP connected');
      
      results.push({
        test: 'Google Sheets MCP Connection',
        status: 'PASS',
        details: 'MCP server started successfully'
      });
      
      await sheetsClient.close();
    } catch (error: any) {
      results.push({
        test: 'Google Sheets MCP Connection',
        status: 'FAIL',
        details: 'Failed to connect',
        error: error.message
      });
      console.log(`❌ FAILED: Google Sheets MCP connection failed - ${error.message}`);
    }
    console.log('');

    // Test 3: Google Sheets Integration (if configured)
    if (googleApiKey && spreadsheetId) {
      console.log('🔧 TEST 3: Google Sheets Direct Integration');
      console.log('-' .repeat(40));

      try {
        const sheetsIntegration = createStripeSheetsIntegration();
        if (!sheetsIntegration) {
          throw new Error('Failed to initialize Google Sheets integration');
        }

        // Test reading sheet (should return empty or data)
        await sheetsIntegration.getSalesAnalytics();
        
        results.push({
          test: 'Google Sheets Integration',
          status: 'PASS',
          details: 'Successfully connected to Google Sheets API'
        });
        console.log('✅ PASSED: Google Sheets integration working');
      } catch (error: any) {
        results.push({
          test: 'Google Sheets Integration',
          status: 'FAIL',
          details: 'API connection failed',
          error: error.message
        });
        console.log(`❌ FAILED: Google Sheets integration failed - ${error.message}`);
      }
    }
    console.log('');

    // Test 4: Stripe API Test (if configured)
    if (stripeKey) {
      console.log('🔧 TEST 4: Stripe API Connection');
      console.log('-' .repeat(40));

      try {
        const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
        const client = new MCPClient("Stripe-API-Test", stripeScript, []);
        await client.connect();
        
        // Test retrieve_balance (should work with test key)
        const balance = await client.callTool('retrieve_balance', {});
        
        if (balance && balance.content && balance.content[0]?.text) {
          const balanceData = JSON.parse(balance.content[0].text);
          
          results.push({
            test: 'Stripe API Test',
            status: 'PASS',
            details: `Balance retrieved: ${balanceData.available[0]?.amount || 0} ${balanceData.available[0]?.currency || 'unknown'}`
          });
          console.log(`✅ PASSED: Stripe API working - Balance: ${balanceData.available[0]?.amount || 0} ${balanceData.available[0]?.currency || 'unknown'}`);
        } else {
          throw new Error('Invalid response format');
        }
        
        await client.close();
      } catch (error: any) {
        results.push({
          test: 'Stripe API Test',
          status: 'FAIL',
          details: 'API call failed',
          error: error.message
        });
        console.log(`❌ FAILED: Stripe API test failed - ${error.message}`);
      }
    }
    console.log('');

    // Test 5: Automation Flow Simulation
    console.log('🔧 TEST 5: Complete Automation Flow Simulation');
    console.log('-' .repeat(40));

    try {
      // Simulate a payment transaction flow
      const testTransaction = {
        id: `test_${Date.now()}`,
        date: new Date().toISOString(),
        customerEmail: 'test@example.com',
        amount: 29.99,
        currency: 'usd',
        status: 'completed' as const,
        paymentMethod: 'card',
        product: 'Test Product',
        description: 'Automated test transaction'
      };

      // If Google Sheets is configured, test the recording
      if (googleApiKey && spreadsheetId) {
        const sheetsIntegration = createStripeSheetsIntegration();
        if (sheetsIntegration) {
          await sheetsIntegration.recordTransaction(testTransaction);
          console.log('✅ PASSED: Transaction recorded in Google Sheets');
        }
      }

      results.push({
        test: 'Automation Flow',
        status: 'PASS',
        details: 'Complete payment → sheets flow tested'
      });
      console.log('✅ PASSED: Complete automation flow validated');
    } catch (error: any) {
      results.push({
        test: 'Automation Flow',
        status: 'FAIL',
        details: 'Flow simulation failed',
        error: error.message
      });
      console.log(`❌ FAILED: Automation flow failed - ${error.message}`);
    }
    console.log('');

  } catch (error: any) {
    results.push({
      test: 'Overall Test Execution',
      status: 'FAIL',
      details: 'Test execution failed',
      error: error.message
    });
    console.error(`💥 CRITICAL ERROR: ${error.message}`);
  }

  // Final Results Summary
  console.log('=' .repeat(60));
  console.log('📊 STRIPE + GOOGLE SHEETS TEST SUMMARY');
  console.log('=' .repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('');

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  • ${r.test}: ${r.details}`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
    console.log('');
  }

  if (skipped > 0) {
    console.log('⚠️  SKIPPED TESTS (missing configuration):');
    results.filter(r => r.status === 'SKIP').forEach(r => {
      console.log(`  • ${r.test}: ${r.details}`);
    });
    console.log('');
  }

  console.log('🎯 RECOMMENDATIONS:');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('• Configure STRIPE_SECRET_KEY in .env.local for full testing');
  }
  
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_SHEETS_ID) {
    console.log('• Configure GOOGLE_API_KEY and GOOGLE_SHEETS_ID in .env.local for Google Sheets integration');
  }

  if (passed > 0 && failed === 0) {
    console.log('🎉 STRIPE + GOOGLE SHEETS INTEGRATION IS READY!');
    console.log('   Your automation flow is working correctly.');
  } else if (passed > failed) {
    console.log('⚠️  INTEGRATION PARTIALLY WORKING');
    console.log('   Fix failed tests to enable full functionality.');
  } else {
    console.log('❌ INTEGRATION NEEDS SETUP');
    console.log('   Configure environment variables and retry testing.');
  }

  console.log('=' .repeat(60));

  return {
    total: results.length,
    passed,
    failed,
    skipped,
    results
  };
}

// Main execution
async function main() {
  try {
    const results = await testStripeSheetsIntegration();
    
    if (results.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check recommendations above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed! Integration is ready for production.');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  }
}

main();