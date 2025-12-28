
export enum AgentCapability {
  RESEARCH = 'RESEARCH',
  ACTION = 'ACTION',
  CODING = 'CODING',
  CONTENT = 'CONTENT',
  ANALYSIS = 'ANALYSIS',
  CREATIVITY = 'CREATIVITY',
  VISUALIZATION = 'VISUALIZATION',
  EMOTIONAL_INTELLIGENCE = 'EMOTIONAL_INTELLIGENCE',
  DESIGN = 'DESIGN',
  UI_UX = 'UI_UX',
  FRONTEND_CODING = 'FRONTEND_CODING',
  ACCESSIBILITY = 'ACCESSIBILITY'
}

export enum AgentType {
  OPENMANUS = 'OPENMANUS',
  CONTENT = 'CONTENT',
  PYTHON_BRIDGE = 'PYTHON_BRIDGE',
  SPECIALIST = 'SPECIALIST',
  CREATIVE = 'CREATIVE',
  DESIGNER = 'DESIGNER'
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
