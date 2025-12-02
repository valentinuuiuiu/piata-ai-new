import { spawn } from 'child_process';
import { BaseAgent } from './base-agent';
import { AgentCapability, AgentTask, AgentResult, AgentType } from './types';
import { promisify } from 'util';

const execFile = promisify(require('child_process').execFile);

export class OpenManusAgent extends BaseAgent {
  private bridgeScriptPath: string;
  private scriptTimeout: number = 30000; // 30 seconds

  constructor() {
    super('OpenManus', AgentType.OPENMANUS, [AgentCapability.RESEARCH, AgentCapability.ANALYSIS]);
    this.bridgeScriptPath = process.env.NODE_ENV === 'production'
      ? '/home/shiva/ai-market-online/external/manus_bridge_simple.py'
      : '/home/shiva/ai-market-online/external/manus_bridge_simple.py';
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      // Prepare the payload for the Python bridge
      const payload = {
        context: {
          name: this.name,
          capabilities: this.capabilities
        },
        task: {
          id: task.id,
          goal: task.goal,
          input: task.input || {}
        }
      };

      // Execute the Python bridge script
      const result = await this.executePythonBridge(payload);

      if (result.status === 'success') {
        return {
          status: 'success',
          output: result.output,
          metadata: {
            ...result.metadata,
            agent: this.name,
            executionTime: Date.now()
          }
        };
      } else {
        return {
          status: 'error',
          error: result.error || 'Unknown error from OpenManus',
          output: null,
          metadata: {
            agent: this.name,
            taskId: task.id
          }
        };
      }
    } catch (error: any) {
      console.error('OpenManus Agent execution failed:', error);
      return {
        status: 'error',
        error: error.message || 'OpenManus bridge execution failed',
        output: null,
        metadata: {
          agent: this.name,
          taskId: task.id
        }
      };
    }
  }

  private async executePythonBridge(payload: any): Promise<AgentResult> {
    return new Promise((resolve) => {
      try {
        // Use python3 to execute the bridge script
        const pythonProcess = spawn('python3', [this.bridgeScriptPath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        // Send JSON payload to stdin
        pythonProcess.stdin.write(JSON.stringify(payload));
        pythonProcess.stdin.end();

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          try {
            if (code === 0 && stdout) {
              const result = JSON.parse(stdout);
              resolve(result);
            } else {
              resolve({
                status: 'error',
                error: stderr || `Process exited with code ${code}`,
                output: null
              });
            }
          } catch (parseError: any) {
            resolve({
              status: 'error',
              error: `Failed to parse bridge output: ${parseError.message}`,
              output: { raw_stdout: stdout, raw_stderr: stderr }
            });
          }
        });

        // Timeout handling
        setTimeout(() => {
          if (!pythonProcess.killed) {
            pythonProcess.kill();
            resolve({
              status: 'error',
              error: 'OpenManus bridge execution timeout',
              output: null
            });
          }
        }, this.scriptTimeout);

      } catch (error: any) {
        resolve({
          status: 'error',
          error: `Failed to execute Python bridge: ${error.message}`,
          output: null
        });
      }
    });
  }

  // Test method to verify bridge connectivity
  async testBridge(): Promise<boolean> {
    try {
      const testPayload = {
        context: { name: 'Test Agent' },
        task: {
          id: 'test-bridge',
          goal: 'test',
          input: { topic: 'bridge connectivity test' }
        }
      };

      const result = await this.executePythonBridge(testPayload);
      return result.status === 'success';
    } catch (error) {
      console.error('OpenManus bridge test failed:', error);
      return false;
    }
  }
}