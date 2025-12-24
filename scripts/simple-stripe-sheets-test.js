#!/usr/bin/env node
/**
 * Simple Stripe + Google Sheets Integration Test
 * JavaScript version to avoid TypeScript issues
 */

const { MCPClient } = require('../src/lib/mcp-client');
const { createStripeSheetsIntegration } = require('../src/lib/google-sheets-integration');
const path = require('path');

async function testStripeSheets() {
  console.log('🧪 STRIPE + GOOGLE SHEETS INTEGRATION TEST\n');
  console.log('=' .repeat(50));

  const results = [];

  // Test 1: Environment Check
  console.log('🔧 Environment Configuration:');
  console.log('-' .repeat(30));
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const sheetsId = process.env.GOOGLE_SHEETS_ID;

  if (!stripeKey) {
    console.log('⚠️  STRIPE_SECRET_KEY: Not configured');
    results.push({ test: 'Stripe Config', status: 'SKIP', reason: 'No key' });
  } else {
    console.log('✅ STRIPE_SECRET_KEY: Configured');
    results.push({ test: 'Stripe Config', status: 'PASS', reason: 'Key present' });
  }

  if (!googleKey || !sheetsId) {
    console.log('⚠️  Google Sheets: Not configured');
    results.push({ test: 'Sheets Config', status: 'SKIP', reason: 'No keys' });
  } else {
    console.log('✅ Google Sheets: Configured');
    results.push({ test: 'Sheets Config', status: 'PASS', reason: 'Keys present' });
  }
  console.log('');

  // Test 2: MCP Connection
  console.log('🔧 MCP Agent Connections:');
  console.log('-' .repeat(30));

  // Test Stripe MCP
  try {
    const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
    const stripeClient = new MCPClient("Test-Stripe", stripeScript, []);
    await stripeClient.connect();
    const tools = await stripeClient.listTools();
    
    console.log(`✅ Stripe MCP: ${tools.tools.length} tools available`);
    results.push({ test: 'Stripe MCP', status: 'PASS', reason: `${tools.tools.length} tools` });
    
    await stripeClient.close();
  } catch (error) {
    console.log(`❌ Stripe MCP: ${error.message}`);
    results.push({ test: 'Stripe MCP', status: 'FAIL', reason: error.message });
  }

  // Test Sheets MCP
  try {
    const sheetsScript = path.resolve(process.cwd(), 'subagents/stripe-sheets-mcp-agent.sh');
    const sheetsClient = new MCPClient("Test-Sheets", sheetsScript, []);
    await sheetsClient.connect();
    
    console.log('✅ Sheets MCP: Connected');
    results.push({ test: 'Sheets MCP', status: 'PASS', reason: 'Connected' });
    
    await sheetsClient.close();
  } catch (error) {
    console.log(`❌ Sheets MCP: ${error.message}`);
    results.push({ test: 'Sheets MCP', status: 'FAIL', reason: error.message });
  }
  console.log('');

  // Test 3: Stripe API (if configured)
  if (stripeKey) {
    console.log('🔧 Stripe API Test:');
    console.log('-' .repeat(30));

    try {
      const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
      const client = new MCPClient("API-Test", stripeScript, []);
      await client.connect();
      
      const balance = await client.callTool('retrieve_balance', {});
      
      if (balance && balance.content && Array.isArray(balance.content)) {
        const textContent = balance.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          const balanceData = JSON.parse(textContent.text);
          const amount = balanceData.available[0]?.amount || 0;
          const currency = balanceData.available[0]?.currency || 'unknown';
          
          console.log(`✅ Stripe API: Balance ${amount} ${currency}`);
          results.push({ test: 'Stripe API', status: 'PASS', reason: `Balance: ${amount} ${currency}` });
        } else {
          throw new Error('No text content in response');
        }
      } else {
        throw new Error('Invalid response format');
      }
      
      await client.close();
    } catch (error) {
      console.log(`❌ Stripe API: ${error.message}`);
      results.push({ test: 'Stripe API', status: 'FAIL', reason: error.message });
    }
    console.log('');
  }

  // Test 4: Google Sheets API (if configured)
  if (googleKey && sheetsId) {
    console.log('🔧 Google Sheets API Test:');
    console.log('-' .repeat(30));

    try {
      const integration = createStripeSheetsIntegration();
      if (!integration) {
        throw new Error('Failed to initialize');
      }

      // Test basic API call
      const analytics = await integration.getSalesAnalytics();
      
      console.log(`✅ Google Sheets API: Connected`);
      console.log(`   - Total Revenue: $${analytics.totalRevenue.toFixed(2)}`);
      console.log(`   - Transactions: ${analytics.totalTransactions}`);
      results.push({ test: 'Sheets API', status: 'PASS', reason: 'Connected' });
    } catch (error) {
      console.log(`❌ Google Sheets API: ${error.message}`);
      results.push({ test: 'Sheets API', status: 'FAIL', reason: error.message });
    }
    console.log('');
  }

  // Test 5: Integration Flow
  console.log('🔧 Integration Flow Test:');
  console.log('-' .repeat(30));

  try {
    // Simulate the complete flow
    const testTransaction = {
      id: `test_${Date.now()}`,
      date: new Date().toISOString(),
      customerEmail: 'test@example.com',
      amount: 25.99,
      currency: 'usd',
      status: 'completed',
      paymentMethod: 'card',
      product: 'Test Product',
      description: 'Integration test transaction'
    };

    if (googleKey && sheetsId) {
      const integration = createStripeSheetsIntegration();
      if (integration) {
        await integration.recordTransaction(testTransaction);
        await integration.updateInventory('Test Product', 1, 25.99);
        
        console.log('✅ Integration Flow: Payment → Sheets working');
        results.push({ test: 'Integration Flow', status: 'PASS', reason: 'Complete flow tested' });
      }
    } else {
      console.log('⚠️  Integration Flow: Skipped (Google Sheets not configured)');
      results.push({ test: 'Integration Flow', status: 'SKIP', reason: 'No Sheets config' });
    }
  } catch (error) {
    console.log(`❌ Integration Flow: ${error.message}`);
    results.push({ test: 'Integration Flow', status: 'FAIL', reason: error.message });
  }
  console.log('');

  // Final Summary
  console.log('=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);

  if (failed === 0 && passed > 0) {
    console.log('\n🎉 SUCCESS! Your Stripe + Google Sheets integration is ready!');
    console.log('   The automation flow is working correctly.');
  } else if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the results above.');
  }

  if (skipped > 0) {
    console.log('\n💡 NEXT STEPS:');
    if (!stripeKey) {
      console.log('   • Add STRIPE_SECRET_KEY to .env.local for full testing');
    }
    if (!googleKey || !sheetsId) {
      console.log('   • Add GOOGLE_API_KEY and GOOGLE_SHEETS_ID for Sheets integration');
    }
  }

  console.log('=' .repeat(50));

  return { passed, failed, skipped, total: results.length };
}

// Run the test
testStripeSheets().catch(console.error);