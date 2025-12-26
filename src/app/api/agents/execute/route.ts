import { NextRequest, NextResponse } from 'next/server';
import {
  getInternalAgentManager,
  executeAgentTask,
  executeAgentTaskAuto
} from '@/lib/internal-agent-manager';
import { withAPISpan, setAttribute, recordEvent } from '@/lib/tracing';
import { AgentCapability } from '@/lib/agents/types';

/**
 * POST - Execute a task with an agent
 */
export async function POST(req: NextRequest) {
  return withAPISpan('/api/agents/execute', async (span) => {
    try {
      const { agentId, task, autoSelect } = await req.json();

      setAttribute('agent.id', agentId || 'auto');
      setAttribute('agent.auto_select', autoSelect);

      recordEvent('agent.execution.requested', { agentId, autoSelect });

      const agentTask = {
        id: `task-${Date.now()}`,
        type: AgentCapability.ANALYSIS, // Default type, could be inferred from task if needed
        goal: task.goal || task,
        input: task.input || {}
      };

      let result;

      if (autoSelect || !agentId) {
        // Auto-select best agent
        result = await executeAgentTaskAuto(agentTask);
        setAttribute('agent.selected_agent', result.metadata?.agentId || 'auto');
      } else {
        // Use specified agent
        result = await executeAgentTask(agentId, agentTask);
      }

      recordEvent('agent.execution.completed', { 
        agentId: agentId || 'auto',
        status: result.status 
      });

      return NextResponse.json({
        success: result.status === 'success',
        result,
        message: result.status === 'success' 
          ? `✅ Agent task completed successfully!`
          : `❌ Agent task failed: ${result.error}`
      });

    } catch (error) {
      setAttribute('error.message', (error as Error).message);
      recordEvent('agent.execution.failed', { 
        error: (error as Error).message 
      });

      return NextResponse.json({
        error: (error as Error).message,
        message: '❌ Agent execution failed'
      }, { status: 500 });
    }
  });
}

/**
 * GET - List all available agents
 */
export async function GET(req: NextRequest) {
  return withAPISpan('/api/agents/execute', async (span) => {
    try {
      const manager = getInternalAgentManager();
      const agents = manager.getAllAgentConfigs();

      setAttribute('agents.count', agents.length);

      recordEvent('agents.listed', { count: agents.length });

      return NextResponse.json({
        count: agents.length,
        agents: agents.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          model: a.model,
          enabled: a.enabled,
          description: a.description,
          capabilities: a.capabilities
        })),
        message: '✅ All internal agents ready - Jules, Kate, Grok, and more!'
      });
    } catch (error) {
      setAttribute('error.message', (error as Error).message);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  });
}
