import { AgentCapability } from './types';
import { PythonBridgeAgent } from './python-bridge-agent';
import path from 'path';
import os from 'os';

export class ManusAgent extends PythonBridgeAgent {
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
      [AgentCapability.RESEARCH, AgentCapability.ANALYSIS],
      {
        scriptPath: scriptPath,
        // Fallback to 'python3' if venv doesn't exist (though likely won't work without deps)
        // For this environment, we'll try to use the venv if we can guess it, otherwise rely on path
        pythonPath: 'python3', 
        cwd: path.dirname(scriptPath)
      }
    );
  }
}
