export interface WorkflowStep {
  id: string;
  name: string;
  type: 'command' | 'manual' | 'api_call' | 'fabric_pattern' | 'subworkflow' | 'agent_task' | string;
  description: string;
  agent: string;
  command?: string;
  pattern?: string;
  workflow?: string;
  requires_llm?: boolean;
  timeout?: number;
  retries?: number;
  depends_on?: string[];
  params?: Record<string, any>;
  action?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: Record<string, string>;
  steps: WorkflowStep[];
  record_on_chain?: boolean;
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  category?: string;
  triggers?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  steps_completed: number;
  steps_total: number;
  results: Record<string, any>;
  errors: Record<string, any>;
  error?: string;
}
