/**
 * A2A Signal Replay System
 * Debugging and learning through historical signal recreation
 */

import { a2aSignalManager } from './signal-manager';
import { SignalFilter } from './signal-manager';

export interface ReplaySession {
  id: string;
  name: string;
  signalIds: number[];
  status: 'pending' | 'running' | 'paused' | 'stopped' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  settings: ReplaySettings;
  results: ReplayResults;
}

export interface ReplaySettings {
  speed: 'realtime' | 'fast' | 'superfast';
  simulateResponses: boolean;
  includeBreaks: boolean;
  breakDuration: number;
  autoPauseOnErrors: boolean;
  outputLogs: boolean;
}

export interface ReplayResults {
  totalSignals: number;
  successfulSignals: number;
  failedSignals: number;
  skippedSignals: number;
  averageSignalDelay: number;
  totalDuration: number;
  errors: string[];
  agentResponseStats: Record<string, {
    calls: number;
    successes: number;
    failures: number;
    avgResponseTime: number;
  }>;
}

export interface PlaybackControls {
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  speed(speed: 'realtime' | 'fast' | 'superfast'): Promise<void>;
  skipToSignal(signalIndex: number): Promise<void>;
}

export class A2ASignalReplaySystem {
  private static instance: A2ASignalReplaySystem;
  private activeSessions: Map<string, ReplaySession> = new Map();

  private constructor() {}

  static getInstance(): A2ASignalReplaySystem {
    if (!A2ASignalReplaySystem.instance) {
      A2ASignalReplaySystem.instance = new A2ASignalReplaySystem();
    }
    return A2ASignalReplaySystem.instance;
  }

  /**
   * Create a replay session from historical signals
   */
  async createReplaySession(
    name: string,
    filter: SignalFilter,
    settings: Partial<ReplaySettings> = {}
  ): Promise<string> {
    try {
      // Get historical signals
      const signals = await a2aSignalManager.getSignals(filter, 1000);
      
      if (signals.length === 0) {
        throw new Error('No signals found for the specified filter');
      }

      const sessionId = this.generateSessionId();
      const session: ReplaySession = {
        id: sessionId,
        name,
        signalIds: signals.map(s => s.id).sort((a, b) => a - b),
        status: 'pending',
        createdAt: new Date(),
        settings: {
          speed: settings.speed || 'fast',
          simulateResponses: settings.simulateResponses ?? true,
          includeBreaks: settings.includeBreaks ?? false,
          breakDuration: settings.breakDuration || 1000,
          autoPauseOnErrors: settings.autoPauseOnErrors ?? true,
          outputLogs: settings.outputLogs ?? true
        },
        results: {
          totalSignals: 0,
          successfulSignals: 0,
          failedSignals: 0,
          skippedSignals: 0,
          averageSignalDelay: 0,
          totalDuration: 0,
          errors: [],
          agentResponseStats: {}
        }
      };

      this.activeSessions.set(sessionId, session);
      
      console.log(`🎬 [A2A REPLAY] Session created: ${name} (${signals.length} signals)`);
      return sessionId;
    } catch (error) {
      console.error('❌ [A2A REPLAY] Failed to create replay session:', error);
      throw error;
    }
  }

