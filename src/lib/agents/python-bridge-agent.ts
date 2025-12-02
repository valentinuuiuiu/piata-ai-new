import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { BaseAgent } from './base-agent';
import { AgentCapability, AgentResult, AgentTask, AgentType } from './types';

interface PythonBridgeConfig {
  scriptPath: string;
  pythonPath?: string; // Optional: path to python executable or venv python
  cwd?: string;
}

export class PythonBridgeAgent extends BaseAgent {
  private config: PythonBridgeConfig;

  constructor(name: string, type: AgentType, capabilities: AgentCapability[], config: PythonBridgeConfig) {
    super(name, type, capabilities);
    this.config = config;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    return new Promise((resolve, reject) => {
      const pythonCmd = this.config.pythonPath || 'python3';
      const scriptArgs = [this.config.scriptPath];
      
      const child: ChildProcess = spawn(pythonCmd, scriptArgs, {
        cwd: this.config.cwd || path.dirname(this.config.scriptPath),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdoutData = '';
      let stderrData = '';

      // Prepare payload
      const payload = {
        context: {
          name: this.name
        },
        task: {
          id: task.id,
          goal: task.goal,
          input: task.input
        }
      };

      // Send payload to stdin
      if (child.stdin) {
        child.stdin.write(JSON.stringify(payload));
        child.stdin.end();
      }

      // Collect stdout
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });
      }

      // Collect stderr
      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderrData += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code !== 0) {
          console.error(`[PythonBridgeAgent] Process exited with code ${code}`);
          console.error(`[PythonBridgeAgent] Stderr: ${stderrData}`);
          resolve({
            status: 'error',
            error: `Process exited with code ${code}. Stderr: ${stderrData}`,
            output: stdoutData
          });
          return;
        }

        try {
          // Try to parse the last line as JSON, as there might be logs before it
          const lines = stdoutData.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          
          if (result.status === 'success') {
            resolve({
              status: 'success',
              output: result.output,
              metadata: result.metadata
            });
          } else {
            resolve({
              status: 'error',
              error: result.error || 'Unknown error from python script',
              output: result
            });
          }
        } catch (e: any) {
          console.error(`[PythonBridgeAgent] Failed to parse JSON output: ${stdoutData}`);
          resolve({
            status: 'error',
            error: `Failed to parse JSON output: ${e.message}`,
            output: stdoutData
          });
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
  }
}
