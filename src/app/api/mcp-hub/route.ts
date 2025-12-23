import { NextRequest, NextResponse } from 'next/server';
import { mcpHub } from '@/lib/mcp-hub';

export async function GET(req: NextRequest) {
  const localTools = mcpHub.getTools();
  const remote = await mcpHub.getRemoteToolsSummary();

  return NextResponse.json({
    tools: [...localTools, ...(remote.tools || [])],
    workflows: mcpHub.getWorkflows(),
    bridge: {
      enabled: remote.enabled,
      servers: remote.servers,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, name, args, options } = await req.json();

    if (action === 'call_tool') {
      const result = await mcpHub.callTool(name, args);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'run_workflow') {
      const result = await mcpHub.runWorkflow(name, args);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'refresh_remote_tools') {
      const result = await mcpHub.refreshRemoteTools();
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}