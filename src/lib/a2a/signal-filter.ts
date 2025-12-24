/**
 * A2A Signal Filter and Prioritization
 * Critical event filtering, prioritization, and escalation system
 */

import { a2aSignalManager } from './signal-manager';

export interface SignalClassification {
  priority: 'critical' | 'high' | 'normal' | 'low';
  urgency: 'immediate' | 'urgent' | 'standard' | 'deferred';
  category: 'system' | 'agent' | 'business' | 'security' | 'performance' | 'user';
  impact: 'global' | 'system' | 'agent' | 'task' | 'minimal';
  requiresAlert: boolean;
  escalationLevel: number;
}

export interface FilterRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: FilterCondition[];
  actions: FilterAction[];
  priority: number;
  description?: string;
}

export interface FilterCondition {
  field: 'signalType' | 'fromAgent' | 'toAgent' | 'priority' | 'content' | 'metadata' | 'status';
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface FilterAction {
  type: 'set_priority' | 'set_category' | 'set_urgency' | 'forward' | 'duplicate' | 'drop' | 'escalate' | 'alert';
  parameters: Record<string, any>;
}

export interface CriticalEvent {
  id: string;
  title: string;
  description: string;
  type: 'failure' | 'timeout' | 'performance' | 'security' | 'capacity' | 'configuration';
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceSignal: any;
  correlatedSignals: any[];
  affectedAgents: string[];
  status: 'active' | 'investigating' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
  actions: EventAction[];
}

export interface EventAction {
  type: 'notification' | 'escalation' | 'auto_retry' | 'failover' | 'restart' | 'pause';
  parameters: Record<string, any>;
  executedAt?: Date;
  success: boolean;
}

export class A2ASignalFilter {
  private static instance: A2ASignalFilter;
  private filterRules: Map<string, FilterRule> = new Map();
  private criticalEvents: Map<string, CriticalEvent> = new Map();
  private eventCorrelations: Map<string, string> = new Map();
  private priorityQueue: PriorityQueue = new PriorityQueue();

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): A2ASignalFilter {
    if (!A2ASignalFilter.instance) {
      A2ASignalFilter.instance = new A2ASignalFilter();
    }
    return A2ASignalFilter.instance;
  }

  private initializeDefaultRules(): void {
    const defaultRules: FilterRule[] = [
      {
        id: 'critical_agent_failure',
        name: 'Critical Agent Failure',
        enabled: true,
        priority: 1,
        description: 'Immediately escalate agent failures',
        conditions: [
          { field: 'signalType', operator: 'equals', value: 'CALL_AGENT' },
          { field: 'status', operator: 'equals', value: 'failed' }
        ],
        actions: [
          { type: 'set_priority', parameters: { priority: 'critical' } },
          { type: 'set_category', parameters: { category: 'system' } },
          { type: 'escalate', parameters: { level: 1 } },
          { type: 'alert', parameters: { channels: ['email', 'slack'] } }
        ]
      },
      {
        id: 'performance_degradation',
        name: 'Performance Degradation',
        enabled: true,
        priority: 2,
        description: 'Detect and escalate performance issues',
        conditions: [
          { field: 'signalType', operator: 'contains', value: 'performance' },
          { field: 'content', operator: 'contains', value: 'response_time' }
        ],
        actions: [
          { type: 'set_priority', parameters: { priority: 'high' } },
          { type: 'set_category', parameters: { category: 'performance' } },
          { type: 'alert', parameters: { channels: ['dashboard'] } }
        ]
      },
      {
        id: 'security_alerts',
        name: 'Security Alerts',
        enabled: true,
        priority: 1,
        description: 'Prioritize security-related signals',
        conditions: [
          { field: 'signalType', operator: 'contains', value: 'security' },
          { field: 'metadata', operator: 'contains', value: 'authentication' }
        ],
        actions: [
          { type: 'set_priority', parameters: { priority: 'critical' } },
          { type: 'set_category', parameters: { category: 'security' } },
          { type: 'escalate', parameters: { level: 2 } },
          { type: 'alert', parameters: { channels: ['email', 'slack', 'sms'] } }
        ]
      },
      {
        id: 'user_critical_requests',
        name: 'User Critical Requests',
        enabled: true,
        priority: 3,
        description: 'Prioritize user-generated critical requests',
        conditions: [
          { field: 'metadata', operator: 'contains', value: 'user_request' },
          { field: 'priority', operator: 'equals', value: 'high' }
        ],
        actions: [
          { type: 'set_urgency', parameters: { urgency: 'urgent' } },
          { type: 'set_category', parameters: { category: 'user' } }
        ]
      }
    ];

    defaultRules.forEach(rule => {
      this.addFilterRule(rule);
    });

    console.log(`🔧 [A2A FILTER] Initialized ${defaultRules.length} default filter rules`);
  }

