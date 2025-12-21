import { AIOrchestrator } from '@/lib/ai-orchestrator';

interface AgentHealthStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'error';
  capabilities: string[];
  error?: string;
}

/**
 * Performs a health check on all registered AI agents.
 */
export async function checkAgentHealth(): Promise<{ success: boolean; totalAgents: number; healthyAgents: number; agents: AgentHealthStatus[]; error?: string }> {
  try {
    console.log('Starting agent health check task...');

    const orchestrator = new AIOrchestrator();
    const agents = orchestrator.getAllAgents();
    
    const healthChecks = await Promise.all(
      agents.map(async (agent): Promise<AgentHealthStatus> => {
        try {
          const result = await agent.run({
            id: `health-check-${Date.now()}`,
            type: agent.capabilities[0], // Use the first capability for a simple check
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
    
    console.log(`Agent health check complete: ${healthyCount}/${agents.length} healthy.`);

    return {
      success: true,
      totalAgents: agents.length,
      healthyAgents: healthyCount,
      agents: healthChecks
    };

  } catch (error: any) {
    console.error('Agent health check task failed:', error);
    return {
      success: false,
      totalAgents: 0,
      healthyAgents: 0,
      agents: [],
      error: error.message
    };
  }
}
