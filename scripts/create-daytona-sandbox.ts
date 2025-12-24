#!/usr/bin/env ts-node
/**
 * Create Daytona Sandbox with Specific Resources
 * Creates a sandbox with 2 CPUs and 8GB RAM using the Daytona API
 */

import { getDaytonaSandbox } from '../src/lib/daytona-sandbox';

interface SandboxConfig {
  name: string;
  gitUrl: string;
  branch?: string;
  timeout?: string;
  cpus?: number;
  memory?: string; // e.g., "8Gi"
  disk?: string;   // e.g., "20Gi"
}

async function createResourceConfiguredSandbox(config: SandboxConfig) {
  console.log('🚀 [Daytona]: Creating sandbox with custom resources...');
  console.log(`   Name: ${config.name}`);
  console.log(`   Git URL: ${config.gitUrl}`);
  console.log(`   Branch: ${config.branch || 'main'}`);
  console.log(`   CPUs: ${config.cpus || 2}`);
  console.log(`   Memory: ${config.memory || '8Gi'}`);
  console.log(`   Disk: ${config.disk || '20Gi'}`);
  console.log(`   Timeout: ${config.timeout || '10h'}`);

  try {
    // Initialize Daytona with API key from environment
    const daytonaApiKey = process.env.DAYTONA_APY_KEY;
    if (!daytonaApiKey) {
      throw new Error('DAYTONA_APY_KEY not found in environment variables');
    }

    const daytona = getDaytonaSandbox(daytonaApiKey);
    
    // Create sandbox with enhanced API call
    const response = await fetch(`${process.env.DAYTONA_BASE_URL || 'https://app.daytona.io/api'}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${daytonaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name,
        gitUrl: config.gitUrl,
        branch: config.branch || 'main',
        timeout: config.timeout || '10h',
        resources: {
          cpus: config.cpus || 2,
          memory: config.memory || '8Gi',
          disk: config.disk || '20Gi'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create sandbox: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const workspace = await response.json();
    
    console.log('\n✅ [Daytona]: Sandbox created successfully!');
    console.log(`   Workspace ID: ${workspace.id}`);
    console.log(`   Name: ${workspace.name}`);
    console.log(`   Status: ${workspace.status}`);
    console.log(`   URL: ${workspace.url}`);
    console.log(`   Git URL: ${workspace.gitUrl}`);
    console.log(`   Branch: ${workspace.branch}`);
    console.log(`   Created: ${workspace.createdAt}`);
    console.log(`   Expires: ${workspace.expiresAt}`);

    // Wait a moment for workspace to be ready
    console.log('\n⏳ [Daytona]: Waiting for workspace to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test connectivity
    console.log('\n🧪 [Daytona]: Testing workspace connectivity...');
    try {
      const testResult = await daytona.runCommand(workspace.id, 'echo "Workspace is ready!"');
      console.log(`   Test Output: ${testResult}`);
    } catch (error) {
      console.log(`   ⚠️  Workspace connectivity test failed: ${error.message}`);
    }

    return workspace;

  } catch (error) {
    console.error('❌ [Daytona]: Failed to create sandbox:', error.message);
    throw error;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  const config: SandboxConfig = {
    name: args[0] || `daytona-sandbox-${Date.now()}`,
    gitUrl: args[1] || 'https://github.com/valentinuuiuiu/piata-ai-new.git',
    branch: args[2] || 'main',
    cpus: parseInt(args[3]) || 2,
    memory: args[4] || '8Gi',
    disk: args[5] || '20Gi',
    timeout: args[6] || '10h'
  };

  console.log('🎯 [Daytona Sandbox Creator]');
  console.log('=====================================');
  
  try {
    const workspace = await createResourceConfiguredSandbox(config);
    
    console.log('\n🎉 [Daytona]: Setup Complete!');
    console.log('=====================================');
    console.log(`Sandbox ID: ${workspace.id}`);
    console.log(`Access URL: ${workspace.url}`);
    console.log('You can now:');
    console.log('  1. SSH into the workspace');
    console.log('  2. Run development commands');
    console.log('  3. Test your applications');
    console.log('  4. Deploy changes');
    console.log('\nTo delete this workspace later, run:');
    console.log(`curl -X DELETE "${process.env.DAYTONA_BASE_URL || 'https://app.daytona.io/api'}/workspaces/${workspace.id}" -H "Authorization: Bearer ${process.env.DAYTONA_APY_KEY}"`);

  } catch (error) {
    console.error('💥 [Daytona]: Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { createResourceConfiguredSandbox };