  async processSignal(signal: any): Promise<{
    filtered: boolean;
    classification: SignalClassification;
    modified: boolean;
    actions: string[];
    priorityScore: number;
  }> {
    try {
      let classification: SignalClassification = {
        priority: signal.priority || 'normal',
        urgency: 'standard',
        category: 'system',
        impact: 'minimal',
        requiresAlert: false,
        escalationLevel: 0
      };

      const appliedActions: string[] = [];
      let priorityScore = this.calculateBasePriorityScore(signal);

      const matchingRules = this.getMatchingRules(signal);
      for (const rule of matchingRules) {
        const result = await this.applyFilterAction(rule, signal, classification);
        if (result.modified) {
          appliedActions.push(rule.name);
          priorityScore += result.priorityBoost;
        }
      }

      const shouldFilter = appliedActions.some(actionName => {
        const rule = Array.from(this.filterRules.values()).find(r => r.name === actionName);
        return rule?.actions.some(a => a.type === 'drop');
      });

      if (shouldFilter) {
        console.log(`🚫 [A2A FILTER] Signal filtered out: ${signal.signal_type}`);
        return {
          filtered: true,
          classification,
          modified: true,
          actions: appliedActions,
          priorityScore
        };
      }

      const criticalEvent = await this.detectCriticalEvent(signal);
      if (criticalEvent) {
        classification.priority = 'critical';
        classification.urgency = 'immediate';
        classification.requiresAlert = true;
        classification.escalationLevel = Math.max(classification.escalationLevel, 2);
        priorityScore += 100;
      }

      this.priorityQueue.add(signal.id, priorityScore, signal);

      console.log(`🔍 [A2A FILTER] Processed signal: ${signal.signal_type} (Priority: ${classification.priority}, Score: ${priorityScore})`);

      return {
        filtered: false,
        classification,
        modified: appliedActions.length > 0,
        actions: appliedActions,
        priorityScore
      };

    } catch (error) {
      console.error('❌ [A2A FILTER] Failed to process signal:', error);
      return {
        filtered: false,
        classification: {
          priority: 'normal',
          urgency: 'standard',
          category: 'system',
          impact: 'minimal',
          requiresAlert: false,
          escalationLevel: 0
        },
        modified: false,
        actions: [],
        priorityScore: 50
      };
    }
  }

  private getMatchingRules(signal: any): FilterRule[] {
    const matchingRules: FilterRule[] = [];

    for (const rule of this.filterRules.values()) {
      if (!rule.enabled) continue;

      let allConditionsMatch = true;
      for (const condition of rule.conditions) {
        if (!this.evaluateCondition(signal, condition)) {
          allConditionsMatch = false;
          break;
        }
      }

      if (allConditionsMatch) {
        matchingRules.push(rule);
      }
    }

    return matchingRules.sort((a, b) => a.priority - b.priority);
  }

