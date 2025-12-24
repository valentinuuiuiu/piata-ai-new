/**
 * A2A Performance Dashboard
 * Real-time agent performance monitoring and analytics
 */

import { a2aSignalManager } from './signal-manager';
import { PerformanceMetrics } from './signal-manager';

export interface DashboardMetrics {
  agentName: string;
  metrics: {
    responseTime: {
      current: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
      percentile_95: number;
      percentile_99: number;
    };
    successRate: {
      current: number;
      average: number;
      trend: 'up' | 'down' | 'stable';
      totalCalls: number;
      successfulCalls: number;
    };
    throughput: {
      current: number;
      average: number;
      peak: number;
      total: number;
    };
    errorRate: {
      current: number;
      average: number;
      totalErrors: number;
      errorTypes: Record<string, number>;
    };
    systemHealth: {
      status: 'healthy' | 'degraded' | 'critical' | 'offline';
      cpuUsage: number;
      memoryUsage: number;
      lastSeen: Date;
      uptime: number;
    };
  };
  lastUpdated: Date;
}

export interface PerformanceAlert {
  id: string;
  agentName: string;
  alertType: 'response_time' | 'success_rate' | 'error_rate' | 'system_health';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface DashboardConfig {
  refreshInterval: number;
  alertThresholds: {
    responseTime: { warning: number; critical: number };
    successRate: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
    cpuUsage: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
  };
  retentionPeriod: {
    metrics: number; // hours
    alerts: number; // days
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: string[];
  };
}

export class A2APerformanceDashboard {
  private static instance: A2APerformanceDashboard;
  private config: DashboardConfig;
  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private metricsHistory: Map<string, DashboardMetrics[]> = new Map();
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor(config?: Partial<DashboardConfig>) {
    this.config = {
      refreshInterval: 5000, // 5 seconds
      alertThresholds: {
        responseTime: { warning: 1000, critical: 3000 },
        successRate: { warning: 0.8, critical: 0.6 },
        errorRate: { warning: 0.1, critical: 0.2 },
        cpuUsage: { warning: 70, critical: 90 },
        memoryUsage: { warning: 80, critical: 95 }
      },
      retentionPeriod: {
        metrics: 24, // 24 hours
        alerts: 7 // 7 days
      },
      notifications: {
        email: true,
        slack: false,
        webhook: []
      },
      ...config
    };
  }

  static getInstance(config?: Partial<DashboardConfig>): A2APerformanceDashboard {
    if (!A2APerformanceDashboard.instance) {
      A2APerformanceDashboard.instance = new A2APerformanceDashboard(config);
    }
    return A2APerformanceDashboard.instance;
  }

  /**
   * Start the performance dashboard monitoring
   */
  start(): void {
    console.log('📊 [A2A DASHBOARD] Starting performance monitoring...');
    
    // Initial data collection
    this.collectMetrics();
    
    // Set up periodic refresh
    this.refreshTimer = setInterval(() => {
      this.collectMetrics();
      this.processAlerts();
      this.cleanupOldData();
    }, this.config.refreshInterval);
  }

  /**
   * Stop the performance dashboard monitoring
   */
  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    console.log('📊 [A2A DASHBOARD] Performance monitoring stopped');
  }

  /**
   * Collect performance metrics from all agents
   */
  private async collectMetrics(): Promise<void> {
    try {
      const agents = await a2aSignalManager.getRegisteredAgents();
      
      for (const agent of agents) {
        const metrics = await this.getAgentMetrics(agent.agent_name);
        if (metrics) {
          this.updateMetricsHistory(agent.agent_name, metrics);
          await this.recordMetrics(metrics);
        }
      }

      console.log(`📊 [A2A DASHBOARD] Metrics collected for ${agents.length} agents`);
    } catch (error) {
      console.error('❌ [A2A DASHBOARD] Failed to collect metrics:', error);
    }
  }

