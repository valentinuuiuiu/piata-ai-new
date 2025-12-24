#!/usr/bin/env ts-node
/**
 * Daytona API Tester
 * Tests different API endpoints and configurations to find the correct one
 */

import { config } from 'dotenv';

async function testDaytonaAPI() {
  console.log('🔍 [Daytona API Tester]');
  console.log('========================');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrls = [
    'https://app.daytona.io/api',
    'https://api.daytona.io', 
    'https://app.daytona.io'
  ];

  for (const baseUrl of baseUrls) {
    console.log(`\n🧪 Testing base URL: ${baseUrl}`);
    
    // Test 1: Simple workspace creation (no resources)
    console.log('  Test 1: Basic workspace creation');
    try {
      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `test-workspace-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
          branch: 'main'
        })
      });

      if (response.ok) {
        const workspace = await response.json();
        console.log(`  ✅ SUCCESS: Workspace created!`);
        console.log(`     ID: ${workspace.id}`);
        console.log(`     URL: ${workspace.url}`);
        
        // Delete the test workspace
        await fetch(`${baseUrl}/workspaces/${workspace.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        console.log(`     Test workspace cleaned up`);
        return baseUrl;
      } else {
        const error = await response.text();
        console.log(`  ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`     Error: ${error}`);
      }
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
    }
  }

  return null;
}

// Test resource-specific configuration
async function testWithResources(baseUrl: string) {
  console.log('\n🧪 Testing with resource configuration...');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  
  // Try different resource configurations
  const resourceConfigs = [
    // Standard 2 CPU, 8GB config
    {
      name: `resource-test-2cpu-8gb-${Date.now()}`,
      cpus: 2,
      memory: '8Gi',
      disk: '20Gi'
    },
    // Minimal config
    {
      name: `resource-test-minimal-${Date.now()}`,
      cpus: 1,
      memory: '4Gi'
    },
    // Memory only
    {
      name: `resource-test-memory-${Date.now()}`,
      memory: '8Gi'
    }
  ];

  for (const config of resourceConfigs) {
    console.log(`\n  Testing config: ${JSON.stringify(config, null, 2)}`);
    
    try {
      const body: any = {
        name: config.name,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: 'main'
      };
      
      // Add resources if specified
      if (config.cpus || config.memory || config.disk) {
        body.resources = {};
        if (config.cpus) body.resources.cpus = config.cpus;
        if (config.memory) body.resources.memory = config.memory;
        if (config.disk) body.resources.disk = config.disk;
      }

      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const workspace = await response.json();
        console.log(`    ✅ SUCCESS: Workspace with resources created!`);
        console.log(`       ID: ${workspace.id}`);
        console.log(`       Status: ${workspace.status}`);
        
        // Clean up
        await fetch(`${baseUrl}/workspaces/${workspace.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        return body;
      } else {
        const error = await response.text();
        console.log(`    ❌ FAILED: ${response.status} ${response.statusText}`);
        console.log(`       Error: ${error}`);
      }
    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`);
    }
  }

  return null;
}

async function main() {
  try {
    // Find working API endpoint
    const workingBaseUrl = await testDaytonaAPI();
    
    if (!workingBaseUrl) {
      console.log('\n❌ No working API endpoint found');
      return;
    }

    console.log(`\n🎯 Working base URL: ${workingBaseUrl}`);

    // Test resource configurations
    const workingConfig = await testWithResources(workingBaseUrl);
    
    if (workingConfig) {
      console.log('\n✅ Working resource configuration found!');
      console.log('Configuration:', JSON.stringify(workingConfig, null, 2));
    } else {
      console.log('\n⚠️  Basic workspace creation works, but resource configuration may not be supported');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}