  private evaluateCondition(signal: any, condition: FilterCondition): boolean {
    const fieldValue = this.getFieldValue(signal, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        const fieldStr = String(fieldValue || '');
        const searchStr = String(condition.value || '');
        return condition.caseSensitive !== false 
          ? fieldStr.includes(searchStr)
          : fieldStr.toLowerCase().includes(searchStr.toLowerCase());
      case 'regex':
        try {
          const regex = new RegExp(condition.value, condition.caseSensitive ? '' : 'i');
          return regex.test(String(fieldValue || ''));
        } catch {
          return false;
        }
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  private getFieldValue(signal: any, field: string): any {
    switch (field) {
      case 'signalType':
        return signal.signal_type;
      case 'fromAgent':
        return signal.from_agent;
      case 'toAgent':
        return signal.to_agent;
      case 'priority':
        return signal.priority;
      case 'content':
        return signal.content;
      case 'metadata':
        return signal.metadata;
      case 'status':
        return signal.status;
      default:
        return signal[field];
    }
  }

  private async applyFilterAction(
    rule: FilterRule, 
    signal: any, 
    classification: SignalClassification
  ): Promise<{ modified: boolean; priorityBoost: number }> {
    let modified = false;
    let priorityBoost = 0;

    for (const action of rule.actions) {
      switch (action.type) {
        case 'set_priority':
          if (action.parameters.priority && classification.priority !== action.parameters.priority) {
            classification.priority = action.parameters.priority;
            modified = true;
            priorityBoost += this.getPriorityBoost(action.parameters.priority);
          }
          break;
        case 'set_category':
          classification.category = action.parameters.category || classification.category;
          modified = true;
          break;
        case 'set_urgency':
          classification.urgency = action.parameters.urgency || classification.urgency;
          modified = true;
          break;
        case 'escalate':
          classification.escalationLevel = Math.max(
            classification.escalationLevel,
            action.parameters.level || 1
          );
          priorityBoost += action.parameters.level * 10;
          modified = true;
          break;
        case 'alert':
          classification.requiresAlert = true;
          priorityBoost += 5;
          modified = true;
          break;
        case 'forward':
          console.log(`📨 [A2A FILTER] Forwarding signal to ${action.parameters.destination}`);
          break;
        case 'duplicate':
          break;
      }
    }

    return { modified, priorityBoost };
  }

  private calculateBasePriorityScore(signal: any): number {
    let score = 50;

    const signalTypeScores: Record<string, number> = {
      'CALL_AGENT': 20,
      'BROADCAST': 15,
      'FAILURE': 40,
      'TIMEOUT': 35,
      'PERFORMANCE_ALERT': 30,
      'SECURITY_ALERT': 50
    };

    score += signalTypeScores[signal.signal_type] || 0;

    const priorityScores: Record<string, number> = {
      'critical': 40,
      'high': 25,
      'normal': 10,
      'low': 0
    };

    score += priorityScores[signal.priority] || 10;

    return score;
  }

  private getPriorityBoost(priority: string): number {
    const boosts: Record<string, number> = {
      'critical': 40,
      'high': 25,
      'normal': 10,
      'low': 0
    };
    return boosts[priority] || 10;
  }

  private async detectCriticalEvent(signal: any): Promise<CriticalEvent | null> {
    const eventPatterns = [
      {
        type: 'agent_failure' as const,
        condition: signal.signal_type === 'CALL_AGENT' && signal.status === 'failed',
        title: 'Agent Execution Failed',
        severity: 'high' as const
      },
      {
        type: 'performance_degradation' as const,
        condition: signal.signal_type === 'PERFORMANCE_ALERT' && signal.priority === 'high',
        title: 'Performance Degradation Detected',
        severity: 'medium' as const
      },
      {
        type: 'timeout' as const,
        condition: signal.status === 'timeout',
        title: 'Agent Timeout Occurred',
        severity: 'high' as const
      },
      {
        type: 'security_violation' as const,
        condition: signal.signal_type.includes('SECURITY'),
        title: 'Security Violation Detected',
        severity: 'critical' as const
      }
    ];

    const matchingPattern = eventPatterns.find(pattern => pattern.condition);
    if (!matchingPattern) return null;

    const correlatedEventId = this.eventCorrelations.get(signal.id);
    if (correlatedEventId) {
      return this.criticalEvents.get(correlatedEventId) || null;
    }

    const eventId = `critical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const criticalEvent: CriticalEvent = {
      id: eventId,
      title: matchingPattern.title,
      description: `${matchingPattern.title}: ${signal.signal_type} from ${signal.from_agent}`,
      type: this.mapToEventType(matchingPattern.type),
      severity: matchingPattern.severity,
      sourceSignal: signal,
      correlatedSignals: [signal],
      affectedAgents: [signal.from_agent, signal.to_agent].filter(Boolean),
      status: 'active',
      createdAt: new Date(),
      actions: []
    };

    this.criticalEvents.set(eventId, criticalEvent);
    this.eventCorrelations.set(signal.id, eventId);

    console.log(`🚨 [A2A FILTER] Critical event created: ${criticalEvent.title}`);

    return criticalEvent;
  }

  private mapToEventType(pattern: string): CriticalEvent['type'] {
    switch (pattern) {
      case 'agent_failure':
        return 'failure';
      case 'performance_degradation':
        return 'performance';
      case 'timeout':
        return 'timeout';
      case 'security_violation':
        return 'security';
      default:
        return 'failure';
    }
  }

  addFilterRule(rule: FilterRule): void {
    this.filterRules.set(rule.id, rule);
    console.log(`🔧 [A2A FILTER] Added filter rule: ${rule.name}`);
  }

  removeFilterRule(ruleId: string): boolean {
    const removed = this.filterRules.delete(ruleId);
    if (removed) {
      console.log(`🗑️ [A2A FILTER] Removed filter rule: ${ruleId}`);
    }
    return removed;
  }

  getFilterRules(): FilterRule[] {
    return Array.from(this.filterRules.values());
  }

  updateFilterRule(ruleId: string, updates: Partial<FilterRule>): boolean {
    const rule = this.filterRules.get(ruleId);
    if (!rule) return false;

    const updated = { ...rule, ...updates };
    this.filterRules.set(ruleId, updated);
    
    console.log(`🔧 [A2A FILTER] Updated filter rule: ${ruleId}`);
    return true;
  }

  getCriticalEvents(status?: CriticalEvent['status']): CriticalEvent[] {
    let events = Array.from(this.criticalEvents.values());
    
    if (status) {
      events = events.filter(e => e.status === status);
    }
    
    return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getNextSignal(): { signal: any; score: number } | null {
    return this.priorityQueue.pop();
  }

  getQueueStats(): {
    totalSignals: number;
    criticalCount: number;
    highCount: number;
    normalCount: number;
    lowCount: number;
  } {
    return this.priorityQueue.getStats();
  }

  clearQueue(): void {
    this.priorityQueue.clear();
    console.log('🧹 [A2A FILTER] Priority queue cleared');
  }

  getFilterStats(): {
    totalRules: number;
    enabledRules: number;
    activeEvents: number;
    queueSize: number;
  } {
    return {
      totalRules: this.filterRules.size,
      enabledRules: Array.from(this.filterRules.values()).filter(r => r.enabled).length,
      activeEvents: this.getCriticalEvents('active').length,
      queueSize: this.priorityQueue.size()
    };
  }
}

class PriorityQueue {
  private items: Map<number, any[]> = new Map();
  private scores: Map<string, number> = new Map();
  private ids: Set<string> = new Set();

  add(id: any, score: number, item: any): void {
    this.ids.add(String(id));
    this.scores.set(String(id), score);
    
    if (!this.items.has(score)) {
      this.items.set(score, []);
    }
    this.items.get(score)!.push(item);
  }

  pop(): { signal: any; score: number } | null {
    const scores = Array.from(this.items.keys()).sort((a, b) => b - a);
    
    for (const score of scores) {
      const items = this.items.get(score);
      if (items && items.length > 0) {
        const item = items.shift()!;
        this.ids.delete(String(item.id));
        this.scores.delete(String(item.id));
        
        if (items.length === 0) {
          this.items.delete(score);
        }
        
        return { signal: item, score };
      }
    }
    
    return null;
  }

  size(): number {
    return this.ids.size;
  }

  clear(): void {
    this.items.clear();
    this.scores.clear();
    this.ids.clear();
  }

  getStats(): {
    totalSignals: number;
    criticalCount: number;
    highCount: number;
    normalCount: number;
    lowCount: number;
  } {
    return {
      totalSignals: this.size(),
      criticalCount: 0,
      highCount: 0,
      normalCount: this.size(),
      lowCount: 0
    };
  }
}

export const a2aSignalFilter = A2ASignalFilter.getInstance();