  /**
   * Get comprehensive metrics for an agent
   */
  private async getAgentMetrics(agentName: string): Promise<DashboardMetrics | null> {
    try {
      const recentSignals = await a2aSignalManager.getSignals({
        agents: [agentName],
        timeRange: {
          from: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          to: new Date()
        }
      }, 1000);

      if (recentSignals.length === 0) {
        return this.createEmptyMetrics(agentName);
      }

      // Calculate response time metrics
      const responseTimes = recentSignals
        .filter(s => s.processed_at && s.created_at)
        .map(s => new Date(s.processed_at!).getTime() - new Date(s.created_at).getTime());

      const responseTimeMetrics = this.calculateResponseTimeMetrics(responseTimes);

      // Calculate success rate
      const successfulSignals = recentSignals.filter(s => s.status === 'completed').length;
      const totalSignals = recentSignals.length;
      const successRate = totalSignals > 0 ? successfulSignals / totalSignals : 0;

      // Calculate error metrics
      const errorSignals = recentSignals.filter(s => s.status === 'failed');
      const errorRate = totalSignals > 0 ? errorSignals.length / totalSignals : 0;

      // Calculate throughput (signals per minute)
      const timeRange = 5 * 60 * 1000; // 5 minutes
      const throughput = (totalSignals / timeRange) * 60 * 1000;

      // Get agent health status
      const healthStatus = await a2aSignalManager.getAgentHealth(agentName);

      const metrics: DashboardMetrics = {
        agentName,
        metrics: {
          responseTime: responseTimeMetrics,
          successRate: {
            current: successRate,
            average: await this.calculateAgentAverage(agentName, 'success_rate'),
            trend: this.calculateTrend(agentName, 'success_rate'),
            totalCalls: totalSignals,
            successfulCalls: successfulSignals
          },
          throughput: {
            current: throughput,
            average: await this.calculateAgentAverage(agentName, 'throughput'),
            peak: await this.calculateAgentPeak(agentName, 'throughput'),
            total: totalSignals
          },
          errorRate: {
            current: errorRate,
            average: await this.calculateAgentAverage(agentName, 'error_rate'),
            totalErrors: errorSignals.length,
            errorTypes: this.categorizeErrors(errorSignals)
          },
          systemHealth: {
            status: this.calculateSystemHealth(healthStatus, errorRate),
            cpuUsage: await this.getCpuUsage(agentName),
            memoryUsage: await this.getMemoryUsage(agentName),
            lastSeen: healthStatus?.last_heartbeat ? new Date(healthStatus.last_heartbeat) : new Date(),
            uptime: await this.calculateUptime(agentName)
          }
        },
        lastUpdated: new Date()
      };

      return metrics;
    } catch (error) {
      console.error(`❌ [A2A DASHBOARD] Failed to get metrics for ${agentName}:`, error);
      return null;
    }
  }

  /**
   * Calculate response time metrics
   */
  private calculateResponseTimeMetrics(responseTimes: number[]): {
    current: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    percentile_95: number;
    percentile_99: number;
  } {
    if (responseTimes.length === 0) {
      return {
        current: 0,
        average: 0,
        trend: 'stable',
        percentile_95: 0,
        percentile_99: 0
      };
    }

    const sorted = responseTimes.sort((a, b) => a - b);
    const current = sorted[sorted.length - 1]; // Most recent
    const average = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const percentile_95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const percentile_99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    // Calculate trend (simplified - compare current to average)
    const trend = current > average * 1.2 ? 'up' : current < average * 0.8 ? 'down' : 'stable';

    return {
      current,
      average,
      trend,
      percentile_95,
      percentile_99
    };
  }

