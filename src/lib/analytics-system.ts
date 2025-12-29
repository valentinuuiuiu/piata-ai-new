/**
 * Comprehensive Analytics and Performance Monitoring System
 * Handles real-time tracking, alerts, and reporting for all marketing channels.
 */

import { createServiceClient } from './supabase/server';
import { a2aSignalManager } from './a2a/signal-manager';

export interface AnalyticsEvent {
  eventType: 'click' | 'view' | 'conversion' | 'open' | 'share' | 'referral';
  channel: 'email' | 'facebook' | 'instagram' | 'tiktok' | 'seo' | 'referral' | 'direct';
  campaignId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  metricName: string;
  channel?: string;
  currentValue: number;
  threshold: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export class AnalyticsSystem {
  private static instance: AnalyticsSystem;

  private constructor() {}

  static getInstance(): AnalyticsSystem {
    if (!AnalyticsSystem.instance) {
      AnalyticsSystem.instance = new AnalyticsSystem();
    }
    return AnalyticsSystem.instance;
  }

  private getSupabase() {
    return createServiceClient();
  }

  /**
   * Track a marketing event in real-time
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase.rpc('track_marketing_event', {
        p_event_type: event.eventType,
        p_channel: event.channel,
        p_campaign_id: event.campaignId,
        p_user_id: event.userId,
        p_metadata: {
          ...event.metadata,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          language: typeof window !== 'undefined' ? window.navigator.language : 'ro-RO'
        }
      });

      if (error) throw error;

      // Check for alerts after tracking
      await this.checkAlerts(event);

      console.log(`📊 [ANALYTICS] Event tracked: ${event.eventType} on ${event.channel}`);
    } catch (error) {
      console.error('❌ [ANALYTICS] Failed to track event:', error);
    }
  }

  /**
   * Check if the event triggers any performance alerts
   */
  private async checkAlerts(event: AnalyticsEvent): Promise<void> {
    // In a real implementation, this would query performance_alerts_config
    // and compare with aggregated stats. For now, we'll implement basic logic.
    
    if (event.eventType === 'conversion' && event.metadata?.revenue > 1000) {
      await this.triggerAlert({
        metricName: 'high_value_conversion',
        channel: event.channel,
        currentValue: event.metadata.revenue,
        threshold: 1000,
        message: `High value conversion detected on ${event.channel}: €${event.metadata.revenue}`,
        severity: 'info'
      });
    }
  }

  /**
   * Trigger a performance alert
   */
  async triggerAlert(alert: PerformanceAlert): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from('performance_alerts_history').insert({
        alert_type: alert.metricName,
        message: alert.message,
        current_value: alert.currentValue,
        status: 'active'
      });

      if (error) throw error;

      // Notify via A2A Signal Manager for real-time agent reaction
      await a2aSignalManager.broadcastEnhanced(
        'PERFORMANCE_ALERT',
        {
          sender: 'AnalyticsSystem',
          receiver: 'MarketingOrchestrator',
          payload: alert
        },
        'AnalyticsSystem',
        alert.severity === 'critical' ? 'high' : 'medium'
      );

      console.log(`🚨 [ANALYTICS] Alert triggered: ${alert.message}`);
    } catch (error) {
      console.error('❌ [ANALYTICS] Failed to trigger alert:', error);
    }
  }

  /**
   * Get real-time dashboard data
   */
  async getDashboardData(timeframe: string = '24h') {
    try {
      const supabase = this.getSupabase();
      const { data: stats, error: statsError } = await supabase
        .from('realtime_marketing_stats')
        .select('*');

      if (statsError) throw statsError;

      const { data: geo, error: geoError } = await supabase
        .from('geographic_performance')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);

      if (geoError) throw geoError;

      const { data: roi, error: roiError } = await supabase
        .from('marketing_roi')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (roiError) throw roiError;

      return {
        stats,
        geographic: geo,
        roi,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [ANALYTICS] Failed to fetch dashboard data:', error);
      return null;
    }
  }

  /**
   * Calculate ROI and optimize budget
   */
  async optimizeBudget(): Promise<any> {
    const supabase = this.getSupabase();
    const { data: roiData } = await supabase
      .from('marketing_roi')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0]);

    if (!roiData || roiData.length === 0) return null;

    // Simple optimization: find channels with ROI > 2 and suggest budget increase
    const recommendations = roiData.map(item => ({
      channel: item.channel,
      currentRoi: item.roi,
      recommendation: item.roi > 2 ? 'INCREASE_BUDGET' : item.roi < 0.5 ? 'DECREASE_BUDGET' : 'MAINTAIN'
    }));

    return recommendations;
  }

  /**
   * A/B Testing Framework: Get variation for a user
   */
  getABTestVariation(testName: string, userId: string): string {
    // Simple deterministic hash-based variation assignment
    const hash = Array.from(testName + userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 2 === 0 ? 'A' : 'B';
  }
}

export const analyticsSystem = AnalyticsSystem.getInstance();
