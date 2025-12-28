import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator } from '@/lib/ai-orchestrator';

/**
 * Check Agents Health Cron Job
 * Called by Vercel Cron at 9 AM daily
 *
 * Verifies all agents are working properly
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron request');
    }

    console.log('[CRON] Checking agent health...');

    const orchestrator = new AIOrchestrator();
    const agents = orchestrator.getAllAgents();
    
    const healthChecks = await Promise.all(
      agents.map(async (agent) => {
        try {
          const result = await agent.run({
            id: `health-check-${Date.now()}`,
            type: agent.capabilities[0],
            goal: 'Respond with "OK" if you are working',
            context: { healthCheck: true }
          });

          return {
            name: agent.name,
            status: result.status === 'success' ? 'healthy' : 'unhealthy',
            capabilities: agent.capabilities,
            error: result.error
          };
        } catch (error: any) {
          return {
            name: agent.name,
            status: 'error',
            capabilities: agent.capabilities,
            error: error.message
          };
        }
      })
    );

    const healthyCount = healthChecks.filter(a => a.status === 'healthy').length;
    
    console.log(`[CRON] Agent health: ${healthyCount}/${agents.length} healthy`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalAgents: agents.length,
      healthyAgents: healthyCount,
      agents: healthChecks
    });

  } catch (error: any) {
    console.error('[CRON] Health check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
