/**
 * Daytona Sandbox Manager
 * Integrates with Manus agent for automated testing
 */

export interface DaytonaWorkspace {
  id: string;
  name: string;
  gitUrl: string;
  branch: string;
  status: 'creating' | 'running' | 'stopped' | 'deleted';
  url: string;
  createdAt: Date;
  expiresAt: Date;
}

export class DaytonaSandbox {
  private apiKey: string;
  private baseUrl = process.env.DAYTONA_BASE_URL || 'https://api.daytona.io';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log(`🔗 [DaytonaSandbox]: Initialized with API Key: ${this.apiKey ? '*****' + this.apiKey.slice(-4) : 'Not Set'}`);
    console.log(`🔗 [DaytonaSandbox]: Using Base URL: ${this.baseUrl}`);
  }

  /**
   * Create a new sandbox workspace
   */
  async createSandbox(options: {
    name: string;
    gitUrl: string;
    branch?: string;
    timeout?: string; // e.g. "10h"
  }): Promise<DaytonaWorkspace> {
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
        timeout: options.timeout || '10h'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create sandbox: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Run a command inside the sandbox
   */
  async runCommand(workspaceId: string, command: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    const result = await response.json();
    return result.output;
  }

  /**
   * Get workspace status
   */
  async getWorkspace(workspaceId: string): Promise<DaytonaWorkspace> {
    const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return await response.json();
  }

  /**
   * Delete a sandbox (cleanup)
   */
  async deleteSandbox(workspaceId: string): Promise<void> {
    await fetch(`${this.baseUrl}/workspaces/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  /**
   * Automated test workflow
   */
  async testFeature(options: {
    featureName: string;
    branch: string;
    testScript: string;
  }): Promise<{ success: boolean; output: string }> {
    console.log(`🧪 [Daytona]: Testing ${options.featureName}...`);

    // 1. Create sandbox
    const sandbox = await this.createSandbox({
      name: `test-${options.featureName}`,
      gitUrl: 'https://github.com/valentinuuiuiu/piata-ai-new.git',
      branch: options.branch
    });

    try {
      // 2. Install dependencies
      await this.runCommand(sandbox.id, 'npm install');

      // 3. Run test script
      const output = await this.runCommand(sandbox.id, options.testScript);

      // 4. Check if successful
      const success = !output.includes('error') && !output.includes('failed');

      return { success, output };

    } finally {
      // 5. Cleanup (delete sandbox)
      await this.deleteSandbox(sandbox.id);
      console.log(`🧹 [Daytona]: Sandbox cleaned up.`);
    }
  }
}

// Export singleton
let daytonaInstance: DaytonaSandbox | null = null;

export function getDaytonaSandbox(apiKey?: string): DaytonaSandbox {
  if (!daytonaInstance && apiKey) {
    daytonaInstance = new DaytonaSandbox(apiKey);
  }
  if (!daytonaInstance) {
    throw new Error('Daytona not initialized. Provide API key.');
  }
  return daytonaInstance;
}
