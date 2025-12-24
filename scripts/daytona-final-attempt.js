#!/usr/bin/env node
/**
 * Final attempt to create Daytona sandbox with alternative endpoints
 */

async function tryAllEndpoints() {
  console.log('🔍 Daytona API Final Attempt');
  console.log('=============================');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  
  // Test different endpoints and methods
  const tests = [
    {
      name: 'POST /api/sandbox',
      url: 'https://app.daytona.io/api/sandbox',
      method: 'POST'
    },
    {
      name: 'POST /api/create-workspace',
      url: 'https://app.daytona.io/api/create-workspace',
      method: 'POST'
    },
    {
      name: 'POST /api/workspace',
      url: 'https://app.daytona.io/api/workspace',
      method: 'POST'
    },
    {
      name: 'GET /api/workspaces',
      url: 'https://app.daytona.io/api/workspaces',
      method: 'GET'
    },
    {
      name: 'POST /api/v1/workspaces',
      url: 'https://app.daytona.io/api/v1/workspaces',
      method: 'POST'
    },
    {
      name: 'GET /api/user/workspaces',
      url: 'https://app.daytona.io/api/user/workspaces',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    
    try {
      const options = {
        method: test.method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      // Add body for POST requests
      if (test.method === 'POST') {
        options.body = JSON.stringify({
          name: `test-workspace-${Date.now()}`,
          gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
          resources: {
            cpus: 2,
            memory: '8Gi',
            disk: '20Gi'
          }
        });
      }

      const response = await fetch(test.url, options);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS! Response:`);
        console.log(`   ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
        
        if (test.name.includes('workspaces') && test.method === 'POST') {
          return { url: test.url, success: true, data, config: { cpus: 2, memory: '8Gi' } };
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Failed: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
  }

  return { success: false };
}

async function createWithWorkingEndpoint(workingConfig) {
  console.log('\n🚀 Creating sandbox with working configuration...');
  
  const workspaceName = `piata-ai-2cpu-8gb-${Date.now()}`;
  
  try {
    const response = await fetch(workingConfig.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: workspaceName,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: 'main',
        resources: {
          cpus: 2,
          memory: '8Gi',
          disk: '20Gi'
        }
      })
    });

    if (response.ok) {
      const workspace = await response.json();
      console.log('🎉 SUCCESS! Daytona sandbox created!');
      console.log('\n📋 Workspace Details:');
      console.log(`   Name: ${workspace.name || workspaceName}`);
      console.log(`   ID: ${workspace.id}`);
      console.log(`   Status: ${workspace.status}`);
      console.log(`   URL: ${workspace.url}`);
      console.log(`   Resources: 2 CPUs, 8GB RAM, 20GB Disk`);
      
      console.log('\n🔧 Usage Commands:');
      console.log(`   Connect: ${workspace.url}`);
      console.log(`   Check CPUs: cat /proc/cpuinfo | grep processor | wc -l`);
      console.log(`   Check Memory: free -h`);
      console.log(`   Install deps: npm install`);
      
      console.log('\n🧹 Cleanup:');
      console.log(`   Delete: curl -X DELETE "${workingConfig.url}/${workspace.id}" -H "Authorization: Bearer dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f"`);
      
      return workspace;
    } else {
      console.log(`❌ Creation failed: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Attempting to create Daytona sandbox with 2 CPUs and 8GB RAM...\n');
  
  // Try to find working endpoint
  const result = await tryAllEndpoints();
  
  if (result.success) {
    // Create workspace with working endpoint
    const workspace = await createWithWorkingEndpoint(result);
    
    if (workspace) {
      console.log('\n🎯 MISSION ACCOMPLISHED!');
      console.log('Your Daytona sandbox is ready for development.');
      return true;
    }
  }
  
  console.log('\n❌ API approach unsuccessful');
  console.log('\n📝 Manual Setup Required:');
  console.log('1. Go to https://app.daytona.io');
  console.log('2. Create new workspace manually');
  console.log('3. Configure: 2 CPUs, 8GB RAM, 20GB Disk');
  console.log('4. Repository: https://github.com/valentinuuiuiu/piata-ai-new.git');
  
  return false;
}

if (require.main === module) {
  main().catch(console.error);
}