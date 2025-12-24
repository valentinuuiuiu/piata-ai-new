import { AgentCapability, AgentType, AgentTask, AgentResult } from './types';
import { PythonBridgeAgent } from './python-bridge-agent';
import { getDaytonaSandbox } from '../daytona-sandbox';
import path from 'path';
import os from 'os';

export class ManusAgent extends PythonBridgeAgent {
  private daytonaApiKey: string | null = null;

  constructor() {
    // Assuming the user has the external folder at ~/ai-market-online/external
    // We can make this configurable via env vars later
    const homeDir = os.homedir();
    const scriptPath = path.join(homeDir, 'ai-market-online/external/manus_bridge.py');

    // We might need a specific venv python. For now, assuming system python or user needs to config
    // Ideally, we should check for a venv in the external folder
    const venvPython = path.join(homeDir, 'ai-market-online/external/OpenManus/.venv/bin/python');

    super(
      'Manus',
      AgentType.OPENMANUS,
      [AgentCapability.RESEARCH, AgentCapability.ANALYSIS],
      {
        scriptPath: scriptPath,
        // ALWAYS use the venv python to ensure dependencies like pydantic are available
        pythonPath: venvPython,
        cwd: path.dirname(scriptPath)
      }
    );

    // Initialize Daytona API key from environment
    this.daytonaApiKey = process.env.DAYTONA_APY_KEY || null;
    if (this.daytonaApiKey) {
      console.log('🔗 [Manus]: Daytona API connected.');
      console.log(`🔗 [Manus]: Using Daytona API Key: ${this.daytonaApiKey ? '*****' + this.daytonaApiKey.slice(-4) : 'Not Set'}`); // Log last 4 chars for security
    }
  }

  /**
   * Enhanced execute with Daytona integration
   * Intercepts 'daytona' operations and handles them directly
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    // Check if this is a Daytona operation
    const operation = task.input?.operation;
    
    if (operation === 'daytona_test' && this.daytonaApiKey) {
      return await this.handleDaytonaTest(task);
    }

    // Otherwise, delegate to Python bridge (web search, marketing, research)
    return await super.execute(task);
  }

  /**
   * Create a Daytona sandbox and test a feature
   */
  private async handleDaytonaTest(task: AgentTask): Promise<AgentResult> {
    try {
      const { branch, testScript } = task.input;
      
      if (!branch || !testScript) {
        return {
          status: 'error',
          error: 'Missing branch or testScript for Daytona test',
          output: null
        };
      }

      console.log(`🧪 [Manus]: Testing branch '${branch}' in Daytona...`);

      const daytona = getDaytonaSandbox(this.daytonaApiKey!);

      // Create sandbox
      const sandbox = await daytona.createSandbox({
        name: `manus-test-${Date.now()}`,
        gitUrl: process.env.DAYTONA_GIT_URL || 'https://github.com/valentinuuiuiu/piata-ai-new.git',
        branch: branch,
        timeout: '1h'
      });

      console.log(`📦 [Manus]: Sandbox created: ${sandbox.id}`);

      // Install dependencies
      await daytona.runCommand(sandbox.id, 'npm install');

      // Run test script
      const output = await daytona.runCommand(sandbox.id, testScript);

      // Cleanup
      await daytona.deleteSandbox(sandbox.id);

      const success = !output.includes('error') && !output.includes('failed');

      console.log(`${success ? '✅' : '❌'} [Manus]: Test ${success ? 'passed' : 'failed'}`);

      return {
        status: success ? 'success' : 'error',
        output: {
          branch,
          testScript,
          result: output,
          sandboxId: sandbox.id
        },
        metadata: {
          operation: 'daytona_test',
          success,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error: any) {
      return {
        status: 'error',
        error: `Daytona test failed: ${error.message}`,
        output: null
      };
    }
  }
}