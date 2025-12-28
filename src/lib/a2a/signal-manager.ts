/**
 * A2A Signal Manager
 * Enhanced agent-to-agent communication with persistent storage
 * Refactored to use Supabase Client (REST) for environment compatibility
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface A2ASignalData {
  signalType: string;
  fromAgent: string;
  toAgent?: string;
  content?: any;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  metadata?: any;
}

export interface SignalFilter {
  signalTypes?: string[];
  agents?: string[];
  timeRange?: { from: Date; to: Date };
  priority?: string[];
  status?: string[];
}

export interface PerformanceMetrics {
  agentName: string;
  metricType: string;
  value: number;
  timeWindow: string;
}

export class A2ASignalManager {
  private static instance: A2ASignalManager;
  private supabase: SupabaseClient | null = null;

  private constructor() {
    // Initialize Supabase client if credentials are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('⚠️ [A2A] Supabase credentials missing. Persistent storage will be disabled.');
    }
  }

  static getInstance(): A2ASignalManager {
    if (!A2ASignalManager.instance) {
      A2ASignalManager.instance = new A2ASignalManager();
    }
    return A2ASignalManager.instance;
  }

  /**
   * Log an A2A signal to the database
   */
  async logSignal(signalData: A2ASignalData): Promise<number> {
    if (!this.supabase) return -1;

    try {
      const { data, error } = await this.supabase
        .from('a2a_signals')
        .insert({
          signal_type: signalData.signalType,
          from_agent: signalData.fromAgent,
          to_agent: signalData.toAgent || null,
          content: signalData.content || {},
          priority: signalData.priority || 'normal',
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      console.log(`📡 [A2A] Signal logged: ${signalData.signalType} from ${signalData.fromAgent} to ${signalData.toAgent || 'BROADCAST'}`);
      return data.id;
    } catch (error) {
      console.error('❌ [A2A] Failed to log signal:', error);
      // Don't crash the orchestrator if logging fails
      return -1;
    }
  }

  /**
   * Update signal status
   */
  async updateSignalStatus(signalId: number, status: string, errorMessage?: string): Promise<void> {
    if (!this.supabase || signalId === -1) return;

    try {
      const { error } = await this.supabase
        .from('a2a_signals')
        .update({
          status,
          error_message: errorMessage || null,
          processed_at: new Date().toISOString()
        })
        .eq('id', signalId);

      if (error) throw error;

      console.log(`📡 [A2A] Signal ${signalId} status updated to: ${status}`);
    } catch (error) {
      console.error('❌ [A2A] Failed to update signal status:', error);
    }
  }

  /**
   * Retrieve signals with filtering
   */
  async getSignals(filter: SignalFilter = {}, limit: number = 100): Promise<any[]> {
    if (!this.supabase) return [];

    try {
      let query = this.supabase
        .from('a2a_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filter.signalTypes?.length) {
        query = query.in('signal_type', filter.signalTypes);
      }

      if (filter.agents?.length) {
        query = query.or(`from_agent.in.(${filter.agents.join(',')}),to_agent.in.(${filter.agents.join(',')})`);
      }

      if (filter.priority?.length) {
        query = query.in('priority', filter.priority);
      }

      if (filter.status?.length) {
        query = query.in('status', filter.status);
      }

      if (filter.timeRange) {
        query = query.gte('created_at', filter.timeRange.from.toISOString())
                     .lte('created_at', filter.timeRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ [A2A] Failed to retrieve signals:', error);
      return [];
    }
  }

  /**
   * Log agent learning history
   */
  async logAgentInteraction(data: {
    fromAgent: string;
    toAgent: string;
    interactionType: string;
    taskId?: string;
    taskDescription?: string;
    outcome: 'success' | 'failure' | 'partial';
    duration?: number;
    agentPerformance?: any;
    context?: any;
  }): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('agent_learning_history')
        .insert({
          from_agent: data.fromAgent,
          to_agent: data.toAgent,
          interaction_type: data.interactionType,
          task_id: data.taskId || null,
          task_description: data.taskDescription || null,
          outcome: data.outcome,
          duration: data.duration || null,
          agent_performance: data.agentPerformance || {},
          context: data.context || {}
        });

      if (error) throw error;

      console.log(`🧠 [A2A] Learning history logged: ${data.fromAgent} → ${data.toAgent} (${data.outcome})`);
    } catch (error) {
      console.error('❌ [A2A] Failed to log learning history:', error);
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('agent_performance_metrics')
        .insert({
          agent_name: metrics.agentName,
          metric_type: metrics.metricType,
          metric_value: metrics.value.toString(),
          time_window: metrics.timeWindow
        });

      if (error) throw error;

      console.log(`📊 [A2A] Performance metrics recorded: ${metrics.agentName}.${metrics.metricType} = ${metrics.value}`);
    } catch (error) {
      console.error('❌ [A2A] Failed to record performance metrics:', error);
    }
  }

  /**
   * Get performance metrics for an agent
   */
  async getAgentPerformance(agentName: string, timeWindow: string = '1h'): Promise<any[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_name', agentName)
        .eq('time_window', timeWindow)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ [A2A] Failed to get agent performance:', error);
      return [];
    }
  }

  /**
   * Register or update agent in registry
   */
  async updateAgentRegistry(agentName: string, data: {
    agentType: string;
    status: string;
    capabilities?: string[];
    metadata?: any;
  }): Promise<void> {
    if (!this.supabase) return;

    // Check mocked mode for tests
    if (process.env.SKIP_A2A_DB_WRITE === 'true') {
        console.log(`🔧 [A2A] (MOCKED) Agent registry updated: ${agentName} (${data.status})`);
        return;
    }

    try {
      const { error } = await this.supabase
        .from('agent_registry')
        .upsert({
          agent_name: agentName,
          agent_type: data.agentType,
          status: data.status,
          capabilities: data.capabilities || [],
          last_heartbeat: new Date().toISOString(),
          metadata: data.metadata || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'agent_name' });

      if (error) throw error;

      console.log(`🔧 [A2A] Agent registry updated: ${agentName} (${data.status})`);
    } catch (error) {
      console.error('❌ [A2A] Failed to update agent registry:', error);
    }
  }

  /**
   * Get all registered agents
   */
  async getRegisteredAgents(): Promise<any[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('agent_registry')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ [A2A] Failed to get registered agents:', error);
      return [];
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(agentName: string): Promise<any> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('agent_registry')
        .select('*')
        .eq('agent_name', agentName)
        .single();

      if (error) throw error;

      return data || null;
    } catch (error) {
      console.error('❌ [A2A] Failed to get agent health:', error);
      return null;
    }
  }

  /**
   * Enhanced A2A broadcast with persistence
   */
  async broadcastEnhanced(signalType: string, data: any, fromAgent: string, priority: string = 'normal'): Promise<number> {
    const signalId = await this.logSignal({
      signalType,
      fromAgent,
      content: data,
      priority: priority as any
    });

    console.log(`📢 [A2A ENHANCED BROADCAST] ${signalType} from ${fromAgent} (ID: ${signalId})`);
    
    // Log learning history for broadcast
    await this.logAgentInteraction({
      fromAgent,
      toAgent: 'BROADCAST',
      interactionType: 'broadcast',
      outcome: 'success',
      context: { signalType, priority }
    });

    return signalId;
  }

  /**
   * Enhanced agent call with persistence and learning
   */
  async callAgentEnhanced(toAgent: string, task: any, fromAgent: string, priority: string = 'normal'): Promise<any> {
    const signalId = await this.logSignal({
      signalType: 'CALL_AGENT',
      fromAgent,
      toAgent,
      content: { task },
      priority: priority as any
    });

    console.log(`📡 [A2A ENHANCED CALL] ${fromAgent} → ${toAgent} (ID: ${signalId})`);
    
    // Record performance start time
    const startTime = Date.now();
    
    return {
      signalId,
      startTime,
      complete: (outcome: 'success' | 'failure' | 'partial', result?: any, error?: string) => {
        const duration = Date.now() - startTime;
        
        // Update signal status
        this.updateSignalStatus(signalId, outcome === 'success' ? 'completed' : 'failed', error);
        
        // Log learning history
        this.logAgentInteraction({
          fromAgent,
          toAgent,
          interactionType: 'call',
          taskDescription: task.description || task.goal || 'Unknown task',
          outcome,
          duration,
          agentPerformance: {
            responseTime: duration,
            successRate: outcome === 'success' ? 1 : 0
          },
          context: { task, result, error }
        });

        // Record performance metrics
        this.recordPerformanceMetrics({
          agentName: toAgent,
          metricType: 'response_time',
          value: duration,
          timeWindow: '5m'
        });

        if (outcome === 'success') {
          this.recordPerformanceMetrics({
            agentName: toAgent,
            metricType: 'success_rate',
            value: 1,
            timeWindow: '5m'
          });
        }
      }
    };
  }
}

// Export singleton instance
export const a2aSignalManager = A2ASignalManager.getInstance();
