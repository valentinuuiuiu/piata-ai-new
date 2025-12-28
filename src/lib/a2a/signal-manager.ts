/**
 * A2A Signal Manager
 * Enhanced agent-to-agent communication with persistent storage
 */

import { db } from '../drizzle/db';
import { a2aSignals, agentLearningHistory, agentPerformanceMetrics, agentRegistry } from '../drizzle/a2a-schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

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
  private mockMode: boolean = false;
  private mockSignals: any[] = [];
  private mockRegistry: Map<string, any> = new Map();
  private mockMetrics: any[] = [];
  private mockHistory: any[] = [];

  private constructor() {}

  static getInstance(): A2ASignalManager {
    if (!A2ASignalManager.instance) {
      A2ASignalManager.instance = new A2ASignalManager();
    }
    return A2ASignalManager.instance;
  }

  setMockMode(enabled: boolean) {
    this.mockMode = enabled;
    if (enabled) {
        console.warn('⚠️ [A2A] Running in MOCK MODE. Data will not be persisted to DB.');
    }
  }

  /**
   * Log an A2A signal to the database
   */
  async logSignal(signalData: A2ASignalData): Promise<number> {
    if (this.mockMode) {
        const id = this.mockSignals.length + 1;
        this.mockSignals.push({
            id,
            ...signalData,
            toAgent: signalData.toAgent || null,
            content: signalData.content || {},
            priority: signalData.priority || 'normal',
            status: 'pending',
            createdAt: new Date(),
            processedAt: null,
            errorMessage: null,
            retryCount: 0
        });
        console.log(`📡 [A2A MOCK] Signal logged: ${signalData.signalType} from ${signalData.fromAgent} to ${signalData.toAgent || 'BROADCAST'}`);
        return id;
    }

    try {
      const result = await db.insert(a2aSignals).values({
        signalType: signalData.signalType,
        fromAgent: signalData.fromAgent,
        toAgent: signalData.toAgent || null,
        content: signalData.content || {},
        priority: signalData.priority || 'normal',
        status: 'pending'
      }).returning({ id: a2aSignals.id });

      console.log(`📡 [A2A] Signal logged: ${signalData.signalType} from ${signalData.fromAgent} to ${signalData.toAgent || 'BROADCAST'}`);
      return result[0].id;
    } catch (error) {
      console.error('❌ [A2A] Failed to log signal:', error);
      throw error;
    }
  }

  /**
   * Update signal status
   */
  async updateSignalStatus(signalId: number, status: string, errorMessage?: string): Promise<void> {
    if (this.mockMode) {
        const signal = this.mockSignals.find(s => s.id === signalId);
        if (signal) {
            signal.status = status;
            signal.errorMessage = errorMessage || null;
            signal.processedAt = new Date();
            console.log(`📡 [A2A MOCK] Signal ${signalId} status updated to: ${status}`);
        }
        return;
    }

    try {
      await db.update(a2aSignals)
        .set({
          status,
          errorMessage: errorMessage || null,
          processedAt: new Date()
        })
        .where(eq(a2aSignals.id, signalId));

      console.log(`📡 [A2A] Signal ${signalId} status updated to: ${status}`);
    } catch (error) {
      console.error('❌ [A2A] Failed to update signal status:', error);
      throw error;
    }
  }

  /**
   * Retrieve signals with filtering
   */
  async getSignals(filter: SignalFilter = {}, limit: number = 100): Promise<any[]> {
    if (this.mockMode) {
        let filtered = [...this.mockSignals];

        if (filter.signalTypes?.length) {
            filtered = filtered.filter(s => filter.signalTypes!.includes(s.signalType));
        }
        if (filter.agents?.length) {
            filtered = filtered.filter(s => filter.agents!.includes(s.fromAgent) || filter.agents!.includes(s.toAgent));
        }
        if (filter.status?.length) {
            filtered = filtered.filter(s => filter.status!.includes(s.status));
        }

        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
    }

    try {
      const conditions = [];

      if (filter.signalTypes?.length) {
        conditions.push(sql`${a2aSignals.signalType} = ANY(${filter.signalTypes})`);
      }

      if (filter.agents?.length) {
        conditions.push(sql`(${a2aSignals.fromAgent} = ANY(${filter.agents}) OR ${a2aSignals.toAgent} = ANY(${filter.agents}))`);
      }

      if (filter.priority?.length) {
        conditions.push(sql`${a2aSignals.priority} = ANY(${filter.priority})`);
      }

      if (filter.status?.length) {
        conditions.push(sql`${a2aSignals.status} = ANY(${filter.status})`);
      }

      if (filter.timeRange) {
        conditions.push(gte(a2aSignals.createdAt, filter.timeRange.from));
        conditions.push(lte(a2aSignals.createdAt, filter.timeRange.to));
      }

      const signals = await db.select()
        .from(a2aSignals)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(a2aSignals.createdAt))
        .limit(limit);

      return signals;
    } catch (error) {
      console.error('❌ [A2A] Failed to retrieve signals:', error);
      throw error;
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
    if (this.mockMode) {
        this.mockHistory.push({
            ...data,
            createdAt: new Date()
        });
        console.log(`🧠 [A2A MOCK] Learning history logged: ${data.fromAgent} → ${data.toAgent} (${data.outcome})`);
        return;
    }

    try {
      await db.insert(agentLearningHistory).values({
        fromAgent: data.fromAgent,
        toAgent: data.toAgent,
        interactionType: data.interactionType,
        taskId: data.taskId || null,
        taskDescription: data.taskDescription || null,
        outcome: data.outcome,
        duration: data.duration || null,
        agentPerformance: data.agentPerformance || {},
        context: data.context || {}
      });

      console.log(`🧠 [A2A] Learning history logged: ${data.fromAgent} → ${data.toAgent} (${data.outcome})`);
    } catch (error) {
      console.error('❌ [A2A] Failed to log learning history:', error);
      throw error;
    }
  }

  /**
   * Record performance metrics
   */
  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    if (this.mockMode) {
        this.mockMetrics.push({
            ...metrics,
            timestamp: new Date()
        });
        console.log(`📊 [A2A MOCK] Performance metrics recorded: ${metrics.agentName}.${metrics.metricType} = ${metrics.value}`);
        return;
    }

    try {
      await db.insert(agentPerformanceMetrics).values({
        agentName: metrics.agentName,
        metricType: metrics.metricType,
        metricValue: metrics.value.toString(),
        timeWindow: metrics.timeWindow
      });

      console.log(`📊 [A2A] Performance metrics recorded: ${metrics.agentName}.${metrics.metricType} = ${metrics.value}`);
    } catch (error) {
      console.error('❌ [A2A] Failed to record performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics for an agent
   */
  async getAgentPerformance(agentName: string, timeWindow: string = '1h'): Promise<any[]> {
    try {
      const metrics = await db.select()
        .from(agentPerformanceMetrics)
        .where(and(
          eq(agentPerformanceMetrics.agentName, agentName),
          eq(agentPerformanceMetrics.timeWindow, timeWindow)
        ))
        .orderBy(desc(agentPerformanceMetrics.timestamp))
        .limit(50);

      return metrics;
    } catch (error) {
      console.error('❌ [A2A] Failed to get agent performance:', error);
      throw error;
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
    if (this.mockMode) {
        this.mockRegistry.set(agentName, {
            agentName,
            ...data,
            lastHeartbeat: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`🔧 [A2A MOCK] Agent registry updated: ${agentName} (${data.status})`);
        return;
    }

    try {
      await db.insert(agentRegistry)
        .values({
          agentName,
          agentType: data.agentType,
          status: data.status,
          capabilities: data.capabilities || [],
          lastHeartbeat: new Date(),
          metadata: data.metadata || {}
        })
        .onConflictDoUpdate({
          target: agentRegistry.agentName,
          set: {
            agentType: data.agentType,
            status: data.status,
            capabilities: data.capabilities || [],
            lastHeartbeat: new Date(),
            metadata: data.metadata || {},
            updatedAt: new Date()
          }
        });

      console.log(`🔧 [A2A] Agent registry updated: ${agentName} (${data.status})`);
    } catch (error) {
      console.error('❌ [A2A] Failed to update agent registry:', error);
      throw error;
    }
  }

  /**
   * Get all registered agents
   */
  async getRegisteredAgents(): Promise<any[]> {
    if (this.mockMode) {
        return Array.from(this.mockRegistry.values());
    }

    try {
      const agents = await db.select()
        .from(agentRegistry)
        .orderBy(desc(agentRegistry.lastHeartbeat));

      return agents;
    } catch (error) {
      console.error('❌ [A2A] Failed to get registered agents:', error);
      throw error;
    }
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(agentName: string): Promise<any> {
    try {
      const agents = await db.select()
        .from(agentRegistry)
        .where(eq(agentRegistry.agentName, agentName))
        .limit(1);

      return agents[0] || null;
    } catch (error) {
      console.error('❌ [A2A] Failed to get agent health:', error);
      throw error;
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
