/**
 * A2A Protocol Index
 * Main entry point for all A2A (Agent-to-Agent) protocol modules
 */

export { a2aSignalManager, A2ASignalManager, type A2ASignalData, type SignalFilter, type PerformanceMetrics } from './signal-manager';
export { a2aSignalReplaySystem, A2ASignalReplaySystem, type ReplaySession, type ReplaySettings, type ReplayResults, type PlaybackControls } from './signal-replay';
export { a2aPerformanceDashboard, A2APerformanceDashboard, type DashboardMetrics, type PerformanceAlert, type DashboardConfig } from './performance-dashboard';
export { a2aSignalFilter, A2ASignalFilter, type SignalClassification, type FilterRule, type FilterCondition, type FilterAction, type CriticalEvent } from './signal-filter';