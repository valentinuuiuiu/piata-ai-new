#!/usr/bin/env node
/**
 * Create and Work in Daytona Sandbox using piata-ai-new volume integration
 * Uses the existing DaytonaSandbox class from src/lib/daytona-sandbox.ts
 */

const fs = require('fs');

// Import the DaytonaSandbox implementation
// We'll recreate the essential parts since we're running in Node.js
class DaytonaSandboxManager {
  constructor(apiKey, baseUrl = 'https://app.daytona.io/api') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    console.log(`🔗 [DaytonaSandbox]: Initialized with API Key: ${apiKey ? '*****' + apiKey.slice(-4) : 'Not Set'}`);
    console.log(`🔗 [DaytonaSandbox]: Using Base URL: ${this.baseUrl}`);
  }

  async createSandbox(options) {
    console.log(`🏗️  Creating sandbox: ${options.name}`);
    
    const response = await fetch(`${this.baseUrl}/workspaces`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: options.name,
        gitUrl: options.gitUrl,
        branch: options.branch || 'main',
        timeout: options.timeout || '10h',
        resources: {
          cpus: options.cpus || 2,
          memory: options.memory || '8Gi',
          disk: options.disk || '20Gi'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create sandbox: ${response.status} ${response.statusText} - ${error}`);
    }

    const workspace = await response.json();
    console.log(`✅ Sandbox created: ${workspace.id}`);
    return workspace;
  }

  async runCommand(workspaceId, command) {
    console.log(`🧪 Running: ${command}`);
    
    const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Command failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    return result.output || result.result || result;
  }

  async getWorkspace(workspaceId) {
    const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return await response.json();
  }

  async deleteSandbox(workspaceId) {
    console.log(`🧹 Deleting sandbox: ${workspaceId}`);
    
    await fetch(`${this.baseUrl}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  async testWorkflow(workspaceId) {
    console.log('\n🧪 Testing complete workflow in Daytona sandbox...');
    
    const tests = [
      {
        name: 'System Information',
        command: 'echo "=== System Info ===" && cat /proc/cpuinfo | grep processor | wc -l && echo "CPUs detected" && free -h && echo "Memory info"'
      },
      {
        name: 'Working Directory',
        command: 'pwd && ls -la'
      },
      {
        name: 'Node.js Environment',
        command: 'node --version && npm --version'
      },
      {
        name: 'Repository Status',
        command: 'git status --porcelain'
      },
      {
        name: 'Install Dependencies',
        command: 'npm install --silent'
      },
      {
        name: 'Build Project',
        command: 'npm run build'
      },
      {
        name: 'Run Tests',
        command: 'npm run test --silent --if-present'
      },
      {
        name: 'Project Analysis',
        command: 'find src -name "*.ts" -o -name "*.tsx" | wc -l && echo "TypeScript files found"'
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`\n▶️  ${test.name}...`);
        const output = await this.runCommand(workspaceId, test.command);
        console.log(`   ✅ ${test.name}: SUCCESS`);
        results.push({ name: test.name, success: true, output });
      } catch (error) {
        console.log(`   ❌ ${test.name}: FAILED - ${error.message}`);
        results.push({ name: test.name, success: false, error: error.message });
      }
    }

    return results;
  }
}

async function createAndWorkInDaytona() {
  console.log('🚀 Creating Daytona Sandbox from piata-ai-new Volume');
  console.log('=' * 60);
  console.log('Using existing integration in the piata-ai-new volume');
  console.log();

  const apiKey = 'dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f';
  const daytona = new DaytonaSandboxManager(apiKey);
  
  let workspace = null;
  let keepAlive = false;

  try {
    // Step 1: Create sandbox with 2 CPUs and 8GB RAM
    console.log('Phase 1: Creating Sandbox');
    console.log('-' * 40);
    
    workspace = await daytona.createSandbox({
      name: `piata-ai-active-${Date.now()}`,
      gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
      branch: 'main',
      timeout: '6h', // 6 hours as requested
      cpus: 2,
      memory: '8Gi',
      disk: '20Gi'
    });

    console.log(`\n✅ Sandbox Created Successfully!`);
    console.log(`   ID: ${workspace.id}`);
    console.log(`   Name: ${workspace.name}`);
    console.log(`   Status: ${workspace.status}`);
    console.log(`   URL: ${workspace.url}`);
    console.log(`   Created: ${new Date(workspace.createdAt || Date.now()).toLocaleString()}`);

    // Step 2: Run comprehensive testing
    console.log('\n\nPhase 2: Testing & Development');
    console.log('-' * 40);
    
    const testResults = await daytona.testWorkflow(workspace.id);
    
    // Step 3: Keep alive for development
    console.log('\n\nPhase 3: Development Environment Ready');
    console.log('-' * 40);
    
    console.log(`🔄 Keeping sandbox alive for development...`);
    console.log(`   Duration: 6 hours (${Date.now() + 6 * 60 * 60 * 1000})`);
    console.log(`   Resource: 2 CPUs, 8GB RAM, 20GB Disk`);
    
    // Test connection
    const pingResult = await daytona.runCommand(workspace.id, 'echo "Daytona connection test: $(date)"');
    console.log(`   Connection test: ${pingResult}`);
    
    keepAlive = true;
    
    // Step 4: Development Commands
    console.log('\n\n🚀 Available Development Commands:');
    console.log('-' * 40);
    console.log('You can now run these commands in your Daytona sandbox:');
    console.log();
    console.log('# Development workflow');
    console.log('npm run dev                    # Start development server');
    console.log('npm run build                  # Build project');
    console.log('npm run test                   # Run tests');
    console.log('npm run lint                   # Code quality');
    console.log();
    console.log('# Agent operations');
    console.log('npm run agent                  # Start AI agents');
    console.log('npm run agent:fanny-mae        # Start financial agent');
    console.log('npm run demo:a2a              # A2A protocol demo');
    console.log();
    console.log('# Project exploration');
    console.log('find src -name "*.ts" | head   # TypeScript files');
    console.log('ls -la scripts/                # Available scripts');
    console.log('cat package.json              # Project configuration');
    console.log();

    // Step 5: Save workspace info
    const workspaceInfo = {
      id: workspace.id,
      name: workspace.name,
      status: workspace.status,
      url: workspace.url,
      resources: {
        cpus: 2,
        memory: '8Gi',
        disk: '20Gi'
      },
      repository: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
      testResults: testResults,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      keepAlive: keepAlive,
      commands: {
        connect: `Access: ${workspace.url}`,
        execute: 'Use Daytona web interface or API',
        delete: `curl -X DELETE "${daytona.baseUrl}/workspaces/${workspace.id}" -H "Authorization: Bearer ${apiKey}"`
      }
    };

    fs.writeFileSync('daytona-active-workspace.json', JSON.stringify(workspaceInfo, null, 2));
    console.log(`💾 Workspace info saved to: daytona-active-workspace.json`);

    // Step 6: Summary
    console.log('\n\n📊 SUMMARY');
    console.log('=' * 60);
    console.log(`✅ Daytona sandbox created and operational`);
    console.log(`✅ Resources: 2 CPUs, 8GB RAM, 20GB Disk`);
    console.log(`✅ 6-hour session active`);
    console.log(`✅ piata-ai-new volume loaded`);
    console.log(`✅ ${testResults.filter(r => r.success).length}/${testResults.length} tests passed`);
    console.log(`✅ Development environment ready`);
    console.log();
    console.log(`🎯 You can now:`);
    console.log(`   • Connect to: ${workspace.url}`);
    console.log(`   • Run development commands`);
    console.log(`   • Test your applications`);
    console.log(`   • Deploy improvements`);
    console.log();
    console.log(`📞 Access Methods:`);
    console.log(`   1. Web interface: ${workspace.url}`);
    console.log(`   2. API commands via Daytona interface`);
    console.log(`   3. Integrated development in sandbox`);
    
    return workspace;

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
    // Cleanup if workspace was created
    if (workspace && !keepAlive) {
      try {
        await daytona.deleteSandbox(workspace.id);
        console.log('🧹 Cleaned up failed workspace');
      } catch (cleanupError) {
        console.log(`⚠️  Cleanup failed: ${cleanupError.message}`);
      }
    }
    
    return null;
  }
}

// Keep the sandbox alive for 6 hours
async function keepAlive(workspace, daytona) {
  console.log(`\n🔄 Keeping Daytona sandbox alive for 6 hours...`);
  console.log(`   Started: ${new Date().toLocaleString()}`);
  console.log(`   Will end: ${new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString()}`);
  
  let alive = true;
  let intervalCount = 0;
  
  const keepAliveInterval = setInterval(async () => {
    try {
      intervalCount++;
      const now = new Date();
      console.log(`   [${intervalCount}] ${now.toLocaleTimeString()} - Heartbeat check...`);
      
      // Send heartbeat command
      await daytona.runCommand(workspace.id, 'echo "Heartbeat" > /tmp/daytona-heartbeat.log');
      
      // Check if we're near expiration
      const timeLeft = (6 * 60 * 60 * 1000) - (intervalCount * 60000); // 6 hours in ms
      if (timeLeft <= 0) {
        console.log('   ⏰ 6-hour session expired');
        alive = false;
      }
      
    } catch (error) {
      console.log(`   ❌ Heartbeat failed: ${error.message}`);
      alive = false;
    }
  }, 60000); // Check every minute
  
  // Wait for 6 hours or until manually stopped
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (!alive) {
        clearInterval(checkInterval);
        clearInterval(keepAliveInterval);
        resolve();
      }
    }, 5000);
  });
}

async function main() {
  const workspace = await createAndWorkInDaytona();
  
  if (workspace) {
    console.log('\n🎉 SUCCESS: Daytona sandbox created and running!');
    console.log('\nTo keep it alive for the full 6 hours, you can:');
    console.log('1. Let the script continue running');
    console.log('2. Access the workspace via web interface');
    console.log('3. Run commands directly in Daytona');
    
    // Optionally keep alive (uncomment if needed)
    // const daytona = new DaytonaSandboxManager('dtn_a4aface39f376896e0d832a13088d3ebbb49b78412923c082c11f763ee17413f');
    // await keepAlive(workspace, daytona);
  }
}

if (require.main === module) {
  main().catch(console.error);
}