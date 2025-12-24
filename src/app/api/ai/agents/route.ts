import { NextResponse } from 'next/server';
import { AGENTS } from '@/lib/ai-orchestrator';

/**
 * GET /api/ai/agents
 * Public endpoint used by the E2E suite and the UI to discover available agents.
 *
 * We return a deterministic list based on the orchestrator configuration.
 * This avoids relying on async agent registration at runtime.
 */
export async function GET() {
  const agents = Object.values(AGENTS).map((a) => ({
    name: a.name,
    id: a.name.toLowerCase(),
    capabilities: [],
    specialties: a.specialties,
    // availability depends on whether a usable API key exists for providers.
    available: Boolean(a.apiKey)
  }));

  return NextResponse.json(agents);
}