  /**
   * Start replaying a session
   */
  async startReplay(sessionId: string, playbackControls: PlaybackControls): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Replay session not found: ${sessionId}`);
    }

    if (session.status !== 'pending') {
      throw new Error(`Cannot start session in status: ${session.status}`);
    }

    session.status = 'running';
    session.startedAt = new Date();

    console.log(`▶️ [A2A REPLAY] Starting replay: ${session.name}`);

    try {
      await this.runReplay(session, playbackControls);
    } catch (error) {
      session.status = 'failed';
      console.error(`❌ [A2A REPLAY] Session failed:`, error);
      throw error;
    }
  }

  /**
   * Run the actual replay
   */
  private async runReplay(session: ReplaySession, controls: PlaybackControls): Promise<void> {
    const startTime = Date.now();
    let lastSignalTime = 0;

    for (let i = 0; i < session.signalIds.length; i++) {
      if (session.status === 'paused') {
        await this.waitForResume(session.id, controls);
      }

      if (session.status === 'stopped') {
        console.log(`⏹️ [A2A REPLAY] Session stopped by user`);
        break;
      }

      try {
        const signalId = session.signalIds[i];
        const signal = await this.getSignalById(signalId);
        
        if (!signal) {
          console.warn(`⚠️ [A2A REPLAY] Signal ${signalId} not found, skipping`);
          session.results.skippedSignals++;
          continue;
        }

        const currentTime = Date.now();
        const timeSinceLast = lastSignalTime > 0 ? currentTime - lastSignalTime : 0;
        
        // Apply timing based on speed setting
        const delay = this.calculateDelay(timeSinceLast, session.settings.speed);
        
        if (delay > 0 && session.settings.includeBreaks) {
          await this.sleep(delay);
        }

        await this.replaySignal(signal, session, i);
        
        lastSignalTime = Date.now();
        session.results.successfulSignals++;
        
        // Log progress
        if (session.settings.outputLogs && i % 10 === 0) {
          console.log(`📊 [A2A REPLAY] Progress: ${i + 1}/${session.signalIds.length} signals`);
        }

      } catch (error) {
        session.results.failedSignals++;
        const errorMsg = `Signal ${session.signalIds[i]} failed: ${error}`;
        session.results.errors.push(errorMsg);
        
        console.error(`❌ [A2A REPLAY] ${errorMsg}`);
        
        if (session.settings.autoPauseOnErrors) {
          session.status = 'paused';
          console.log(`⏸️ [A2A REPLAY] Auto-paused due to error`);
          break;
        }
      }
    }

    // Calculate final results
    session.completedAt = new Date();
    session.results.totalDuration = Date.now() - startTime;
    session.results.totalSignals = session.signalIds.length;
    session.results.averageSignalDelay = session.results.totalDuration / session.results.totalSignals;
    
    session.status = 'completed';
    
    console.log(`✅ [A2A REPLAY] Session completed: ${session.name}`);
    console.log(`📊 [A2A REPLAY] Results: ${session.results.successfulSignals}/${session.results.totalSignals} successful`);
  }

  /**
   * Replay a single signal
   */
  private async replaySignal(signal: any, session: ReplaySession, index: number): Promise<void> {
    // Update agent response statistics
    const fromAgent = signal.from_agent;
    if (!session.results.agentResponseStats[fromAgent]) {
      session.results.agentResponseStats[fromAgent] = {
        calls: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0
      };
    }

    const agentStats = session.results.agentResponseStats[fromAgent];
    agentStats.calls++;

    // Log the replayed signal
    console.log(`🎬 [A2A REPLAY] ${index + 1}/${session.signalIds.length} Replaying: ${signal.signal_type} from ${fromAgent} → ${signal.to_agent || 'BROADCAST'}`);

    // Simulate agent responses if enabled
    if (session.settings.simulateResponses && signal.signal_type === 'CALL_AGENT') {
      const simulatedDelay = this.simulateAgentResponse(signal);
      agentStats.avgResponseTime = (agentStats.avgResponseTime + simulatedDelay) / 2;
      
      // Update signal as completed
      await a2aSignalManager.updateSignalStatus(signal.id, 'replayed', `Simulated response in ${simulatedDelay}ms`);
    }

    // Apply any signal-specific processing
    await this.processSignalReplay(signal, session);
  }

  /**
   * Calculate delay based on speed setting
   */
  private calculateDelay(actualDelay: number, speed: string): number {
    switch (speed) {
      case 'realtime':
        return Math.max(actualDelay, 100); // Minimum 100ms
      case 'fast':
        return Math.min(actualDelay / 10, 50); // 10x faster, max 50ms
      case 'superfast':
        return Math.min(actualDelay / 100, 5); // 100x faster, max 5ms
      default:
        return 10;
    }
  }

  /**
   * Wait for session to be resumed
   */
  private async waitForResume(sessionId: string, controls: PlaybackControls): Promise<void> {
    return new Promise((resolve) => {
      const checkResume = () => {
        const session = this.activeSessions.get(sessionId);
        if (session?.status === 'running') {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get signal by ID
   */
  private async getSignalById(signalId: number): Promise<any> {
    const signals = await a2aSignalManager.getSignals({ 
      status: ['all'], // This would need to be implemented to get specific signal by ID
    }, 1000);
    
    return signals.find(s => s.id === signalId);
  }

  /**
   * Simulate agent response time
   */
  private simulateAgentResponse(signal: any): number {
    const baseTime = 100; // Base 100ms
    const randomVariance = Math.random() * 200; // ±100ms variance
    const complexityFactor = JSON.stringify(signal.content || {}).length / 100; // Factor by content size
    
    return Math.round(baseTime + randomVariance + complexityFactor);
  }

  /**
   * Process signal replay logic
   */
  private async processSignalReplay(signal: any, session: ReplaySession): Promise<void> {
    // Here you can add custom replay processing logic
    // For example, calling actual agents, generating reports, etc.
    
    if (signal.priority === 'critical' && signal.status === 'failed') {
      console.log(`🚨 [A2A REPLAY] Critical failed signal detected: ${signal.signal_type}`);
      // Could trigger alerts, notifications, etc.
    }
  }

  /**
   * Get session status
   */
  getSession(sessionId: string): ReplaySession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): ReplaySession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Generate replay report
   */
  generateReplayReport(sessionId: string): string {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return 'Session not found';
    }

    const results = session.results;
    const successRate = ((results.successfulSignals / results.totalSignals) * 100).toFixed(1);
    
    return `
# A2A Signal Replay Report

## Session Information
- **Session ID**: ${session.id}
- **Name**: ${session.name}
- **Status**: ${session.status}
- **Created**: ${session.createdAt.toISOString()}
- **Completed**: ${session.completedAt?.toISOString() || 'In Progress'}

## Replay Results
- **Total Signals**: ${results.totalSignals}
- **Successful**: ${results.successfulSignals}
- **Failed**: ${results.failedSignals}
- **Skipped**: ${results.skippedSignals}
- **Success Rate**: ${successRate}%
- **Total Duration**: ${(results.totalDuration / 1000).toFixed(2)}s
- **Average Signal Delay**: ${results.averageSignalDelay.toFixed(2)}ms

## Settings
- **Speed**: ${session.settings.speed}
- **Simulate Responses**: ${session.settings.simulateResponses}
- **Include Breaks**: ${session.settings.includeBreaks}
- **Auto-pause on Errors**: ${session.settings.autoPauseOnErrors}

## Agent Response Statistics
${Object.entries(results.agentResponseStats).map(([agent, stats]) => 
  `- **${agent}**: ${stats.calls} calls, ${stats.successes} successes, ${stats.failures} failures, ${stats.avgResponseTime.toFixed(2)}ms avg`
).join('\n')}

## Errors
${results.errors.length > 0 ? results.errors.map(err => `- ${err}`).join('\n') : 'No errors recorded'}
`;
  }

  /**
   * Export session data
   */
  async exportSessionData(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      session: session,
      report: this.generateReplayReport(sessionId),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Clean up completed sessions
   */
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const age = now - session.createdAt.getTime();
      if (age > maxAge && session.status === 'completed') {
        toDelete.push(sessionId);
      }
    });

    toDelete.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });

    if (toDelete.length > 0) {
      console.log(`🧹 [A2A REPLAY] Cleaned up ${toDelete.length} old sessions`);
    }
  }
}

// Export singleton instance
export const a2aSignalReplaySystem = A2ASignalReplaySystem.getInstance();