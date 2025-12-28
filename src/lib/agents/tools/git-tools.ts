
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

// Helper for safe command execution
function runCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

export const GitTools = {
  async getGitLog(limit: number = 10): Promise<string> {
    try {
      // Validate limit is a number
      const safeLimit = typeof limit === 'number' ? Math.floor(Math.abs(limit)) : 10;
      return await runCommand('git', ['log', '-n', safeLimit.toString(), '--pretty=format:%h - %an, %ar : %s']);
    } catch (error: any) {
      return `Error getting git log: ${error.message}`;
    }
  },

  async getGitStatus(): Promise<string> {
    try {
      return await runCommand('git', ['status']);
    } catch (error: any) {
      return `Error getting git status: ${error.message}`;
    }
  },

  async getFileContent(filepath: string): Promise<string> {
      try {
          // Security check: prevent directory traversal
          if (filepath.includes('..') || path.isAbsolute(filepath)) return 'Access denied: Path must be relative.';
          return await fs.readFile(filepath, 'utf-8');
      } catch (error: any) {
          return `Error reading file: ${error.message}`;
      }
  },

  async listFiles(dirPath: string = '.'): Promise<string> {
      try {
           // Security check
           if (dirPath.includes('..') || path.isAbsolute(dirPath)) return 'Access denied: Path must be relative.';
           // Use ls -la safely
           return await runCommand('ls', ['-la', dirPath]);
      } catch (error: any) {
          return `Error listing files: ${error.message}`;
      }
  },

  async fixConflict(filepath: string, solution: string): Promise<string> {
      // Very basic placeholder for conflict resolution
      // In reality, this would need complex parsing or just overwriting the file if the agent is confident.
      // For safety, we will just log what would happen for now.
      return `Simulated fix for ${filepath}: \n${solution}`;
  },

  async createFile(filepath: string, content: string): Promise<string> {
      try {
          if (filepath.includes('..') || path.isAbsolute(filepath)) return 'Access denied: Path must be relative.';
          // Ensure directory exists
          const dir = path.dirname(filepath);
          if (dir !== '.') {
              await fs.mkdir(dir, { recursive: true });
          }
          await fs.writeFile(filepath, content, 'utf-8');
          return `File created successfully: ${filepath}`;
      } catch (error: any) {
          return `Error creating file: ${error.message}`;
      }
  },

  async applyPatch(filepath: string, patchContent: string): Promise<string> {
      try {
           if (filepath.includes('..') || path.isAbsolute(filepath)) return 'Access denied: Path must be relative.';
           // Simple overwrite for now as "patching"
           await fs.writeFile(filepath, patchContent, 'utf-8');
           return `Patch applied (file overwritten) for: ${filepath}`;
      } catch (error: any) {
          return `Error applying patch: ${error.message}`;
      }
  }
};
