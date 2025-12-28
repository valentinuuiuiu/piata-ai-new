// Common workflow types

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'command' | 'manual' | 'api_call' | 'fabric_pattern' | 'subworkflow' | 'agent_task';

  // Properties used in registry
  agent?: string;
  command?: string;
  pattern?: string;
  workflow?: string;
  requires_llm?: boolean;
  timeout?: number;
  retries?: number;
  depends_on?: string[];

  // Properties used in executor (aliases or alternative structures)
  action?: string;
  params?: Record<string, any>;
  requiredCapabilities?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;

  // Registry properties
  agents?: Record<string, string>;
  record_on_chain?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  category?: string;

  // Executor properties
  triggers?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string; // Registry uses workflow_id
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  steps_completed: number;
  steps_total: number;
  results: Record<string, any>;
  errors: Record<string, string>;
  error?: string;
  blockchain_recorded?: boolean;

  // Executor aliases (optional)
  workflowId?: string;
  currentStepIndex?: number;
  startedAt?: Date;
  completedAt?: Date;
}