  /**
   * Create empty metrics for offline agents
   */
  private createEmptyMetrics(agentName: string): DashboardMetrics {
    return {
      agentName,
      metrics: {
        responseTime: {
          current: 0,
          average: 0,
          trend: 'stable',
          percentile_95: 0,
          percentile_99: 0
        },
        successRate: {
          current: 0,
          average: 0,
          trend: 'stable',
          totalCalls: 0,
          successfulCalls: 0
        },
        throughput: {
          current: 0,
          average: 0,
          peak: 0,
          total: 0
        },
        errorRate: {
          current: 0,
          average: 0,
          totalErrors: 0,
          errorTypes: {}
        },
        systemHealth: {
          status: 'offline',
          cpuUsage: 0,
          memoryUsage: 0,
          lastSeen: new Date(),
          uptime: 0
        }
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Process alerts based on current metrics
   */
  private async processAlerts(): Promise<void> {
    for (const [agentName, metricsList] of this.metricsHistory.entries()) {
      const currentMetrics = metricsList[metricsList.length - 1];
      if (!currentMetrics) continue;

      const alerts = this.checkAlertThresholds(currentMetrics);
      
      for (const alert of alerts) {
        await this.handleAlert(alert);
      }
    }
  }

  /**
   * Check if any metrics exceed alert thresholds
   */
  private checkAlertThresholds(metrics: DashboardMetrics): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const thresholds = this.config.alertThresholds;

    // Response time alerts
    if (metrics.metrics.responseTime.current > thresholds.responseTime.critical) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'response_time',
        'critical',
        `Critical response time: ${metrics.metrics.responseTime.current}ms`,
        thresholds.responseTime.critical,
        metrics.metrics.responseTime.current
      ));
    } else if (metrics.metrics.responseTime.current > thresholds.responseTime.warning) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'response_time',
        'warning',
        `High response time: ${metrics.metrics.responseTime.current}ms`,
        thresholds.responseTime.warning,
        metrics.metrics.responseTime.current
      ));
    }

    // Success rate alerts
    if (metrics.metrics.successRate.current < thresholds.successRate.critical) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'success_rate',
        'critical',
        `Critical success rate: ${(metrics.metrics.successRate.current * 100).toFixed(1)}%`,
        thresholds.successRate.critical,
        metrics.metrics.successRate.current
      ));
    } else if (metrics.metrics.successRate.current < thresholds.successRate.warning) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'success_rate',
        'warning',
        `Low success rate: ${(metrics.metrics.successRate.current * 100).toFixed(1)}%`,
        thresholds.successRate.warning,
        metrics.metrics.successRate.current
      ));
    }

    // Error rate alerts
    if (metrics.metrics.errorRate.current > thresholds.errorRate.critical) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'error_rate',
        'critical',
        `Critical error rate: ${(metrics.metrics.errorRate.current * 100).toFixed(1)}%`,
        thresholds.errorRate.critical,
        metrics.metrics.errorRate.current
      ));
    } else if (metrics.metrics.errorRate.current > thresholds.errorRate.warning) {
      alerts.push(this.createAlert(
        metrics.agentName,
        'error_rate',
        'warning',
        `High error rate: ${(metrics.metrics.errorRate.current * 100).toFixed(1)}%`,
        thresholds.errorRate.warning,
        metrics.metrics.errorRate.current
      ));
    }

    // System health alerts
    if (metrics.metrics.systemHealth.status === 'offline') {
      alerts.push(this.createAlert(
        metrics.agentName,
        'system_health',
        'critical',
        'Agent is offline',
        0,
        0
      ));
    }

    return alerts;
  }

  /**
   * Create an alert
   */
  private createAlert(
    agentName: string,
    alertType: PerformanceAlert['alertType'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    currentValue: number
  ): PerformanceAlert {
    return {
      id: `${agentName}_${alertType}_${Date.now()}`,
      agentName,
      alertType,
      severity,
      message,
      threshold,
      currentValue,
      triggeredAt: new Date(),
      acknowledged: false
    };
  }

  /**
   * Handle an alert (send notifications, log, etc.)
   */
  private async handleAlert(alert: PerformanceAlert): Promise<void> {
    // Check if this alert is already active
    if (this.activeAlerts.has(alert.id)) {
      return;
    }

    this.activeAlerts.set(alert.id, alert);

    console.log(`🚨 [A2A DASHBOARD] ALERT: ${alert.agentName} - ${alert.message}`);

    // Send notifications based on configuration
    if (this.config.notifications.email) {
      await this.sendEmailNotification(alert);
    }

    if (this.config.notifications.slack) {
      await this.sendSlackNotification(alert);
    }

    for (const webhook of this.config.notifications.webhook) {
      await this.sendWebhookNotification(alert, webhook);
    }
  }

  /**
   * Update metrics history for an agent
   */
  private updateMetricsHistory(agentName: string, metrics: DashboardMetrics): void {
    if (!this.metricsHistory.has(agentName)) {
      this.metricsHistory.set(agentName, []);
    }

    const history = this.metricsHistory.get(agentName)!;
    history.push(metrics);

    // Keep only recent metrics based on retention period
    const cutoff = new Date(Date.now() - this.config.retentionPeriod.metrics * 60 * 60 * 1000);
    while (history.length > 0 && history[0].lastUpdated < cutoff) {
      history.shift();
    }
  }

  /**
   * Calculate trend for a metric
   */
  private calculateTrend(agentName: string, metricType: string): 'up' | 'down' | 'stable' {
    const history = this.metricsHistory.get(agentName);
    if (!history || history.length < 3) {
      return 'stable';
    }

    const recent = history.slice(-3);
    const values = this.extractMetricValues(recent, metricType);

    if (values.length < 2) return 'stable';

    const trend = values[values.length - 1] - values[values.length - 2];
    const threshold = values[values.length - 2] * 0.1; // 10% change

    if (trend > threshold) return 'up';
    if (trend < -threshold) return 'down';
    return 'stable';
  }

  /**
   * Extract metric values from history
   */
  private extractMetricValues(history: DashboardMetrics[], metricType: string): number[] {
    return history.map(m => {
      switch (metricType) {
        case 'response_time': return m.metrics.responseTime.current;
        case 'success_rate': return m.metrics.successRate.current;
        case 'error_rate': return m.metrics.errorRate.current;
        case 'throughput': return m.metrics.throughput.current;
        default: return 0;
      }
    });
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): {
    agents: Record<string, DashboardMetrics>;
    activeAlerts: PerformanceAlert[];
    summary: {
      totalAgents: number;
      healthyAgents: number;
      activeAlerts: number;
      criticalAlerts: number;
    };
  } {
    const agents: Record<string, DashboardMetrics> = {};
    const activeAlerts = Array.from(this.activeAlerts.values());

    for (const [agentName, history] of this.metricsHistory.entries()) {
      const latestMetrics = history[history.length - 1];
      if (latestMetrics) {
        agents[agentName] = latestMetrics;
      }
    }

    const summary = {
      totalAgents: Object.keys(agents).length,
      healthyAgents: Object.values(agents).filter(a => a.metrics.systemHealth.status === 'healthy').length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length
    };

    return { agents, activeAlerts, summary };
  }

  /**
   * Get metrics for a specific agent
   */
  getAgentMetricsHistory(agentName: string, timeRange: string = '1h'): DashboardMetrics[] {
    const history = this.metricsHistory.get(agentName) || [];
    
    // Apply time range filter
    const now = new Date();
    const cutoff = new Date();
    
    switch (timeRange) {
      case '1h':
        cutoff.setHours(now.getHours() - 1);
        break;
      case '6h':
        cutoff.setHours(now.getHours() - 6);
        break;
      case '24h':
        cutoff.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      default:
        cutoff.setHours(now.getHours() - 1);
    }

    return history.filter(m => m.lastUpdated >= cutoff);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, user: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log(`✅ [A2A DASHBOARD] Alert ${alertId} acknowledged by ${user}`);
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, user: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      this.activeAlerts.delete(alertId);
      console.log(`✅ [A2A DASHBOARD] Alert ${alertId} resolved by ${user}`);
      return true;
    }
    return false;
  }

  // Helper methods (simplified implementations)

  private calculateAgentAverage(agentName: string, metricType: string): Promise<number> {
    return Promise.resolve(0); // Simplified
  }

  private calculateAgentPeak(agentName: string, metricType: string): Promise<number> {
    return Promise.resolve(0); // Simplified
  }

  private categorizeErrors(errorSignals: any[]): Record<string, number> {
    const categories: Record<string, number> = {};
    errorSignals.forEach(signal => {
      const errorType = signal.error_message || 'unknown';
      categories[errorType] = (categories[errorType] || 0) + 1;
    });
    return categories;
  }

  private calculateSystemHealth(healthStatus: any, errorRate: number): 'healthy' | 'degraded' | 'critical' | 'offline' {
    if (!healthStatus) return 'offline';
    if (errorRate > 0.2) return 'critical';
    if (errorRate > 0.1) return 'degraded';
    return 'healthy';
  }

  private async getCpuUsage(agentName: string): Promise<number> {
    return Math.random() * 100; // Simulated
  }

  private async getMemoryUsage(agentName: string): Promise<number> {
    return Math.random() * 100; // Simulated
  }

  private async calculateUptime(agentName: string): Promise<number> {
    return Math.random() * 100; // Simulated
  }

  private async recordMetrics(metrics: DashboardMetrics): Promise<void> {
    await a2aSignalManager.recordPerformanceMetrics({
      agentName: metrics.agentName,
      metricType: 'dashboard_response_time',
      value: metrics.metrics.responseTime.current,
      timeWindow: '5m'
    });
  }

  private async sendEmailNotification(alert: PerformanceAlert): Promise<void> {
    console.log(`📧 [A2A DASHBOARD] Email notification: ${alert.message}`);
  }

  private async sendSlackNotification(alert: PerformanceAlert): Promise<void> {
    console.log(`💬 [A2A DASHBOARD] Slack notification: ${alert.message}`);
  }

  private async sendWebhookNotification(alert: PerformanceAlert, webhook: string): Promise<void> {
    console.log(`🔗 [A2A DASHBOARD] Webhook notification to ${webhook}: ${alert.message}`);
  }

  private cleanupOldData(): void {
    // Cleanup old metrics and alerts based on retention periods
    const now = new Date();
    const metricsCutoff = new Date(now.getTime() - this.config.retentionPeriod.metrics * 60 * 60 * 1000);
    const alertsCutoff = new Date(now.getTime() - this.config.retentionPeriod.alerts * 24 * 60 * 60 * 1000);

    // Clean up metrics history
    for (const [agentName, history] of this.metricsHistory.entries()) {
      while (history.length > 0 && history[0].lastUpdated < metricsCutoff) {
        history.shift();
      }
      if (history.length === 0) {
        this.metricsHistory.delete(agentName);
      }
    }

    // Clean up old alerts
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.triggeredAt < alertsCutoff) {
        this.activeAlerts.delete(alertId);
      }
    }
  }
}

// Export singleton instance
export const a2aPerformanceDashboard = A2APerformanceDashboard.getInstance();