export interface AgentRegistry {
  id: number
  agent_name: string
  agent_type: string
  status: string
  version?: string
  capabilities?: any
  last_heartbeat?: string
  uptime_seconds?: number
  load_average?: number
  memory_usage_mb?: number
  cpu_usage_percent?: number
  error_count?: number
  task_queue_size?: number
  metadata?: any
  created_at: string
  updated_at: string
}

export interface AutomationLog {
  id: number
  created_at: string
  task_name: string
  status: 'success' | 'failure' | 'running'
  duration_ms?: number
  summary?: string
  details?: string
}

export interface A2ASignal {
  id: number
  signal_type: string
  from_agent: string
  to_agent?: string
  content?: any
  priority?: string
  status: string
  processed_at?: string
  error_message?: string
  retry_count?: number
  created_at: string
}
