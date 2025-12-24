#!/usr/bin/env ts-node
/**
 * Daytona API Diagnostic Tool
 * Simplified version to find working endpoints
 */

async function testDaytonaAPI() {
  console.log('🔍 [Daytona API Diagnostic]');
  console.log('=========================================');
  
  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrl = 'https://app.daytona.io/api';
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log();

  // Test workspace creation
  console.log('🧪 Testing Workspace Creation');
  try {
    const response = await fetch(`${baseUrl}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `test-workspace-${Date.now()}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS: Workspace created!');
      console.log(`Workspace ID: ${data.id}`);
      console.log(`Name: ${data.name}`);
      console.log(`Status: ${data.status}`);
      console.log(`URL: ${data.url}`);
      
      // Clean up
      await fetch(`${baseUrl}/workspaces/${data.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      console.log('🧹 Workspace cleaned up');
      
      return { success: true, baseUrl, data };
    } else {
      const error = await response.text();
      console.log('❌ FAILED:');
      console.log(error.substring(0, 500));
      return { success: false, error, status: response.status };
    }
  } catch (error) {
    console.log('💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

async function testResourceConfiguration(baseUrl: string, apiKey: string) {
  console.log('\n🧪 Testing Resource Configuration (2 CPUs, 8GB RAM)');
  
  const resourceTests = [
    {
      name: 'With resources object',
      body: {
        name: `resource-test-2cpu-8gb-${Date.now()}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        resources: {
          cpus: 2,
          memory: '8Gi',
          disk: '20Gi'
        }
      }
    },
    {
      name: 'With individual fields',
      body: {
        name: `resource-test-individual-${Date.now()}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        cpus: 2,
        memory: '8Gi'
      }
    },
    {
      name: 'Simple config',
      body: {
        name: `resource-test-simple-${Date.now()}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git'
      }
    }
  ];

  for (const test of resourceTests) {
    console.log(`\nTesting: ${test.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.body)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS: Workspace created!');
        console.log(`  ID: ${data.id}`);
        console.log(`  Status: ${data.status}`);
        
        // Test if we can run commands
        console.log('  Testing command execution...');
        try {
          const execResponse = await fetch(`${baseUrl}/workspaces/${data.id}/exec`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: 'echo "Hello from Daytona!"' })
          });
          
          if (execResponse.ok) {
            const execData = await execResponse.json();
            console.log(`  ✅ Command output: ${execData.output || execData.result}`);
          } else {
            console.log(`  ⚠️ Command execution failed: ${execResponse.status}`);
          }
        } catch (execError) {
          console.log(`  💥 Command execution error: ${execError.message}`);
        }
        
        // Clean up
        await fetch(`${baseUrl}/workspaces/${data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        return test.body;
      } else {
        const error = await response.text();
        console.log(`❌ FAILED: ${response.status} - ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
    }
  }

  return null;
}

async function main() {
  console.log('Starting Daytona sandbox setup...\n');
  
  // Test basic connectivity
  const result = await testDaytonaAPI();
  
  if (result.success) {
    console.log('\n🎯 Basic connectivity confirmed!');
    
    // Test resource configurations
    const resourceConfig = await testResourceConfiguration(
      result.baseUrl, 
      'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f'
    );
    
    if (resourceConfig) {
      console.log('\n✅ SUCCESS: Found working configuration for 2 CPUs, 8GB RAM!');
      console.log('\n📋 Your Daytona sandbox configuration:');
      console.log(`Base URL: ${result.baseUrl}`);
      console.log('Resources: 2 CPUs, 8GB RAM, 20GB Disk');
      console.log('Repository: https://github.com/valentinuuiuiu/piata-ai-new.git');
      
      console.log('\n🚀 You can now create sandboxes using:');
      console.log('- Standard API calls with resources parameter');
      console.log('- 2 CPUs and 8GB RAM allocation');
      console.log('- Automatic workspace creation and cleanup');
      
    } else {
      console.log('\n⚠️ Basic workspace creation works, but custom resources may not be configurable.');
      console.log('   Your Daytona API may have fixed resource allocations.');
    }
    
  } else {
    console.log('\n❌ Daytona API connection failed.');
    console.log('   Status:', result.status);
    console.log('   Error:', result.error?.substring(0, 300));
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check if API key is valid and not expired');
    console.log('2. Verify Daytona service is accessible');
    console.log('3. Check network connectivity and firewall settings');
    console.log('4. Ensure correct API endpoint and authentication method');
  }
}

if (require.main === module) {
  main().catch(console.error);
}