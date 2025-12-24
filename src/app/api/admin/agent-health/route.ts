/**
 * 📊 Agent Health API Endpoint
 * Returns health status of all registered agents.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { agentRegistry, agentPerformanceMetrics } from '@/lib/drizzle/a2a-schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all registered agents
    const agents = await db.select()
      .from(agentRegistry)
      .orderBy(desc(agentRegistry.lastHeartbeat));

    const agentHealthList = [];

    for (const agent of agents) {
      // Get recent metrics
      const metrics = await db.select()
        .from(agentPerformanceMetrics)
        .where(eq(agentPerformanceMetrics.agentName, agent.agentName))
        .orderBy(desc(agentPerformanceMetrics.timestamp))
        .limit(20);

      const successMetrics = metrics.filter(m => m.metricType === 'success_rate');
      const timeMetrics = metrics.filter(m => m.metricType === 'response_time');

      const successRate = successMetrics.length > 0
        ? successMetrics.reduce((sum, m) => sum + parseFloat(m.metricValue), 0) / successMetrics.length
        : 1.0;

      const avgResponseTime = timeMetrics.length > 0
        ? timeMetrics.reduce((sum, m) => sum + parseFloat(m.metricValue), 0) / timeMetrics.length
        : 0;

      const tasksCompleted = successMetrics.length;
      const tasksFailed = metrics.filter(m => m.metricType === 'tool_execution_errors').length;

      // Determine status based on success rate
      let status: 'healthy' | 'degraded' | 'down';
      if (successRate > 0.9) {
        status = 'healthy';
      } else if (successRate > 0.7) {
        status = 'degraded';
      } else {
        status = 'down';
      }

      agentHealthList.push({
        name: agent.agentName,
        status,
        lastHeartbeat: agent.lastHeartbeat,
        metrics: {
          successRate,
          avgResponseTime,
          tasksCompleted,
          tasksFailed
        }
      });
    }

    return NextResponse.json(agentHealthList);

  } catch (error) {
    console.error('Error fetching agent health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent health' },
      { status: 500 }
    );
  }
}