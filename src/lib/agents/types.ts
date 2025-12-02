
export enum AgentCapability {
  RESEARCH = 'RESEARCH',
  ACTION = 'ACTION',
  CODING = 'CODING',
  CONTENT = 'CONTENT',
  ANALYSIS = 'ANALYSIS'
}

export enum AgentType {
  OPENMANUS = 'OPENMANUS',
  CONTENT = 'CONTENT',
  PYTHON_BRIDGE = 'PYTHON_BRIDGE'
}

export interface AgentTask {
  id: string;
  type: AgentCapability;
  agentType?: AgentType;
  goal: string;
  input?: Record<string, any>;
  context?: Record<string, any>;
}

export interface AgentResult {
  status: 'success' | 'error';
  output: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];
  
  run(task: AgentTask): Promise<AgentResult>;
}
