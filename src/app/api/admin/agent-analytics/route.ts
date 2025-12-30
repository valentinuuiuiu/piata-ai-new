import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { a2aSignalManager } from '@/lib/a2a/signal-manager';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    const timeframe = searchParams.get('timeframe') || '24h';

    if (!agentName) {
      // Get overall agent analytics
      const analytics = await getOverallAgentAnalytics(supabase, timeframe);
      return NextResponse.json(analytics);
    }

    // Get specific agent analytics
    const agentAnalytics = await getAgentSpecificAnalytics(supabase, agentName, timeframe);
    return NextResponse.json(agentAnalytics);

  } catch (error: any) {
    console.error('Error in agent analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent analytics', details: error.message },
      { status: 500 }
    );
  }
}

async function getOverallAgentAnalytics(supabase: any, timeframe: string) {
  const hoursAgo = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720; // 30d
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

  // Get all agents from registry
  const { data: agents } = await supabase
    .from('agent_registry')
    .select('*');

  // Get performance metrics for all agents
  const metrics = [];
  for (const agent of agents || []) {
    try {
      const agentMetrics = await a2aSignalManager.getAgentPerformance(agent.agent_name, '5m');

      // Get interaction stats
      const { count: totalInteractions } = await supabase
        .from('agent_learning_history')
        .select('*', { count: 'exact', head: true })
        .eq('from_agent', agent.agent_name)
        .gte('created_at', since);

      const { count: successfulInteractions } = await supabase
        .from('agent_learning_history')
        .select('*', { count: 'exact', head: true })
        .eq('from_agent', agent.agent_name)
        .eq('outcome', 'success')
        .gte('created_at', since);

      const successRate = totalInteractions > 0 ? (successfulInteractions / totalInteractions) * 100 : 0;

      metrics.push({
        agentName: agent.agent_name,
        status: agent.status,
        totalInteractions,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: calculateAverageResponseTime(agentMetrics),
        lastSeen: agent.last_heartbeat
      });
    } catch (error) {
      console.error(`Error getting metrics for ${agent.agent_name}:`, error);
    }
  }

  return {
    timeframe,
    totalAgents: agents?.length || 0,
    agentsOnline: agents?.filter(a => a.status === 'online').length || 0,
    agents: metrics,
    summary: {
      averageSuccessRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length,
      totalInteractions: metrics.reduce((sum, m) => sum + m.totalInteractions, 0)
    }
  };
}

async function getAgentSpecificAnalytics(supabase: any, agentName: string, timeframe: string) {
  const hoursAgo = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

  // Get agent info
  const { data: agent } = await supabase
    .from('agent_registry')
    .select('*')
    .eq('agent_name', agentName)
    .single();

  // Get performance metrics
  const performanceMetrics = await a2aSignalManager.getAgentPerformance(agentName, '5m');

  // Get interaction history
  const { data: interactions } = await supabase
    .from('agent_learning_history')
    .select('*')
    .eq('from_agent', agentName)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(50);

  // Calculate stats
  const totalInteractions = interactions?.length || 0;
  const successfulInteractions = interactions?.filter(i => i.outcome === 'success').length || 0;
  const failedInteractions = interactions?.filter(i => i.outcome === 'failure').length || 0;

  // Response time analysis
  const responseTimes = interactions?.filter(i => i.duration).map(i => i.duration) || [];
  const avgResponseTime = responseTimes.length > 0 ?
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;

  // Interaction types breakdown
  const interactionTypes = {};
  interactions?.forEach(i => {
    interactionTypes[i.interaction_type] = (interactionTypes[i.interaction_type] || 0) + 1;
  });

  // Performance over time (last 24 hours, hourly breakdown)
  const hourlyStats = await getHourlyStats(supabase, agentName, since);

  return {
    agent: agent || null,
    timeframe,
    stats: {
      totalInteractions,
      successfulInteractions,
      failedInteractions,
      successRate: totalInteractions > 0 ? Math.round((successfulInteractions / totalInteractions) * 100) : 0,
      averageResponseTime: Math.round(avgResponseTime),
      interactionTypes
    },
    performanceMetrics,
    interactions: interactions?.slice(0, 10), // Last 10 interactions
    hourlyStats
  };
}

async function getHourlyStats(supabase: any, agentName: string, since: string) {
  const stats = [];

  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(Date.now() - i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const { count: interactions } = await supabase
      .from('agent_learning_history')
      .select('*', { count: 'exact', head: true })
      .eq('from_agent', agentName)
      .gte('created_at', hourStart.toISOString())
      .lt('created_at', hourEnd.toISOString());

    const { count: successes } = await supabase
      .from('agent_learning_history')
      .select('*', { count: 'exact', head: true })
      .eq('from_agent', agentName)
      .eq('outcome', 'success')
      .gte('created_at', hourStart.toISOString())
      .lt('created_at', hourEnd.toISOString());

    stats.push({
      hour: hourStart.getHours(),
      interactions,
      successes,
      successRate: interactions > 0 ? Math.round((successes / interactions) * 100) : 0
    });
  }

  return stats;
}

function calculateAverageResponseTime(metrics: any[]): number {
  if (!metrics || metrics.length === 0) return 0;

  const responseTimeMetrics = metrics.filter(m => m.metric_type === 'response_time');
  if (responseTimeMetrics.length === 0) return 0;

  const total = responseTimeMetrics.reduce((sum, m) => sum + parseFloat(m.metric_value), 0);
  return total / responseTimeMetrics.length;
}