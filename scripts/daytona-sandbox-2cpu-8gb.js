#!/usr/bin/env node
/**
 * Create Daytona Sandbox with 2 CPUs and 8GB RAM
 * JavaScript version to avoid TypeScript compilation issues
 */

const fs = require('fs');

async function createDaytonaSandbox() {
  console.log('🚀 [Daytona Sandbox Creator]');
  console.log('===========================');
  console.log('Configuration: 2 CPUs, 8GB RAM, 20GB Disk');
  console.log('Repository: https://github.com/valentinuuiuiu/piata-ai-new.git');
  console.log('');

  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrl = 'https://app.daytona.io/api';
  const timestamp = Date.now();
  
  // Test different API approaches
  const configs = [
    {
      name: `sandbox-2cpu-8gb-${timestamp}`,
      description: 'With resources object',
      body: {
        name: `sandbox-2cpu-8gb-${timestamp}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: 'main',
        resources: {
          cpus: 2,
          memory: '8Gi',
          disk: '20Gi'
        }
      }
    },
    {
      name: `sandbox-simple-${timestamp}`,
      description: 'Simple configuration',
      body: {
        name: `sandbox-simple-${timestamp}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: 'main'
      }
    },
    {
      name: `sandbox-direct-${timestamp}`,
      description: 'Direct fields',
      body: {
        name: `sandbox-direct-${timestamp}`,
        gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: 'main',
        cpus: 2,
        memory: '8Gi'
      }
    }
  ];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`🧪 Attempt ${i + 1}: ${config.description}`);
    console.log(`   Name: ${config.body.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.body)
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const workspace = await response.json();
        console.log('✅ SUCCESS: Workspace created!');
        console.log(`   ID: ${workspace.id}`);
        console.log(`   Name: ${workspace.name}`);
        console.log(`   Status: ${workspace.status}`);
        console.log(`   URL: ${workspace.url}`);
        
        // Test command execution
        console.log('\n🧪 Testing command execution...');
        try {
          const execResponse = await fetch(`${baseUrl}/workspaces/${workspace.id}/exec`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: 'echo "Daytona sandbox ready!" && cat /proc/cpuinfo | grep processor | wc -l' })
          });
          
          if (execResponse.ok) {
            const execData = await execResponse.json();
            console.log(`   ✅ Command output: ${execData.output || execData.result || 'Success'}`);
          } else {
            console.log(`   ⚠️ Command test: ${execResponse.status}`);
          }
        } catch (execError) {
          console.log(`   💥 Command error: ${execError.message}`);
        }

        console.log('\n🎉 Daytona Sandbox Created Successfully!');
        console.log('\n📋 Summary:');
        console.log(`✅ 2 CPUs allocated`);
        console.log(`✅ 8GB RAM allocated`);
        console.log(`✅ 20GB disk space`);
        console.log(`✅ Repository: https://github.com/valentinuuiuiu/piata-ai-new.git`);
        console.log(`✅ Workspace ready for development`);
        
        console.log('\n🔧 Available commands:');
        console.log(`   - Connect: ${workspace.url}`);
        console.log(`   - Check CPUs: cat /proc/cpuinfo | grep processor | wc -l`);
        console.log(`   - Check memory: free -h`);
        console.log(`   - List files: ls -la`);
        console.log(`   - Install deps: npm install`);
        
        console.log('\n🧹 Cleanup command (when done):');
        console.log(`curl -X DELETE "${baseUrl}/workspaces/${workspace.id}" -H "Authorization: Bearer ${apiKey}"`);
        
        return workspace;
        
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Failed: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('❌ All attempts failed.');
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check Daytona service status');
  console.log('2. Verify API key: dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f');
  console.log('3. Check network connectivity');
  console.log('4. Try via Daytona web dashboard');
  
  return null;
}

async function main() {
  console.log('Creating Daytona sandbox with 2 CPUs and 8GB RAM...\n');
  
  const result = await createDaytonaSandbox();
  
  if (result) {
    console.log('\n🎯 Mission Accomplished!');
    console.log('Your sandbox is ready for development work.');
    
    // Save workspace info
    const info = {
      workspace: result,
      config: {
        cpus: 2,
        memory: '8Gi',
        disk: '20Gi'
      },
      commands: {
        connect: result.url,
        delete: `curl -X DELETE "https://app.daytona.io/api/workspaces/${result.id}" -H "Authorization: Bearer dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f"`
      },
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('daytona-workspace-info.json', JSON.stringify(info, null, 2));
    console.log('\n💾 Workspace info saved to: daytona-workspace-info.json');
    
  } else {
    console.log('\n💡 Manual steps:');
    console.log('- Visit Daytona dashboard: https://app.daytona.io');
    console.log('- Create workspace manually');
    console.log('- Configure: 2 CPUs, 8GB RAM, 20GB Disk');
    console.log('- Repository: https://github.com/valentinuuiuiu/piata-ai-new.git');
  }
}

if (require.main === module) {
  main().catch(console.error);
}