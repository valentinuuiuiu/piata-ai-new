/**
 * 📈 Agent Statistics API Endpoint
 * Returns aggregated task statistics for all agents.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { agentLearningHistory, agentPerformanceMetrics } from '@/lib/drizzle/a2a-schema';
import { desc, gte, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get total tasks from learning history (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentTasks = await db.select()
      .from(agentLearningHistory)
      .where(gte(agentLearningHistory.createdAt, yesterday));

    // Calculate success rate
    const totalTasks = recentTasks.length;
    const successfulTasks = recentTasks.filter(t => t.outcome === 'success').length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 1.0;

    // Calculate average duration
    const tasksWithDuration = recentTasks.filter(t => t.duration !== null);
    const avgDuration = tasksWithDuration.length > 0
      ? tasksWithDuration.reduce((sum, t) => sum + (t.duration || 0), 0) / tasksWithDuration.length
      : 0;

    // Calculate agent distribution
    const agentDistribution: Record<string, number> = {};
    for (const task of recentTasks) {
      const agent = task.toAgent || 'unknown';
      agentDistribution[agent] = (agentDistribution[agent] || 0) + 1;
    }

    // Get historical metrics
    const metrics = await db.select()
      .from(agentPerformanceMetrics)
      .orderBy(desc(agentPerformanceMetrics.timestamp))
      .limit(100);

    // Count success/failure from metrics
    const successMetrics = metrics.filter(m => m.metricType === 'success_rate');
    const failureMetrics = metrics.filter(m => m.metricType === 'tool_execution_errors');
    
    const historicalTotal = successMetrics.length + failureMetrics.length;
    const historicalSuccesses = successMetrics.length;

    return NextResponse.json({
      totalTasks: historicalTotal || totalTasks,
      successRate: historicalTotal > 0 ? historicalSuccesses / historicalTotal : successRate,
      avgDuration,
      agentDistribution
    });

  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent stats' },
      { status: 500 }
    );
  }
}