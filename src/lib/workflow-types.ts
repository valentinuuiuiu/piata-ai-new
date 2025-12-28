export interface WorkflowStep {
  id: string;
  name: string;
  type: 'command' | 'manual' | 'api_call' | 'fabric_pattern' | 'subworkflow' | 'agent_task';
  description: string;
  agent: string;
  command?: string;
  pattern?: string;
  workflow?: string;
  requires_llm?: boolean;
  timeout?: number;
  retries?: number;
  depends_on?: string[];
  action?: string; // Kept for compatibility with some files
  required_capabilities?: string[]; // Kept for compatibility
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  agents?: Record<string, string>; // Optional because some definitions might not have it
  steps: WorkflowStep[];
  record_on_chain?: boolean;
  enabled: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  category?: string;
  trigger?: string; // Kept for compatibility
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string; // Used in registry
  workflowId?: string; // Used in executor (alias)
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: string;
  startTime?: Date;
  completed_at?: string;
  endTime?: Date;
  steps_completed?: number;
  steps_total?: number;
  results: Record<string, any>;
  errors: Record<string, string>;
  error?: string;
  blockchain_recorded?: boolean;
  steps?: { // Kept for executor compatibility
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    result?: any;
    error?: string;
  }[];
}
