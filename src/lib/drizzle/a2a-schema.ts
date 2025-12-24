/**
 * A2A Protocol Enhanced Schema
 * Extended database schema for persistent agent communication and learning
 */

import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean, decimal } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// A2A Signals - Persistent communication store
export const a2aSignals = pgTable('a2a_signals', {
  id: serial('id').primaryKey(),
  signalType: varchar('signal_type', { length: 100 }).notNull(), // CALL_AGENT, BROADCAST, TASK_COMPLETE, ERROR, etc.
  fromAgent: varchar('from_agent', { length: 50 }).notNull(),
  toAgent: varchar('to_agent', { length: 50 }), // null for broadcasts
  content: jsonb('content').$type<{
    task?: any;
    data?: any;
    error?: string;
    metadata?: any;
  }>().default({}),
  priority: varchar('priority', { length: 20 }).default('normal'), // critical, high, normal, low
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, completed, failed
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Learning History - Patterns and interactions
export const agentLearningHistory = pgTable('agent_learning_history', {
  id: serial('id').primaryKey(),
  fromAgent: varchar('from_agent', { length: 50 }).notNull(),
  toAgent: varchar('to_agent', { length: 50 }).notNull(),
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // call, response, broadcast, error
  taskId: varchar('task_id', { length: 100 }),
  taskDescription: text('task_description'),
  outcome: varchar('outcome', { length: 20 }).notNull(), // success, failure, partial
  duration: integer('duration_ms'),
  agentPerformance: jsonb('agent_performance').$type<{
    responseTime?: number;
    errorCount?: number;
    successRate?: number;
    complexity?: number;
  }>().default({}),
  context: jsonb('context').$type<{
    taskComplexity?: number;
    dependencies?: string[];
    resourcesUsed?: string[];
    externalCalls?: number;
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Performance Metrics - Real-time dashboard data
export const agentPerformanceMetrics = pgTable('agent_performance_metrics', {
  id: serial('id').primaryKey(),
  agentName: varchar('agent_name', { length: 50 }).notNull(),
  metricType: varchar('metric_type', { length: 50 }).notNull(), // response_time, success_rate, task_count, error_rate
  metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
  timeWindow: varchar('time_window', { length: 20 }).notNull(), // 1m, 5m, 15m, 1h, 1d
  timestamp: timestamp('timestamp').defaultNow(),
});

// Agent Registry - Health monitoring and status
export const agentRegistry = pgTable('agent_registry', {
  id: serial('id').primaryKey(),
  agentName: varchar('agent_name', { length: 50 }).notNull().unique(),
  agentType: varchar('agent_type', { length: 50 }).notNull(), // mcp, internal, external, custom
  status: varchar('status', { length: 20 }).default('unknown'), // unknown, healthy, degraded, offline, error
  version: varchar('version', { length: 20 }),
  capabilities: jsonb('capabilities').$type<string[]>().default([]),
  lastHeartbeat: timestamp('last_heartbeat'),
  uptime: integer('uptime_seconds').default(0),
  loadAverage: decimal('load_average', { precision: 8, scale: 2 }).default('0'),
  memoryUsage: decimal('memory_usage_mb', { precision: 10, scale: 2 }).default('0'),
  cpuUsage: decimal('cpu_usage_percent', { precision: 5, scale: 2 }).default('0'),
  errorCount: integer('error_count').default(0),
  taskQueue: integer('task_queue_size').default(0),
  metadata: jsonb('metadata').$type<{
    endpoint?: string;
    config?: any;
    customMetrics?: any;
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Signal Replay Sessions - For debugging and learning
export const signalReplaySessions = pgTable('signal_replay_sessions', {
  id: serial('id').primaryKey(),
  sessionName: varchar('session_name', { length: 100 }).notNull(),
  description: text('description'),
  replaySpeed: decimal('replay_speed', { precision: 5, scale: 2 }).default('1'), // 1x, 2x, 5x, etc.
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  signalFilters: jsonb('signal_filters').$type<{
    agents?: string[];
    signalTypes?: string[];
    timeRange?: { from: string; to: string };
  }>().default({}),
  status: varchar('status', { length: 20 }).default('created'), // created, running, completed, failed
  createdBy: varchar('created_by', { length: 100 }), // user or system identifier
  createdAt: timestamp('created_at').defaultNow(),
});

// Agent Skill Matching - For intelligent task routing
export const agentSkillMatching = pgTable('agent_skill_matching', {
  id: serial('id').primaryKey(),
  agentName: varchar('agent_name', { length: 50 }).notNull(),
  skillCategory: varchar('skill_category', { length: 50 }).notNull(), // database, api, file_processing, ai, etc.
  skillLevel: integer('skill_level').notNull(), // 1-10 scale
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }).default('0'),
  lastUsed: timestamp('last_used'),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0'),
  avgResponseTime: integer('avg_response_time_ms').default(0),
  metadata: jsonb('metadata').$type<{
    examples?: string[];
    certifications?: string[];
    specialties?: string[];
  }>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export types
export type A2ASignal = InferSelectModel<typeof a2aSignals>;
export type NewA2ASignal = InferInsertModel<typeof a2aSignals>;
export type AgentLearningRecord = InferSelectModel<typeof agentLearningHistory>;
export type AgentPerformanceMetric = InferSelectModel<typeof agentPerformanceMetrics>;
export type AgentRegistryEntry = InferSelectModel<typeof agentRegistry>;
export type SignalReplaySession = InferSelectModel<typeof signalReplaySessions>;
export type AgentSkillMatch = InferSelectModel<typeof agentSkillMatching>;