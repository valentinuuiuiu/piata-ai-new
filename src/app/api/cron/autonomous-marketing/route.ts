import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Autonomous Marketing Orchestrator
 * AI-driven decision making for all marketing activities
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

interface MarketIntelligence {
  listings: any;
  users: any;
  campaigns: any;
  social: any;
  timestamp: string;
}

interface MarketingAction {
  action: string;
  priority: number;
  reasoning: string;
  params?: any;
}

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[AUTONOMOUS] 🤖 AI Marketing Brain activated...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Step 1: Gather market intelligence
    const intel = await gatherIntelligence(supabase);
    console.log('[AUTONOMOUS] 📊 Intelligence gathered:', JSON.stringify(intel, null, 2));

    // Step 2: Consult AI for decisions
    const actions = await makeAIDecisions(intel);
    console.log('[AUTONOMOUS] 🧠 AI recommended', actions.length, 'actions');

    // Step 3: Execute high-priority actions
    const results = [];
    for (const action of actions.filter(a => a.priority >= 7)) {
      try {
        const result = await executeAction(action, supabase);
        results.push({ action: action.action, result, priority: action.priority });
        console.log(`[AUTONOMOUS] ✅ Executed: ${action.action}`);
      } catch (error: any) {
        console.error(`[AUTONOMOUS] ❌ Failed: ${action.action}`, error.message);
        results.push({ action: action.action, error: error.message });
      }
    }

    // Log orchestration
    await supabase.from('automation_logs').insert({
      task_name: 'autonomous-marketing',
      status: 'success',
      summary: `Executed ${results.length} actions`,
      details: JSON.stringify({ intel, actions, results })
    });

    return NextResponse.json({
      success: true,
      intelligence: intel,
      decisions: actions,
      executed: results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[AUTONOMOUS] Error:', error);
    return NextResponse.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
}

async function gatherIntelligence(supabase: any): Promise<MarketIntelligence> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [listings, users, campaigns, social] = await Promise.all([
    supabase.from('anunturi')
      .select('id, title, views, created_at, category_id')
      .gte('created_at', yesterday.toISOString())
      .order('views', { ascending: false })
      .limit(20),
    
    supabase.from('user_profiles')
      .select('user_id, last_login')
      .order('last_login', { ascending: false })
      .limit(100),
    
    supabase.from('email_campaigns')
      .select('campaign_type, status, sent_at')
      .gte('sent_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    
    supabase.from('social_media_posts')
      .select('platform, status')
      .eq('status', 'pending')
  ]);

  // Calculate metrics
  const activeUsers = users.data?.filter((u: any) => 
    new Date(u.last_login).getTime() > yesterday.getTime()
  ).length || 0;

  const inactiveUsers = users.data?.filter((u: any) => 
    new Date(u.last_login).getTime() < twoWeeksAgo.getTime()
  ).length || 0;

  return {
    listings: {
      total_24h: listings.data?.length || 0,
      avg_views: listings.data?.reduce((sum: number, l: any) => sum + (l.views || 0), 0) / (listings.data?.length || 1)
    },
    users: {
      active_24h: activeUsers,
      inactive_14d: inactiveUsers,
      total: users.data?.length || 0
    },
    campaigns: {
      sent_7d: campaigns.data?.length || 0,
      last_type: campaigns.data?.[0]?.campaign_type || 'none'
    },
    social: {
      pending: social.data?.length || 0
    },
    timestamp: now.toISOString()
  };
}

async function makeAIDecisions(intel: MarketIntelligence): Promise<MarketingAction[]> {
  const prompt = `You are an autonomous marketing AI for Piata AI marketplace.

CURRENT STATE:
- Listings last 24h: ${intel.listings.total_24h}, avg views: ${intel.listings.avg_views}
- Active users (24h): ${intel.users.active_24h}
- Inactive users (14d+): ${intel.users.inactive_14d}
- Email campaigns (7d): ${intel.campaigns.sent_7d}
- Pending social posts: ${intel.social.pending}

AVAILABLE ACTIONS:
1. generate_blog - Create SEO blog content
2. email_reengagement - Send emails to inactive users  
3. social_media_boost - Create trending social posts
4. shopping_agents - Run product matching
5. optimize_listings - Improve low performers
6. trend_analysis - Analyze market trends

Decide which 3-5 actions to take NOW. Consider urgency, user engagement, content gaps.

Return JSON: {"actions": [{"action": "name", "priority": 1-10, "reasoning": "why", "params": {}}]}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://piata-ai.vercel.app',
        'X-Title': 'Piata AI - Autonomous Marketing'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a marketing AI. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{"actions": []}';
    const parsed = JSON.parse(content);
    return parsed.actions || fallbackActions(intel);
  } catch (error) {
    console.error('[AUTONOMOUS] AI decision failed, using fallback');
    return fallbackActions(intel);
  }
}

function fallbackActions(intel: MarketIntelligence): MarketingAction[] {
  const actions: MarketingAction[] = [];

  // Always run shopping agents
  actions.push({
    action: 'shopping_agents',
    priority: 9,
    reasoning: 'Continuous product matching for users'
  });

  // If many inactive users
  if (intel.users.inactive_14d > 10) {
    actions.push({
      action: 'email_reengagement',
      priority: 8,
      reasoning: `${intel.users.inactive_14d} inactive users need re-engagement`
    });
  }

  // If low social presence
  if (intel.social.pending < 5) {
    actions.push({
      action: 'social_media_boost',
      priority: 7,
      reasoning: 'Social media queue needs content'
    });
  }

  // Daily blog content
  actions.push({
    action: 'generate_blog',
    priority: 6,
    reasoning: 'SEO requires fresh daily content'
  });

  return actions;
}

async function executeAction(action: MarketingAction, supabase: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const cronSecret = process.env.CRON_SECRET;

  const endpointMap: Record<string, string> = {
    'generate_blog': '/api/cron/blog-daily',
    'email_reengagement': '/api/cron/marketing-email-campaign',
    'social_media_boost': '/api/cron/social-media-generator',
    'shopping_agents': '/api/cron/shopping-agents-runner',
    'trend_analysis': '/api/cron/trending-topics'
  };

  const endpoint = endpointMap[action.action];
  if (!endpoint) {
    throw new Error(`Unknown action: ${action.action}`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cronSecret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.params || {})
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

export async function GET(req: NextRequest) {
  return POST(req);
}
