#!/usr/bin/env ts-node
/**
 * Daytona API Diagnostic Tool
 * Comprehensive testing to find the correct API structure
 */

import { config } from 'dotenv';

async function testDaytonaAPI() {
  console.log('🔍 [Daytona API Diagnostic]');
  console.log('=========================================');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrl = 'https://app.daytona.io/api';
  
  console.log(`🔑 API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log();

  // Test 1: Check if API key is valid by testing auth endpoint
  console.log('🧪 Test 1: Authentication Check');
  try {
    // Test different auth patterns
    const authTests = [
      { method: 'GET', path: '/me', headers: { 'Authorization': `Bearer ${apiKey}` } },
      { method: 'GET', path: '/user', headers: { 'Authorization': `Bearer ${apiKey}` } },
      { method: 'GET', path: '/profile', headers: { 'Authorization': `Bearer ${apiKey}` } },
      { method: 'GET', path: '/auth/me', headers: { 'Authorization': `Bearer ${apiKey}` } },
      { method: 'POST', path: '/auth/test', headers: { 'Authorization': `Bearer ${apiKey}` } }
    ];

    for (const test of authTests) {
      console.log(`  Testing: ${test.method} ${test.path}`);
      try {
        const response = await fetch(`${baseUrl}${test.path}`, {
          method: test.method,
          headers: test.headers
        });

        console.log(`    Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`    ✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
          return test; // Found working auth endpoint
        } else {
          const error = await response.text();
          console.log(`    ❌ FAILED: ${error.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`    💥 ERROR: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`  💥 Auth test failed: ${error.message}`);
  }

  // Test 2: Try workspace creation with different methods
  console.log('\n🧪 Test 2: Workspace Creation Tests');
  try {
    const workspaceTests = [
      {
        name: 'Standard POST',
        method: 'POST',
        path: '/workspaces',
        body: {
          name: `test-workspace-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
        }
      },
      {
        name: 'Create with resources',
        method: 'POST', 
        path: '/workspaces',
        body: {
          name: `test-workspace-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
          resources: {
            cpus: 2,
            memory: '8Gi'
          }
        }
      },
      {
        name: 'Alternative workspace endpoint',
        method: 'POST',
        path: '/create-workspace',
        body: {
          name: `test-workspace-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
        }
      },
      {
        name: 'Sandbox endpoint',
        method: 'POST',
        path: '/sandbox',
        body: {
          name: `test-sandbox-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
        }
      }
    ];

    for (const test of workspaceTests) {
      console.log(`\n  Testing: ${test.name} (${test.method} ${test.path})`);
      
      try {
        const response = await fetch(`${baseUrl}${test.path}`, {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(test.body)
        });

        console.log(`    Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`    ✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
          
          // If workspace created, try to delete it
          if (data.id) {
            console.log(`    🧹 Cleaning up workspace ${data.id}...`);
            try {
              await fetch(`${baseUrl}/workspaces/${data.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${apiKey}`
                }
              });
              console.log(`    ✅ Cleanup successful`);
            } catch (cleanupError) {
              console.log(`    ⚠️  Cleanup failed: ${cleanupError.message}`);
            }
          }
          
          return test; // Found working workspace endpoint
        } else {
          const error = await response.text();
          console.log(`    ❌ FAILED: ${error.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`    💥 ERROR: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`  💥 Workspace test failed: ${error.message}`);
  }

  // Test 3: Alternative base URLs
  console.log('\n🧪 Test 3: Alternative Base URLs');
  const alternativeUrls = [
    'https://api.daytona.io/v1',
    'https://api.daytona.io/v2', 
    'https://api.daytona.io/workspace',
    'https://daytona.io/api',
    'https://daytona.io/api/v1'
  ];

  for (const url of alternativeUrls) {
    console.log(`\n  Testing URL: ${url}`);
    try {
      const response = await fetch(`${url}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `test-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
        })
      });

      console.log(`    Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`    ✅ SUCCESS with ${url}!`);
        console.log(`    Response: ${JSON.stringify(data, null, 2)}`);
        return { url, working: true };
      } else {
        const error = await response.text();
        console.log(`    ❌ FAILED: ${error.substring(0, 150)}...`);
      }
    } catch (error) {
      console.log(`    💥 ERROR: ${error.message}`);
    }
  }

  return null;
}

// Test resource configuration once we find working endpoint
async function testResourceConfiguration(workingEndpoint: any) {
  console.log('\n🧪 Test 4: Resource Configuration');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrl = workingEndpoint.url || 'https://app.daytona.io/api';
  
  const resourceConfigs = [
    {
      name: '2 CPU, 8GB RAM',
      resources: {
        cpus: 2,
        memory: '8Gi',
        disk: '20Gi'
      }
    },
    {
      name: 'High memory configuration',
      resources: {
        cpus: 1,
        memory: '16Gi',
        disk: '50Gi'
      }
    },
    {
      name: 'Standard configuration',
      resources: {
        cpus: 2,
        memory: '4Gi'
      }
    }
  ];

  for (const config of resourceConfigs) {
    console.log(`\n  Testing: ${config.name}`);
    console.log(`  Resources: ${JSON.stringify(config.resources, null, 2)}`);
    
    try {
      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `resource-test-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
          ...config
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`    ✅ SUCCESS: Workspace created with custom resources!`);
        console.log(`    Workspace ID: ${data.id}`);
        console.log(`    Status: ${data.status}`);
        
        // Clean up
        await fetch(`${baseUrl}/workspaces/${data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        return config;
      } else {
        const error = await response.text();
        console.log(`    ❌ FAILED: ${response.status} - ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`    💥 ERROR: ${error.message}`);
    }
  }

  return null;
}

async function main() {
  try {
    console.log('Starting Daytona API diagnostic...\n');
    
    // Find working endpoint
    const workingEndpoint = await testDaytonaAPI();
    
    if (workingEndpoint) {
      console.log('\n🎯 Found working endpoint!');
      
      // Test resource configuration
      const workingResourceConfig = await testResourceConfiguration(workingEndpoint);
      
      if (workingResourceConfig) {
        console.log('\n✅ SUCCESS: Found working resource configuration!');
        console.log('\n📋 FINAL CONFIGURATION:');
        console.log(`Base URL: ${workingEndpoint.url || 'https://app.daytona.io/api'}`);
        console.log(`Method: ${workingEndpoint.method || 'POST'}`);
        console.log(`Endpoint: ${workingEndpoint.path || '/workspaces'}`);
        console.log(`Resources: ${JSON.stringify(workingResourceConfig.resources, null, 2)}`);
        
        console.log('\n🚀 You can now create Daytona sandboxes with:');
        console.log(`   - 2 CPUs`);
        console.log(`   - 8GB RAM`);
        console.log(`   - Custom resource configurations`);
      } else {
        console.log('\n⚠️  Basic workspace creation works, but custom resources may not be supported.');
        console.log('   You can still create basic sandboxes, but resource limits may be fixed.');
      }
    } else {
      console.log('\n❌ No working API endpoints found.');
      console.log('   Possible issues:');
      console.log('   - API key may be expired or invalid');
      console.log('   - API structure may have changed');
      console.log('   - Network connectivity issues');
      console.log('   - Different authentication method required');
    }
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}