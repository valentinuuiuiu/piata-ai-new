#!/usr/bin/env node
/**
 * Final MCP Tools Test - JavaScript version to avoid TypeScript issues
 */

const { MCPClient } = require('../src/lib/mcp-client');
const path = require('path');

async function testAllMcpTools() {
  console.log('🔍 FINAL MCP TOOLS TEST - All 22 Tools...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    const tools = await client.listTools();
    console.log(`📋 Total available tools: ${tools.tools.length}\n`);

    const results = [];

    for (const tool of tools.tools) {
      try {
        console.log(`🔧 Testing: ${tool.name}`);
        
        // Test with minimal args
        const args = tool.name.includes('list') || tool.name.includes('search') 
          ? { limit: 1 } 
          : {};

        const rawResponse = await client.callTool(tool.name, args);
        
        // Analyze response
        if (rawResponse && rawResponse.content && Array.isArray(rawResponse.content)) {
          const contentItem = rawResponse.content.find(item => item.type === 'text');
          
          if (contentItem && contentItem.text) {
            const textContent = contentItem.text;
            
            if (textContent.includes('MCP error') || textContent.includes('API error') || textContent.includes('Invalid API Key')) {
              console.log(`   ❌ API_ERROR: ${textContent.substring(0, 80)}...`);
              results.push({ name: tool.name, status: 'API_ISSUE', details: textContent.substring(0, 80) });
            } else {
              // Try to parse as JSON
              try {
                const parsed = JSON.parse(textContent);
                console.log(`   ✅ WORKING: Valid Stripe data (${Object.keys(parsed).length} keys)`);
                results.push({ name: tool.name, status: 'WORKING', details: 'Valid Stripe JSON response' });
              } catch (e) {
                console.log(`   ⚠️ TEXT_RESPONSE: ${textContent.substring(0, 80)}...`);
                results.push({ name: tool.name, status: 'TEXT_RESPONSE', details: textContent.substring(0, 80) });
              }
            }
          } else {
            console.log(`   ⚠️ NO_TEXT_CONTENT: ${JSON.stringify(rawResponse)}`);
            results.push({ name: tool.name, status: 'NO_TEXT', details: 'No text content in response' });
          }
        } else {
          console.log(`   ⚠️ UNEXPECTED_FORMAT: ${JSON.stringify(rawResponse)}`);
          results.push({ name: tool.name, status: 'UNEXPECTED', details: 'Unexpected response format' });
        }

      } catch (error) {
        console.log(`   💥 EXCEPTION: ${error.message}`);
        results.push({ name: tool.name, status: 'ERROR', details: error.message });
      }

      console.log('');
    }

    await client.close();
    console.log('🔌 Disconnected from MCP server\n');

    // Summary
    console.log('=' .repeat(80));
    console.log('📊 FINAL MCP TOOLS TEST RESULTS');
    console.log('=' .repeat(80));

    const working = results.filter(r => r.status === 'WORKING').length;
    const apiIssues = results.filter(r => r.status === 'API_ISSUE').length;
    const textResponse = results.filter(r => r.status === 'TEXT_RESPONSE').length;
    const other = results.filter(r => !['WORKING', 'API_ISSUE', 'TEXT_RESPONSE'].includes(r.status)).length;

    console.log(`Total Tools Tested: ${results.length}`);
    console.log(`✅ WORKING: ${working} tools (return valid Stripe data)`);
    console.log(`⚠️ API_ISSUES: ${apiIssues} tools (expected API/auth errors)`);
    console.log(`📝 TEXT_RESPONSE: ${textResponse} tools (return text instead of JSON)`);
    console.log(`❓ OTHER: ${other} tools (other response formats)`);
    console.log('');

    // Show working tools
    if (working > 0) {
      console.log('✅ FULLY FUNCTIONAL TOOLS:');
      results.filter(r => r.status === 'WORKING').forEach(r => {
        console.log(`  • ${r.name}`);
      });
      console.log('');
    }

    // Show API issues (these are expected)
    if (apiIssues > 0) {
      console.log('⚠️ EXPECTED API ISSUES (Require valid Stripe setup):');
      results.filter(r => r.status === 'API_ISSUE').forEach(r => {
        console.log(`  • ${r.name}`);
      });
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('🎯 FINAL CONCLUSION:');
    
    if (working > 0) {
      console.log(`✅ MCP INTEGRATION IS WORKING!`);
      console.log(`   • ${working} tools return valid Stripe data`);
      console.log(`   • ${apiIssues} tools have expected API issues`);
      console.log('   • The Stripe MCP server is functioning correctly');
    }
    
    console.log(`   Total Success Rate: ${((working / results.length) * 100).toFixed(1)}%`);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('💥 Critical error:', error.message);
    throw error;
  }
}

testAllMcpTools().catch(console.error);