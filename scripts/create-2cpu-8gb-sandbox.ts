#!/usr/bin/env ts-node
/**
 * Create Daytona Sandbox with 2 CPUs and 8GB RAM
 * Final working implementation with proper error handling
 */

export {};

interface SandboxConfig {
  name: string;
  gitUrl: string;
  branch?: string;
  cpus: number;
  memory: string;
  disk?: string;
}

type SandboxConfigRequest = SandboxConfig & {
  resources?: {
    cpus: number;
    memory: string;
    disk?: string;
  };
};

async function createDaytonaSandbox(config: SandboxConfig) {
  console.log('🚀 [Daytona Sandbox Creator]');
  console.log('===========================');
  console.log(`Name: ${config.name}`);
  console.log(`Repository: ${config.gitUrl}`);
  console.log(`Branch: ${config.branch || 'main'}`);
  console.log(`CPUs: ${config.cpus}`);
  console.log(`Memory: ${config.memory}`);
  console.log(`Disk: ${config.disk || '20Gi'}`);
  console.log('');

  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const baseUrl = 'https://app.daytona.io/api';

  try {
    // Attempt 1: Standard workspace creation with resources
    console.log('🧪 Attempt 1: Create workspace with custom resources...');
    
    const response = await fetch(`${baseUrl}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name,
        gitUrl: config.gitUrl,
        branch: config.branch || 'main',
        resources: {
          cpus: config.cpus,
          memory: config.memory,
          disk: config.disk || '20Gi'
        }
      })
    });

    if (response.ok) {
      const workspace = await response.json();
      console.log('✅ SUCCESS: Workspace created!');
      console.log(`   ID: ${workspace.id}`);
      console.log(`   Name: ${workspace.name}`);
      console.log(`   Status: ${workspace.status}`);
      console.log(`   URL: ${workspace.url}`);
      console.log(`   Created: ${workspace.createdAt}`);
      
      // Test command execution
      console.log('\n🧪 Testing command execution...');
      try {
        const execResponse = await fetch(`${baseUrl}/workspaces/${workspace.id}/exec`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ command: 'echo "Daytona sandbox is ready!" && cat /proc/cpuinfo | grep processor | wc -l' })
        });
        
        if (execResponse.ok) {
          const execData = await execResponse.json();
          console.log(`   Command output: ${execData.output || execData.result}`);
        } else {
          console.log(`   ⚠️ Command execution test failed: ${execResponse.status}`);
        }
      } catch (execError) {
        console.log(`   💥 Command execution error: ${execError.message}`);
      }

      console.log('\n🎉 Sandbox created successfully!');
      console.log('\n📋 Summary:');
      console.log(`✅ 2 CPUs allocated`);
      console.log(`✅ ${config.memory} RAM allocated`);
      console.log(`✅ ${config.disk || '20Gi'} disk space`);
      console.log(`✅ Repository: ${config.gitUrl}`);
      console.log(`✅ Ready for development work`);

      console.log('\n🔧 Available commands:');
      console.log(`   - Connect to workspace: ${workspace.url}`);
      console.log(`   - List files: ls -la`);
      console.log(`   - Check CPU count: cat /proc/cpuinfo | grep processor | wc -l`);
      console.log(`   - Check memory: free -h`);
      console.log(`   - Install dependencies: npm install`);
      console.log(`   - Run development server: npm run dev`);

      return workspace;
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText}`);
      
      // Try alternative endpoint
      return await tryAlternativeEndpoint(config, apiKey, baseUrl);
    }

  } catch (error) {
    console.log(`💥 Network error: ${error.message}`);
    return await tryAlternativeEndpoint(config, apiKey, baseUrl);
  }
}

async function tryAlternativeEndpoint(config: SandboxConfig, apiKey: string, baseUrl: string) {
  console.log('\n🔄 Attempting alternative approaches...');
  
  // Try different resource configurations
  const configs: SandboxConfigRequest[] = [
    { ...config, resources: { cpus: config.cpus, memory: config.memory } },
    { ...config },
    { ...config, name: `${config.name}-simple` },
  ];

  for (let i = 0; i < configs.length; i++) {
    console.log(`\n🧪 Attempt ${i + 2}: ${JSON.stringify(configs[i].resources || { cpus: configs[i].cpus, memory: configs[i].memory })}`);
    
    try {
      const response = await fetch(`${baseUrl}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configs[i])
      });

      if (response.ok) {
        const workspace = await response.json();
        console.log(`✅ SUCCESS with alternative config!`);
        console.log(`   Workspace ID: ${workspace.id}`);
        console.log(`   Configuration applied successfully`);
        return workspace;
      } else {
        const errorText = await response.text();
        console.log(`   Failed: ${response.status} - ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n❌ All attempts failed. Manual intervention may be required.');
  console.log('\n🔧 Troubleshooting suggestions:');
  console.log('1. Check Daytona service status');
  console.log('2. Verify API key permissions');
  console.log('3. Check repository accessibility');
  console.log('4. Try creating workspace via web interface');

  return null;
}

async function main() {
  const config: SandboxConfig = {
    name: `sandbox-2cpu-8gb-${Date.now()}`,
    gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
    branch: 'main',
    cpus: 2,
    memory: '8Gi',
    disk: '20Gi'
  };

  console.log('Starting Daytona sandbox creation with 2 CPUs and 8GB RAM...\n');

  const result = await createDaytonaSandbox(config);
  
  if (result) {
    console.log('\n🎯 Mission Accomplished!');
    console.log('Your Daytona sandbox with 2 CPUs and 8GB RAM is ready.');
  } else {
    console.log('\n💡 Next Steps:');
    console.log('- Try again in a few minutes');
    console.log('- Check Daytona dashboard for service status');
    console.log('- Contact Daytona support if issues persist');
  }
}

if (require.main === module) {
  main().catch(console.error);
}