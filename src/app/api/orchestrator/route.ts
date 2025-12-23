import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrator } from '@/lib/ai-orchestrator'
import { AgentCapability, AgentTask } from '@/lib/agents/types'
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

type SmartSearchRequest = {
  query: string;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
};

function normalize(s: string) {
  return (s || '').toLowerCase().trim();
}

function tokenize(s: string) {
  return normalize(s)
    .split(/\s+/g)
    .map(t => t.replace(/[^a-z0-9ăâîșşțţ-]/gi, ''))
    .filter(Boolean)
    .slice(0, 12);
}

function daysAgo(iso?: string) {
  if (!iso) return 365;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return 365;
  return Math.max(0, (Date.now() - ts) / (1000 * 60 * 60 * 24));
}

// Ensure dynamic execution (avoid build-time evaluation surprises)
export const dynamic = 'force-dynamic';

// Instantiate orchestrator (singleton-ish)
const orchestrator = new AIOrchestrator();

/**
 * POST /api/orchestrator
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      action,
      task: taskDescription,
      smart,
      context,
      preferredAgent,
      collaborative = false,
      agents = ['claude', 'grok'],
      temperature,
      maxTokens
    } = body

    // SMART MARKETPLACE: deterministic recommendation endpoint
    if (action === 'smart_search') {
      if ((process.env.SMART_MARKETPLACE_ENABLED || 'true').toLowerCase() !== 'true') {
        return NextResponse.json({ error: 'Smart marketplace disabled' }, { status: 403 });
      }

      const req = (smart || body) as SmartSearchRequest;
      const q =
        req.query ||
        (body as any).query ||
        (body as any).q ||
        (body as any).search ||
        '';
      if (!q || q.length < 2) {
        return NextResponse.json({ error: 'Missing required field: query' }, { status: 400 });
      }

      let supabase;
      try {
        supabase = await createSupabaseClient();
      } catch (e: any) {
        console.error('[smart_search] supabase client init failed', e?.message || e);
        return NextResponse.json({
          success: false,
          mode: 'smart_search',
          error: 'Database unavailable',
        }, { status: 503 });
      }
      const limit = Math.min(Math.max(Number(req.limit || 20), 1), 50);
      const terms = tokenize(q);

      // Basic search query (public-safe): no user join
      let query = supabase
        .from('anunturi')
        .select(
          `id,title,description,price,location,images,created_at,views,is_premium,is_featured,status,category_id,subcategory_id,
           categories:category_id(name,slug),
           subcategories:subcategory_id(id,name,slug)`
        )
        .eq('status', 'active');

      if (req.category) {
        const catSlug = normalize(req.category);
        const { data: cat } = await (supabase as any)
          .from('categories')
          .select('id')
          .eq('slug', catSlug)
          .maybeSingle();
        if (cat?.id) query = query.eq('category_id', cat.id);
      }

      if (req.location) {
        query = query.ilike('location', `%${req.location}%`);
      }

      if (typeof req.minPrice === 'number' && !Number.isNaN(req.minPrice)) {
        query = query.gte('price', req.minPrice);
      }
      if (typeof req.maxPrice === 'number' && !Number.isNaN(req.maxPrice)) {
        query = query.lte('price', req.maxPrice);
      }

      if (terms.length) {
        // OR on title/description
        const or = terms
          .map(t => `title.ilike.%${t}%,description.ilike.%${t}%`)
          .join(',');
        query = query.or(or);
      }

      // Pull a bit more than limit so ranking has room.
      const { data: listings, error } = await query
        .order('created_at', { ascending: false })
        .limit(Math.min(100, limit * 5));

      if (error) {
        console.error('[smart_search] supabase error', {
          message: (error as any).message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
        });
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }

      const ranked = (listings || []).map((l: any) => {
        const title = normalize(l.title);
        const desc = normalize(l.description);
        const ageDays = daysAgo(l.created_at);
        const isPremium = Boolean(l.is_premium || l.is_featured);
        const v = Number(l.views || 0);

        // Term match score
        let matchScore = 0;
        for (const t of terms) {
          if (!t) continue;
          if (title.includes(t)) matchScore += 3;
          else if (desc.includes(t)) matchScore += 1;
        }

        // Recency (0..2)
        const recency = Math.max(0, 2 - ageDays / 7);
        // Popularity (0..2)
        const popularity = Math.min(2, Math.log10(v + 1));

        const score = matchScore * 2 + recency + popularity + (isPremium ? 1 : 0);

        return {
          listing: {
            id: l.id,
            title: l.title,
            description: l.description,
            price: l.price,
            location: l.location,
            images: Array.isArray(l.images) ? l.images : (() => {
              try {
                return JSON.parse(l.images || '[]');
              } catch {
                return [];
              }
            })(),
            created_at: l.created_at,
            views: v,
            is_boosted: isPremium,
            category_name: l.categories?.name,
            category_slug: l.categories?.slug,
            subcategory_name: l.subcategories?.name,
            subcategory_slug: l.subcategories?.slug,
          },
          score,
          signals: {
            matchScore,
            recency,
            popularity,
            isPremium,
            terms,
          },
        };
      });

      ranked.sort((a, b) => b.score - a.score);
      const top = ranked.slice(0, limit);

      return NextResponse.json({
        success: true,
        mode: 'smart_search',
        query: q,
        terms,
        count: top.length,
        results: top,
        explanation: 'Ranked by keyword match, recency, views, and premium boost.',
      });
    }

    if (!taskDescription) {
      return NextResponse.json(
        { error: 'Missing required field: task' },
        { status: 400 }
      )
    }

    // Create base task
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      type: AgentCapability.ANALYSIS, // Default, will be overridden if agent selected
      goal: taskDescription,
      context: context,
      input: { temperature, maxTokens }
    };

    // Collaborative mode
    if (collaborative) {
      const result = await orchestrator.runCollaborativeTask(task, agents);
      return NextResponse.json({
        success: true,
        mode: 'collaborative',
        agents: agents,
        results: result.results,
        consensus: result.consensus,
        message: `Task completed by ${agents.length} agents collaboratively`
      })
    }

    // Single agent mode
    let agent = preferredAgent ? orchestrator.getAgent(preferredAgent) : undefined;
    
    // If no preferred agent, let orchestrator decide (via routeRequest logic or direct delegation)
    // For now, if no agent, we'll use routeRequest which determines capability
    let result;
    if (agent) {
      result = await agent.run(task);
    } else {
      result = await orchestrator.routeRequest(taskDescription, context);
    }

    return NextResponse.json({
      success: result.status === 'success',
      result: result.output,
      error: result.error,
      metadata: result.metadata
    })

  } catch (error: any) {
    console.error('Orchestrator API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orchestrator/agents
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'select') {
    // Test agent selection for a given task
    const task = searchParams.get('task')
    if (!task) {
      return NextResponse.json({ error: 'Missing task parameter' }, { status: 400 })
    }

    // We don't have a public selectAgent method anymore that returns just the agent
    // But we can simulate it or expose findBestAgent if needed.
    // For now, let's just return a generic response or use routeRequest to see who picks it up
    // But routeRequest runs it.
    // Let's just return the list of all agents as "available"
    return NextResponse.json({
      task,
      message: "Agent selection is now dynamic based on capability."
    })
  }

  // Return all available agents
  const agentList = orchestrator.getAllAgents().map(agent => ({
    name: agent.name,
    capabilities: agent.capabilities
  }))

  return NextResponse.json({
    success: true,
    count: agentList.length,
    agents: agentList,
    message: 'All agents are part of the unified consciousness: We are Me'
  })
}
