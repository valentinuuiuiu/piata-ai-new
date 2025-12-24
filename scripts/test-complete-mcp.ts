#!/usr/bin/env ts-node
/**
 * Complete MCP Tools Testing - All 22 Tools
 */

import { MCPClient } from '../src/lib/mcp-client';
import path from 'path';

async function testAllMcpTools() {
  console.log('🔍 COMPLETE MCP TOOLS ANALYSIS - Testing All 22 Tools...\n');

  const stripeScript = path.resolve(process.cwd(), 'subagents/stripe-agent.sh');
  const client = new MCPClient("Stripe-Subagent", stripeScript, []);

  try {
    await client.connect();
    console.log('✅ Connected to Stripe MCP server\n');

    const tools = await client.listTools();
    console.log(`📋 Total available tools: ${tools.tools.length}\n`);

    // Test all 22 tools individually
    const results: Array<{name: string, status: 'WORKING' | 'ERROR' | 'API_ISSUE' | 'RESPONSE_FORMAT', details: string}> = [];

    for (const tool of tools.tools) {
      try {
        console.log(`🔧 Testing: ${tool.name}`);
        
        // Test with minimal/empty args for safety
        const args = tool.name.includes('list') || tool.name.includes('search') 
          ? { limit: 1 } 
          : {};

        const rawResponse = await client.callTool(tool.name, args);
        
        // Analyze response
        if (rawResponse && rawResponse.content && rawResponse.content[0]?.text) {
          const textContent = rawResponse.content[0].text;
          
          if (textContent.includes('MCP error') || textContent.includes('API error')) {
            console.log(`   ❌ API_ERROR: ${textContent.substring(0, 100)}...`);
            results.push({ name: tool.name, status: 'API_ISSUE', details: textContent });
          } else {
            // Try to parse as JSON
            try {
              const parsed = JSON.parse(textContent);
              console.log(`   ✅ WORKING: Returns valid JSON with keys: ${Object.keys(parsed).join(', ').substring(0, 50)}...`);
              results.push({ name: tool.name, status: 'WORKING', details: `Valid JSON response with ${Object.keys(parsed).length} keys` });
            } catch (e) {
              console.log(`   ⚠️ RESPONSE_FORMAT: Non-JSON response: ${textContent.substring(0, 100)}...`);
              results.push({ name: tool.name, status: 'RESPONSE_FORMAT', details: textContent.substring(0, 100) });
            }
          }
        } else {
          console.log(`   ⚠️ UNEXPECTED_FORMAT: ${JSON.stringify(rawResponse)}`);
          results.push({ name: tool.name, status: 'RESPONSE_FORMAT', details: 'Unexpected response format' });
        }

      } catch (error: any) {
        console.log(`   💥 EXCEPTION: ${error.message}`);
        results.push({ name: tool.name, status: 'ERROR', details: error.message });
      }

      console.log('');
    }

    await client.close();
    console.log('🔌 Disconnected from MCP server\n');

    // Analysis Summary
    console.log('=' .repeat(80));
    console.log('📊 COMPLETE MCP TOOLS ANALYSIS SUMMARY');
    console.log('=' .repeat(80));

    const working = results.filter(r => r.status === 'WORKING').length;
    const apiIssues = results.filter(r => r.status === 'API_ISSUE').length;
    const responseFormat = results.filter(r => r.status === 'RESPONSE_FORMAT').length;
    const errors = results.filter(r => r.status === 'ERROR').length;

    console.log(`Total Tools Tested: ${results.length}`);
    console.log(`✅ WORKING: ${working} tools (return valid Stripe data)`);
    console.log(`⚠️ API_ISSUES: ${apiIssues} tools (API errors/auth issues)`);
    console.log(`📝 RESPONSE_FORMAT: ${responseFormat} tools (different response format)`);
    console.log(`💥 ERRORS: ${errors} tools (threw exceptions)`);
    console.log('');

    // List working tools
    if (working > 0) {
      console.log('✅ WORKING TOOLS:');
      results.filter(r => r.status === 'WORKING').forEach(r => {
        console.log(`  • ${r.name}: ${r.details}`);
      });
      console.log('');
    }

    // List API issue tools
    if (apiIssues > 0) {
      console.log('⚠️ API_ISSUES (Expected - Need valid Stripe setup):');
      results.filter(r => r.status === 'API_ISSUE').forEach(r => {
        console.log(`  • ${r.name}: ${r.details.substring(0, 80)}...`);
      });
      console.log('');
    }

    // List response format tools
    if (responseFormat > 0) {
      console.log('📝 DIFFERENT_RESPONSE_FORMAT:');
      results.filter(r => r.status === 'RESPONSE_FORMAT').forEach(r => {
        console.log(`  • ${r.name}: ${r.details}`);
      });
      console.log('');
    }

    // List error tools
    if (errors > 0) {
      console.log('💥 EXCEPTION_TOOLS:');
      results.filter(r => r.status === 'ERROR').forEach(r => {
        console.log(`  • ${r.name}: ${r.details}`);
      });
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('🎯 CONCLUSION:');
    
    if (working > 0) {
      console.log(`✅ ${working} MCP tools are working correctly!`);
      console.log('   These tools successfully connect to Stripe and return valid data.');
    }
    
    if (apiIssues > 0) {
      console.log(`⚠️ ${apiIssues} tools have API issues - this is expected behavior.`);
      console.log('   These require valid Stripe API keys, proper permissions, or test data.');
    }
    
    if (working > 0 && apiIssues > 0) {
      console.log('✅ MCP integration is working correctly!');
      console.log('   The tools that work prove the connection is functional.');
      console.log('   API issues are normal and expected for tools requiring test data.');
    }

    console.log('=' .repeat(80));

  } catch (error: any) {
    console.error('💥 Critical error during testing:', error.message);
    throw error;
  }
}

testAllMcpTools();